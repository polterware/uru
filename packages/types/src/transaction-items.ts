export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string | null;
  sku_snapshot: string | null;
  name_snapshot: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number | null;
  total_line: number | null;
  attributes_snapshot: string | null;
  tax_details: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateTransactionItemDTO = {
  transaction_id: string;
  product_id?: string;
  sku_snapshot?: string;
  name_snapshot?: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
  attributes_snapshot?: string;
  tax_details?: string;
};

export type UpdateTransactionItemDTO = {
  id: string;
  product_id?: string;
  sku_snapshot?: string;
  name_snapshot?: string;
  quantity?: number;
  unit_price?: number;
  unit_cost?: number;
  attributes_snapshot?: string;
  tax_details?: string;
};
