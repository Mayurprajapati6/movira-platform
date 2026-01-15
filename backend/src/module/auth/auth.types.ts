export const AUTH_ROLES = ["ADMIN", "OWNER", "USER"] as const;

export type JwtRole = typeof AUTH_ROLES[number];

export interface JwtPayload {
  userId: string;
  role: JwtRole;
}

export interface SafeUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: JwtRole;
  city?: string | null;
  trustScore: number;
  createdAt: Date;
}
