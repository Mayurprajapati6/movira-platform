import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service";

export class AuthController {
  static signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.signup(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  static login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  static refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken;
      const result = await AuthService.refresh(token);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  };

  static logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthService.logout(req.cookies?.refreshToken);
      res.clearCookie("refreshToken");
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  static forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await AuthService.forgotPassword(email);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
  };

    static resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, password } = req.body;
            await AuthService.resetPassword(token, password);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    };

}
