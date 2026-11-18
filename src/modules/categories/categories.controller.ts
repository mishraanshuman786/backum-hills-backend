import type { RequestHandler } from "express";

import { categoriesService } from "./categories.service";
import { getRouteParam } from "../../utils/get-route-param";
export const categoriesController = {
  getPublicCategories: (async (_req, res) => {
    const data = await categoriesService.getPublicCategories();

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  getAllCategories: (async (_req, res) => {
    const data = await categoriesService.getAllCategories();

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  createCategory: (async (req, res) => {
    const data = await categoriesService.createCategory(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  updateCategory: (async (req, res) => {
    const data = await categoriesService.updateCategory(
   getRouteParam(req, "id"),
      req.body,
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  deleteCategory: (async (req, res) => {
    const data = await categoriesService.deleteCategory(
     getRouteParam(req,"id")
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,

  toggleMenu: (async (req, res) => {
    const data = await categoriesService.toggleMenu(
      getRouteParam(req,"id"),
      req.body.isInMenu,
    );

    res.status(200).json({
      success: true,
      data,
    });
  }) satisfies RequestHandler,
};