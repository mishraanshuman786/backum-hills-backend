
import { Router } from "express";

import { authController } from "./auth.controller";

import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";

import {
  registerSchema,
  loginSchema,
} from "../../validations/auth.validation";

const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);

router.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);

router.post(
  "/refresh",
  authController.refresh,
);

router.post(
  "/logout",
  authController.logout,
);

router.post(
  "/logout-all",
  authenticate,
  authController.logoutAll,
);

router.get(
  "/me",
  authenticate,
  authController.me,
);

export default router;
