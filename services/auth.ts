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

  // Save user and token to local storage
  saveUserToLocalStorage(user: User, token: string, rememberMe: boolean) {
    const now = Date.now();
    const userData = {
      ...user,
      expiresOn: now + 1000 * 60 * 60 * 24 * 7, // 7 days expiry for the session
      token,
    };
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    this.setAuthHeader(token);
  }

  // Retrieve user from local storage
  getUserFromLocalStorage() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    try {
      const user = JSON.parse(userData);
      this.setAuthHeader(user?.token);
      return user;
    } catch (error) {
      console.error('Error parsing user data from local storage', error);
      return null;
    }
  }

  // Remove user from local storage
  removeUserFromLocalStorage() {
    localStorage.removeItem('user');
    this.setAuthHeader('');
  }

  // Set the Authorization header for axios
  setAuthHeader(token: string) {
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
  handleSessionExpiry() {
    const user = this.getUserFromLocalStorage();

    if (user && !this.isSessionActive(user)) {
      this.removeUserFromLocalStorage();
    }
  }
}

export default new AuthService();
