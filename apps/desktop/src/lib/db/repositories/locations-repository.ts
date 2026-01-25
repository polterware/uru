import { invoke } from "@tauri-apps/api/core";
import type {
  Location,
  CreateLocationDTO,
  UpdateLocationDTO,
} from "@uru/types";

export const LocationsRepository = {
  async list(shopId: string): Promise<Location[]> {
    return invoke("list_locations", { shop_id: shopId });
  },

  async listByShop(shopId: string): Promise<Location[]> {
    return invoke("list_locations", { shop_id: shopId });
  },

  async getById(shopId: string, id: string): Promise<Location | null> {
    return invoke("get_location", { shop_id: shopId, id });
  },

  async create(payload: CreateLocationDTO): Promise<Location> {
    return invoke("create_location", { payload });
  },

  async update(payload: UpdateLocationDTO): Promise<Location> {
    return invoke("update_location", { payload });
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke("delete_location", { shop_id: shopId, id });
  },
};
