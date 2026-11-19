
import type { RequestHandler } from "express";

import { profileService } from "./profile.service";
import { sendSuccess } from "../../utils/api-response";

import type { UpdateProfileInput } from "../../validations/profile.validation";
import type { ChangePasswordInput } from "../../validations/auth.validation";

export const profileController = {
  getProfile: (async (req, res, next) => {
    try {
      const user = await profileService.getProfile(req.user!.id);

      return sendSuccess(res, 200, {
        message: "Profile fetched successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateProfile: (async (req, res, next) => {
    try {
      const user = await profileService.updateProfile(
        req.user!.id,
        req.body as UpdateProfileInput,
      );

      return sendSuccess(res, 200, {
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  changePassword: (async (req, res, next) => {
    try {
      const result = await profileService.changePassword(
        req.user!.id,
        (req.body as ChangePasswordInput).currentPassword,
        (req.body as ChangePasswordInput).newPassword,
      );

      return sendSuccess(res, 200, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};
