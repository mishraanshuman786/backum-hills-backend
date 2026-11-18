import type { RequestHandler } from "express";

import { productsService } from "./products.service";
import { getRouteParam } from "../../utils/get-route-param";
export const productsController = {
  getPublicProducts: (async (req, res) => {
    const result = await productsService.getPublicProducts(
      req.query as never,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }) satisfies RequestHandler,

  getPublicProduct: (async (req, res) => {
    const data = await productsService.getPublicProduct(
      getRouteParam(req,"slug")
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  getAdminProducts: (async (req, res) => {
    const result = await productsService.getAdminProducts(
      req.query as never,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }) satisfies RequestHandler,

  getAdminProduct: (async (req, res) => {
    const data = await productsService.getAdminProduct(
    getRouteParam(req,"id")
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  createProduct: (async (req, res) => {
    const data = await productsService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  updateProduct: (async (req, res) => {
    const data = await productsService.updateProduct(
     getRouteParam(req,"id"),
      req.body,
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  deleteProduct: (async (req, res) => {
    const data = await productsService.deleteProduct(
     getRouteParam(req,"id")
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,
};