import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPrices } from "./_lib/prices.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { data, stale } = await getPrices();
    res.status(200).json({
      ...data,
      gold24kAfnPerGram: data.gold24kUsdPerGram * data.usdToAfn,
      is_stale: stale,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
}
