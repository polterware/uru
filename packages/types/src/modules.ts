export type Module = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  is_core: boolean;
  dependencies: string | null;
  features: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};
