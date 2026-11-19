
import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

import { randomBytes, createHash } from "node:crypto";

import { env } from "../config/env";

export type AuthUserRole = "admin" | "customer";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: AuthUserRole;
}

export const generateAccessToken = (
  user: {
    id: string;
    role: AuthUserRole;
  },
) => {
  return jwt.sign(
    {
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"],
      algorithm: "HS256",
    },
  );
};

export const verifyAccessToken = (
  token: string,
): AccessTokenPayload => {
  const decoded = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
    {
      algorithms: ["HS256"],
    },
  );

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    (decoded.role !== "admin" && decoded.role !== "customer")
  ) {
    throw new Error("Invalid access token payload");
  }

  return decoded as AccessTokenPayload;
};

export const generateRefreshToken = () => {
  return randomBytes(64).toString("hex");
};

export const hashToken = (token: string) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getRefreshTokenExpiry = () => {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS,
  );

  return expiresAt;
};
