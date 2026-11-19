
import type { RequestHandler } from "express";

import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/api-response";

import { env } from "../../config/env";

import type {
  RegisterInput,
  LoginInput,
} from "../../validations/auth.validation";

const REFRESH_COOKIE_NAME = "refresh_token";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/v1/auth",
};

const setRefreshCookie = (
  res: Parameters<RequestHandler>[1],
  token: string,
) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (
  res: Parameters<RequestHandler>[1],
) => {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
};

export const authController = {
  register: (async (req, res, next) => {
    try {
      const result = await authService.register(
        req.body as RegisterInput,
      );

      setRefreshCookie(res, result.refreshToken);

      const { refreshToken, ...responseData } = result;

      return sendSuccess(res, 201, {
        message: "Account registered successfully",
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  login: (async (req, res, next) => {
    try {
      const result = await authService.login(
        req.body as LoginInput,
      );

      setRefreshCookie(res, result.refreshToken);

      const { refreshToken, ...responseData } = result;

      return sendSuccess(res, 200, {
        message: "Login successful",
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  refresh: (async (req, res, next) => {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
        | string
        | undefined;

      if (!rawRefreshToken) {
        clearRefreshCookie(res);

        return res.status(401).json({
          success: false,
          error: {
            code: "REFRESH_TOKEN_MISSING",
            message: "Refresh token is required",
          },
        });
      }

      const result = await authService.refresh(rawRefreshToken);

      setRefreshCookie(res, result.refreshToken);

      const { refreshToken, ...responseData } = result;

      return sendSuccess(res, 200, {
        message: "Token refreshed successfully",
        data: responseData,
      });
    } catch (error) {
      clearRefreshCookie(res);
      next(error);
    }
  }) satisfies RequestHandler,

  logout: (async (req, res, next) => {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
        | string
        | undefined;

      await authService.logout(rawRefreshToken);

      clearRefreshCookie(res);

      return sendSuccess(res, 200, {
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  logoutAll: (async (req, res, next) => {
    try {
      await authService.logoutAll(req.user!.id);

      clearRefreshCookie(res);

      return sendSuccess(res, 200, {
        message: "Logged out from all devices successfully",
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  me: (async (req, res, next) => {
    try {
      const user = await authService.getMe(req.user!.id);

      return sendSuccess(res, 200, {
        message: "User profile fetched successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};
