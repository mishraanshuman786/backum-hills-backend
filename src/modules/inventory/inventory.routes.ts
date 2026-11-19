import { Router } from "express";

import { inventoryController } from "./inventory.controller";

const router = Router();

router.get("/", inventoryController.getInventory);

router.get("/low-stock", inventoryController.getLowStock);
router.get("/out-of-stock", inventoryController.getOutOfStock);

router.get("/:productId/movements", inventoryController.getStockMovements);

router.get("/:productId", inventoryController.getProductInventory);

router.patch("/:productId", inventoryController.updateThreshold);

router.post("/:productId/adjust", inventoryController.adjustStock);

export default router;
