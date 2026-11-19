import { inventoryRepository } from "../../repository/inventory.repository";
import { ApiError } from "../../utils/api-error";

import type { InventoryListQuery, UpdateInventoryThresholdInput, AdjustInventoryInput, InventoryMovementQuery } from "../../validations/inventory.validations";

export const inventoryService = {
  async getInventory(query: InventoryListQuery) {
    const result = await inventoryRepository.findAll(query);

    return {
      data: result.data,
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getProductInventory(productId: string) {
    const product = await inventoryRepository.findByProductId(productId);

    if (!product) {
      throw new ApiError(
        404,
        "PRODUCT_NOT_FOUND",
        "Product not found",
      );
    }

    const isOutOfStock = product.stock === 0;

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      stockStatus: isOutOfStock
        ? "out_of_stock"
        : product.stock <= product.lowStockThreshold
          ? "low_stock"
          : "in_stock",
    };
  },

  async updateThreshold(
    productId: string,
    data: UpdateInventoryThresholdInput,
  ) {
    const product = await inventoryRepository.updateThreshold(
      productId,
      data.lowStockThreshold,
    );

    if (!product) {
      throw new ApiError(
        404,
        "PRODUCT_NOT_FOUND",
        "Product not found",
      );
    }

    return product;
  },

  async adjustStock(
    productId: string,
    data: AdjustInventoryInput,
  ) {
    const result = await inventoryRepository.adjustStock(
      productId,
      data,
    );

    if (!result) {
      throw new ApiError(
        404,
        "PRODUCT_NOT_FOUND",
        "Product not found",
      );
    }

    if (result.insufficientStock) {
      throw new ApiError(
        400,
        "INSUFFICIENT_STOCK",
        `Cannot reduce stock. Available stock: ${result.availableStock}`,
      );
    }

    return result;
  },

  async getStockMovements(
    productId: string,
    query: InventoryMovementQuery,
  ) {
    const product = await inventoryRepository.findByProductId(productId);

    if (!product) {
      throw new ApiError(
        404,
        "PRODUCT_NOT_FOUND",
        "Product not found",
      );
    }

    const result = await inventoryRepository.findMovements(
      productId,
      query.page,
      query.limit,
    );

    return {
      data: result.data,
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },
};