export type InventoryMovement = {
  id: string;
  transaction_id: string | null;
  inventory_level_id: string | null;
  type: string | null;
  quantity: number;
  previous_balance: number | null;
  new_balance: number | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateInventoryMovementDTO = {
  transaction_id?: string;
  inventory_level_id: string;
  movement_type: string;
  quantity: number;
  previous_balance?: number;
  new_balance?: number;
};
