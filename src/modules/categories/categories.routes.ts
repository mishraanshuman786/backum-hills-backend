import { Router } from "express";

import { categoriesController } from "./categories.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { requireRole } from "../../middlewares/require-role";

import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryMenuSchema,
} from "../../validations/categories.validation";

const router = Router();
// Public
router.get("/categories", categoriesController.getPublicCategories);

// Admin
router.get(
  "/admin/categories",
  authenticate,
  requireRole("admin"),
  categoriesController.getAllCategories,
);

router.post(
  "/admin/categories",
  authenticate,
  requireRole("admin"),
  validate({ body: createCategorySchema }),
  categoriesController.createCategory,
);

router.patch(
  "/admin/categories/:id",
  authenticate,
  requireRole("admin"),
  validate({
    params: categoryIdSchema,
    body: updateCategorySchema,
  }),
  categoriesController.updateCategory,
);

router.delete(
  "/admin/categories/:id",
  authenticate,
  requireRole("admin"),
  validate({ params: categoryIdSchema }),
  categoriesController.deleteCategory,
);

router.patch(
  "/admin/categories/:id/menu",
  authenticate,
  requireRole("admin"),
  validate({
    params: categoryIdSchema,
    body: toggleCategoryMenuSchema,
  }),
  categoriesController.toggleMenu,
);

export default router;
