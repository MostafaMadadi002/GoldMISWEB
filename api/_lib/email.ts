export interface ContactFields {
  fullName: string;
  shopName: string;
  phone: string;
  email: string;
  description: string;
}

export async function sendContactEmail(fields: ContactFields) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || "mostafamadadi.1382@gmail.com";
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured on the server");
  }

  const html = `
    <div dir="rtl" style="font-family: Tahoma, sans-serif;">
      <h2>درخواست جدید از سایت خزانه</h2>
      <p><b>نام:</b> ${fields.fullName}</p>
      <p><b>نام فروشگاه:</b> ${fields.shopName}</p>
      <p><b>شماره تماس:</b> ${fields.phone}</p>
      <p><b>ایمیل:</b> ${fields.email}</p>
      <p><b>توضیحات:</b> ${fields.description || "-"}</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Khazaneh <onboarding@resend.dev>",
      to: [toEmail],
      reply_to: fields.email || undefined,
      subject: `درخواست جدید: ${fields.fullName} — ${fields.shopName}`,
      html,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errBody}`);
  }
}
