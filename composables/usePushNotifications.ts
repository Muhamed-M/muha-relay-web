import { urlBase64ToUint8Array } from '~/utils/vapidHelper';

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
    isPWA.value = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
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
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  };

  const subscribeUser = async (registration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.public.vapidPublicKey),
      });
      
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: sub.toJSON(),
      });
      
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
    }

    subscription.value = sub;
    return !!sub;
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const sub = await getExistingSubscription();
      if (sub) {
        await sub.unsubscribe();
        subscription.value = null;
      }
      return true;
    } catch {
      return false;
    }
  };

  onMounted(() => {
    checkSupport();
    if (isSupported.value && isGranted.value) {
      getExistingSubscription().then((sub) => {
        subscription.value = sub;
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
    registerServiceWorker,
  };
}

