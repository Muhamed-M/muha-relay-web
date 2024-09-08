import AuthService from '~/services/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Check if the route is for the API and skip middleware if it's an API request
  if (to.path.startsWith('/api')) {
    return;
  }

  const publicPages = ['/auth/sign-in', '/auth/sign-up'];
  const authRequired = !publicPages.includes(to.path);

  AuthService.handleSessionExpiry(); // Check session expiry

  const user = AuthService.getUserFromCookie();

  if (authRequired && !user) {
    return navigateTo('/auth/sign-in');
  }
});
