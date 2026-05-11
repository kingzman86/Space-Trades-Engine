import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: row, error } = await supabase
      .from("access_codes")
      .select("id, code")
      .eq("used", false)
      .limit(1)
      .single();

    if (error || !row) return new Response(JSON.stringify({ error: "No codes available" }), { status: 500 });

    await supabase
      .from("access_codes")
      .update({ used: true, customer_email: email, assigned_at: new Date().toISOString() })
      .eq("id", row.id);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL"),
        to: email,
        subject: "Your Space Trades Access Code 🚀",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a18;padding:44px 40px 36px;text-align:center;border-bottom:3px solid #F5C842;">
              <img src="https://www.spacetradesengine.com/Space_Trade_Logo.png" alt="Space Trades" width="70" style="display:block;margin:0 auto 16px;" />
              <div style="font-size:30px;font-weight:900;letter-spacing:5px;color:#F5C842;text-transform:uppercase;margin-bottom:6px;">SPACE TRADES</div>
              <div style="font-size:12px;font-weight:700;letter-spacing:4px;color:#ffffff;text-transform:uppercase;">Compounding Engine</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:44px 40px 36px;">
              <p style="color:#111111;font-size:20px;font-weight:800;line-height:1.5;margin:0 0 12px;">Welcome aboard! 🚀</p>
              <p style="color:#333333;font-size:15px;font-weight:500;line-height:1.8;margin:0 0 32px;">Your access to Space Trades has been granted. Use the code below to log in and start building your compounding strategy.</p>

              <!-- Code box -->
              <div style="background:#0a0a18;border:3px solid #F5C842;border-radius:14px;padding:32px;text-align:center;margin:0 0 32px;">
                <div style="font-size:12px;font-weight:800;letter-spacing:4px;color:#F5C842;text-transform:uppercase;margin-bottom:16px;">YOUR ACCESS CODE</div>
                <div style="font-size:28px;font-weight:900;letter-spacing:6px;color:#ffffff;font-family:monospace;background:#16162a;border:1px solid #F5C842;border-radius:8px;padding:16px 24px;display:inline-block;">${row.code}</div>
              </div>

              <!-- Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#f8f8fc;border:1px solid #e0e0f0;border-left:4px solid #F5C842;border-radius:10px;padding:24px;">
                    <div style="font-size:12px;font-weight:800;letter-spacing:3px;color:#0a0a18;text-transform:uppercase;margin-bottom:16px;">HOW TO GET STARTED</div>
                    <div style="color:#222222;font-size:15px;font-weight:600;line-height:2.2;">
                      <span style="color:#c9a020;font-weight:900;">1.</span> &nbsp;Go to <a href="https://www.spacetradesengine.com" style="color:#c9a020;text-decoration:none;font-weight:800;">spacetradesengine.com</a><br>
                      <span style="color:#c9a020;font-weight:900;">2.</span> &nbsp;Enter your access code on the login screen<br>
                      <span style="color:#c9a020;font-weight:900;">3.</span> &nbsp;Start planning and compounding your trades
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="https://www.spacetradesengine.com" style="display:inline-block;background:#F5C842;color:#0a0a18;font-size:15px;font-weight:900;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:18px 44px;border-radius:10px;">Launch Space Trades →</a>
                  </td>
                </tr>
              </table>

              <p style="color:#555555;font-size:13px;font-weight:500;line-height:1.7;margin:0;border-top:1px solid #e8e8f0;padding-top:20px;">Keep this code private — it is linked to your account. If you have any issues, reply to this email and we will help you out.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0a0a18;padding:24px 40px;text-align:center;">
              <div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#F5C842;text-transform:uppercase;margin-bottom:6px;">Space Trades</div>
              <div style="font-size:12px;color:#aaaacc;margin-bottom:6px;">spacetradesengine.com</div>
              <div style="font-size:11px;color:#666688;">Not financial advice. Trading crypto involves significant risk of loss.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      }),
    });

    const resendData = await resendRes.json();
    console.log("Resend:", JSON.stringify(resendData));

    return new Response(JSON.stringify({ success: true, resend: resendData }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
