CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(100),
	"description" text,
	"category_id" uuid,
	"price_paise" integer NOT NULL,
	"compare_at_price_paise" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"color_name" varchar(100),
	"color_hex" varchar(20),
	"group_key" varchar(255),
	"sizes" text[] DEFAULT '{}'::text[] NOT NULL,
	"badge_text" varchar(100),
	"rating_avg" numeric(3, 2) DEFAULT '0' NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "products_price_check" CHECK ("products"."price_paise" > 0),
	CONSTRAINT "products_compare_price_check" CHECK ("products"."compare_at_price_paise" IS NULL OR "products"."compare_at_price_paise" >= "products"."price_paise"),
	CONSTRAINT "products_stock_check" CHECK ("products"."stock" >= 0),
	CONSTRAINT "products_low_stock_threshold_check" CHECK ("products"."low_stock_threshold" >= 0),
	CONSTRAINT "products_rating_count_check" CHECK ("products"."rating_count" >= 0),
	CONSTRAINT "products_sold_count_check" CHECK ("products"."sold_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"is_in_menu" boolean DEFAULT false NOT NULL,
	"is_coming_soon" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_sort_order_non_negative" CHECK ("categories"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_unique" ON "products" USING btree ("sku") WHERE "products"."sku" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_group_key_idx" ON "products" USING btree ("group_key");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_sort_order_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "categories_is_in_menu_idx" ON "categories" USING btree ("is_in_menu");