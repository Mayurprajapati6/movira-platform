import { NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/helpers/jwt";
import { UnauthorizedError } from "../utils/errors/app.error";
import { AuthRequest } from "./types";

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authorization token missing"));
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyAccessToken(token);
  req.user = payload;

  next();
};
