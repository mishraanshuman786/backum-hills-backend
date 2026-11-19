
import { randomUUID } from "node:crypto";

import { userRepository } from "../../repository/user.repository";
import { refreshTokenRepository } from "../../repository/refresh-token.repository";

import { hashPassword, comparePassword } from "../../utils/password";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from "../../utils/jwt";

import { ApiError } from "../../utils/api-error";

import type {
  RegisterInput,
  LoginInput,
} from "../../validations/auth.validation";

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

const issueTokens = async (
  user: {
    id: string;
    role: "admin" | "customer";
  },
  tokenFamilyId = randomUUID(),
) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    tokenFamilyId,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ApiError(
        409,
        "EMAIL_ALREADY_EXISTS",
        "An account with this email already exists",
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      passwordHash,
      // Never accept a role from public registration.
      role: "customer",
    });

    const tokens = await issueTokens(user);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    const passwordMatches = await comparePassword(
      data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        "ACCOUNT_DISABLED",
        "Your account has been disabled",
      );
    }

    const tokens = await issueTokens(user);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async refresh(rawRefreshToken: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const existingToken =
      await refreshTokenRepository.findByHash(tokenHash);

    if (!existingToken) {
      throw new ApiError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid or expired",
      );
    }

    // Reuse of a previously revoked token indicates possible theft.
    if (existingToken.revokedAt) {
      await refreshTokenRepository.revokeFamily(
        existingToken.tokenFamilyId,
      );

      throw new ApiError(
        401,
        "REFRESH_TOKEN_REUSED",
        "Refresh token reuse detected. Please log in again.",
      );
    }

    if (existingToken.expiresAt <= new Date()) {
      throw new ApiError(
        401,
        "REFRESH_TOKEN_EXPIRED",
        "Refresh token has expired. Please log in again.",
      );
    }

    const user = await userRepository.findById(
      existingToken.userId,
    );

    if (!user || !user.isActive) {
      await refreshTokenRepository.revokeFamily(
        existingToken.tokenFamilyId,
      );

      throw new ApiError(
        401,
        "ACCOUNT_UNAVAILABLE",
        "Your account is unavailable. Please log in again.",
      );
    }

    const newRefreshToken = generateRefreshToken();

    const rotated = await refreshTokenRepository.rotate(
      existingToken.id,
      {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        tokenFamilyId: existingToken.tokenFamilyId,
        expiresAt: getRefreshTokenExpiry(),
      },
    );

    if (!rotated) {
      // The token may have been used concurrently or already revoked.
      await refreshTokenRepository.revokeFamily(
        existingToken.tokenFamilyId,
      );

      throw new ApiError(
        401,
        "REFRESH_TOKEN_REUSED",
        "Refresh token is no longer valid. Please log in again.",
      );
    }

    return {
      user: sanitizeUser(user),
      accessToken: generateAccessToken(user),
      refreshToken: newRefreshToken,
    };
  },

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) {
      return;
    }

    const token = await refreshTokenRepository.findByHash(
      hashToken(rawRefreshToken),
    );

    if (token) {
      await refreshTokenRepository.revokeFamily(
        token.tokenFamilyId,
      );
    }
  },

  async logoutAll(userId: string) {
    await refreshTokenRepository.revokeAllByUser(userId);
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(
        404,
        "USER_NOT_FOUND",
        "User account was not found",
      );
    }

    return sanitizeUser(user);
  },
};
