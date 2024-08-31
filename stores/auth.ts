import { defineStore } from 'pinia';
import AuthService from '@/services/auth';
import type { SignInPayload, SignUpPayload } from '~/types/authTypes';

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    user: AuthService.getUserFromCookie() || null,
    loading: false,
    returnUrl: null,
  }),
  actions: {
    async signUp(data: SignUpPayload) {
      this.loading = true;

      try {
        // <-- call service -->
        await AuthService.signUp(data);
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async signIn(data: SignInPayload, rememberMe: boolean) {
      this.loading = true;

      try {
        // <-- call service -->
        const response = await AuthService.signIn(data);
        const user = response.data;

        // update state
        this.user = user;

        // store user details and jwt to nuxt cookie to keep user logged in between page refreshes and set auth headers token
        AuthService.saveUserToCookie(user, rememberMe);
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async signOut() {
      //   if (this.user.googleId) {
      //     await AuthService.googleLogout();
      //   }

      this.user = null;
      AuthService.removeUserFromCookie();
    },
  },
});
