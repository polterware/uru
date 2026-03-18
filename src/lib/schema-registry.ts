import type { Database } from "@/types/database";

export type SchemaTableName = keyof Database["public"]["Tables"];

export type TableGroup =
  | "identity"
  | "catalog"
  | "crm"
  | "inventory"
  | "commerce";

export type DeleteStrategy = "soft" | "hard";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "integer"
  | "enum"
  | "date"
  | "datetime"
  | "json"
  | "array"
  | "metadata"
  | "uuid"
  | "boolean";

export type ListColumnType =
  | "text"
  | "number"
  | "currency"
  | "integer"
  | "date"
  | "datetime"
  | "json"
  | "array"
  | "metadata"
  | "boolean"
  | "enum"
  | "uuid";

export type FieldOption = {
  label: string;
  value: string;
};

export type RelationConfig = {
  table: SchemaTableName;
  valueField: string;
  labelField: string;
  orderBy?: string;
  ascending?: boolean;
};

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  nullable?: boolean;
  editableOnCreate?: boolean;
  editableOnUpdate?: boolean;
  defaultValue?: unknown;
  autoValue?: "current_user_id" | "current_timestamp";
  options?: Array<FieldOption>;
  relation?: RelationConfig;
};

export type FieldConfigWithRelation = FieldConfig & {
  relation: RelationConfig;
};

export type ListColumnConfig = {
  key: string;
  label: string;
  type: ListColumnType;
};

export type TableSortConfig = {
  column: string;
  ascending: boolean;
};

export type TransactionalActionKind =
  | "orders_update_status"
  | "inventory_reserve_release";

export type JoinEditorKind =
  | "profile_roles"
  | "customer_groups"
  | "order_items"
  | "transaction_items"
  | "shipment_items"
  | "product_tags";

export type TableConfig = {
  table: SchemaTableName;
  label: string;
  description: string;
  group: TableGroup;
  primaryKey: string;
  deleteStrategy: DeleteStrategy;
  sort: TableSortConfig;
  listColumns: Array<ListColumnConfig>;
  fields: Array<FieldConfig>;
  transactionalActions?: Array<TransactionalActionKind>;
  joinEditor?: JoinEditorKind;
};

const LIFECYCLE_OPTIONS: Array<FieldOption> = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const ROLE_OPTIONS: Array<FieldOption> = [
  { label: "Admin", value: "admin" },
  { label: "Operator", value: "operator" },
  { label: "Analyst", value: "analyst" },
];

const LOCATION_TYPE_OPTIONS: Array<FieldOption> = [
  { label: "Warehouse", value: "warehouse" },
  { label: "Store", value: "store" },
  { label: "Transit", value: "transit" },
];

const INVENTORY_MOVEMENT_OPTIONS: Array<FieldOption> = [
  { label: "Inbound", value: "inbound" },
  { label: "Outbound", value: "outbound" },
  { label: "Adjustment", value: "adjustment" },
  { label: "Reservation", value: "reservation" },
  { label: "Release", value: "release" },
];

const CHECKOUT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Open", value: "open" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
  { label: "Abandoned", value: "abandoned" },
];

const ORDER_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

const ORDER_PAYMENT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Refunded", value: "refunded" },
  { label: "Partially refunded", value: "partially_refunded" },
];

