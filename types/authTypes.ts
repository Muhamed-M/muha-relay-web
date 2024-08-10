export interface SignUpPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface SignInPayload {
  identifier: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  token: string;
  expiresOn?: number;
  createdAt: string;
  updatedAt: string;
}
