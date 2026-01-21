export interface Inquiry {
  id: string;
  protocol_number: string;
  type: string | null; // 'general'
  status: string | null; // 'new'
  priority: string | null; // 'normal'
  source: string | null; // 'web_form'
  customer_id?: string | null;
  requester_data: string; // JSON
  department?: string | null;
  assigned_staff_id?: string | null;
  subject?: string | null;
  related_order_id?: string | null;
  related_product_id?: string | null;
  metadata?: string | null; // JSON
  sla_due_at?: string | null;
  resolved_at?: string | null;
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateInquiryInput {
  type?: string;
  priority?: string;
  source?: string;
  customer_id?: string;
  requester_data: Record<string, any>;
  department?: string;
  assigned_staff_id?: string;
  subject?: string;
  related_order_id?: string;
  related_product_id?: string;
  metadata?: Record<string, any>;
  sla_due_at?: string;
}

export interface UpdateInquiryInput {
  status?: string;
  priority?: string;
  department?: string;
  assigned_staff_id?: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}
