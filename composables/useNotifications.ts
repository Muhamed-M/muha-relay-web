export function useNotifications() {
  const permissionGranted = ref(false);

  // Request Notification Permission
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          permissionGranted.value = true;
        }
      });
    }
  };

  // Show Notification
  const showNotification = (title: string, body: string, icon = '/public/favicon.svg', url = '/conversations') => {
    if (permissionGranted.value && document.visibilityState === 'hidden') {
      const notification = new Notification(title, {
        body,
        //   icon,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = url;
      };
    }
  };

  return {
    requestNotificationPermission,
    showNotification,
    permissionGranted,
  };
}
