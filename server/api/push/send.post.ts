import webpush from 'web-push';
import { pushStore } from '~/server/utils/pushStore';

interface PushPayload {
  title: string;
  body: string;
  data?: { url?: string; conversationId?: string };
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<PushPayload>(event);

  if (!body?.title || !body?.body) {
    throw createError({ statusCode: 400, message: 'Title and body are required' });
  }

  webpush.setVapidDetails(
    config.vapidSubject,
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  );

  const subscriptions = pushStore.getAll();
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, JSON.stringify(body)).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          pushStore.remove(sub.endpoint);
        }
        throw err;
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { sent, failed, total: subscriptions.length };
});

