export type User = {
  id: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  security_stamp: string | null;
  is_email_verified: boolean | null;
  is_phone_verified: boolean | null;
  failed_login_attempts: number | null;
  lockout_end_at: string | null;
  mfa_enabled: boolean | null;
  mfa_secret: string | null;
  mfa_backup_codes: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  status_internal: string;
  created_at: string;
  updated_at: string;
  profile_type: string | null;
  status: string | null;
};

export type CreateUserDTO = {
  email?: string;
  phone?: string;
  password?: string;
  profile_type?: string;
  status?: string;
};

export type UpdateUserDTO = {
  id: string;
  email?: string;
  phone?: string;
  profile_type?: string;
  status?: string;
};
