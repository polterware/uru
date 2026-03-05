import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Session, User } from "@supabase/supabase-js";
import type { AppRole } from "@/types/domain";
import { getSupabaseClient, getSupabaseConfig } from "@/lib/supabase/client";
import { handleSupabaseError } from "@/lib/supabase/errors";

const NETWORK_ERROR_PATTERNS = [
  "load failed",
  "failed to fetch",
  "network connection was lost",
];

function isNetworkRequestError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

async function retryOnceOnNetworkError<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isNetworkRequestError(error)) {
      throw error;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
    return operation();
  }
}

type NativeSignInResponse = {
  access_token: string;
  refresh_token: string;
};

async function signInWithPasswordViaTauri(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { url, publishableDefaultKey } = getSupabaseConfig();

  const tokenData = await invoke<NativeSignInResponse>(
    "supabase_sign_in_with_password",
    {
      supabaseUrl: url,
      publishableKey: publishableDefaultKey,
      email,
      password,
    },
  );

  if (!tokenData.access_token || !tokenData.refresh_token) {
    throw new Error("Native auth did not return a valid session token pair");
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
  });

  if (error) {
    handleSupabaseError(error);
  }

  return { user: data.user, session: data.session };
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    handleSupabaseError(error);
  }

  return data.session;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await retryOnceOnNetworkError(() =>
      supabase.auth.signInWithPassword({ email, password }),
    );

    if (error) {
      handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    if (isNetworkRequestError(error)) {
      if (isTauri()) {
        try {
          return await signInWithPasswordViaTauri(email, password);
        } catch (nativeFallbackError) {
          if (nativeFallbackError instanceof Error) {
            throw new Error(
              `Unable to reach Supabase Auth endpoint (WebView + native fallback). ${nativeFallbackError.message}`,
            );
          }
        }
      }

      throw new Error(
        "Unable to reach Supabase Auth endpoint. Check internet/firewall/VPN and restart the app to reload connection settings.",
      );
    }

    throw error;
  }
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    handleSupabaseError(error);
  }
}

export async function getUserRoles(userId: string): Promise<Array<AppRole>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    handleSupabaseError(error);
  }

  const rows = data as Array<{
    roles: { code: AppRole } | Array<{ code: AppRole }> | null;
  }>;

  return rows
    .flatMap((row) => {
      if (!row.roles) {
        return [];
      }

      return Array.isArray(row.roles) ? row.roles : [row.roles];
    })
    .map((role) => role.code);
}

export async function assertAuthenticated() {
  const session = await getSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }
  return session;
}
