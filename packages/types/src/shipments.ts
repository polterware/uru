export interface Shipment {
  id: string;
  order_id: string;
  location_id?: string | null;
  status: string | null;
  carrier_company?: string | null;
  carrier_service?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  weight_g?: number | null;
  height_mm?: number | null;
  width_mm?: number | null;
  depth_mm?: number | null;
  package_type?: string | null;
  shipping_label_url?: string | null;
  invoice_url?: string | null;
  invoice_key?: string | null;
  cost_amount?: number | null;
  insurance_amount?: number | null;
  estimated_delivery_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  metadata?: string | null; // JSON
  customs_info?: string | null; // JSON
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateShipmentInput {
  order_id: string;
  location_id?: string;
  status?: string;
  carrier_company?: string;
  carrier_service?: string;
  tracking_number?: string;
  tracking_url?: string;
  weight_g?: number;
  dimensions?: {
    height: number;
    width: number;
    depth: number;
  };
  package_type?: string;
}

export interface UpdateShipmentInput {
  status?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  metadata?: Record<string, any>;
}