const ORDER_FULFILLMENT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Unfulfilled", value: "unfulfilled" },
  { label: "Partial", value: "partial" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

const TRANSACTION_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Pending", value: "pending" },
  { label: "Authorized", value: "authorized" },
  { label: "Captured", value: "captured" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const TRANSACTION_ITEM_KIND_OPTIONS: Array<FieldOption> = [
  { label: "Product", value: "product" },
  { label: "Shipping", value: "shipping" },
  { label: "Discount", value: "discount" },
  { label: "Tax", value: "tax" },
  { label: "Fee", value: "fee" },
];

const REFUND_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Processed", value: "processed" },
];

const SHIPMENT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Pending", value: "pending" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const INQUIRY_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const REVIEW_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const POS_STATUS_OPTIONS: Array<FieldOption> = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

const PROFILE_RELATION: RelationConfig = {
  table: "profiles",
  valueField: "id",
  labelField: "email",
  orderBy: "email",
  ascending: true,
};

function lifecycleField(): FieldConfig {
  return {
    key: "lifecycle_status",
    label: "Lifecycle status",
    type: "enum",
    required: true,
    defaultValue: "active",
    options: LIFECYCLE_OPTIONS,
  };
}

function createdByField(
  key: "created_by" | "opened_by" | "author_id",
  label: string,
): FieldConfig {
  return {
    key,
    label,
    type: "uuid",
    required: true,
    editableOnCreate: false,
    editableOnUpdate: false,
    autoValue: "current_user_id",
    relation: PROFILE_RELATION,
  };
}

function readonlyTimestampField(
  key: "created_at" | "updated_at" | "deleted_at",
  label: string,
): FieldConfig {
  return {
    key,
    label,
    type: "datetime",
    editableOnCreate: false,
    editableOnUpdate: false,
  };
}

function withLifecycleAndTimestamps(
  fields: Array<FieldConfig>,
): Array<FieldConfig> {
  return [
    ...fields,
    lifecycleField(),
    readonlyTimestampField("created_at", "Created at"),
    readonlyTimestampField("updated_at", "Updated at"),
    readonlyTimestampField("deleted_at", "Deleted at"),
  ];
}

function withStandardTableMeta(fields: Array<FieldConfig>): Array<FieldConfig> {
  return [
    ...fields,
    {
      key: "id",
      label: "ID",
      type: "uuid",
      editableOnCreate: false,
      editableOnUpdate: false,
    },
  ];
}

export const SCHEMA_REGISTRY: Array<TableConfig> = [
  {
    table: "profiles",
    label: "Profiles",
    description: "Authenticated user profiles.",
    group: "identity",
    primaryKey: "id",
    deleteStrategy: "soft",
    joinEditor: "profile_roles",
    sort: { column: "updated_at", ascending: false },
    listColumns: [
      { key: "full_name", label: "Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "roles_count", label: "Roles", type: "integer" },
      { key: "role_names_csv", label: "Role names", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
      { key: "updated_at", label: "Updated at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "email", label: "Email", type: "text", nullable: true },
        {
          key: "full_name",
          label: "Full name",
          type: "text",
          nullable: true,
        },
        {
          key: "avatar_url",
          label: "Avatar URL",
          type: "text",
          nullable: true,
        },
      ]),
    ),
  },
  {
    table: "roles",
    label: "Roles",
    description: "System authorization roles.",
    group: "identity",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "code", label: "Code", type: "enum" },
      { key: "name", label: "Name", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "code",
          label: "Code",
          type: "enum",
          required: true,
          options: ROLE_OPTIONS,
        },
        { key: "name", label: "Name", type: "text", required: true },
      ]),
    ),
  },
  {
    table: "user_roles",
    label: "User Roles",
    description: "Link between users and roles.",
    group: "identity",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "user_id", label: "User", type: "uuid" },
      { key: "role_id", label: "Role", type: "uuid" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "user_id",
          label: "User",
          type: "uuid",
          required: true,
          relation: PROFILE_RELATION,
        },
        {
          key: "role_id",
          label: "Role",
          type: "uuid",
          required: true,
          relation: {
            table: "roles",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
      ]),
    ),
  },
  {
    table: "categories",
    label: "Categories",
    description: "Catalog categories.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
      { key: "updated_at", label: "Updated at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "name", label: "Name", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "brands",
    label: "Brands",
    description: "Product brands.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "name", label: "Name", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
      { key: "updated_at", label: "Updated at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "name", label: "Name", type: "text", required: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "lines",
    label: "Lines",
    description: "Product lines (e.g. Blue, Face).",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "image_url", label: "Image URL", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "name", label: "Name", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "image_url", label: "Image URL", type: "text", nullable: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "products",
    label: "Products",
    description: "Commercialized products.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    joinEditor: "product_tags",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "title", label: "Title", type: "text" },
      { key: "sku", label: "SKU", type: "text" },
      { key: "price", label: "Price", type: "currency" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "sku", label: "SKU", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "title", label: "Title", type: "text", required: true },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          nullable: true,
        },
        {
          key: "images",
          label: "Images (URLs)",
          type: "array",
          required: true,
          defaultValue: [],
        },
        {
          key: "category_id",
          label: "Category",
          type: "uuid",
          nullable: true,
          relation: {
            table: "categories",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
        {
          key: "brand_id",
          label: "Brand",
          type: "uuid",
          nullable: true,
          relation: {
            table: "brands",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
        {
          key: "line_id",
          label: "Line",
          type: "uuid",
          nullable: true,
          relation: {
            table: "lines",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
        {
          key: "price",
          label: "Price",
          type: "currency",
          required: true,
          defaultValue: 0,
        },
        { key: "cost", label: "Cost", type: "currency", nullable: true },
        {
          key: "is_published",
          label: "Published",
          type: "boolean",
          defaultValue: false,
        },
        { key: "weight", label: "Weight (kg)", type: "number", nullable: true },
        { key: "height", label: "Height (cm)", type: "number", nullable: true },
        { key: "width", label: "Width (cm)", type: "number", nullable: true },
        {
          key: "depth",
          label: "Depth (cm)",
          type: "number",
          nullable: true,
        },
        {
          key: "metadata",
          label: "Metadata (Key-Value)",
          type: "metadata",
          required: true,
          defaultValue: {},
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "customers",
    label: "Customers",
    description: "Customer registry.",
    group: "crm",
    primaryKey: "id",
    deleteStrategy: "soft",
    joinEditor: "customer_groups",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "full_name", label: "Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "groups_count", label: "Groups", type: "integer" },
      { key: "group_names_csv", label: "Group names", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "full_name",
          label: "Full name",
          type: "text",
          required: true,
        },
        { key: "email", label: "Email", type: "text", nullable: true },
        { key: "phone", label: "Phone", type: "text", nullable: true },
        { key: "notes", label: "Notes", type: "textarea", nullable: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "customer_addresses",
    label: "Customer Addresses",
    description: "Customer addresses.",
    group: "crm",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "updated_at", ascending: false },
    listColumns: [
      { key: "customer_id", label: "Customer", type: "uuid" },
      { key: "city", label: "City", type: "text" },
      { key: "state", label: "State", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "customer_id",
          label: "Customer",
          type: "uuid",
          required: true,
          relation: {
            table: "customers",
            valueField: "id",
            labelField: "full_name",
            orderBy: "full_name",
            ascending: true,
          },
        },
        { key: "line1", label: "Line 1", type: "text", required: true },
        { key: "line2", label: "Line 2", type: "text", nullable: true },
        { key: "city", label: "City", type: "text", required: true },
        { key: "state", label: "State", type: "text", required: true },
        { key: "postal_code", label: "Postal code", type: "text", required: true },
        { key: "country", label: "Country", type: "text", required: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "customer_groups",
    label: "Customer Groups",
    description: "Customer segmentation.",
    group: "crm",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "name", label: "Name", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "name", label: "Name", type: "text", required: true },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          nullable: true,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "customer_group_memberships",
    label: "Customer Group Memberships",
    description: "Group membership relationship.",
    group: "crm",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "customer_id", label: "Customer", type: "uuid" },
      { key: "customer_group_id", label: "Group", type: "uuid" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "customer_id",
          label: "Customer",
          type: "uuid",
          required: true,
          relation: {
            table: "customers",
            valueField: "id",
            labelField: "full_name",
            orderBy: "full_name",
            ascending: true,
          },
        },
        {
          key: "customer_group_id",
          label: "Group",
          type: "uuid",
          required: true,
          relation: {
            table: "customer_groups",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "locations",
    label: "Locations",
    description: "Inventory and operation locations.",
    group: "inventory",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "code", label: "Code", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "type", label: "Type", type: "enum" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "code", label: "Code", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        {
          key: "type",
          label: "Type",
          type: "enum",
          required: true,
          defaultValue: "warehouse",
          options: LOCATION_TYPE_OPTIONS,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "inventory_levels",
    label: "Inventory Levels",
    description: "Inventory balances per product/location.",
    group: "inventory",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "updated_at", ascending: false },
    transactionalActions: ["inventory_reserve_release"],
    listColumns: [
      { key: "product_id", label: "Product", type: "uuid" },
      { key: "location_id", label: "Location", type: "uuid" },
      { key: "quantity_on_hand", label: "On hand", type: "integer" },
      { key: "quantity_reserved", label: "Reserved", type: "integer" },
      { key: "quantity_available", label: "Available", type: "integer" },
      { key: "updated_at", label: "Updated at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "product_id",
          label: "Product",
          type: "uuid",
          required: true,
          relation: {
            table: "products",
            valueField: "id",
            labelField: "title",
            orderBy: "title",
            ascending: true,
          },
        },
        {
          key: "location_id",
          label: "Location",
          type: "uuid",
          required: true,
          relation: {
            table: "locations",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
        {
          key: "quantity_on_hand",
          label: "Quantity on hand",
          type: "integer",
          defaultValue: 0,
        },
        {
          key: "quantity_reserved",
          label: "Quantity reserved",
          type: "integer",
          defaultValue: 0,
        },
        {
          key: "quantity_available",
          label: "Quantity available",
          type: "integer",
          defaultValue: 0,
        },
        {
          key: "reorder_point",
          label: "Reorder point",
          type: "integer",
          defaultValue: 0,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "inventory_movements",
    label: "Inventory Movements",
    description: "Inventory movements.",
    group: "inventory",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "inventory_level_id", label: "Inventory level", type: "uuid" },
      { key: "movement_type", label: "Type", type: "enum" },
      { key: "quantity", label: "Quantity", type: "integer" },
      { key: "reason", label: "Reason", type: "text" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "inventory_level_id",
          label: "Inventory level",
          type: "uuid",
          required: true,
          relation: {
            table: "inventory_levels",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "movement_type",
          label: "Type",
          type: "enum",
          required: true,
          options: INVENTORY_MOVEMENT_OPTIONS,
        },
        {
          key: "quantity",
          label: "Quantity",
          type: "integer",
          required: true,
        },
        { key: "reason", label: "Reason", type: "text", nullable: true },
        {
          key: "reference_type",
          label: "Reference type",
          type: "text",
          nullable: true,
        },
        {
          key: "reference_id",
          label: "Reference ID",
          type: "uuid",
          nullable: true,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "checkouts",
    label: "Checkouts",
    description: "Checkout sessions.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "token", label: "Token", type: "text" },
      { key: "customer_id", label: "Customer", type: "uuid" },
      { key: "status", label: "Status", type: "enum" },
      { key: "total_amount", label: "Total", type: "currency" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "token", label: "Token", type: "text", required: true },
        {
          key: "customer_id",
          label: "Customer",
          type: "uuid",
          nullable: true,
          relation: {
            table: "customers",
            valueField: "id",
            labelField: "full_name",
            orderBy: "full_name",
            ascending: true,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          required: true,
          defaultValue: "open",
          options: CHECKOUT_STATUS_OPTIONS,
        },
        {
          key: "total_amount",
          label: "Total",
          type: "currency",
          defaultValue: 0,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "orders",
    label: "Orders",
    description: "Completed orders.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    transactionalActions: ["orders_update_status"],
    joinEditor: "order_items",
    listColumns: [
      { key: "order_number", label: "Order", type: "text" },
      { key: "status", label: "Status", type: "enum" },
      { key: "payment_status", label: "Payment", type: "enum" },
      { key: "fulfillment_status", label: "Fulfillment", type: "enum" },
      { key: "items_count", label: "Items", type: "integer" },
      { key: "items_quantity_total", label: "Items qty", type: "integer" },
      { key: "items_total_amount", label: "Items total", type: "currency" },
      { key: "total_amount", label: "Total", type: "currency" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "order_number",
          label: "Order number",
          type: "text",
          required: true,
        },
        {
          key: "customer_id",
          label: "Customer",
          type: "uuid",
          nullable: true,
          relation: {
            table: "customers",
            valueField: "id",
            labelField: "full_name",
            orderBy: "full_name",
            ascending: true,
          },
        },
        {
          key: "checkout_id",
          label: "Checkout",
          type: "uuid",
          nullable: true,
          relation: {
            table: "checkouts",
            valueField: "id",
            labelField: "token",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          required: true,
          defaultValue: "pending",
          options: ORDER_STATUS_OPTIONS,
        },
        {
          key: "payment_status",
          label: "Payment status",
          type: "enum",
          required: true,
          defaultValue: "pending",
          options: ORDER_PAYMENT_STATUS_OPTIONS,
        },
        {
          key: "fulfillment_status",
          label: "Fulfillment status",
          type: "enum",
          required: true,
          defaultValue: "unfulfilled",
          options: ORDER_FULFILLMENT_STATUS_OPTIONS,
        },
        {
          key: "subtotal_amount",
          label: "Subtotal",
          type: "currency",
          defaultValue: 0,
        },
        {
          key: "discount_amount",
          label: "Discount",
          type: "currency",
          defaultValue: 0,
        },
        { key: "tax_amount", label: "Tax", type: "currency", defaultValue: 0 },
        {
          key: "shipping_amount",
          label: "Shipping",
          type: "currency",
          defaultValue: 0,
        },
        {
          key: "total_amount",
          label: "Total",
          type: "currency",
          defaultValue: 0,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "order_items",
    label: "Order Items",
    description: "Items that make up the orders.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "order_id", label: "Order", type: "uuid" },
      { key: "product_id", label: "Product", type: "uuid" },
      { key: "quantity", label: "Qty.", type: "integer" },
      { key: "unit_price", label: "Unit price", type: "currency" },
      { key: "line_total", label: "Line total", type: "currency" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "order_id",
          label: "Order",
          type: "uuid",
          required: true,
          relation: {
            table: "orders",
            valueField: "id",
            labelField: "order_number",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "product_id",
          label: "Product",
          type: "uuid",
          required: true,
          relation: {
            table: "products",
            valueField: "id",
            labelField: "title",
            orderBy: "title",
            ascending: true,
          },
        },
        {
          key: "quantity",
          label: "Quantity",
          type: "integer",
          required: true,
        },
        {
          key: "unit_price",
          label: "Unit price",
          type: "currency",
          required: true,
        },
        {
          key: "line_total",
          label: "Line total",
          type: "currency",
          required: true,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "transactions",
    label: "Transactions",
    description: "Aggregated commercial transactions.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    joinEditor: "transaction_items",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "order_id", label: "Order", type: "uuid" },
      { key: "status", label: "Status", type: "enum" },
      { key: "items_count", label: "Items", type: "integer" },
      { key: "item_kinds_csv", label: "Item kinds", type: "text" },
      { key: "items_total_amount", label: "Items total", type: "currency" },
      { key: "total_amount", label: "Total", type: "currency" },
      { key: "currency", label: "Currency", type: "text" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "order_id",
          label: "Order",
          type: "uuid",
          nullable: true,
          relation: {
            table: "orders",
            valueField: "id",
            labelField: "order_number",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "checkout_id",
          label: "Checkout",
          type: "uuid",
          nullable: true,
          relation: {
            table: "checkouts",
            valueField: "id",
            labelField: "token",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          defaultValue: "pending",
          required: true,
          options: TRANSACTION_STATUS_OPTIONS,
        },
        {
          key: "total_amount",
          label: "Total",
          type: "currency",
          required: true,
          defaultValue: 0,
        },
        {
          key: "currency",
          label: "Currency",
          type: "text",
          required: true,
          defaultValue: "BRL",
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "transaction_items",
    label: "Transaction Items",
    description: "Transaction financial items.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "transaction_id", label: "Transaction", type: "uuid" },
      { key: "kind", label: "Type", type: "enum" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "transaction_id",
          label: "Transaction",
          type: "uuid",
          required: true,
          relation: {
            table: "transactions",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "kind",
          label: "Type",
          type: "enum",
          required: true,
          options: TRANSACTION_ITEM_KIND_OPTIONS,
        },
        {
          key: "reference_id",
          label: "Reference ID",
          type: "uuid",
          nullable: true,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "payments",
    label: "Payments",
    description: "Order payments.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "order_id", label: "Order", type: "uuid" },
      { key: "method", label: "Method", type: "text" },
      { key: "status", label: "Status", type: "enum" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "order_id",
          label: "Order",
          type: "uuid",
          nullable: true,
          relation: {
            table: "orders",
            valueField: "id",
            labelField: "order_number",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "transaction_id",
          label: "Transaction",
          type: "uuid",
          nullable: true,
          relation: {
            table: "transactions",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        { key: "method", label: "Method", type: "text", required: true },
        {
          key: "status",
          label: "Status",
          type: "enum",
          required: true,
          defaultValue: "pending",
          options: TRANSACTION_STATUS_OPTIONS,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        {
          key: "currency",
          label: "Currency",
          type: "text",
          required: true,
          defaultValue: "BRL",
        },
        {
          key: "provider_reference",
          label: "Provider reference",
          type: "text",
          nullable: true,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "refunds",
    label: "Refunds",
    description: "Refund requests and status.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "payment_id", label: "Payment", type: "uuid" },
      { key: "order_id", label: "Order", type: "uuid" },
      { key: "status", label: "Status", type: "enum" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "payment_id",
          label: "Payment",
          type: "uuid",
          required: true,
          relation: {
            table: "payments",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "order_id",
          label: "Order",
          type: "uuid",
          required: true,
          relation: {
            table: "orders",
            valueField: "id",
            labelField: "order_number",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          defaultValue: "pending",
          required: true,
          options: REFUND_STATUS_OPTIONS,
        },
        { key: "amount", label: "Amount", type: "currency", required: true },
        { key: "reason", label: "Reason", type: "textarea", nullable: true },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "shipments",
    label: "Shipments",
    description: "Shipments and dispatch.",
    group: "inventory",
    primaryKey: "id",
    deleteStrategy: "soft",
    joinEditor: "shipment_items",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "order_id", label: "Order", type: "uuid" },
      { key: "status", label: "Status", type: "enum" },
      { key: "carrier", label: "Carrier", type: "text" },
      { key: "tracking_number", label: "Tracking", type: "text" },
      { key: "items_count", label: "Items", type: "integer" },
      { key: "items_quantity_total", label: "Items qty", type: "integer" },
      { key: "updated_at", label: "Updated at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "order_id",
          label: "Order",
          type: "uuid",
          required: true,
          relation: {
            table: "orders",
            valueField: "id",
            labelField: "order_number",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          defaultValue: "pending",
          required: true,
          options: SHIPMENT_STATUS_OPTIONS,
        },
        {
          key: "carrier",
          label: "Carrier",
          type: "text",
          nullable: true,
        },
        {
          key: "tracking_number",
          label: "Tracking code",
          type: "text",
          nullable: true,
        },
        {
          key: "shipped_at",
          label: "Shipped at",
          type: "datetime",
          nullable: true,
        },
        {
          key: "delivered_at",
          label: "Delivered at",
          type: "datetime",
          nullable: true,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "shipment_items",
    label: "Shipment Items",
    description: "Items per shipment.",
    group: "inventory",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "shipment_id", label: "Shipment", type: "uuid" },
      { key: "order_item_id", label: "Order item", type: "uuid" },
      { key: "quantity", label: "Quantity", type: "integer" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "shipment_id",
          label: "Shipment",
          type: "uuid",
          required: true,
          relation: {
            table: "shipments",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "order_item_id",
          label: "Order item",
          type: "uuid",
          required: true,
          relation: {
            table: "order_items",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "quantity",
          label: "Quantity",
          type: "integer",
          required: true,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "shipment_events",
    label: "Shipment Events",
    description: "Tracking/logistics events.",
    group: "inventory",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "shipment_id", label: "Shipment", type: "uuid" },
      { key: "event_type", label: "Event", type: "text" },
      { key: "occurred_at", label: "Occurred at", type: "datetime" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "shipment_id",
          label: "Shipment",
          type: "uuid",
          required: true,
          relation: {
            table: "shipments",
            valueField: "id",
            labelField: "id",
            orderBy: "created_at",
            ascending: false,
          },
        },
        {
          key: "event_type",
          label: "Event type",
          type: "text",
          required: true,
        },
        {
          key: "payload",
          label: "Payload (Key-Value)",
          type: "metadata",
          required: true,
          defaultValue: {},
        },
        {
          key: "occurred_at",
          label: "Occurred at",
          type: "datetime",
          required: true,
          defaultValue: "now",
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "inquiries",
    label: "Inquiries",
    description: "Support and inquiries.",
    group: "crm",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "subject", label: "Subject", type: "text" },
      { key: "customer_id", label: "Customer", type: "uuid" },
      { key: "product_id", label: "Product", type: "uuid" },
      { key: "status", label: "Status", type: "enum" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "customer_id",
          label: "Customer",
          type: "uuid",
          nullable: true,
          relation: {
            table: "customers",
            valueField: "id",
            labelField: "full_name",
            orderBy: "full_name",
            ascending: true,
          },
        },
        {
          key: "product_id",
          label: "Product",
          type: "uuid",
          nullable: true,
          relation: {
            table: "products",
            valueField: "id",
            labelField: "title",
            orderBy: "title",
            ascending: true,
          },
        },
        { key: "subject", label: "Subject", type: "text", required: true },
        {
          key: "status",
          label: "Status",
          type: "enum",
          defaultValue: "open",
          required: true,
          options: INQUIRY_STATUS_OPTIONS,
        },
        createdByField("created_by", "Created by"),
      ]),
    ),
  },
  {
    table: "inquiry_messages",
    label: "Inquiry Messages",
    description: "Messages for each inquiry.",
    group: "crm",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "inquiry_id", label: "Inquiry", type: "uuid" },
      { key: "author_id", label: "Author", type: "uuid" },
      { key: "message", label: "Message", type: "text" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "inquiry_id",
          label: "Inquiry",
          type: "uuid",
          required: true,
          relation: {
            table: "inquiries",
            valueField: "id",
            labelField: "subject",
            orderBy: "created_at",
            ascending: false,
          },
        },
        createdByField("author_id", "Author"),
        { key: "message", label: "Message", type: "textarea", required: true },
      ]),
    ),
  },
  {
    table: "reviews",
    label: "Reviews",
    description: "Product reviews.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "product_id", label: "Product", type: "uuid" },
      { key: "customer_id", label: "Customer", type: "uuid" },
      { key: "rating", label: "Rating", type: "integer" },
      { key: "status", label: "Status", type: "enum" },
      { key: "created_at", label: "Created at", type: "datetime" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "product_id",
          label: "Product",
          type: "uuid",
          required: true,
          relation: {
            table: "products",
            valueField: "id",
            labelField: "title",
            orderBy: "title",
            ascending: true,
          },
        },
        {
          key: "customer_id",
          label: "Customer",
          type: "uuid",
          nullable: true,
          relation: {
            table: "customers",
            valueField: "id",
            labelField: "full_name",
            orderBy: "full_name",
            ascending: true,
          },
        },
        { key: "rating", label: "Rating", type: "integer", required: true },
        { key: "title", label: "Title", type: "text", nullable: true },
        { key: "body", label: "Content", type: "textarea", nullable: true },
        {
          key: "status",
          label: "Status",
          type: "enum",
          defaultValue: "pending",
          required: true,
          options: REVIEW_STATUS_OPTIONS,
        },
      ]),
    ),
  },
  {
    table: "product_metrics",
    label: "Product Metrics",
    description: "Aggregated product metrics.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "metric_date", ascending: false },
    listColumns: [
      { key: "product_id", label: "Product", type: "uuid" },
      { key: "metric_date", label: "Date", type: "date" },
      { key: "views", label: "Views", type: "integer" },
      { key: "add_to_cart", label: "Add to cart", type: "integer" },
      { key: "sales_count", label: "Sales", type: "integer" },
      { key: "revenue_amount", label: "Revenue", type: "currency" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "product_id",
          label: "Product",
          type: "uuid",
          required: true,
          relation: {
            table: "products",
            valueField: "id",
            labelField: "title",
            orderBy: "title",
            ascending: true,
          },
        },
        {
          key: "metric_date",
          label: "Metric date",
          type: "date",
          required: true,
        },
        { key: "views", label: "Views", type: "integer", defaultValue: 0 },
        {
          key: "add_to_cart",
          label: "Add to cart",
          type: "integer",
          defaultValue: 0,
        },
        {
          key: "sales_count",
          label: "Sales count",
          type: "integer",
          defaultValue: 0,
        },
        {
          key: "revenue_amount",
          label: "Revenue",
          type: "currency",
          defaultValue: 0,
        },
      ]),
    ),
  },
  {
    table: "pos_sessions",
    label: "POS Sessions",
    description: "Point of sale sessions.",
    group: "commerce",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "opened_at", ascending: false },
    listColumns: [
      { key: "opened_by", label: "Operator", type: "uuid" },
      { key: "opened_at", label: "Opened at", type: "datetime" },
      { key: "closed_at", label: "Closed at", type: "datetime" },
      { key: "status", label: "Status", type: "enum" },
      { key: "opening_amount", label: "Opening", type: "currency" },
      { key: "closing_amount", label: "Closing", type: "currency" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        createdByField("opened_by", "Opened by"),
        {
          key: "opened_at",
          label: "Opened at",
          type: "datetime",
          required: true,
          defaultValue: "now",
        },
        {
          key: "closed_at",
          label: "Closed at",
          type: "datetime",
          nullable: true,
        },
        {
          key: "opening_amount",
          label: "Opening amount",
          type: "currency",
          defaultValue: 0,
        },
        {
          key: "closing_amount",
          label: "Closing amount",
          type: "currency",
          nullable: true,
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          required: true,
          defaultValue: "open",
          options: POS_STATUS_OPTIONS,
        },
      ]),
    ),
  },
  {
    table: "tags",
    label: "Tags",
    description: "Tags for product categorization.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "name", ascending: true },
    listColumns: [
      { key: "name", label: "Name", type: "text" },
      { key: "color", label: "Color", type: "text" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: "name", label: "Name", type: "text", required: true },
        { key: "color", label: "Color (Hex)", type: "text", nullable: true },
      ]),
    ),
  },
  {
    table: "product_tags",
    label: "Product Tags",
    description: "Link between products and tags.",
    group: "catalog",
    primaryKey: "id",
    deleteStrategy: "soft",
    sort: { column: "created_at", ascending: false },
    listColumns: [
      { key: "product_id", label: "Product", type: "uuid" },
      { key: "tag_id", label: "Tag", type: "uuid" },
      { key: "lifecycle_status", label: "Status", type: "enum" },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: "product_id",
          label: "Product",
          type: "uuid",
          required: true,
          relation: {
            table: "products",
            valueField: "id",
            labelField: "title",
            orderBy: "title",
            ascending: true,
          },
        },
        {
          key: "tag_id",
          label: "Tag",
          type: "uuid",
          required: true,
          relation: {
            table: "tags",
            valueField: "id",
            labelField: "name",
            orderBy: "name",
            ascending: true,
          },
        },
      ]),
    ),
  },
];

export const SCHEMA_REGISTRY_BY_TABLE = Object.fromEntries(
  SCHEMA_REGISTRY.map((config) => [config.table, config]),
) as Record<SchemaTableName, TableConfig>;

export const SCHEMA_TABLE_NAMES = SCHEMA_REGISTRY.map((config) => config.table);

export function getTableConfig(table: string): TableConfig | null {
  if (table in SCHEMA_REGISTRY_BY_TABLE) {
    return SCHEMA_REGISTRY_BY_TABLE[table as SchemaTableName];
  }

  return null;
}

export function getNullableFields(config: TableConfig): Array<string> {
  return config.fields
    .filter((field) => field.nullable)
    .map((field) => field.key);
}

export function getCreatableFields(config: TableConfig): Array<FieldConfig> {
  return config.fields.filter((field) => field.editableOnCreate !== false);
}

export function getUpdatableFields(config: TableConfig): Array<FieldConfig> {
  return config.fields.filter((field) => field.editableOnUpdate !== false);
}

export function getRelationFields(
  config: TableConfig,
): Array<FieldConfigWithRelation> {
  return config.fields.filter(
    (field): field is FieldConfigWithRelation => field.relation !== undefined,
  );
}
