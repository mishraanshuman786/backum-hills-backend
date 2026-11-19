
import { Router } from "express";

import { profileController } from "./profile.controller";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";

import { updateProfileSchema } from "../../validations/profile.validation";
import { changePasswordSchema } from "../../validations/auth.validation";

const router = Router();

router.use(authenticate);

router.get("/", profileController.getProfile);

router.patch(
  "/",
  validate({ body: updateProfileSchema }),
  profileController.updateProfile,
);

router.patch(
  "/change-password",
  validate({ body: changePasswordSchema }),
  profileController.changePassword,
);

export default router;
