import { z } from "zod";
import {
  signupSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export type SignupDTO = z.infer<typeof signupSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
