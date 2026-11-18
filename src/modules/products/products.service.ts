import slugify from "slugify";

import { productsRepository } from "../../repository/product.repository";
import { categoriesRepository } from "../../repository/categories.repository";
import { ApiError } from "../../utils/api-error";

import type {
  CreateProductInput,
  UpdateProductInput,
  ProductListQuery,
} from "../../validations/products.validation";

export const productsService = {
  async getPublicProducts(filters: ProductListQuery) {
    let categoryId: string | undefined;

    if (filters.category) {
      const category = await productsRepository.findByCategorySlug(
        filters.category,
      );

      if (!category) {
        throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found");
      }

      categoryId = category.id;
    }

    const result = await productsRepository.findPublicProducts(
      filters,
      categoryId,
    );

    return {
      data: result.data,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / filters.limit),
      },
    };
  },

  async getPublicProduct(slug: string) {
    const product = await productsRepository.findPublicBySlug(slug);

    if (!product) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    const siblings = product.groupKey
      ? await productsRepository.findSiblings(product.groupKey, product.id)
      : [];

    return {
      ...product,
      siblings,
    };
  },

  async getAdminProducts(query: {
    q?: string;
    status?: "active" | "draft" | "archived";
    page: number;
    limit: number;
  }) {
    const result = await productsRepository.findAdminProducts(
      query.q,
      query.status,
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

  async getAdminProduct(id: string) {
    const product = await productsRepository.findById(id);

    if (!product) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    return product;
  },

  async createProduct(data: CreateProductInput) {
    if (data.categoryId) {
      const category = await categoriesRepository.findById(data.categoryId);

      if (!category) {
        throw new ApiError(
          404,
          "CATEGORY_NOT_FOUND",
          "Selected category does not exist",
        );
      }
    }

    const slug = slugify(data.slug || data.name, {
      lower: true,
      strict: true,
    });

    return productsRepository.create({
      ...data,
      slug,
    });
  },

 async updateProduct(id: string, data: UpdateProductInput) {
  const product = await productsRepository.findById(id);

  if (!product) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  // Validate category if categoryId is provided
  if (data.categoryId) {
    const category = await categoriesRepository.findById(data.categoryId);

    if (!category) {
      throw new ApiError(
        404,
        "CATEGORY_NOT_FOUND",
        "Selected category does not exist",
      );
    }
  }

  // Validate final prices using incoming data and existing product values
  const finalPrice = data.pricePaise ?? product.pricePaise;

  const finalCompareAtPrice =
    data.compareAtPricePaise !== undefined
      ? data.compareAtPricePaise
      : product.compareAtPricePaise;

  if (
    finalCompareAtPrice != null &&
    finalCompareAtPrice < finalPrice
  ) {
    throw new ApiError(
      400,
      "INVALID_COMPARE_AT_PRICE",
      "Compare-at price must be greater than or equal to price",
    );
  }

  // Prepare update data
  const updateData = { ...data };

  // Generate slug when name changes and slug is not explicitly provided
  if (data.name && !data.slug) {
    updateData.slug = slugify(data.name, {
      lower: true,
      strict: true,
    });
  }

  // Normalize slug if provided or generated
  if (updateData.slug) {
    updateData.slug = slugify(updateData.slug, {
      lower: true,
      strict: true,
    });
  }

  return productsRepository.update(id, updateData);
},

  async deleteProduct(id: string) {
    const product = await productsRepository.findById(id);

    if (!product) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    return productsRepository.softDelete(id);
  },
};
