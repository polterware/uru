export type Order = {
  id: string;
  order_number: number | null;
  idempotency_key: string | null;
  channel: string | null;
  shop_id: string | null;
  customer_id: string | null;
  status: string | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  currency: string | null;
  subtotal_price: number;
  total_discounts: number | null;
  total_tax: number | null;
  total_shipping: number | null;
  total_tip: number | null;
  total_price: number;
  tax_lines: string | null;
  discount_codes: string | null;
  note: string | null;
  tags: string | null;
  custom_attributes: string | null;
  metadata: string | null;
  customer_snapshot: string;
  billing_address: string | null;
  shipping_address: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
  cancelled_at: string | null;
  closed_at: string | null;
};

export type CreateOrderDTO = {
  channel?: string;
  shop_id?: string;
  customer_id?: string;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  currency?: string;
  subtotal_price: number;
  total_discounts?: number;
  total_tax?: number;
  total_shipping?: number;
  total_tip?: number;
  total_price: number;
  tax_lines?: string;
  discount_codes?: string;
  note?: string;
  tags?: string;
  custom_attributes?: string;
  metadata?: string;
  customer_snapshot: string;
  billing_address?: string;
  shipping_address?: string;
};

export type UpdateOrderDTO = {
  id: string;
  channel?: string;
  shop_id?: string;
  customer_id?: string;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  currency?: string;
  subtotal_price?: number;
  total_discounts?: number;
  total_tax?: number;
  total_shipping?: number;
  total_tip?: number;
  total_price?: number;
  tax_lines?: string;
  discount_codes?: string;
  note?: string;
  tags?: string;
  custom_attributes?: string;
  metadata?: string;
  customer_snapshot?: string;
  billing_address?: string;
  shipping_address?: string;
};

export type UpdatePaymentStatusDTO = {
  id: string;
  payment_status: string;
};

export type UpdateFulfillmentStatusDTO = {
  id: string;
  fulfillment_status: string;
};
