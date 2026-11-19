import { Router } from "express";

import { inventoryController } from "./inventory.controller";
import { authenticate } from "../../middlewares/authenticate";
import { requireRole } from "../../middlewares/require-role";

const router = Router();

// Every inventory endpoint is admin-only.
router.use(authenticate, requireRole("admin"));

router.get("/", inventoryController.getInventory);

router.get("/low-stock", inventoryController.getLowStock);
router.get("/out-of-stock", inventoryController.getOutOfStock);

router.get("/:productId/movements", inventoryController.getStockMovements);

router.get("/:productId", inventoryController.getProductInventory);

router.patch("/:productId", inventoryController.updateThreshold);

router.post("/:productId/adjust", inventoryController.adjustStock);

export default router;
