import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `ST-${seg()}-${seg()}`;
}

async function sendAccessEmail(email, code, planType) {
  const planLabel = planType === 'lifetime' ? 'Lifetime Access' : 'Monthly Plan';
  await resend.emails.send({
    from: 'Space Trades <access@spacetrades.io>',
    to: email,
    subject: `Your Space Trades Access Code — ${planLabel}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#0C0C0F;color:#F4F4F5;border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#F5A623;font-size:28px;margin:0 0 8px;">Welcome to Space Trades 🚀</h1>
          <p style="color:#D4D4D8;margin:0;">${planLabel} — Access Code</p>
        </div>
        <div style="background:#1C1C21;border:1px solid #F5A623;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
          <p style="color:#A1A1AA;font-size:12px;margin:0 0 12px;letter-spacing:2px;text-transform:uppercase;">Your Access Code</p>
          <span style="font-family:monospace;font-size:32px;font-weight:900;color:#F5A623;letter-spacing:6px;">${code}</span>
        </div>
        <p style="color:#D4D4D8;line-height:1.6;">Enter this code on the Space Trades login screen to unlock the Compounding Engine.</p>
        ${planType === 'monthly' ? `<p style="color:#A1A1AA;font-size:13px;">Your code is valid for your current billing period. It will be renewed automatically each month.</p>` : `<p style="color:#22C55E;font-size:13px;">✓ Lifetime access — this code never expires.</p>`}
        <hr style="border:none;border-top:1px solid #2A2A32;margin:28px 0;">
        <p style="color:#71717A;font-size:11px;text-align:center;">For educational purposes only. Not financial advice. Trading crypto involves significant risk of loss.</p>
      </div>
    `,
  });
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);

  const secret    = process.env.LEMON_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];
  const digest    = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  if (digest !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { meta, data } = JSON.parse(rawBody);
  const event = meta.event_name;

  try {
    if (event === 'order_created') {
      const variantId = String(data.attributes.first_order_item?.variant_id ?? '');
      const lifetimeVariantId = process.env.LEMON_LIFETIME_VARIANT_ID;

      if (variantId !== lifetimeVariantId) return res.status(200).json({ skipped: true });

      const email   = data.attributes.user_email;
      const orderId = String(data.id);
      const code    = generateCode();

      await supabase.from('access_codes').insert({
        code, email,
        plan_type: 'lifetime',
        status: 'active',
        lemon_order_id: orderId,
      });

      await sendAccessEmail(email, code, 'lifetime');

    } else if (event === 'subscription_created') {
      const email          = data.attributes.user_email;
      const subscriptionId = String(data.id);
      const renewsAt       = data.attributes.renews_at;

      const { data: existing } = await supabase
        .from('access_codes')
        .select('code')
        .eq('lemon_subscription_id', subscriptionId)
        .maybeSingle();

      if (!existing) {
        const code = generateCode();

        await supabase.from('access_codes').insert({
          code, email,
          plan_type: 'monthly',
          status: 'active',
          lemon_subscription_id: subscriptionId,
          expires_at: renewsAt,
        });

        await sendAccessEmail(email, code, 'monthly');
      }

    } else if (event === 'subscription_updated') {
      const subscriptionId = String(data.id);
      const renewsAt       = data.attributes.renews_at;
      const status         = data.attributes.status;

      if (status === 'active') {
        await supabase
          .from('access_codes')
          .update({ status: 'active', expires_at: renewsAt })
          .eq('lemon_subscription_id', subscriptionId);
      }

    } else if (['subscription_expired', 'subscription_cancelled'].includes(event)) {
      const subscriptionId = String(data.id);

      await supabase
        .from('access_codes')
        .update({ status: 'expired' })
        .eq('lemon_subscription_id', subscriptionId);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
