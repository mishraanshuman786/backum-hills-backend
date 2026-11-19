
import type { AuthUserRole } from "../utils/jwt";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: AuthUserRole;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
