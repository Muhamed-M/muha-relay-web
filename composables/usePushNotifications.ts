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
    if (!isSupported.value) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return registration;
    } catch {
      return null;
    }
  };

  const getExistingSubscription = async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      return registration.pushManager.getSubscription();
    } catch {
      return null;
    }
  };

  const sendSubscriptionToServer = async (sub: PushSubscription): Promise<void> => {
    const subJson = sub.toJSON();
    await axios.post('/push/subscribe', {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
    });
  };

  const subscribeUser = async (registration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.public.vapidPublicKey),
      });

      await sendSubscriptionToServer(sub);
      return sub;
    } catch {
      return null;
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    if (!isSupported.value) return false;

    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    isGranted.value = permission === 'granted';

    if (!isGranted.value) return false;

    const registration = await registerServiceWorker();
    if (!registration) return false;

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

  onMounted(() => {
    checkSupport();
    if (isSupported.value && isGranted.value) {
      // Auto-register service worker and restore subscription on mount
      registerServiceWorker().then(() => {
        getExistingSubscription().then((sub) => {
          subscription.value = sub;
          // Re-send subscription to server on page load
          if (sub) {
            sendSubscriptionToServer(sub).catch(() => {});
          }
        });
      });
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
