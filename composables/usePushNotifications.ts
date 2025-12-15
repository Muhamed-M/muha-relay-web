import { urlBase64ToUint8Array } from '~/utils/vapidHelper';
import axios from '~/utils/axios';

export function usePushNotifications() {
  const config = useRuntimeConfig();
  const isSupported = ref(false);
  const isGranted = ref(false);
  const subscription = ref<PushSubscription | null>(null);
  const isPWA = ref(false);

  const checkSupport = () => {
    if (import.meta.server) return;

    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    isGranted.value = Notification.permission === 'granted';
    isPWA.value =
      window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  };

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return registration;
    } catch (err) {
      console.error('[Push] Failed to register service worker:', err);
      return null;
    }
  };

  const getExistingSubscription = async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      return registration.pushManager.getSubscription();
    } catch (err) {
      console.error('[Push] Failed to get existing subscription:', err);
      return null;
    }
  };

  const sendSubscriptionToServer = async (sub: PushSubscription): Promise<boolean> => {
    try {
      const subJson = sub.toJSON();
      await axios.post('/push/subscribe', {
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        },
      });
      console.log('[Push] Subscription sent to server successfully');
      return true;
    } catch (err) {
      console.error('[Push] Failed to send subscription to server:', err);
      return false;
    }
  };

  const subscribeUser = async (registration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
    try {
      const vapidKey = config.public.vapidPublicKey;
      if (!vapidKey) {
        console.error('[Push] VAPID public key is not configured');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const sent = await sendSubscriptionToServer(sub);
      if (!sent) {
        console.error('[Push] Subscription created but failed to save to server');
      }
      return sub;
    } catch (err) {
      console.error('[Push] Failed to subscribe user:', err);
      return null;
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    // Check support on demand (in case onMounted hasn't run yet)
    checkSupport();

    if (!isSupported.value) {
      console.warn('[Push] Push notifications not supported');
      return false;
    }

    if (Notification.permission === 'denied') {
      console.warn('[Push] Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    isGranted.value = permission === 'granted';

    if (!isGranted.value) {
      console.warn('[Push] Notification permission not granted');
      return false;
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('[Push] Service worker registration failed');
      return false;
    }

    let sub = await getExistingSubscription();
    if (!sub) {
      sub = await subscribeUser(registration);
    } else {
      // Re-send existing subscription to server (in case server restarted)
      await sendSubscriptionToServer(sub);
    }

    subscription.value = sub;
    return !!sub;
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const sub = await getExistingSubscription();
      if (sub) {
        await axios.post('/push/unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
        subscription.value = null;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Show local notification when app is in foreground (fallback)
  const showLocalNotification = (title: string, body: string, url = '/conversations') => {
    if (!isGranted.value || document.visibilityState !== 'hidden') return;

    const notification = new Notification(title, { body, icon: '/favicon.svg' });
    notification.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  };

  onMounted(async () => {
    checkSupport();
    console.log('[Push] onMounted - isSupported:', isSupported.value, 'isGranted:', isGranted.value);

    if (isSupported.value && isGranted.value) {
      // Auto-register service worker and restore subscription on mount
      const registration = await registerServiceWorker();
      if (registration) {
        const sub = await getExistingSubscription();
        subscription.value = sub;
        console.log('[Push] Existing subscription found:', !!sub);

        // Re-send subscription to server on page load (handles server restarts)
        if (sub) {
          const sent = await sendSubscriptionToServer(sub);
          console.log('[Push] Auto-sync to server:', sent ? 'success' : 'failed');
        }
      }
    }
  });

  return {
    isSupported: readonly(isSupported),
    isGranted: readonly(isGranted),
    isPWA: readonly(isPWA),
    subscription: readonly(subscription),
    enableNotifications,
    unsubscribe,
    showLocalNotification,
  };
}
