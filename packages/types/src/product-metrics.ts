export interface ProductMetrics {
  product_id: string;
  average_rating: number;
  review_count: number;
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
