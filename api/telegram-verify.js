import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;
  if (!data || !data.hash) return res.status(400).json({ error: 'Missing data' });

  // Verify the Telegram hash
  const { hash, ...authData } = data;
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');

  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (hmac !== hash) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Reject stale auth (older than 1 hour)
  if (Math.floor(Date.now() / 1000) - Number(data.auth_date) > 3600) {
    return res.status(401).json({ error: 'Auth expired' });
  }

  // Check if the user is a member of the group
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const groupId  = process.env.TELEGRAM_GROUP_ID;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${groupId}&user_id=${data.id}`
    );
    const tgData = await tgRes.json();
    const status = tgData.result?.status;
    const isMember = ['member', 'administrator', 'creator'].includes(status);

    return res.status(200).json({ member: isMember, status });
  } catch {
    return res.status(500).json({ error: 'Could not verify membership' });
  }
}
