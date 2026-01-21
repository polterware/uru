export type CustomerGroupMembership = {
  customer_id: string;
  customer_group_id: string;
  _status: string;
  created_at: string;
  updated_at: string;
};

export type AssignCustomerGroupsDTO = {
  customer_id: string;
  group_ids: string[];
};
