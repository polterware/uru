import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableColumnFilter } from "@/components/ui/table";
import type {
  FieldConfig,
  ListColumnConfig,
  SchemaTableName,
  TableConfig,
} from "@/lib/schema-registry";
import type {
  OrderItemDraft,
  ShipmentItemDraft,
  TableLookupOption,
  TransactionItemDraft,
} from "@/lib/db/repositories";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ConsoleJoinsRepository,
  ConsoleReadRepository,
  InventoryLevelsRepository,
  OrdersRepository,
  TableCrudRepository,
} from "@/lib/db/repositories";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { resolveHiddenJoinRedirect } from "@/lib/hidden-join-routes";
import {
  getCreatableFields,
  getNullableFields,
  getRelationFields,
  getTableConfig,
  getUpdatableFields,
} from "@/lib/schema-registry";
import { getUser } from "@/lib/supabase/auth";
import { slugify } from "@/lib/utils";

export const Route = createFileRoute("/tables/$table")({
  beforeLoad: async ({ params }) => {
    const user = await getUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }

    const redirectedTable = resolveHiddenJoinRedirect(params.table);
    if (redirectedTable) {
      throw redirect({
        to: "/tables/$table",
        params: { table: redirectedTable },
      });
    }

    return { user };
  },
  loader: ({ context }) => {
    return { user: context.user };
  },
  component: TablesBySchemaPage,
});

type TableRecord = Record<string, unknown>;

type DialogMode = "create" | "edit";

type LookupsByField = Partial<Record<string, Array<TableLookupOption>>>;

type OrderStatusForm = {
  orderId: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
};

type InventoryRpcForm = {
  productId: string;
  locationId: string;
  quantity: string;
  reason: string;
};

type OrderItemFormRow = {
  id?: string;
  productId: string;
  quantity: string;
  unitPrice: string;
};

type TransactionItemFormRow = {
  id?: string;
  kind: TransactionItemDraft["kind"];
  referenceId: string;
  amount: string;
};

type ShipmentItemFormRow = {
  id?: string;
  orderItemId: string;
  quantity: string;
};

type AdditionalLookupRequest = {
  key: string;
  table: SchemaTableName;
  valueField: string;
  labelField: string;
  orderBy?: string;
  ascending?: boolean;
};

const ORDER_STATUS_OPTIONS = ["pending", "confirmed", "fulfilled", "cancelled"];
const ORDER_PAYMENT_OPTIONS = [
  "pending",
  "paid",
  "refunded",
  "partially_refunded",
];
const ORDER_FULFILLMENT_OPTIONS = [
  "unfulfilled",
  "partial",
  "fulfilled",
  "cancelled",
];
const TRANSACTION_ITEM_KIND_OPTIONS: Array<TransactionItemDraft["kind"]> = [
  "product",
  "shipping",
  "discount",
  "tax",
  "fee",
];
const SELECT_NONE = "__none__";

const PROFILE_ROLES_LOOKUP_KEY = "__profile_role_ids";
const CUSTOMER_GROUPS_LOOKUP_KEY = "__customer_group_ids";
const ORDER_ITEM_PRODUCTS_LOOKUP_KEY = "__order_item_product_ids";
const SHIPMENT_ORDER_ITEMS_LOOKUP_KEY = "__shipment_order_item_ids";
const PRODUCT_TAGS_LOOKUP_KEY = "__product_tag_ids";

function getFieldTextareaPlaceholder(
  config: TableConfig,
  field: FieldConfig,
): string | undefined {
  if (field.type === "array") {
    if (config.table === "products" && field.key === "images") {
      return "https://cdn.example.com/products/item-front.jpg, https://cdn.example.com/products/item-side.jpg";
    }

    return "item_one, item_two, item_three";
  }

  if (field.type === "metadata") {
    return '{"source":"catalog","tags":["featured","seasonal"]}';
  }

  if (field.type === "json") {
    return '{"items":["value_one","value_two"],"enabled":true}';
  }

  return undefined;
}

function getFieldInputHint(config: TableConfig, field: FieldConfig): string | null {
  if (field.type === "array") {
    if (config.table === "products" && field.key === "images") {
      return 'Add image URIs separated by commas. Example: https://cdn.example.com/products/item-front.jpg, https://cdn.example.com/products/item-side.jpg';
    }

    return "Add list values separated by commas. Example: value_one, value_two, value_three";
  }

  if (field.type === "metadata" || field.type === "json") {
    return 'Use valid JSON. For lists, use comma-separated items inside brackets. Example: ["value_one", "value_two"]';
  }

  return null;
}

function toDateInputValue(value: unknown): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function toDateTimeInputValue(value: unknown): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const localDate = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 16);
}

function getDefaultValue(field: FieldConfig, userId: string | null): string | boolean {
  if (field.autoValue === "current_user_id") {
    return userId ?? "";
  }

  if (field.autoValue === "current_timestamp") {
    return new Date().toISOString();
  }

  if (field.defaultValue === "now") {
    return new Date().toISOString();
  }

  if (field.defaultValue !== undefined) {
    if (typeof field.defaultValue === "object" && field.defaultValue !== null) {
      return JSON.stringify(field.defaultValue);
    }
    return String(field.defaultValue);
  }

  if (field.type === "boolean") {
    return false;
  }

  if (field.type === "metadata" || field.type === "json") {
    return "{}";
  }

  if (field.type === "array") {
    return "";
  }

  return "";
}

