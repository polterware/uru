export type Location = {
  id: string;
  name: string;
  type: string;
  is_sellable: boolean;
  address_data: string | null;
};

export type CreateLocationDTO = {
  name: string;
  type: string;
  is_sellable?: boolean;
  address_data?: string;
};

export type UpdateLocationDTO = {
  id: string;
  name?: string;
  type?: string;
  is_sellable?: boolean;
  address_data?: string;
};
