import { Prisma } from "../../../generated/prisma/client.js";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { AuthRepository } from "./auth.repository";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/helpers/jwt";
import {
  ConflictError,
  InternalServerError,
  UnauthorizedError,
} from "../../utils/errors/app.error";
import { SafeUser, JwtRole } from "./auth.types";
import { toSafeUser } from "./auth.mapper";
import { SignupDTO } from "../../dto/auth.dto.js";

export class AuthService {
  static async signup(data: SignupDTO) {
    const emailExists = await AuthRepository.findByEmail(data.email);
    if (emailExists) {
        throw new ConflictError("User already exists with this email");
    }

    const phoneExists = await AuthRepository.findByPhone(data.phone);
    if (phoneExists) {
        throw new ConflictError("User already exists with this phone");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await AuthRepository.createUser({
        ...data,
        password: hashedPassword,
    });

    return this.issueTokens(user.id, user.role, user);
  }


  static async login(email: string, password: string) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.accountStatus === "SUSPENDED") {
      throw new UnauthorizedError("Account is suspended");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return this.issueTokens(user.id, user.role, user);
  }

  static async refresh(refreshToken: string) {
    const stored = await AuthRepository.findRefreshToken(refreshToken);
    if (!stored || stored.revoked) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const payload = verifyRefreshToken(refreshToken);

    await AuthRepository.revokeRefreshToken(refreshToken);

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    await AuthRepository.saveRefreshToken({
      userId: payload.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken: string) {
    await AuthRepository.revokeRefreshToken(refreshToken);
  }

  static async forgotPassword(email: string) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) return;

    const token = randomUUID();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await AuthRepository.setResetToken(user.id, token, expiry);
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await AuthRepository.findByResetToken(token);
    if (!user) {
      throw new UnauthorizedError("Token expired or invalid");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await AuthRepository.updatePassword(user.id, hashed);
  }

  private static async issueTokens(
  userId: string,
  role: JwtRole,
  user: any
) {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });

  await AuthRepository.saveRefreshToken({
    userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: toSafeUser(user),
  };
}
}
