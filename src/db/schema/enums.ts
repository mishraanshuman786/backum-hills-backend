import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "customer",
]);

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);

export const collectionTypeEnum = pgEnum("collection_type", [
  "manual",
  "automatic",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",
  "prepaid",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "hidden",
]);