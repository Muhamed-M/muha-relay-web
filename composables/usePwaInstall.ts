const PWA_DISMISSED_KEY = 'pwa-install-dismissed';
const PWA_DISMISSED_EXPIRY_DAYS = 7;

interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isStandalone: boolean;
}

export const usePwaInstall = () => {
  const showPrompt = ref(false);
  const deviceInfo = ref<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isStandalone: false,
  });

  const checkDeviceInfo = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        isChrome: false,
        isStandalone: false,
      };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
    const isChrome = /chrome/.test(ua) && !/edge/.test(ua);

    // Check if app is running in standalone mode (installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    return { isIOS, isAndroid, isSafari, isChrome, isStandalone };
  };

  const isDismissed = (): boolean => {
    if (typeof window === 'undefined') return true;

    const dismissedData = localStorage.getItem(PWA_DISMISSED_KEY);
    if (!dismissedData) return false;

    try {
      const { timestamp } = JSON.parse(dismissedData);
      const expiryTime = PWA_DISMISSED_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - timestamp > expiryTime;

      if (isExpired) {
        localStorage.removeItem(PWA_DISMISSED_KEY);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  const dismissPrompt = () => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      PWA_DISMISSED_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        dismissed: true,
      })
    );
    showPrompt.value = false;
  };

  const checkShouldShowPrompt = () => {
    const info = checkDeviceInfo();
    deviceInfo.value = info;

    // Don't show if already in standalone mode (app installed)
    if (info.isStandalone) {
      showPrompt.value = false;
      return;
    }

    // Don't show if user already dismissed
    if (isDismissed()) {
      showPrompt.value = false;
      return;
    }

    // Only show on mobile devices
    if (info.isIOS || info.isAndroid) {
      showPrompt.value = true;
    }
  };

  onMounted(() => {
    checkShouldShowPrompt();
  });

  return {
    showPrompt,
    deviceInfo,
    dismissPrompt,
    checkShouldShowPrompt,
  };
};
