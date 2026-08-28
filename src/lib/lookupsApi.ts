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

const FALLBACK_LOOKUPS: LookupItem[] = [
  {
    id: "sec-1",
    type: "SECTOR",
    code: "SEC_AGRI",
    label: "Agriculture & Livestock",
    isActive: true,
  },
  {
    id: "sec-2",
    type: "SECTOR",
    code: "SEC_HORT",
    label: "Horticulture & Seed Development",
    isActive: true,
  },
  {
    id: "sec-3",
    type: "SECTOR",
    code: "SEC_NAT",
    label: "Natural Resources & Irrigation",
    isActive: true,
  },
  {
    id: "fs-1",
    type: "FUNDING_SOURCE",
    code: "FS_WB",
    label: "World Bank (IDA)",
    isActive: true,
  },
  {
    id: "fs-2",
    type: "FUNDING_SOURCE",
    code: "FS_AFDB",
    label: "African Development Bank (AfDB)",
    isActive: true,
  },
  {
    id: "fs-3",
    type: "FUNDING_SOURCE",
    code: "FS_GOV",
    label: "Government of Ethiopia (Treasury)",
    isActive: true,
  },
  {
    id: "pm-1",
    type: "PROCUREMENT_METHOD",
    code: "PM_RFQ",
    label: "Request for Quotations (RFQ)",
    isActive: true,
  },
  {
    id: "pm-2",
    type: "PROCUREMENT_METHOD",
    code: "PM_QCBS",
    label: "Quality and Cost-Based Selection (QCBS)",
    isActive: true,
  },
  {
    id: "pm-3",
    type: "PROCUREMENT_METHOD",
    code: "PM_NCB",
    label: "National Competitive Bidding (NCB)",
    isActive: true,
  },
];

const FALLBACK_OFFICERS: OfficerUserItem[] = [
  {
    id: "off-1",
    name: "Abebe Bikila",
    email: "officer@moa.gov.et",
    role: "ProcurementOfficer",
    isActive: true,
  },
  {
    id: "off-2",
    name: "Almaz Ayana",
    email: "almaz.officer@moa.gov.et",
    role: "ProcurementOfficer",
    isActive: true,
  },
];

export async function fetchLookups(type?: string): Promise<LookupItem[]> {
  try {
    const payload = await apiClient.get<any>("/lookups", {
      params: type ? { type } : undefined,
    });
    const items = Array.isArray(payload) ? payload : payload?.data || [];
    if (items.length > 0) return items;
  } catch {
    // Graceful fallback to default baseline
  }
  return type
    ? FALLBACK_LOOKUPS.filter((l) => l.type === type)
    : FALLBACK_LOOKUPS;
}

export async function fetchSuppliers(): Promise<SupplierItem[]> {
  try {
    const payload = await apiClient.get<any>("/suppliers");
    const items = Array.isArray(payload) ? payload : payload?.data || [];
    if (items.length > 0) return items;
  } catch {
    // Graceful fallback
  }
  return [
    {
      id: "sup-1",
      name: "Ethiopian Agricultural Equipment Enterprise",
      tinNumber: "TIN-00293847",
      email: "sales@eaee.gov.et",
      phone: "+251115512345",
      status: "ACTIVE",
    },
  ];
}

export async function fetchOfficers(): Promise<OfficerUserItem[]> {
  try {
    const payload = await apiClient.get<any>("/users", {
      params: { role: "ProcurementOfficer", pageSize: 100 },
    });
    const list = Array.isArray(payload) ? payload : payload?.data || [];
    if (list.length > 0) {
      return list.map((u: any) => ({
        id: u.id,
        name: u.name || u.displayName || u.email,
        email: u.email,
        role: u.role || u.authRole,
        isActive: u.isActive ?? true,
      }));
    }
  } catch {
    // Graceful fallback
  }
  return FALLBACK_OFFICERS;
}
