export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    roles: string[];
  };
}