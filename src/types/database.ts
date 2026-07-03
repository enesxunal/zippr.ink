export type PlanType =
  | "free"
  | "lite"
  | "standard"
  | "professional"
  | "enterprise";

export type UserRole = "user" | "super_admin";

export type FileStatus = "active" | "expired" | "deleted";

export type SubscriptionStatus = "active" | "canceled" | "past_due";

export type TicketStatus = "open" | "pending" | "resolved";

export type TicketPriority = "low" | "medium" | "high";

export type QuoteStatus = "pending" | "contacted" | "closed";

export type ApiKeyMode = "test" | "live";

export type ImageJobStatus = "pending" | "processing" | "completed" | "failed";

export type ImageJobSource = "upload" | "url";

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  mode: ApiKeyMode;
  last_used_at: string | null;
  usage_count: number;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiUsageRecord {
  id: string;
  user_id: string;
  api_key_id: string | null;
  endpoint: string;
  method: string;
  status_code: number;
  created_at: string;
}

export interface ImageJobRecord {
  id: string;
  user_id: string;
  api_key_id: string | null;
  status: ImageJobStatus;
  source_type: ImageJobSource;
  original_url: string | null;
  optimized_url: string | null;
  original_size_bytes: number | null;
  optimized_size_bytes: number | null;
  compression_ratio: number | null;
  format: string | null;
  width: number | null;
  height: number | null;
  error_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  plan_type: PlanType;
  storage_used: number;
  storage_limit: number;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string | null;
  slug: string;
  original_name: string;
  custom_name: string;
  file_size: number;
  mime_type: string;
  r2_key: string;
  download_url: string | null;
  click_count: number;
  download_count: number;
  expires_at: string | null;
  is_compressed: boolean;
  status: FileStatus;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan_type: PlanType;
  price: number;
  currency: string;
  billing_cycle: string;
  gateway_transaction_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  company_name: string;
  email: string;
  user_count: number;
  requested_storage_gb: number;
  status: QuoteStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemMetric {
  key: string;
  value: string;
  updated_at: string;
}

export interface CronLog {
  id: string;
  job_name: string;
  status: string;
  files_processed: number;
  bytes_freed: number;
  message: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      };
      files: {
        Row: FileRecord;
        Insert: Omit<FileRecord, "id" | "created_at" | "click_count" | "download_count"> & {
          id?: string;
        };
        Update: Partial<FileRecord>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Subscription>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Ticket>;
      };
      quotes: {
        Row: Quote;
        Insert: Omit<Quote, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Quote>;
      };
      system_metrics: {
        Row: SystemMetric;
        Insert: SystemMetric;
        Update: Partial<SystemMetric>;
      };
      cron_logs: {
        Row: CronLog;
        Insert: Omit<CronLog, "id" | "created_at"> & { id?: string };
        Update: Partial<CronLog>;
      };
      api_keys: {
        Row: ApiKeyRecord;
        Insert: Omit<ApiKeyRecord, "id" | "created_at" | "updated_at" | "last_used_at" | "usage_count" | "revoked_at"> & {
          id?: string;
          last_used_at?: string | null;
          usage_count?: number;
          revoked_at?: string | null;
        };
        Update: Partial<ApiKeyRecord>;
      };
      api_usage: {
        Row: ApiUsageRecord;
        Insert: Omit<ApiUsageRecord, "id" | "created_at"> & { id?: string };
        Update: Partial<ApiUsageRecord>;
      };
      image_jobs: {
        Row: ImageJobRecord;
        Insert: Omit<ImageJobRecord, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<ImageJobRecord>;
      };
    };
  };
}

export type ImageFormat = "webp" | "png" | "jpeg" | "gif" | "avif";

export interface UploadInitRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  customSlug: string;
  customName?: string;
}

export interface TransformRequest {
  imageData: string;
  format: ImageFormat;
  quality?: number;
  compress?: boolean;
}

export interface ToslaCheckoutRequest {
  planType: Exclude<PlanType, "free" | "enterprise">;
  userId: string;
}
