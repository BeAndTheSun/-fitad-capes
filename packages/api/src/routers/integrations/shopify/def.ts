import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const createCustomerBodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

const shopifyCustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  accepts_marketing: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  orders_count: z.number(),
  state: z.string(),
  total_spent: z.string(),
  last_order_id: z.number(),
  note: z.string().nullable(),
  verified_email: z.boolean(),
  multipass_identifier: z.unknown(),
  tax_exempt: z.boolean(),
  phone: z.string().nullable(),
  tags: z.string(),
  last_order_name: z.string(),
  currency: z.string(),
  addresses: z.array(z.any()),
  accepts_marketing_updated_at: z.string(),
  marketing_opt_in_level: z.unknown().nullable(),
  tax_exemptions: z.array(z.string()),
  sms_marketing_consent: z.array(z.any()),
  admin_graphql_api_id: z.string(),
  default_address: z.array(z.any()),
});
const createCustomerSuccessSchema = z.object({
  customer: shopifyCustomerSchema,
});

export const shopifyApiDef = makeApi([
  {
    alias: 'getCustomer',
    description: 'getCustomer',
    method: 'post',
    path: '/:workspaceId/customer/get',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace ID',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Body',
        name: 'body',
        schema: createCustomerBodySchema.pick({ phone: true, email: true }),
      },
    ],
    errors: [
      {
        status: 404,
        description: 'Shopify integration not configured',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Shopify integration is not configured',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
    response: createCustomerSuccessSchema,
  },
  {
    alias: 'createCustomer',
    description: 'create customer in shopify',
    method: 'post',
    path: '/:workspaceId/customer/create',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace ID',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Body',
        name: 'body',
        schema: createCustomerBodySchema,
      },
    ],
    errors: [
      {
        status: 404,
        description: 'Shopify integration not configured',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Shopify integration is not configured',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
    response: createCustomerSuccessSchema,
  },
]);
