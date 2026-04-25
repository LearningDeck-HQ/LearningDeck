import { User, ApiResponse } from "./index";

export interface AuthData {
  user: User;
  token: string;
}

export type AuthResponse = ApiResponse<AuthData>;
