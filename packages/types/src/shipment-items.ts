export interface ShipmentItem {
  id: string;
  shipment_id: string;
  order_item_id: string;
  quantity: number;
  batch_number?: string | null;
  serial_numbers?: string | null; // string array as JSON or string? Schema says TEXT, comment TEXT[]
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateShipmentItemInput {
  shipment_id: string;
  order_item_id: string;
  quantity: number;
  batch_number?: string;
  serial_numbers?: string[];
}
