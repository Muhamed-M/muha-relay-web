import webpush from 'web-push';
import { pushStore, type PushSubscriptionData } from './pushStore';

interface PushPayload {
  title: string;
  body: string;
  data?: { url?: string; conversationId?: string };
}

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return;
  
  const config = useRuntimeConfig();
  webpush.setVapidDetails(
    config.vapidSubject,
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  );
  vapidConfigured = true;
}

export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  ensureVapidConfigured();
  
  const subscriptions = pushStore.getAll();
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushToSubscription(sub, payload))
  );

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  };
}

export async function sendPushToSubscription(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<void> {
  ensureVapidConfigured();
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      pushStore.remove(subscription.endpoint);
    }
    throw err;
  }
}

