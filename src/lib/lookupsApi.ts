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

export async function fetchLookups(type?: string): Promise<LookupItem[]> {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const response = await fetch(`/api/lookups${query}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch lookups");
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.data || [];
}

export async function fetchSuppliers(): Promise<SupplierItem[]> {
  const response = await fetch("/api/suppliers", {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch suppliers");
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.data || [];
}

export async function fetchOfficers(): Promise<OfficerUserItem[]> {
  const response = await fetch(
    "/api/users?role=ProcurementOfficer&pageSize=100",
    {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    // If users endpoint fails or is restricted, return empty array gracefully
    return [];
  }
  const payload = await response.json();
  const list = Array.isArray(payload) ? payload : payload.data || [];
  return list.map((u: any) => ({
    id: u.id,
    name: u.name || u.displayName || u.email,
    email: u.email,
    role: u.role || u.authRole,
    isActive: u.isActive ?? true,
  }));
}
