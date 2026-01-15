import express from "express";
import { AuthController } from "./auth.controller";
import { validateRequestBody } from "../../validators";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/auth.validator";

const router = express.Router();

router.post("/signup", validateRequestBody(signupSchema), AuthController.signup);
router.post("/login", validateRequestBody(loginSchema), AuthController.login);

router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

router.post("/forgot-password",validateRequestBody(forgotPasswordSchema),AuthController.forgotPassword);

router.post("/reset-password",validateRequestBody(resetPasswordSchema),AuthController.resetPassword);

export default router;
