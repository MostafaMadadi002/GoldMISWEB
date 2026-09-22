import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendContactEmail } from "./_lib/email";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fullName, shopName, phone, email, description } = req.body || {};

  if (!fullName || !shopName || !phone) {
    return res.status(400).json({ error: "نام، نام فروشگاه و شماره تماس الزامی است." });
  }

  try {
    await sendContactEmail({ fullName, shopName, phone, email, description });
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    res.status(500).json({ error: "ارسال درخواست ناموفق بود. لطفاً بعداً دوباره تلاش کنید." });
  }
}
