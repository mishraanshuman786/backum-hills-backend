
import { userRepository } from "../../repository/user.repository";
import { refreshTokenRepository } from "../../repository/refresh-token.repository";

import {
  hashPassword,
  comparePassword,
} from "../../utils/password";

import { ApiError } from "../../utils/api-error";

import type { UpdateProfileInput } from "../../validations/profile.validation";

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "customer";
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  emailVerifiedAt: user.emailVerifiedAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const profileService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(
        404,
        "USER_NOT_FOUND",
        "User profile was not found",
      );
    }

    return sanitizeUser(user);
  },

  async updateProfile(
    userId: string,
    data: UpdateProfileInput,
  ) {
    const user = await userRepository.updateProfile(userId, data);

    if (!user || !user.isActive) {
      throw new ApiError(
        404,
        "USER_NOT_FOUND",
        "User profile was not found",
      );
    }

    return sanitizeUser(user);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await userRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(
        404,
        "USER_NOT_FOUND",
        "User profile was not found",
      );
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new ApiError(
        400,
        "INVALID_CURRENT_PASSWORD",
        "Current password is incorrect",
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await userRepository.updatePassword(userId, passwordHash);

    // Require fresh login on every device after a password change.
    await refreshTokenRepository.revokeAllByUser(userId);

    return {
      message: "Password changed successfully. Please log in again.",
    };
  },
};
