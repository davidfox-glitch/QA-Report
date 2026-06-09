// src/services/notifications/index.ts
import { vapidKeys } from '../../lib/supabase';

/** Helper to convert VAPID public key */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Subscribe the current user to push notifications */
export async function subscribeUser(email: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKeys.publicKey)
    });
    // Send subscription to backend for storage
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subscription })
    });
    console.log('Push subscription successful');
    return subscription;
  } catch (err) {
    console.error('Failed to subscribe for push', err);
  }
}

/** Send a push notification to a specific user */
export async function sendPush(userEmail: string, title: string, body: string) {
  try {
    await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userEmail, title, body })
    });
  } catch (err) {
    console.error('Push notification error', err);
  }
}
