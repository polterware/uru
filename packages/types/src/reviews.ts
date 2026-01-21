export interface Review {
  id: string;
  order_id: string;
  customer_id?: string | null;
  product_id?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  photos?: string | null; // JSON
  videos?: string | null; // JSON
  _status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateReviewInput {
  order_id: string;
  customer_id?: string;
  product_id?: string;
  rating: number;
  title?: string;
  body?: string;
  photos?: string[];
  videos?: string[];
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  body?: string;
  photos?: string[];
  videos?: string[];
}
