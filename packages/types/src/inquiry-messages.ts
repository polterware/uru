export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_type: "customer" | "staff" | "bot";
  sender_id?: string | null;
  body?: string | null;
  is_internal_note?: number | null; // 0 or 1
  attachments?: string | null; // JSON
  external_id?: string | null;
  read_at?: string | null;
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateInquiryMessageInput {
  inquiry_id: string;
  sender_type: "customer" | "staff" | "bot";
  sender_id?: string;
  body?: string;
  is_internal_note?: boolean;
  attachments?: string[];
}
