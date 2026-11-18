CREATE TYPE "public"."collection_type" AS ENUM('manual', 'automatic');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cod', 'prepaid');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer');