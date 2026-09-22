import dotenv from "dotenv";
// This project uses the Vite convention (.env.local), but dotenv's default
// config() only reads a file literally named ".env" — point it at the real file.
dotenv.config({ path: ".env.local" });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getPrices } from "./api/_lib/prices";
import { sendContactEmail } from "./api/_lib/email";

// NOTE: this file is the LOCAL / VPS entry point (npm run dev, npm start).
// It is NOT used on Vercel — Vercel runs api/prices.ts and api/contact.ts
// directly as serverless functions instead. Both entry points share the
// same logic via api/_lib/, so there's only one place to fix bugs.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/contact", async (req, res) => {
    const { fullName, shopName, phone, email, description } = req.body || {};

    if (!fullName || !shopName || !phone) {
      return res.status(400).json({ error: "نام، نام فروشگاه و شماره تماس الزامی است." });
    }

    try {
      await sendContactEmail({ fullName, shopName, phone, email, description });
      res.json({ ok: true });
    } catch (error) {
      console.error("Failed to send contact email:", error);
      res.status(500).json({ error: "ارسال درخواست ناموفق بود. لطفاً بعداً دوباره تلاش کنید." });
    }
  });

  app.get("/api/prices", async (req, res) => {
    try {
      const { data, stale } = await getPrices();
      res.json({
        ...data,
        gold24kAfnPerGram: data.gold24kUsdPerGram * data.usdToAfn,
        is_stale: stale,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