function toFormValue(
  field: FieldConfig,
  rowValue: unknown,
  userId: string | null,
): string | boolean {
  if (rowValue === undefined) {
    return getDefaultValue(field, userId);
  }

  if (rowValue === null) {
    if (field.type === "boolean") {
      return false;
    }

    if (field.type === "metadata" || field.type === "json") {
      return "{}";
    }

    return "";
  }

  if (field.type === "json" || field.type === "metadata") {
    if (typeof rowValue === "object") {
      return JSON.stringify(rowValue);
    }
    return String(rowValue);
  }

  if (field.type === "array") {
    return Array.isArray(rowValue) ? rowValue.join(", ") : "";
  }

  if (field.type === "date") {
    return toDateInputValue(rowValue);
  }

  if (field.type === "datetime") {
    return toDateTimeInputValue(rowValue);
  }

  if (field.type === "boolean") {
    return Boolean(rowValue);
  }

  return String(rowValue);
}

function parseFieldValue(field: FieldConfig, rawValue: unknown): unknown {
  if (field.autoValue === "current_user_id") {
    return rawValue;
  }

  if (field.type === "boolean") {
    return Boolean(rawValue);
  }

  const normalized = String(rawValue ?? "").trim();

  if (normalized.length === 0) {
    if (field.nullable) {
      return null;
    }

    if (field.required) {
      throw new Error(`Field ${field.label} is required.`);
    }

    return "";
  }

  if (field.type === "integer") {
    const parsed = Number.parseInt(normalized, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Field ${field.label} must be an integer.`);
    }

    return parsed;
  }

  if (field.type === "number" || field.type === "currency") {
    const parsed = Number.parseFloat(normalized);
    if (Number.isNaN(parsed)) {
      throw new Error(`Field ${field.label} must be a valid number.`);
    }

    return parsed;
  }

  if (field.type === "date") {
    return normalized;
  }

  if (field.type === "datetime") {
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Field ${field.label} must be a valid datetime.`);
    }

    return parsed.toISOString();
  }

  if (field.type === "json" || field.type === "metadata") {
    try {
      return JSON.parse(normalized);
    } catch {
      throw new Error(`Field ${field.label} must contain valid JSON.`);
    }
  }

  if (field.type === "array") {
    if (normalized.startsWith("[") && normalized.endsWith("]")) {
      try {
        const parsed = JSON.parse(normalized);
        if (!Array.isArray(parsed)) {
          throw new Error();
        }

        return parsed
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      } catch {
        throw new Error(
          `Field ${field.label} must be a comma-separated list or a JSON array.`,
        );
      }
    }

    return normalized
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return normalized;
}

function parsePositiveIntegerInput(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }

  return parsed;
}

