export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

const subscriptions = new Map<string, PushSubscriptionData>();

export const pushStore = {
  add(subscription: PushSubscriptionData): void {
    subscriptions.set(subscription.endpoint, subscription);
  },

  remove(endpoint: string): boolean {
    return subscriptions.delete(endpoint);
  },

  getAll(): PushSubscriptionData[] {
    return Array.from(subscriptions.values());
  },

  has(endpoint: string): boolean {
    return subscriptions.has(endpoint);
  },

  clear(): void {
    subscriptions.clear();
  },
};

