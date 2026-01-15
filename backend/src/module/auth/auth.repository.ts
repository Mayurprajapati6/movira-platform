import { prisma } from "../../config/prisma";

export class AuthRepository {
  static createUser(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "ADMIN" | "OWNER" | "USER";
  }) {
    return prisma.user.create({ data });
  }

  static findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static saveRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  static findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  static revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  static setResetToken(userId: string, token: string, expiry: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
  }

  static findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
  }

  static updatePassword(userId: string, password: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  static findByPhone(phone: string) {
    return prisma.user.findUnique({
        where: { phone },
    });
  }

}
