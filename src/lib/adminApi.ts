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

import { apiClient, ApiClientError } from "./apiClient";

export async function fetchUsers(
  params: FetchUsersParams = {},
): Promise<PaginatedResponse<ApiUser>> {
  try {
    const res = await apiClient.get<any>("/users", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        role: params.role,
        isActive: params.isActive,
      },
    });

    if (res && res.data && res.meta) {
      return res as PaginatedResponse<ApiUser>;
    }
    const list = Array.isArray(res) ? res : res?.data || [];
    return {
      data: list,
      meta: {
        page: params.page || 1,
        pageSize: params.pageSize || 15,
        total: list.length,
        totalPages: 1,
      },
    };
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
    throw new AuthApiError("Unable to reach the administration service.");
  }
}

export async function updateUser(
  id: string,
  data: { isActive?: boolean; name?: string; role?: string },
): Promise<{ message: string; data: ApiUser }> {
  try {
    const res = await apiClient.patch<any>(
      `/users/${encodeURIComponent(id)}`,
      data,
    );
    return res.data ? res : { message: "User updated successfully", data: res };
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
    throw new AuthApiError("Failed to update user.");
  }
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

export async function fetchAuditLogs(
  params: FetchAuditLogsParams = {},
): Promise<PaginatedResponse<AuditLogEntry>> {
  try {
    const res = await apiClient.get<any>("/audit-logs", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        userId: params.userId,
        entityType: params.entityType,
        action: params.action,
        search: params.search,
      },
    });

    if (res && res.data && res.meta) {
      return res as PaginatedResponse<AuditLogEntry>;
    }
    const list = Array.isArray(res) ? res : res?.data || [];
    return {
      data: list,
      meta: {
        page: params.page || 1,
        pageSize: params.pageSize || 25,
        total: list.length,
        totalPages: 1,
      },
    };
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
    throw new AuthApiError("Unable to reach the audit logs service.");
  }
}
