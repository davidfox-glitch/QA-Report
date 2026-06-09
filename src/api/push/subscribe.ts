// src/api/push/subscribe.ts
import { supabase } from '../../lib/supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node'; // adjust if not Next.js

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { email, subscription } = req.body;
  if (!email || !subscription) {
    res.status(400).json({ error: 'Missing email or subscription' });
    return;
  }
  // Store subscription in Supabase table push_subscriptions (create if not exists)
  const { error } = await supabase.from('push_subscriptions').upsert({
    user_email: email,
    subscription: subscription as any,
  });
  if (error) {
    console.error('Supabase insert error', error);
    res.status(500).json({ error: 'Failed to store subscription' });
    return;
  }
  res.status(200).json({ success: true });
}
