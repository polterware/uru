export type Brand = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  sort_order: number | null;
  metadata: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateBrandDTO = {
  name: string;
  slug: string;
  status?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_featured?: boolean;
  sort_order?: number;
  metadata?: string;
};

export type UpdateBrandDTO = {
  id: string;
  name?: string;
  slug?: string;
  status?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_featured?: boolean;
  sort_order?: number;
  metadata?: string;
};
