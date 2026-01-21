export type Payment = {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string | null;
  exchange_rate: number | null;
  provider: string;
  method: string;
  installments: number | null;
  installment_amount: number | null;
  interest_rate: number | null;
  status: string;
  provider_transaction_id: string | null;
  authorization_code: string | null;
  payment_details: string | null;
  metadata: string | null;
  risk_level: string | null;
  authorized_at: string | null;
  captured_at: string | null;
  voided_at: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreatePaymentDTO = {
  transaction_id: string;
  amount: number;
  currency?: string;
  exchange_rate?: number;
  provider: string;
  method: string;
  installments?: number;
  installment_amount?: number;
  interest_rate?: number;
  status?: string;
  provider_transaction_id?: string;
  authorization_code?: string;
  payment_details?: string;
  metadata?: string;
  risk_level?: string;
};

export type UpdatePaymentDTO = {
  id: string;
  amount?: number;
  currency?: string;
  exchange_rate?: number;
  provider?: string;
  method?: string;
  installments?: number;
  installment_amount?: number;
  interest_rate?: number;
  status?: string;
  provider_transaction_id?: string;
  authorization_code?: string;
  payment_details?: string;
  metadata?: string;
  risk_level?: string;
  authorized_at?: string;
  captured_at?: string;
  voided_at?: string;
};

export const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "voucher", label: "Voucher" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "Wallet" },
  { value: "crypto", label: "Crypto" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "authorized", label: "Authorized" },
  { value: "captured", label: "Captured" },
  { value: "declined", label: "Declined" },
  { value: "voided", label: "Voided" },
  { value: "refunded", label: "Refunded" },
  { value: "charged_back", label: "Charged Back" },
] as const;

export const RISK_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;
