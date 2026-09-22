import { GoogleGenAI } from "@google/genai";

export interface PriceCache {
  gold24kUsdPerGram: number;
  silver999UsdPerGram: number;
  usdToAfn: number;
  updatedAtGold: string;
  updatedAtCurrency: string;
  lastFetched: number;
}

// Module-level cache. On a VPS (server.ts) this persists as long as the
// process runs. On Vercel this only persists between requests that happen
// to hit the same warm serverless instance — not guaranteed, but harmless:
// worst case it just re-fetches. gold-api.com has no rate limit, so that's
// fine. It's the currency fallback (open.er-api.com) that's rate-limited,
// which is the whole reason CACHE_DURATION is long.
let cache: PriceCache | null = null;
let isFetching = false;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Built lazily (not at module load time) so it reads GEMINI_API_KEY only
// once dotenv has actually had a chance to run locally, and so it doesn't
// matter on Vercel whether this module is imported before or after env vars
// are injected.
function getAi() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

async function fetchSmartPrices(): Promise<PriceCache> {
  console.log("Initiating Smart Fetch for live prices...");
  const todayStr = new Date().toISOString().split("T")[0]; // never hardcode a date, or this rots

  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `What is the current gold spot price per ounce in USD (XAU/USD), the current silver spot price per ounce in USD (XAG/USD), and the USD to AFN exchange rate right now (${todayStr})? Return ONLY a JSON object: {gold_oz: number, silver_oz: number, usd_afn: number}. Ensure the response is valid JSON.`,
            },
          ],
        },
      ],
      config: {
        tools: [{ googleSearch: {} } as any],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    const data = JSON.parse(text);

    if (data.gold_oz && data.usd_afn) {
      console.log("Smart Fetch Success:", data);
      return {
        gold24kUsdPerGram: data.gold_oz / 31.1035,
        silver999UsdPerGram: (data.silver_oz ?? data.gold_oz / 85) / 31.1035,
        usdToAfn: data.usd_afn,
        updatedAtGold: new Date().toISOString(),
        updatedAtCurrency: new Date().toISOString(),
        lastFetched: Date.now(),
      };
    }
  } catch (e) {
    console.error("Smart Fetch Failed (likely quota or service issue):", e);
  }

  console.log("Falling back to standard public APIs...");
  try {
    // Base URL is https://api.gold-api.com, price endpoint is /price/{symbol}.
    const [goldRes, silverRes, curRes] = await Promise.all([
      fetch("https://api.gold-api.com/price/XAU"),
      fetch("https://api.gold-api.com/price/XAG"),
      fetch("https://open.er-api.com/v6/latest/USD"),
    ]);

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    const curData = await curRes.json();

    if (goldData.price && curData.rates?.AFN) {
      console.log("Fallback API Success:", { gold: goldData.price, silver: silverData?.price, afn: curData.rates.AFN });
      return {
        gold24kUsdPerGram: goldData.price / 31.1035,
        silver999UsdPerGram: (silverData?.price ?? goldData.price / 85) / 31.1035,
        usdToAfn: curData.rates.AFN,
        updatedAtGold: new Date().toISOString(),
        updatedAtCurrency: new Date().toISOString(),
        lastFetched: Date.now(),
      };
    }
    console.error("Fallback API returned unexpected shape:", { goldData, silverData, curData });
  } catch (err) {
    console.error("Standard API Fallback Failed:", err);
  }

  if (cache) {
    console.warn("Both sources failed — serving last known cached price.");
    return { ...cache, lastFetched: Date.now() };
  }

  throw new Error("No price source available (Gemini failed, fallback APIs failed, no prior cache).");
}

/** Returns the cached price if fresh, otherwise fetches. Shared by the
 *  Express dev server and the Vercel serverless function. */
export async function getPrices(): Promise<{ data: PriceCache; stale: boolean }> {
  const now = Date.now();

  if (cache && now - cache.lastFetched < CACHE_DURATION) {
    return { data: cache, stale: false };
  }

  if (isFetching) {
    if (cache) return { data: cache, stale: true };
    // Nothing to serve yet and someone else is already fetching — just fetch too,
    // simplest correct behavior for a serverless environment with no shared lock.
  }

  isFetching = true;
  try {
    cache = await fetchSmartPrices();
    return { data: cache, stale: false };
  } finally {
    isFetching = false;
  }
}
