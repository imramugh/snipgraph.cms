CREATE TABLE "media_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"checksum" text NOT NULL,
	"alt_text" text NOT NULL,
	"decorative" boolean DEFAULT false NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"source" "actor_source" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings_revision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"source" "actor_source" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings_state" (
	"site_id" uuid PRIMARY KEY NOT NULL,
	"draft_revision_id" uuid NOT NULL,
	"published_revision_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings_revision" ADD CONSTRAINT "site_settings_revision_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings_state" ADD CONSTRAINT "site_settings_state_site_id_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings_state" ADD CONSTRAINT "site_settings_state_draft_revision_id_site_settings_revision_id_fk" FOREIGN KEY ("draft_revision_id") REFERENCES "public"."site_settings_revision"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings_state" ADD CONSTRAINT "site_settings_state_published_revision_id_site_settings_revision_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "public"."site_settings_revision"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_asset_site_checksum_idx" ON "media_asset" USING btree ("site_id","checksum");--> statement-breakpoint
CREATE INDEX "media_asset_site_created_idx" ON "media_asset" USING btree ("site_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "site_settings_revision_sequence_uidx" ON "site_settings_revision" USING btree ("site_id","sequence");