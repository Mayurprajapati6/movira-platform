import { SafeUser } from "./auth.types";

export const toSafeUser = (user: any): SafeUser => {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    city: user.city,
    role: user.role,
    trustScore: user.trustScore,
    createdAt: user.createdAt,
  };
};
