CREATE TYPE "public"."entity_type" AS ENUM('customer', 'menu_item', 'ingredient', 'supplier', 'staff', 'campaign', 'order');
CREATE TYPE "public"."inventory_unit" AS ENUM('kg', 'g', 'l', 'ml', 'ea', 'pack', 'box');
CREATE TYPE "public"."order_item_status" AS ENUM('pending', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled');
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'gcash', 'customer_card');
CREATE TYPE "public"."relation_type" AS ENUM('ordered', 'contains', 'requires', 'supplied_by', 'served_by', 'feedback_on', 'part_of', 'triggers');
CREATE TYPE "public"."sentiment" AS ENUM('very_positive', 'positive', 'neutral', 'negative', 'very_negative');
CREATE TYPE "public"."staff_role" AS ENUM('manager', 'chef', 'server', 'cashier', 'procurement', 'marketing', 'part_time');
CREATE TYPE "public"."strategy_level" AS ENUM('objective', 'key_result', 'tactic', 'action');
CREATE TYPE "public"."strategy_status" AS ENUM('draft', 'active', 'completed', 'paused', 'cancelled');
CREATE TYPE "public"."table_status" AS ENUM('available', 'occupied', 'reserved', 'cleaning');
CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'income');
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"customer_id" uuid,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2) DEFAULT '0',
	"is_used" integer DEFAULT 0,
	"used_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);

CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20),
	"name" varchar(100),
	"email" varchar(200),
	"rfm_recency" integer DEFAULT 0,
	"rfm_frequency" integer DEFAULT 0,
	"rfm_monetary" numeric(12, 2) DEFAULT '0',
	"rfm_segment" varchar(50) DEFAULT 'new',
	"preferences" jsonb DEFAULT '{"favoriteItems":[],"allergens":[],"avgSpend":0,"visitPattern":""}'::jsonb,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"last_visit_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);

CREATE TABLE "feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"customer_id" uuid,
	"rating" integer NOT NULL,
	"comment" text,
	"sentiment" "sentiment",
	"sentiment_score" numeric(4, 3),
	"ai_analysis" jsonb,
	"is_resolved" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "daily_closings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"total_income" numeric(12, 2) NOT NULL,
	"total_expense" numeric(12, 2) NOT NULL,
	"total_orders" integer DEFAULT 0,
	"avg_order_amount" numeric(10, 2),
	"top_menu_items" jsonb DEFAULT '[]'::jsonb,
	"source_snapshots" jsonb DEFAULT '[]'::jsonb,
	"ai_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_closings_date_unique" UNIQUE("date")
);

CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"group" varchar(100),
	"sort_order" integer DEFAULT 0,
	"is_active" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "financial_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"initial_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"current_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"role" "staff_role" NOT NULL,
	"phone" varchar(30),
	"pin" varchar(6),
	"is_active" integer DEFAULT 1 NOT NULL,
	"total_orders_served" integer DEFAULT 0,
	"avg_service_time" integer DEFAULT 0,
	"customer_rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"category_id" uuid,
	"source_id" uuid NOT NULL,
	"staff_id" uuid,
	"order_id" uuid,
	"receipt_url" varchar(500),
	"items" jsonb DEFAULT '[]'::jsonb,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "table_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"guest_count" integer DEFAULT 1,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	CONSTRAINT "table_sessions_session_token_unique" UNIQUE("session_token")
);

CREATE TABLE "tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"name" varchar(50),
	"seats" integer DEFAULT 4 NOT NULL,
	"status" "table_status" DEFAULT 'available' NOT NULL,
	"qr_code" varchar(500),
	"position_x" integer,
	"position_y" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tables_number_unique" UNIQUE("number")
);

CREATE TABLE "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"name_tl" varchar(100),
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"icon" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "menu_item_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit" varchar(20) NOT NULL
);

CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_en" varchar(200),
	"name_tl" varchar(200),
	"description" text,
	"description_en" text,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"image_url" varchar(500),
	"allergens" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"prep_time_minutes" integer DEFAULT 15,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_seasonal" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"avg_rating" numeric(3, 2) DEFAULT '0',
	"profit_margin" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "menu_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"recommended_with" uuid,
	"reason" text,
	"score" numeric(5, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"special_request" text,
	"status" "order_item_status" DEFAULT 'pending' NOT NULL,
	"prep_started_at" timestamp with time zone,
	"ready_at" timestamp with time zone,
	"served_at" timestamp with time zone
);

CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" integer NOT NULL,
	"table_id" uuid,
	"session_id" uuid,
	"customer_id" uuid,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"final_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_method" "payment_method",
	"staff_id" uuid,
	"special_request" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"paid_at" timestamp with time zone
);

CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"unit" "inventory_unit" NOT NULL,
	"current_stock" numeric(12, 3) DEFAULT '0' NOT NULL,
	"min_stock" numeric(12, 3) DEFAULT '0' NOT NULL,
	"avg_cost_per_unit" numeric(10, 2) DEFAULT '0',
	"last_purchase_price" numeric(10, 2),
	"preferred_supplier_id" uuid,
	"storage_location" varchar(100),
	"expiry_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"unit_price" numeric(10, 2),
	"total_price" numeric(10, 2),
	"supplier_id" uuid,
	"order_id" uuid,
	"note" text,
	"receipt_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb,
	"total_estimated" numeric(12, 2),
	"total_actual" numeric(12, 2),
	"ordered_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"contact_person" varchar(100),
	"phone" varchar(30),
	"email" varchar(200),
	"address" text,
	"category" varchar(100),
	"rating" numeric(3, 2) DEFAULT '0',
	"is_active" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "entity_type" NOT NULL,
	"ref_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid,
	"entity_type" varchar(50),
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" integer DEFAULT 0,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'info',
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"action_suggestion" text,
	"is_read" integer DEFAULT 0,
	"is_actioned" integer DEFAULT 0,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "ontology_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"relation_type" "relation_type" NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb,
	"weight" numeric(5, 3) DEFAULT '1.0',
	"valid_from" timestamp with time zone DEFAULT now(),
	"valid_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid,
	"name" varchar(300) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"target_segment" varchar(50),
	"channel" varchar(50),
	"budget" numeric(12, 2) DEFAULT '0',
	"spent" numeric(12, 2) DEFAULT '0',
	"revenue_generated" numeric(12, 2) DEFAULT '0',
	"config" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'draft',
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"level" "strategy_level" NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" "strategy_status" DEFAULT 'draft' NOT NULL,
	"kpi_metric" varchar(100),
	"kpi_target" numeric(15, 2),
	"kpi_current" numeric(15, 2) DEFAULT '0',
	"kpi_unit" varchar(20),
	"assigned_to" uuid,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"ai_generated" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "strategy_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text,
	"kpi_snapshot" numeric(15, 2),
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "coupons" ADD CONSTRAINT "coupons_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_id_financial_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."financial_sources"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "menu_item_ingredients" ADD CONSTRAINT "menu_item_ingredients_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "menu_recommendations" ADD CONSTRAINT "menu_recommendations_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "menu_recommendations" ADD CONSTRAINT "menu_recommendations_recommended_with_menu_items_id_fk" FOREIGN KEY ("recommended_with") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_table_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."table_sessions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_preferred_supplier_id_suppliers_id_fk" FOREIGN KEY ("preferred_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ontology_relations" ADD CONSTRAINT "ontology_relations_source_id_entities_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ontology_relations" ADD CONSTRAINT "ontology_relations_target_id_entities_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "strategy_logs" ADD CONSTRAINT "strategy_logs_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "idx_entities_type" ON "entities" USING btree ("type");
CREATE INDEX "idx_entities_ref" ON "entities" USING btree ("ref_id");
CREATE INDEX "idx_events_type" ON "events" USING btree ("event_type");
CREATE INDEX "idx_events_processed" ON "events" USING btree ("processed");
CREATE INDEX "idx_relations_source" ON "ontology_relations" USING btree ("source_id");
CREATE INDEX "idx_relations_target" ON "ontology_relations" USING btree ("target_id");
CREATE INDEX "idx_relations_type" ON "ontology_relations" USING btree ("relation_type");