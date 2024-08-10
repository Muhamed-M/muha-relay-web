import axios from '~/utils/axios';
import type { User, SignUpPayload, SignInPayload } from '~/types/authTypes';

class AuthService {
  // user registration API call
  async signUp(data: SignUpPayload) {
    const response = await axios.post('/auth/sign-up', data);
    return response.data;
  }

  // user login API call
  async signIn(data: SignInPayload) {
    const response = await axios.post('/auth/sign-in', data);
    return response.data;
  }

  // Save user and token to cookie
  saveUserToCookie(user: User, rememberMe: boolean): void {
    const now = Date.now();
    const userCookie = useCookie('user');

    const userData = {
      ...user,
      expiresOn: now + 1000 * 60 * 60 * 24 * 7, // 7 days expiry for the session
    };

    if (rememberMe) {
      userCookie.value = JSON.stringify(userData);
    }

    // set token in axios headers
    this.setAuthHeader(user.token);
  }

  // Retrieve user from cookie
  getUserFromCookie(): User | null {
    const userCookie = useCookie('user') as { value: User | null };
    if (!userCookie.value) return null;

    const user = userCookie.value;
    this.setAuthHeader(user?.token);
    return user;
  }

  // Remove user from cookie
  removeUserFromCookie(): void {
    const userCookie = useCookie('user');
    userCookie.value = null;

    this.setAuthHeader('');
  }

  // Set the Authorization header for axios
  setAuthHeader(token: string): void {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // Check if the user's session is still valid
  isSessionActive(user: User) {
    const now = Date.now();
    return user?.expiresOn && user.expiresOn > now;
  }

  // Handle session expiry
  handleSessionExpiry(): void {
    const user = this.getUserFromCookie();

    if (user && !this.isSessionActive(user)) {
      this.removeUserFromCookie();
    }
  }
}

export default new AuthService();
