import slugify from "slugify";

import { categoriesRepository } from "../../repository/categories.repository";
import { ApiError } from "../../utils/api-error";

import type { CreateCategoryInput, UpdateCategoryInput } from "../../validations/categories.validation";

export const categoriesService = {
  async getPublicCategories() {
    return categoriesRepository.findMenuCategories();
  },

  async getAllCategories() {
    return categoriesRepository.findAll();
  },

  async createCategory(data: CreateCategoryInput) {
    const slug = data.slug
      ? slugify(data.slug, { lower: true, strict: true })
      : slugify(data.name, { lower: true, strict: true });

    const existing = await categoriesRepository.findBySlug(slug);

    if (existing) {
      throw new ApiError(
        409,
        "CATEGORY_SLUG_EXISTS",
        "A category with this slug already exists",
      );
    }

    return categoriesRepository.create({
      ...data,
      slug,
    });
  },

  async updateCategory(
    id: string,
    data: UpdateCategoryInput,
  ) {
    const existingCategory =
      await categoriesRepository.findById(id);

    if (!existingCategory) {
      throw new ApiError(
        404,
        "CATEGORY_NOT_FOUND",
        "Category not found",
      );
    }

    const updateData = { ...data };

    if (data.name && !data.slug) {
      updateData.slug = slugify(data.name, {
        lower: true,
        strict: true,
      });
    }

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug, {
        lower: true,
        strict: true,
      });

      const existingSlug = await categoriesRepository.findBySlug(
        updateData.slug,
      );

      if (existingSlug && existingSlug.id !== id) {
        throw new ApiError(
          409,
          "CATEGORY_SLUG_EXISTS",
          "A category with this slug already exists",
        );
      }
    }

    return categoriesRepository.update(id, updateData);
  },

  async deleteCategory(id: string) {
    const category = await categoriesRepository.findById(id);

    if (!category) {
      throw new ApiError(
        404,
        "CATEGORY_NOT_FOUND",
        "Category not found",
      );
    }

    const productCount =
      await categoriesRepository.countProducts(id);

    if (productCount > 0) {
      throw new ApiError(
        409,
        "CATEGORY_HAS_PRODUCTS",
        "Cannot delete a category containing products",
        { productCount },
      );
    }

    return categoriesRepository.delete(id);
  },

  async toggleMenu(id: string, isInMenu: boolean) {
    const category = await categoriesRepository.findById(id);

    if (!category) {
      throw new ApiError(
        404,
        "CATEGORY_NOT_FOUND",
        "Category not found",
      );
    }

    return categoriesRepository.update(id, { isInMenu });
  },
};