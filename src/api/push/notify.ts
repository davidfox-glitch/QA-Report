// src/api/push/notify.ts
import { supabase } from '../../lib/supabase';
import webpush from 'web-push';
import type { VercelRequest, VercelResponse } from '@vercel/node'; // If using Next.js, otherwise adjust

// Load VAPID keys from environment (they are in .env.local)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY as string;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY as string;

webpush.setVapidDetails(
  'mailto:admin@example.com',
  vapidPublicKey,
  vapidPrivateKey
);

/**
 * Expected request body:
 * { userId: string, title: string, body: string, url?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { userId, title, body, url } = req.body;
  if (!userId || !title || !body) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Fetch all subscriptions for the user
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase fetch error', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
    return;
  }

  const payload = JSON.stringify({ title, body, url });

  const sendPromises = (subs ?? []).map(async (row) => {
    const subscription = row.subscription as any;
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (e) {
      console.error('Failed to send push', e);
    }
  });

  await Promise.all(sendPromises);
  res.status(200).json({ success: true });
}
