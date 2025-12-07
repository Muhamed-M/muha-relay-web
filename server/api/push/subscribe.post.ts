import { pushStore, type PushSubscriptionData } from '~/server/utils/pushStore';

export default defineEventHandler(async (event) => {
  const body = await readBody<PushSubscriptionData>(event);

  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    throw createError({ statusCode: 400, message: 'Invalid subscription data' });
  }

  pushStore.add(body);

  return { success: true };
});

