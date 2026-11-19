import { Router } from "express";

import { productsController } from "./products.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { requireRole } from "../../middlewares/require-role";

import {
  productIdSchema,
  productSlugSchema,
  productListQuerySchema,
  adminProductListQuerySchema,
  createProductSchema,
  updateProductSchema,
} from "../../validations/products.validation";

const router = Router();

// Public routes
router.get(
  "/products",
  validate({ query: productListQuerySchema }),
  productsController.getPublicProducts,
);

router.get(
  "/products/:slug",
  validate({ params: productSlugSchema }),
  productsController.getPublicProduct,
);

// Admin routes
// Attach authenticate + requireRole("admin") before production use.

router.get(
  "/admin/products",
  authenticate,
  requireRole("admin"),
  validate({ query: adminProductListQuerySchema }),
  productsController.getAdminProducts,
);

router.post(
  "/admin/products",
  authenticate,
  requireRole("admin"),
  validate({ body: createProductSchema }),
  productsController.createProduct,
);

router.get(
  "/admin/products/:id",
  authenticate,
  requireRole("admin"),
  validate({ params: productIdSchema }),
  productsController.getAdminProduct,
);

router.patch(
  "/admin/products/:id",
  authenticate,
  requireRole("admin"),
  validate({
    params: productIdSchema,
    body: updateProductSchema,
  }),
  productsController.updateProduct,
);

router.delete(
  "/admin/products/:id",
  authenticate,
  requireRole("admin"),
  validate({ params: productIdSchema }),
  productsController.deleteProduct,
);

export default router;
