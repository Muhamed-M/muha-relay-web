import AuthService from '~/services/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicPages = ['/auth/sign-in', '/auth/sign-up'];
  const authRequired = !publicPages.includes(to.path);

  const user = AuthService.getUserFromCookie();

  if (authRequired && !user) {
    return navigateTo('/auth/sign-in');
  }
});
