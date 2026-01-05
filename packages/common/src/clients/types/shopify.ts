export type ShopifyOrder = {
  id: number;
  email: string;
  closed_at: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string;
  token: string;
  gateway: string;
  test: string;
  total_price: number;
  subtotal_price: number;
  total_weight: number;
  total_tax: number;
  taxes_included: boolean;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: number;
  total_line_items_price: number;
  cart_token: string;
  buyer_accepts_marketing: boolean;
  name: string;
  referring_site: string;
  landing_site: string;
  cancelled_at: string;
  cancel_reason: string;
  total_price_usd: string;
  checkout_token: string;
  reference: string;
  user_id: string;
  location_id: string;
  source_identifier: string;
  source_url: string;
  processed_at: string;
  device_id: string;
  phone: string;
  customer_locale: string;
  app_id: string;
  browser_ip: string;
  landing_site_ref: string;
  order_number: number;
  discount_applications: [
    {
      type: string;
      value: number;
      value_type: string;
      allocation_method: string;
      target_selection: string;
      target_type: 'line_item';
      description: string;
      title: string;
    },
  ];
  discount_codes: [];
  note_attributes: unknown;
  payment_gateway_names: [];
  processing_method: string;
  checkout_id: string;
  source_name: string;
  fulfillment_status: string;
  tax_lines: [];
  tags: string;
  contact_email: string;
  order_status_url: string;
  presentment_currency: string;
  total_line_items_price_set: {
    shop_money: {
      amount: number;
      currency_code: string;
    };
    presentment_money: {
      amount: number;
      currency_code: string;
    };
  };
  total_discounts_set: {
    shop_money: {
      amount: number;
      currency_code: string;
    };
    presentment_money: {
      amount: number;
      currency_code: string;
    };
  };
  total_shipping_price_set: {
    shop_money: {
      amount: number;
      currency_code: string;
    };
    presentment_money: {
      amount: number;
      currency_code: string;
    };
  };
  subtotal_price_set: {
    shop_money: {
      amount: number;
      currency_code: string;
    };
    presentment_money: {
      amount: number;
      currency_code: string;
    };
  };
  total_price_set: {
    shop_money: {
      amount: number;
      currency_code: string;
    };
    presentment_money: {
      amount: number;
      currency_code: string;
    };
  };
  total_tax_set: {
    shop_money: {
      amount: number;
      currency_code: string;
    };
    presentment_money: {
      amount: number;
      currency_code: string;
    };
  };
  line_items: [
    {
      id: string;
      variant_id: string;
      title: string;
      quantity: number;
      sku: string;
      variant_title: string;
      vendor: string;
      fulfillment_service: string;
      product_id: string;
      requires_shipping: boolean;
      taxable: boolean;
      gift_card: boolean;
      name: string;
      variant_inventory_management: string;
      properties: [];
      product_exists: boolean;
      fulfillable_quantity: number;
      grams: number;
      price: number;
      total_discount: number;
      fulfillment_status: string;
      price_set: {
        shop_money: {
          amount: number;
          currency_code: string;
        };
        presentment_money: {
          amount: number;
          currency_code: string;
        };
      };
      total_discount_set: {
        shop_money: {
          amount: number;
          currency_code: string;
        };
        presentment_money: {
          amount: number;
          currency_code: string;
        };
      };
      discount_allocations: [];
      duties: [];
      admin_graphql_api_id: string;
      tax_lines: [];
    },
  ];
  fulfillments: [];
  refunds: [];
  total_tip_received: number;
  original_total_duties_set: string;
  current_total_duties_set: string;
  payment_terms: string;
  admin_graphql_api_id: string;
  shipping_lines: [
    {
      id: string;
      title: string;
      price: number;
      code: string;
      source: string;
      phone: string;
      requested_fulfillment_service_id: string;
      delivery_category: string;
      carrier_identifier: string;
      discounted_price: number;
      price_set: {
        shop_money: {
          amount: number;
          currency_code: string;
        };
        presentment_money: {
          amount: number;
          currency_code: string;
        };
      };
      discounted_price_set: {
        shop_money: {
          amount: number;
          currency_code: string;
        };
        presentment_money: {
          amount: number;
          currency_code: string;
        };
      };
      discount_allocations: [];
      tax_lines: [];
    },
  ];
  billing_address: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company: string;
    latitude: string;
    longitude: string;
    name: string;
    country_code: string;
    province_code: string;
  };
  shipping_address: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company: string;
    latitude: string;
    longitude: string;
    name: string;
    country_code: string;
    province_code: string;
  };
  customer: {
    id: string;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: number;
    last_order_id: string;
    note: string;
    verified_email: boolean;
    multipass_identifier: string;
    tax_exempt: boolean;
    phone: string;
    tags: string;
    last_order_name: string;
    currency: string;
    accepts_marketing_updated_at: string;
    marketing_opt_in_level: string;
    email_marketing_consent: {
      state: string;
      opt_in_level: string;
      consent_updated_at: string;
    };
    sms_marketing_consent: string;
    admin_graphql_api_id: string;
    default_address: {
      id: string;
      customer_id: string;
      first_name: string;
      last_name: string;
      company: string;
      address1: string;
      address2: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone: string;
      name: string;
      province_code: string;
      country_code: string;
      country_name: string;
      default: boolean;
    };
  };
};

