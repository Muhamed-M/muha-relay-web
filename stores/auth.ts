import { defineStore } from 'pinia';
import AuthService from '@/services/auth';
import type { SignInPayload, SignUpPayload } from '~/types/authTypes';

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    user: process.client ? AuthService.getUserFromLocalStorage() : null,
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
        const user = response.data.user;

        // update state
        this.user = user;

        // store user details and jwt in local storage to keep user logged in between page refreshes and set auth headers token
        AuthService.saveUserToLocalStorage(this.user, response.data.token, rememberMe);
        // redirect to overview page after successfull registration
        // router.push(
        //   this.user.role === 'admin' || this.user.role === 'admin-viewer' || this.user.role === 'admin-editor'
        //     ? '/admin'
        //     : '/'
        // );
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      //   if (this.user.googleId) {
      //     await AuthService.googleLogout();
      //   }

      this.user = null;
      AuthService.removeUserFromLocalStorage();
      //   router.push('/auth/login');
    },
  },
});
