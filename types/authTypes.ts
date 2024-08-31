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
