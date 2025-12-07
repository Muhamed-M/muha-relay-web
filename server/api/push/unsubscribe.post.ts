import { pushStore } from '~/server/utils/pushStore';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ endpoint: string }>(event);

  if (!body?.endpoint) {
    throw createError({ statusCode: 400, message: 'Endpoint is required' });
  }

  const removed = pushStore.remove(body.endpoint);

  return { success: removed };
});

