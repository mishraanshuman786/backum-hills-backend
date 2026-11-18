import { Router } from "express";

import { categoriesController } from "./categories.controller";
import { validate } from "../../middlewares/validate";


import { categoryIdSchema, createCategorySchema, updateCategorySchema, toggleCategoryMenuSchema } from "../../validations/categories.validation";


const router = Router();
// Public
router.get("/categories", categoriesController.getPublicCategories);

// Admin
router.get("/admin/categories", categoriesController.getAllCategories);

router.post(
  "/admin/categories",
  validate({ body: createCategorySchema }),
  categoriesController.createCategory,
);

router.patch(
  "/admin/categories/:id",
  validate({
    params: categoryIdSchema,
    body: updateCategorySchema,
  }),
  categoriesController.updateCategory,
);

router.delete(
  "/admin/categories/:id",
  validate({ params: categoryIdSchema }),
  categoriesController.deleteCategory,
);

router.patch(
  "/admin/categories/:id/menu",
  validate({
    params: categoryIdSchema,
    body: toggleCategoryMenuSchema,
  }),
  categoriesController.toggleMenu,
);

export default router;