export type ShopifyVariant = {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: number | null;
  fulfillment_service: string;
  inventory_management: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string;
  grams: number;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
  image_id: string | null;
};

export type ShopifyWebhookEvent = {
  order: ShopifyOrder;
};

export type ShopifyCustomer = {
  id: string;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note: string;
  verified_email: boolean;
  multipass_identifier: unknown;
  tax_exempt: boolean;
  phone: string | null;
  tags: string;
  last_order_name: string;
  currency: string;
  addresses: [];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: unknown;
  tax_exemptions: [];
  sms_marketing_consent: [];
  admin_graphql_api_id: string;
  default_address: [];
};

export type ShopifyCustomers = {
  customers: ShopifyCustomer[];
};

export type ShopifyCustomerInformation = {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string | null;
  addresses?: {
    address1: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
};

type TaxLine = {
  rate: number;
  price: number;
};

type ShopifyLineItem = {
  title?: string;
  variant_id?: number;
  product_id?: number;
  variant_title?: string;
  total_discount?: number;
  price?: number;
  quantity: number;
  taxable?: boolean;
  tax_lines?: TaxLine[];
  requires_shipping: boolean;
  properties?: { name: string; value: string }[];
};

type ShopifyAddress = {
  address2: string;
  address1: string;
  city: string;
  country: string;
  first_name: string;
  last_name: string;
  // TODO: check this
  phone?: string | null;
  province: string;
  name?: string;
};

export type ShopifyShippingLine = {
  title: string;
  price: number;
  code?: string;
  discounted_price?: number;
  source?: string;
  tax_lines?: TaxLine[];
  carrier_identifier?: string;
  requested_fulfillment_service_id?: string | null;
};

export type ShopifyOrderInformation = {
  line_items: ShopifyLineItem[];
  send_receipt: boolean;
  send_fulfillment_receipt: boolean;
  note_attributes: {
    name: string;
    value: unknown;
  }[];
  taxes_included: boolean;
  total_discounts: number;
  // TODO: check the correct type of this
  financial_status: 'paid';
  transactions: {
    // TODO: check the correct type of this
    kind: 'capture';
    // TODO: check the correct type of this
    status: 'success';
    currency: string;
    gateway: string;
    amount: number;
  }[];
  shipping_lines: ShopifyShippingLine[] | null;
  total_price: number;
  shipping_address: ShopifyAddress;
  billing_address: ShopifyAddress;
  note: string | null;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
};

export type ShopifyProduct = {
  body_html: string;
  created_at: string;
  handle: string;
  id: number;
  images: {
    id: string;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    width: number;
    height: number;
    src: string;
    variant_ids: string[];
  }[];
  options: {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }[];
  product_type: string;
  published_at: string;
  published_scope: string;
  status: string;
  tags: string;
  template_suffix: string;
  title: string;
  updated_at: string;
  variants: ShopifyVariant[];
  vendor: string;
};
