import type { RequestHandler } from "express";

import { inventoryService } from "./inventory.service";
import { getRouteParam } from "../../utils/get-route-param";

import {
  inventoryListQuerySchema,
  inventoryProductIdSchema,
  updateInventoryThresholdSchema,
  adjustInventorySchema,
  inventoryMovementQuerySchema,
} from "../../validations/inventory.validations";

export const inventoryController = {
  getInventory: (async (req, res) => {
    const query = inventoryListQuerySchema.parse(req.query);

    const result = await inventoryService.getInventory(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }) satisfies RequestHandler,

  getProductInventory: (async (req, res) => {
    const params = inventoryProductIdSchema.parse({
      productId: getRouteParam(req, "productId"),
    });

    const data = await inventoryService.getProductInventory(params.productId);

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  updateThreshold: (async (req, res) => {
    const params = inventoryProductIdSchema.parse({
      productId: getRouteParam(req, "productId"),
    });

    const body = updateInventoryThresholdSchema.parse(req.body);

    const data = await inventoryService.updateThreshold(params.productId, body);

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  adjustStock: (async (req, res) => {
    const params = inventoryProductIdSchema.parse({
      productId: getRouteParam(req, "productId"),
    });

    const body = adjustInventorySchema.parse(req.body);

    const data = await inventoryService.adjustStock(params.productId, body);

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  getStockMovements: (async (req, res) => {
    const params = inventoryProductIdSchema.parse({
      productId: getRouteParam(req, "productId"),
    });

    const query = inventoryMovementQuerySchema.parse(req.query);

    const result = await inventoryService.getStockMovements(
      params.productId,
      query,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }) satisfies RequestHandler,

  getLowStock: (async (req, res) => {
    const query = inventoryListQuerySchema.parse({
      ...req.query,
      stockStatus: "low_stock",
    });

    const result = await inventoryService.getInventory(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }) satisfies RequestHandler,

  getOutOfStock: (async (req, res) => {
    const query = inventoryListQuerySchema.parse({
      ...req.query,
      stockStatus: "out_of_stock",
    });

    const result = await inventoryService.getInventory(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }) satisfies RequestHandler,
};
