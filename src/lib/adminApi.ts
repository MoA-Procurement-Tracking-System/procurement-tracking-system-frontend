import { AuthApiError } from "./authApi";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  displayName: string;
  role: string;
  authRole: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function adminRequest<T>(
  path: string,
  options?: { method?: string; body?: object },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: options?.method ?? "GET",
      headers: options?.body
        ? { "Content-Type": "application/json" }
        : undefined,
      credentials: "same-origin",
      cache: "no-store",
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new AuthApiError(
      "Unable to reach the administration service. Please try again.",
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const msg =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as Record<string, unknown>).message === "string"
        ? ((payload as Record<string, unknown>).message as string)
        : "The request could not be completed.";
    throw new AuthApiError(msg);
  }

  return payload as T;
}

// ─── User Management API ────────────────────────────────────────────────────

export interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export function fetchUsers(
  params: FetchUsersParams = {},
): Promise<PaginatedResponse<ApiUser>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));

  const qs = query.toString();
  return adminRequest<PaginatedResponse<ApiUser>>(
    `/api/users${qs ? `?${qs}` : ""}`,
  );
}

export function updateUser(
  id: string,
  data: { isActive?: boolean; name?: string; role?: string },
): Promise<{ message: string; data: ApiUser }> {
  return adminRequest<{ message: string; data: ApiUser }>(
    `/api/users/${encodeURIComponent(id)}`,
    { method: "PATCH", body: data },
  );
}

// ─── Audit Logs API ─────────────────────────────────────────────────────────

export interface FetchAuditLogsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  entityType?: string;
  action?: string;
  search?: string;
}

export function fetchAuditLogs(
  params: FetchAuditLogsParams = {},
): Promise<PaginatedResponse<AuditLogEntry>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.userId) query.set("userId", params.userId);
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.action) query.set("action", params.action);
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  return adminRequest<PaginatedResponse<AuditLogEntry>>(
    `/api/audit-logs${qs ? `?${qs}` : ""}`,
  );
}
