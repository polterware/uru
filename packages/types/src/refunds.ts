export type Refund = {
  id: string;
  payment_id: string;
  amount: number;
  status: string;
  reason: string | null;
  provider_refund_id: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
};

export type CreateRefundDTO = {
  payment_id: string;
  amount: number;
  status?: string;
  reason?: string;
  provider_refund_id?: string;
};

export type UpdateRefundDTO = {
  id: string;
  payment_id?: string;
  amount?: number;
  status?: string;
  reason?: string;
  provider_refund_id?: string;
};

export const REFUND_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const REFUND_REASONS = [
  { value: "customer_request", label: "Customer Request" },
  { value: "product_defect", label: "Product Defect" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "not_as_described", label: "Not As Described" },
  { value: "duplicate_charge", label: "Duplicate Charge" },
  { value: "fraud", label: "Fraud" },
  { value: "other", label: "Other" },
] as const;
