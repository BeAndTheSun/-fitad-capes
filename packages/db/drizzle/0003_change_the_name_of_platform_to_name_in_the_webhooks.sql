ALTER TYPE "public"."platform" ADD VALUE 'stripe';--> statement-breakpoint
ALTER TYPE "public"."platform" ADD VALUE 'mercado-pago';--> statement-breakpoint
ALTER TYPE "public"."platform" ADD VALUE 'woocommerce';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'STRIPE_SECRET_LIVE_KEY';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'STRIPE_SECRET_TEST_KEY';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'MERCADO_PAGO_PUBLIC_PRODUCTION_KEY';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'MERCADO_PAGO_SANDBOX_ACCESS_TOKEN';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'MERCADO_PAGO_PUBLIC_SANDBOX_KEY';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'WOOCOMMERCE_API_URL';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'WOOCOMMERCE_CONSUMER_KEY';--> statement-breakpoint
ALTER TYPE "public"."keyName" ADD VALUE 'WOOCOMMERCE_CONSUMER_SECRET';--> statement-breakpoint
ALTER TABLE "webhook-events" RENAME COLUMN "platform" TO "name";--> statement-breakpoint
ALTER TABLE "webhooks" RENAME COLUMN "platform" TO "name";