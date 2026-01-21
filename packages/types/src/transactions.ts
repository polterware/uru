import type { CreateTransactionItemDTO } from "./transaction-items";

export type Transaction = {
  id: string;
  type: string;
  status: string;
  channel: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  staff_id: string | null;
  currency: string | null;
  total_items: number | null;
  total_shipping: number | null;
  total_discount: number | null;
  total_net: number | null;
  shipping_method: string | null;
  shipping_address: string | null;
  billing_address: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateTransactionDTO = {
  type: string;
  status?: string;
  channel?: string;
  customer_id?: string;
  supplier_id?: string;
  staff_id?: string;
  currency?: string;
  total_shipping?: number;
  total_discount?: number;
  shipping_method?: string;
  shipping_address?: string;
  billing_address?: string;
  location_id?: string;
  items: CreateTransactionItemDTO[];
};

export type UpdateTransactionDTO = {
  id: string;
  type?: string;
  status?: string;
  channel?: string;
  customer_id?: string;
  supplier_id?: string;
  staff_id?: string;
  currency?: string;
  total_items?: number;
  total_shipping?: number;
  total_discount?: number;
  total_net?: number;
  shipping_method?: string;
  shipping_address?: string;
  billing_address?: string;
};

export type UpdateTransactionStatusDTO = {
  id: string;
  status: string;
};

export type CompleteSaleDTO = {
  id: string;
  location_id: string;
};
