export interface ShipmentEvent {
  id: string;
  shipment_id: string | null;
  status: string | null;
  description: string | null;
  location: string | null;
  happened_at?: string | null;
  raw_data?: string | null; // JSON
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateShipmentEventInput {
  shipment_id: string;
  status: string;
  description?: string;
  location?: string;
  happened_at?: string;
  raw_data?: Record<string, any>;
}
