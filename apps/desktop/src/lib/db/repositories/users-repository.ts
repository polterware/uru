import { invoke } from "@tauri-apps/api/core";
import type { User, CreateUserDTO, UpdateUserDTO } from "@uru/types";

export const UsersRepository = {
  async list(): Promise<User[]> {
    return invoke("list_users");
  },

  async getById(id: string): Promise<User | null> {
    return invoke("get_user", { id });
  },

  async create(payload: CreateUserDTO): Promise<User> {
    return invoke("create_user", { payload });
  },

  async update(payload: UpdateUserDTO): Promise<User> {
    return invoke("update_user", { payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_user", { id });
  },
};