function parseNonNegativeNumberInput(value: string, label: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${label} must be zero or greater.`);
  }

  return parsed;
}

function getAdditionalLookupRequests(
  config: TableConfig,
): Array<AdditionalLookupRequest> {
  if (config.joinEditor === "profile_roles") {
    return [
      {
        key: PROFILE_ROLES_LOOKUP_KEY,
        table: "roles",
        valueField: "id",
        labelField: "name",
        orderBy: "name",
        ascending: true,
      },
    ];
  }

  if (config.joinEditor === "customer_groups") {
    return [
      {
        key: CUSTOMER_GROUPS_LOOKUP_KEY,
        table: "customer_groups",
        valueField: "id",
        labelField: "name",
        orderBy: "name",
        ascending: true,
      },
    ];
  }

  if (config.joinEditor === "order_items") {
    return [
      {
        key: ORDER_ITEM_PRODUCTS_LOOKUP_KEY,
        table: "products",
        valueField: "id",
        labelField: "title",
        orderBy: "title",
        ascending: true,
      },
    ];
  }

  if (config.joinEditor === "shipment_items") {
    return [
      {
        key: SHIPMENT_ORDER_ITEMS_LOOKUP_KEY,
        table: "order_items",
        valueField: "id",
        labelField: "id",
        orderBy: "created_at",
        ascending: false,
      },
    ];
  }

  if (config.joinEditor === "product_tags") {
    return [
      {
        key: PRODUCT_TAGS_LOOKUP_KEY,
        table: "tags",
        valueField: "id",
        labelField: "name",
        orderBy: "name",
        ascending: true,
      },
    ];
  }

  return [];
}

function renderListValue(
  row: TableRecord,
  column: ListColumnConfig,
  relationLabels: Partial<Record<string, Map<string, string>>>,
): string {
  const value = row[column.key];

  if (value === null || value === undefined) {
    return "-";
  }

  if (column.type === "currency") {
    return formatCurrency(typeof value === "number" ? value : Number(value));
  }

  if (column.type === "datetime") {
    return formatDateTime(String(value));
  }

  if (column.type === "date") {
    return formatDate(String(value));
  }

  if (column.type === "boolean") {
    return value === true ? "Yes" : "No";
  }

  if (column.type === "json" || column.type === "metadata") {
    const payload = typeof value === "string" ? value : JSON.stringify(value);
    return payload.length > 60 ? `${payload.slice(0, 57)}...` : payload;
  }

  if (column.type === "array") {
    const arrayValue = Array.isArray(value) ? value.join(", ") : String(value);
    return arrayValue.length > 60
      ? `${arrayValue.slice(0, 57)}...`
      : arrayValue;
  }

  const relationLabel = relationLabels[column.key]?.get(String(value));
  if (relationLabel) {
    return relationLabel;
  }

  return String(value);
}

function buildDataTableFilters(
  config: TableConfig,
): Array<DataTableColumnFilter<TableRecord>> {
  const filters: Array<DataTableColumnFilter<TableRecord>> = [];

  for (const column of config.listColumns) {
    const field = config.fields.find((item) => item.key === column.key);
    if (!field) {
      continue;
    }

    if (field.type === "enum" && field.options?.length) {
      filters.push({
        columnId: column.key,
        label: column.label,
        type: "select",
        options: field.options,
      });
      continue;
    }

    if (field.type === "boolean") {
      filters.push({
        columnId: column.key,
        label: column.label,
        type: "select",
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      });
      continue;
    }

    if (
      field.type === "text" ||
      field.type === "textarea" ||
      field.type === "uuid"
    ) {
      filters.push({
        columnId: column.key,
        label: column.label,
        type: "text",
      });
    }

    if (filters.length >= 4) {
      break;
    }
  }

  return filters;
}

function TablesBySchemaPage() {
  const params = Route.useParams();
  const { user } = Route.useLoaderData();
  const userId = user.id;

  const config = useMemo(() => getTableConfig(params.table), [params.table]);

  const [rows, setRows] = useState<Array<TableRecord>>([]);
  const [lookupsByField, setLookupsByField] = useState<LookupsByField>({});
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoinDataLoading, setIsJoinDataLoading] = useState(false);

  const [profileRoleIds, setProfileRoleIds] = useState<Array<string>>([]);
  const [customerGroupIds, setCustomerGroupIds] = useState<Array<string>>([]);
  const [productTagIds, setProductTagIds] = useState<Array<string>>([]);
  const [orderItemRows, setOrderItemRows] = useState<Array<OrderItemFormRow>>(
    [],
  );
  const [transactionItemRows, setTransactionItemRows] = useState<
    Array<TransactionItemFormRow>
  >([]);
  const [shipmentItemRows, setShipmentItemRows] = useState<
    Array<ShipmentItemFormRow>
  >([]);

  const [orderStatusForm, setOrderStatusForm] = useState<OrderStatusForm>({
    orderId: "",
    status: "pending",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
  });

  const [inventoryRpcForm, setInventoryRpcForm] = useState<InventoryRpcForm>({
    productId: "",
    locationId: "",
    quantity: "1",
    reason: "",
  });

  const [rpcMessage, setRpcMessage] = useState<string | null>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [isRpcLoading, setIsRpcLoading] = useState(false);

  const relationLabels = useMemo(() => {
    return Object.fromEntries(
      Object.entries(lookupsByField).map(([fieldKey, options]) => [
        fieldKey,
        new Map((options ?? []).map((option) => [option.value, option.label])),
      ]),
    ) as Partial<Record<string, Map<string, string>>>;
  }, [lookupsByField]);

  const resetJoinEditorState = useCallback(() => {
    setProfileRoleIds([]);
    setCustomerGroupIds([]);
    setProductTagIds([]);
    setOrderItemRows([]);
    setTransactionItemRows([]);
    setShipmentItemRows([]);
  }, []);

  const loadJoinEditorData = useCallback(
    async (tableConfig: TableConfig, record: TableRecord) => {
      resetJoinEditorState();

      if (!tableConfig.joinEditor) {
        return;
      }

      const recordId = String(record.id ?? "");
      if (!recordId) {
        return;
      }

      setIsJoinDataLoading(true);

      try {
        switch (tableConfig.joinEditor) {
          case "profile_roles": {
            const roleIds =
              await ConsoleJoinsRepository.getProfileRoleIds(recordId);
            setProfileRoleIds(roleIds);
            break;
          }
          case "customer_groups": {
            const groupIds =
              await ConsoleJoinsRepository.getCustomerGroupIds(recordId);
            setCustomerGroupIds(groupIds);
            break;
          }
          case "product_tags": {
            const tagIds =
              await ConsoleJoinsRepository.getProductTagIds(recordId);
            setProductTagIds(tagIds);
            break;
          }
          case "order_items": {
            const items = await ConsoleJoinsRepository.getOrderItems(recordId);
            setOrderItemRows(
              items.map((item) => ({
                id: item.id,
                productId: item.product_id,
                quantity: String(item.quantity),
                unitPrice: String(item.unit_price),
              })),
            );
            break;
          }
          case "transaction_items": {
            const items =
              await ConsoleJoinsRepository.getTransactionItems(recordId);
            setTransactionItemRows(
              items.map((item) => ({
                id: item.id,
                kind: item.kind,
                referenceId: item.reference_id ?? "",
                amount: String(item.amount),
              })),
            );
            break;
          }
          case "shipment_items": {
            const items =
              await ConsoleJoinsRepository.getShipmentItems(recordId);
            setShipmentItemRows(
              items.map((item) => ({
                id: item.id,
                orderItemId: item.order_item_id,
                quantity: String(item.quantity),
              })),
            );
            break;
          }
        }
      } finally {
        setIsJoinDataLoading(false);
      }
    },
    [resetJoinEditorState],
  );

  const loadTableData = useCallback(async () => {
    if (!config) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const relationFields = getRelationFields(config);
      const additionalLookupRequests = getAdditionalLookupRequests(config);

      const [tableRows, lookupEntries] = await Promise.all([
        ConsoleReadRepository.list(config.table, {
          includeArchived,
          orderBy: config.sort.column,
          ascending: config.sort.ascending,
        }),
        Promise.all([
          ...relationFields.map(async (field) => {
            const options = await TableCrudRepository.lookup(
              field.relation.table,
              {
                valueField: field.relation.valueField,
                labelField: field.relation.labelField,
                orderBy: field.relation.orderBy,
                ascending: field.relation.ascending,
              },
            );

            return [field.key, options] as const;
          }),
          ...additionalLookupRequests.map(async (lookupRequest) => {
            const options = await TableCrudRepository.lookup(
              lookupRequest.table,
              {
                valueField: lookupRequest.valueField,
                labelField: lookupRequest.labelField,
                orderBy: lookupRequest.orderBy,
                ascending: lookupRequest.ascending,
              },
            );

            return [lookupRequest.key, options] as const;
          }),
        ]),
      ]);

      setRows(tableRows);
      setLookupsByField(Object.fromEntries(lookupEntries));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load table records.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [config, includeArchived]);

  useEffect(() => {
    void loadTableData();
  }, [loadTableData]);

  const openEditDialog = useCallback(
    async (record: TableRecord) => {
      if (!config) {
        return;
      }

      setDialogMode("edit");
      setEditingRecord(record);
      setFormValues(
        Object.fromEntries(
          getUpdatableFields(config).map((field) => [
            field.key,
            toFormValue(field, record[field.key], userId),
          ]),
        ),
      );
      setFormError(null);
      setIsDialogOpen(true);

      try {
        await loadJoinEditorData(config, record);
      } catch (joinLoadError) {
        setFormError(
          joinLoadError instanceof Error
            ? joinLoadError.message
            : "Unable to load related data.",
        );
      }
    },
    [config, loadJoinEditorData, userId],
  );

  const openCreateDialog = () => {
    if (!config) {
      return;
    }

    setDialogMode("create");
    setEditingRecord(null);
    resetJoinEditorState();

    const values = Object.fromEntries(
      getCreatableFields(config).map((field) => [
        field.key,
        toFormValue(field, undefined, userId),
      ]),
    );

    setFormValues(values);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const tableColumns = useMemo(() => {
    if (!config) {
      return [] as Array<ColumnDef<TableRecord>>;
    }

    const columns: Array<ColumnDef<TableRecord>> = config.listColumns.map(
      (column) => ({
        accessorFn: (row) => row[column.key],
        id: column.key,
        header: column.label,
        cell: ({ row }) =>
          renderListValue(row.original, column, relationLabels),
      }),
    );

    columns.push({
      id: "__actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              void openEditDialog(row.original);
            }}
          >
            Edit
          </Button>

          <Button
            size="xs"
            variant="destructive"
            onClick={async () => {
              const confirmed = window.confirm(
                "Do you want to archive this record?",
              );
              if (!confirmed) {
                return;
              }

              try {
                if (config.deleteStrategy === "soft") {
                  await TableCrudRepository.archive(
                    config.table,
                    String(row.original.id),
                  );
                } else {
                  await TableCrudRepository.hardDelete(
                    config.table,
                    String(row.original.id),
                  );
                }

                await loadTableData();
              } catch (archiveError) {
                setError(
                  archiveError instanceof Error
                    ? archiveError.message
                    : "Failed to remove record.",
                );
              }
            }}
          >
            Archive
          </Button>
        </div>
      ),
    });

    return columns;
  }, [config, relationLabels, openEditDialog, loadTableData]);

  const filters = useMemo(() => {
    if (!config) {
      return [];
    }

    return buildDataTableFilters(config);
  }, [config]);

  const onSubmitForm = async () => {
    if (!config) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = config.fields.reduce<Record<string, unknown>>((acc, field) => {
        let rawValue = formValues[field.key];

        const isAutoValue = Boolean(field.autoValue);
        const isEditable =
          dialogMode === "create"
            ? field.editableOnCreate !== false
            : field.editableOnUpdate !== false;

        if (field.autoValue === "current_user_id") {
          rawValue = userId;
        }

        if (field.autoValue === "current_timestamp") {
          rawValue = new Date().toISOString();
        }

        if (
          dialogMode === "create" &&
          (rawValue === "" || rawValue === undefined) &&
          field.defaultValue !== undefined
        ) {
          rawValue =
            field.defaultValue === "now"
              ? new Date().toISOString()
              : field.defaultValue;
        }

        // Only include if it's an auto-value OR if it's editable
        // This prevents sending fields like 'id' or timestamps when they shouldn't be
        if (isAutoValue || isEditable) {
          acc[field.key] = parseFieldValue(field, rawValue);
        }

        return acc;
      }, {});

      let savedRecord: TableRecord;

      if (dialogMode === "create") {
        savedRecord = (await TableCrudRepository.create(config.table, payload, {
          nullableFields: getNullableFields(config),
        })) as TableRecord;
      } else {
        if (!editingRecord) {
          throw new Error("Record not found for edition.");
        }

        savedRecord = (await TableCrudRepository.update(
          config.table,
          String(editingRecord.id),
          payload,
          {
            nullableFields: getNullableFields(config),
          },
        )) as TableRecord;
      }

      if (dialogMode === "edit" && config.joinEditor) {
        const recordId = String(savedRecord.id ?? editingRecord?.id ?? "");
        if (!recordId) {
          throw new Error(
            "Unable to sync related records because id is missing.",
          );
        }

        switch (config.joinEditor) {
          case "profile_roles": {
            await ConsoleJoinsRepository.syncProfileRoles(
              recordId,
              profileRoleIds,
            );
            break;
          }
          case "customer_groups": {
            await ConsoleJoinsRepository.syncCustomerGroups(
              recordId,
              customerGroupIds,
            );
            break;
          }
          case "product_tags": {
            await ConsoleJoinsRepository.syncProductTags(
              recordId,
              productTagIds,
            );
            break;
          }
          case "order_items": {
            const normalizedRows = orderItemRows
              .filter(
                (row) =>
                  row.productId.trim().length > 0 ||
                  row.quantity.trim().length > 0 ||
                  row.unitPrice.trim().length > 0 ||
                  Boolean(row.id),
              )
              .map<OrderItemDraft>((row, index) => ({
                id: row.id,
                product_id: row.productId.trim(),
                quantity: parsePositiveIntegerInput(
                  row.quantity,
                  `Order item #${index + 1} quantity`,
                ),
                unit_price: parseNonNegativeNumberInput(
                  row.unitPrice,
                  `Order item #${index + 1} unit price`,
                ),
              }));

            await ConsoleJoinsRepository.syncOrderItems(
              recordId,
              normalizedRows,
            );
            break;
          }
          case "transaction_items": {
            const normalizedRows = transactionItemRows
              .filter(
                (row) =>
                  row.amount.trim().length > 0 ||
                  row.referenceId.trim().length > 0 ||
                  Boolean(row.id),
              )
              .map<TransactionItemDraft>((row, index) => ({
                id: row.id,
                kind: row.kind,
                reference_id:
                  row.referenceId.trim().length > 0
                    ? row.referenceId.trim()
                    : null,
                amount: parseNonNegativeNumberInput(
                  row.amount,
                  `Transaction item #${index + 1} amount`,
                ),
              }));

            await ConsoleJoinsRepository.syncTransactionItems(
              recordId,
              normalizedRows,
            );
            break;
          }
          case "shipment_items": {
            const normalizedRows = shipmentItemRows
              .filter(
                (row) =>
                  row.orderItemId.trim().length > 0 ||
                  row.quantity.trim().length > 0 ||
                  Boolean(row.id),
              )
              .map<ShipmentItemDraft>((row, index) => ({
                id: row.id,
                order_item_id: row.orderItemId.trim(),
                quantity: parsePositiveIntegerInput(
                  row.quantity,
                  `Shipment item #${index + 1} quantity`,
                ),
              }));

            await ConsoleJoinsRepository.syncShipmentItems(
              recordId,
              normalizedRows,
            );
            break;
          }
        }
      }

      setIsDialogOpen(false);
      setFormValues({});
      setEditingRecord(null);
      resetJoinEditorState();

      await loadTableData();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateOrderStatus = async () => {
    setRpcError(null);
    setRpcMessage(null);
    setIsRpcLoading(true);

    try {
      await OrdersRepository.updateStatus(
        orderStatusForm.orderId,
        orderStatusForm.status,
        orderStatusForm.paymentStatus,
        orderStatusForm.fulfillmentStatus,
      );
      setRpcMessage("Order status updated through RPC.");
      await loadTableData();
    } catch (rpcLoadError) {
      setRpcError(
        rpcLoadError instanceof Error
          ? rpcLoadError.message
          : "Failed to update order status.",
      );
    } finally {
      setIsRpcLoading(false);
    }
  };

  const onRunInventoryRpc = async (mode: "reserve" | "release") => {
    setRpcError(null);
    setRpcMessage(null);
    setIsRpcLoading(true);

    try {
      const quantity = Number.parseInt(inventoryRpcForm.quantity, 10);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      if (mode === "reserve") {
        await InventoryLevelsRepository.reserveStock(
          inventoryRpcForm.productId,
          inventoryRpcForm.locationId,
          quantity,
          inventoryRpcForm.reason || undefined,
        );
        setRpcMessage("Stock reservation completed through RPC.");
      } else {
        await InventoryLevelsRepository.releaseStock(
          inventoryRpcForm.productId,
          inventoryRpcForm.locationId,
          quantity,
          inventoryRpcForm.reason || undefined,
        );
        setRpcMessage("Stock release completed through RPC.");
      }

      await loadTableData();
    } catch (rpcLoadError) {
      setRpcError(
        rpcLoadError instanceof Error
          ? rpcLoadError.message
          : "Failed to execute inventory RPC.",
      );
    } finally {
      setIsRpcLoading(false);
    }
  };

  if (!config) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Table not found</h1>
        <p className="text-muted-foreground text-sm">
          The table `{params.table}` is not present in the schema registry.
        </p>
      </section>
    );
  }

  const profileRoleOptions = lookupsByField[PROFILE_ROLES_LOOKUP_KEY] ?? [];
  const customerGroupOptions = lookupsByField[CUSTOMER_GROUPS_LOOKUP_KEY] ?? [];
  const productTagOptions = lookupsByField[PRODUCT_TAGS_LOOKUP_KEY] ?? [];
  const orderItemProductOptions =
    lookupsByField[ORDER_ITEM_PRODUCTS_LOOKUP_KEY] ?? [];
  const shipmentOrderItemOptions =
    lookupsByField[SHIPMENT_ORDER_ITEMS_LOOKUP_KEY] ?? [];

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{config.label}</h1>
        <p className="text-muted-foreground text-sm">
          {config.description} Table:{" "}
          <span className="font-mono">{config.table}</span>
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              Schema-driven CRUD with filters, sorting, CSV export, and
              read-model RPC support.
            </CardDescription>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-archived"
                checked={includeArchived}
                onCheckedChange={(checked) =>
                  setIncludeArchived(Boolean(checked))
                }
              />
              <Label htmlFor="include-archived">Include archived</Label>
            </div>

            <Button onClick={openCreateDialog}>New record</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          <DataTable
            columns={tableColumns}
            data={rows}
            filters={filters}
            searchPlaceholder={`Search ${config.table}...`}
            emptyMessage={
              isLoading
                ? "Loading records..."
                : "No records found for the current filters."
            }
            exportFileName={`ops-${config.table}`}
          />
        </CardContent>
      </Card>

      {config.transactionalActions?.includes("orders_update_status") ? (
        <Card>
          <CardHeader>
            <CardTitle>RPC Actions: Orders</CardTitle>
            <CardDescription>
              Transactional status update through `update_order_status`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="rpc-order-id">Order ID</Label>
              <Input
                id="rpc-order-id"
                value={orderStatusForm.orderId}
                onChange={(event) =>
                  setOrderStatusForm((current) => ({
                    ...current,
                    orderId: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={orderStatusForm.status}
                onValueChange={(value) =>
                  setOrderStatusForm((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment status</Label>
              <Select
                value={orderStatusForm.paymentStatus}
                onValueChange={(value) =>
                  setOrderStatusForm((current) => ({
                    ...current,
                    paymentStatus: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_PAYMENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fulfillment status</Label>
              <Select
                value={orderStatusForm.fulfillmentStatus}
                onValueChange={(value) =>
                  setOrderStatusForm((current) => ({
                    ...current,
                    fulfillmentStatus: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fulfillment status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_FULFILLMENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Button disabled={isRpcLoading} onClick={onUpdateOrderStatus}>
                Update status via RPC
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {config.transactionalActions?.includes("inventory_reserve_release") ? (
        <Card>
          <CardHeader>
            <CardTitle>RPC Actions: Inventory</CardTitle>
            <CardDescription>
              Reserve/release stock through `reserve_inventory_stock` and
              `release_inventory_stock`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={inventoryRpcForm.productId}
                onValueChange={(value) =>
                  setInventoryRpcForm((current) => ({
                    ...current,
                    productId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {lookupsByField.product_id?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={inventoryRpcForm.locationId}
                onValueChange={(value) =>
                  setInventoryRpcForm((current) => ({
                    ...current,
                    locationId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {lookupsByField.location_id?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpc-quantity">Quantity</Label>
              <Input
                id="rpc-quantity"
                type="number"
                min="1"
                value={inventoryRpcForm.quantity}
                onChange={(event) =>
                  setInventoryRpcForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpc-reason">Reason</Label>
              <Input
                id="rpc-reason"
                value={inventoryRpcForm.reason}
                onChange={(event) =>
                  setInventoryRpcForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex gap-2 md:col-span-4">
              <Button
                disabled={isRpcLoading}
                onClick={() => void onRunInventoryRpc("reserve")}
              >
                Reserve
              </Button>
              <Button
                variant="outline"
                disabled={isRpcLoading}
                onClick={() => void onRunInventoryRpc("release")}
              >
                Release
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {rpcMessage ? (
        <p className="text-muted-foreground text-sm">{rpcMessage}</p>
      ) : null}
      {rpcError ? <p className="text-destructive text-sm">{rpcError}</p> : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? `New record in ${config.table}`
                : `Edit ${config.table}`}
            </DialogTitle>
            <DialogDescription>
              Fill the fields according to the schema contract. Permissions are
              enforced by RLS.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {(dialogMode === "create"
              ? getCreatableFields(config)
              : getUpdatableFields(config)
            ).map((field) => {
              const isRelation = Boolean(field.relation);
              const isBoolean = field.type === "boolean";
              const isEnum = field.type === "enum";
              const isTextArea =
                field.type === "textarea" ||
                field.type === "json" ||
                field.type === "metadata" ||
                field.type === "array";
              const isDate = field.type === "date";
              const isDateTime = field.type === "datetime";
              const isNumber =
                field.type === "integer" ||
                field.type === "number" ||
                field.type === "currency";
              const textareaPlaceholder = getFieldTextareaPlaceholder(
                config,
                field,
              );
              const inputHint = getFieldInputHint(config, field);

              const value = formValues[field.key];

              return (
                <div
                  key={field.key}
                  className={
                    isTextArea ? "space-y-2 md:col-span-2" : "space-y-2"
                  }
                >
                  <Label htmlFor={`field-${field.key}`}>
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive"> *</span>
                    ) : null}
                  </Label>

                  {isRelation ? (
                    <Select
                      value={String(value ?? "") || SELECT_NONE}
                      onValueChange={(nextValue) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]:
                            nextValue === SELECT_NONE ? "" : nextValue,
                        }));
                      }}
                    >
                      <SelectTrigger id={`field-${field.key}`}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_NONE}>None</SelectItem>
                        {lookupsByField[field.key]?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {isEnum ? (
                    <Select
                      value={String(value ?? "") || SELECT_NONE}
                      onValueChange={(nextValue) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]:
                            nextValue === SELECT_NONE ? "" : nextValue,
                        }));
                      }}
                    >
                      <SelectTrigger id={`field-${field.key}`}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_NONE}>
                          {field.nullable ? "None" : "Select"}
                        </SelectItem>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {isBoolean ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`field-${field.key}`}
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => {
                          setFormValues((current) => ({
                            ...current,
                            [field.key]: Boolean(checked),
                          }));
                        }}
                      />
                      <Label htmlFor={`field-${field.key}`}>Enabled</Label>
                    </div>
                  ) : null}

                  {isTextArea ? (
                    <Textarea
                      id={`field-${field.key}`}
                      placeholder={textareaPlaceholder}
                      value={String(value ?? "")}
                      onChange={(event) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }));
                      }}
                    />
                  ) : null}

                  {inputHint ? (
                    <p className="text-muted-foreground text-xs">{inputHint}</p>
                  ) : null}

                  {isDate ? (
                    <Input
                      id={`field-${field.key}`}
                      type="date"
                      value={String(value ?? "")}
                      onChange={(event) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }));
                      }}
                    />
                  ) : null}

                  {isDateTime ? (
                    <Input
                      id={`field-${field.key}`}
                      type="datetime-local"
                      value={String(value ?? "")}
                      onChange={(event) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }));
                      }}
                    />
                  ) : null}

                  {isNumber ? (
                    <Input
                      id={`field-${field.key}`}
                      type="number"
                      step={field.type === "integer" ? "1" : "0.01"}
                      value={String(value ?? "")}
                      onChange={(event) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }));
                      }}
                    />
                  ) : null}

                  {!isRelation &&
                  !isEnum &&
                  !isBoolean &&
                  !isTextArea &&
                  !isDate &&
                  !isDateTime &&
                  !isNumber ? (
                    <Input
                      id={`field-${field.key}`}
                      value={String(value ?? "")}
                      onChange={(event) => {
                        const newValue = event.target.value;

                        setFormValues((current) => {
                          const nextValues = {
                            ...current,
                            [field.key]: newValue,
                          };

                          if (
                            config.table === "products" &&
                            dialogMode === "create" &&
                            field.key === "title"
                          ) {
                            const currentSlug = String(current.slug ?? "");
                            const currentSku = String(current.sku ?? "");

                            const oldAutoSlug = slugify(String(current.title ?? ""));
                            const oldAutoSku = oldAutoSlug.toUpperCase().replace(/-/g, "_");

                            if (currentSlug === "" || currentSlug === oldAutoSlug) {
                              nextValues.slug = slugify(newValue);
                            }

                            if (currentSku === "" || currentSku === oldAutoSku) {
                              nextValues.sku = slugify(newValue)
                                .toUpperCase()
                                .replace(/-/g, "_");
                            }
                          }

                          return nextValues;
                        });
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {dialogMode === "edit" && config.joinEditor ? (
            <div className="space-y-3 rounded-md border p-4">
              <div>
                <p className="text-sm font-semibold">Related Records</p>
                <p className="text-muted-foreground text-xs">
                  Manage linked records directly from this form.
                </p>
              </div>

              {isJoinDataLoading ? (
                <p className="text-muted-foreground text-sm">
                  Loading related records...
                </p>
              ) : null}

              {!isJoinDataLoading && config.joinEditor === "profile_roles" ? (
                <div className="space-y-2">
                  <Label>Roles</Label>
                  {profileRoleOptions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No role options available.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {profileRoleOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 rounded-md border px-2 py-1"
                        >
                          <Checkbox
                            checked={profileRoleIds.includes(option.value)}
                            onCheckedChange={(checked) => {
                              setProfileRoleIds((current) => {
                                if (checked) {
                                  return Array.from(
                                    new Set([...current, option.value]),
                                  );
                                }

                                return current.filter(
                                  (item) => item !== option.value,
                                );
                              });
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {!isJoinDataLoading && config.joinEditor === "customer_groups" ? (
                <div className="space-y-2">
                  <Label>Customer groups</Label>
                  {customerGroupOptions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No customer-group options available.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {customerGroupOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 rounded-md border px-2 py-1"
                        >
                          <Checkbox
                            checked={customerGroupIds.includes(option.value)}
                            onCheckedChange={(checked) => {
                              setCustomerGroupIds((current) => {
                                if (checked) {
                                  return Array.from(
                                    new Set([...current, option.value]),
                                  );
                                }

                                return current.filter(
                                  (item) => item !== option.value,
                                );
                              });
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {!isJoinDataLoading && config.joinEditor === "product_tags" ? (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  {productTagOptions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No tag options available.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {productTagOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 rounded-md border px-2 py-1"
                        >
                          <Checkbox
                            checked={productTagIds.includes(option.value)}
                            onCheckedChange={(checked) => {
                              setProductTagIds((current) => {
                                if (checked) {
                                  return Array.from(
                                    new Set([...current, option.value]),
                                  );
                                }

                                return current.filter(
                                  (item) => item !== option.value,
                                );
                              });
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {!isJoinDataLoading && config.joinEditor === "order_items" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Order items</Label>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setOrderItemRows((current) => [
                          ...current,
                          {
                            productId: "",
                            quantity: "1",
                            unitPrice: "0",
                          },
                        ]);
                      }}
                    >
                      Add item
                    </Button>
                  </div>

                  {orderItemRows.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No items configured.
                    </p>
                  ) : null}

                  {orderItemRows.map((item, index) => (
                    <div
                      key={item.id ?? `order-item-${index}`}
                      className="grid gap-2 md:grid-cols-12"
                    >
                      <div className="md:col-span-5">
                        <Select
                          value={item.productId || SELECT_NONE}
                          onValueChange={(nextValue) => {
                            setOrderItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  productId:
                                    nextValue === SELECT_NONE ? "" : nextValue,
                                };
                              }),
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SELECT_NONE}>None</SelectItem>
                            {orderItemProductOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => {
                            setOrderItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  quantity: event.target.value,
                                };
                              }),
                            );
                          }}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => {
                            setOrderItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  unitPrice: event.target.value,
                                };
                              }),
                            );
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="destructive"
                          onClick={() => {
                            setOrderItemRows((current) =>
                              current.filter(
                                (_, entryIndex) => entryIndex !== index,
                              ),
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!isJoinDataLoading &&
              config.joinEditor === "transaction_items" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Transaction items</Label>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setTransactionItemRows((current) => [
                          ...current,
                          {
                            kind: "product",
                            referenceId: "",
                            amount: "0",
                          },
                        ]);
                      }}
                    >
                      Add item
                    </Button>
                  </div>

                  {transactionItemRows.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No items configured.
                    </p>
                  ) : null}

                  {transactionItemRows.map((item, index) => (
                    <div
                      key={item.id ?? `transaction-item-${index}`}
                      className="grid gap-2 md:grid-cols-12"
                    >
                      <div className="md:col-span-3">
                        <Select
                          value={item.kind}
                          onValueChange={(nextValue) => {
                            setTransactionItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  kind: nextValue as TransactionItemDraft["kind"],
                                };
                              }),
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kind" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTION_ITEM_KIND_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-5">
                        <Input
                          value={item.referenceId}
                          placeholder="Reference id (optional)"
                          onChange={(event) => {
                            setTransactionItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  referenceId: event.target.value,
                                };
                              }),
                            );
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(event) => {
                            setTransactionItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  amount: event.target.value,
                                };
                              }),
                            );
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="destructive"
                          onClick={() => {
                            setTransactionItemRows((current) =>
                              current.filter(
                                (_, entryIndex) => entryIndex !== index,
                              ),
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!isJoinDataLoading && config.joinEditor === "shipment_items" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Shipment items</Label>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setShipmentItemRows((current) => [
                          ...current,
                          {
                            orderItemId: "",
                            quantity: "1",
                          },
                        ]);
                      }}
                    >
                      Add item
                    </Button>
                  </div>

                  {shipmentItemRows.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No items configured.
                    </p>
                  ) : null}

                  {shipmentItemRows.map((item, index) => (
                    <div
                      key={item.id ?? `shipment-item-${index}`}
                      className="grid gap-2 md:grid-cols-12"
                    >
                      <div className="md:col-span-7">
                        <Select
                          value={item.orderItemId || SELECT_NONE}
                          onValueChange={(nextValue) => {
                            setShipmentItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  orderItemId:
                                    nextValue === SELECT_NONE ? "" : nextValue,
                                };
                              }),
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select order item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SELECT_NONE}>None</SelectItem>
                            {shipmentOrderItemOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => {
                            setShipmentItemRows((current) =>
                              current.map((entry, entryIndex) => {
                                if (entryIndex !== index) {
                                  return entry;
                                }

                                return {
                                  ...entry,
                                  quantity: event.target.value,
                                };
                              }),
                            );
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="destructive"
                          onClick={() => {
                            setShipmentItemRows((current) =>
                              current.filter(
                                (_, entryIndex) => entryIndex !== index,
                              ),
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {dialogMode === "create" && config.joinEditor ? (
            <p className="text-muted-foreground text-xs">
              Related records can be edited after creating and reopening this
              record.
            </p>
          ) : null}

          {formError ? (
            <p className="text-destructive text-sm">{formError}</p>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={() => void onSubmitForm()}>
              {isSubmitting
                ? "Saving..."
                : dialogMode === "create"
                  ? "Create record"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
