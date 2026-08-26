export interface LookupItem {
  id: string;
  type: string;
  code: string;
  label: string;
  isActive: boolean;
}

export interface SupplierItem {
  id: string;
  name: string;
  tinNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
}

export interface OfficerUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

import { apiClient } from "./apiClient";

export async function fetchLookups(type?: string): Promise<LookupItem[]> {
  try {
    const payload = await apiClient.get<any>("/lookups", {
      params: type ? { type } : undefined,
    });
    return Array.isArray(payload) ? payload : payload.data || [];
  } catch (err) {
    console.error("fetchLookups error:", err);
    return [];
  }
}

export async function fetchSuppliers(): Promise<SupplierItem[]> {
  try {
    const payload = await apiClient.get<any>("/suppliers");
    return Array.isArray(payload) ? payload : payload.data || [];
  } catch (err) {
    console.error("fetchSuppliers error:", err);
    return [];
  }
}

export async function fetchOfficers(): Promise<OfficerUserItem[]> {
  try {
    const payload = await apiClient.get<any>("/users", {
      params: { role: "ProcurementOfficer", pageSize: 100 },
    });
    const list = Array.isArray(payload) ? payload : payload.data || [];
    return list.map((u: any) => ({
      id: u.id,
      name: u.name || u.displayName || u.email,
      email: u.email,
      role: u.role || u.authRole,
      isActive: u.isActive ?? true,
    }));
  } catch {
    return [];
  }
}
