export interface InstagramProfile {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface DMRequest {
  username: string;
  message: string;
}

export interface DMResponse {
  success: boolean;
  error?: string;
}
