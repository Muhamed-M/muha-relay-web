import axios from '~/utils/axios';
import type { User, SignUpPayload, SignInPayload } from '~/types';

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
  saveUserToCookie(user: User, rememberMe: boolean = true): void {
    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : undefined; // 7 days in seconds, or session cookie
    const userCookie = useCookie('user', { maxAge });

    userCookie.value = JSON.stringify(user);

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
}

export default new AuthService();
