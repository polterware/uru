export type PosSession = {
  id: string;
  shop_id: string;
  location_id: string | null;
  operator_id: string;
  terminal_id: string | null;
  session_number: number | null;
  status: string | null; // 'open', 'paused', 'closed', 'cancelled'
  opening_cash_amount: number | null;
  opening_notes: string | null;
  opened_at: string | null;
  closing_cash_amount: number | null;
  closing_notes: string | null;
  closed_at: string | null;
  closed_by: string | null;
  total_sales: number | null;
  total_returns: number | null;
  total_cash_in: number | null;
  total_cash_out: number | null;
  transaction_count: number | null;
  expected_cash_amount: number | null;
  cash_difference: number | null;
  metadata: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreatePosSessionDTO = {
  shop_id: string;
  location_id?: string;
  operator_id: string;
  terminal_id?: string;
  opening_cash_amount?: number;
  opening_notes?: string;
  metadata?: string;
};

export type UpdatePosSessionDTO = {
  id: string;
  terminal_id?: string;
  opening_notes?: string;
  total_sales?: number;
  total_returns?: number;
  total_cash_in?: number;
  total_cash_out?: number;
  transaction_count?: number;
  metadata?: string;
};

export type ClosePosSessionDTO = {
  id: string;
  closing_cash_amount: number;
  closing_notes?: string;
  closed_by: string;
};
