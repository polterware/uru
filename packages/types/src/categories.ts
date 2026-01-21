export type Category = {
  id: string;
  shop_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  type: string | null;
  rules: string | null;
  is_visible: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  template_suffix: string | null;
  metadata: string | null;
  _status: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCategoryDTO = {
  shop_id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  banner_url?: string;
  type?: string;
  rules?: string;
  is_visible?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
  template_suffix?: string;
  metadata?: string;
};

export type UpdateCategoryDTO = {
  id: string;
  shop_id?: string;
  parent_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  banner_url?: string;
  type?: string;
  rules?: string;
  is_visible?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
  template_suffix?: string;
  metadata?: string;
};
