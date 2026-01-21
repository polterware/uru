export type InventoryLevel = {
  id: string;
  product_id: string;
  location_id: string;
  batch_number: string | null;
  serial_number: string | null;
  expiry_date: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  stock_status: string | null;
  aisle_bin_slot: string | null;
  last_counted_at: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateInventoryLevelDTO = {
  product_id: string;
  location_id: string;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  quantity_on_hand?: number;
  quantity_reserved?: number;
  stock_status?: string;
  aisle_bin_slot?: string;
};

export type UpdateInventoryLevelDTO = {
  id: string;
  product_id?: string;
  location_id?: string;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  quantity_on_hand?: number;
  quantity_reserved?: number;
  stock_status?: string;
  aisle_bin_slot?: string;
};

export type AdjustStockDTO = {
  product_id: string;
  location_id: string;
  new_quantity: number;
  reason?: string;
};

export type TransferStockDTO = {
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  reason?: string;
};
