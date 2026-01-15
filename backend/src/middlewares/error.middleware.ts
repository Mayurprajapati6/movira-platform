import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors/app.error";

export const appErrorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if ((err as AppError).statusCode) {
    const appError = err as AppError;
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export const genericErrorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
