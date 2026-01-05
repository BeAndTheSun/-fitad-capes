export interface IntegrationConfig {
  enabled: boolean;
  values: {
    [key: string]: string;
  };
}

export interface ShopifyIntegrationConfig {
  enabled: boolean;
  values: {
    accessToken: string;
    shopUrl: string;
  };
}

export interface ZapierIntegrationConfig {
  enabled: boolean;
  values: {
    WEBHOOK_URL: string;
    API_KEY: string;
  };
}

export interface PrivateSiteIntegrationsConfig {
  zapier: ZapierIntegrationConfig;
  shopify: ShopifyIntegrationConfig;
}

export enum IntegrationsKeys {
  Zapier = 'zapier',
  Shopify = 'shopify',
  Stripe = 'stripe',
  MercadoPago = 'mercado-pago',
  WooCommerce = 'woocommerce',
}
