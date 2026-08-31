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
  status?: string;
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
      params: { role: "ProcurementOfficer", isActive: true, pageSize: 100 },
    });
    const list = Array.isArray(payload) ? payload : payload?.data || [];
    if (list.length > 0) {
      return list
        .filter((u: any) => {
          const activeFlag = u.isActive !== false;
          const activeStatus = !u.status || u.status === "ACTIVE";
          const isOfficerRole =
            !u.role ||
            u.role === "ProcurementOfficer" ||
            u.role === "OFFICER" ||
            u.authRole === "OFFICER" ||
            u.authRole === "ProcurementOfficer";
          return activeFlag && activeStatus && isOfficerRole;
        })
        .map((u: any) => ({
          id: u.id,
          name: u.name || u.displayName || u.email,
          email: u.email,
          role: u.role || u.authRole || "ProcurementOfficer",
          isActive: true,
          status: u.status || "ACTIVE",
        }));
    }
  } catch {
    // Graceful fallback
  }
  return FALLBACK_OFFICERS.filter((o) => o.isActive);
}

export interface CommitteeUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

const FALLBACK_COMMITTEE_MEMBERS: CommitteeUserItem[] = [
  {
    id: "dcb48490-bf61-4982-89b0-3556da376ea3",
    name: "Workneh Tsionawit",
    email: "tsionawit.ugr-4989-16@aau.edu.et",
    role: "ENDORSING_COMMITTEE",
  },
  {
    id: "46258fbe-9684-41cf-b814-77788d30bca1",
    name: "Edna Asmamaw",
    email: "edna@gmail.com",
    role: "ENDORSING_COMMITTEE",
  },
  {
    id: "265f711e-adf1-406a-b965-185a96496bce",
    name: "Alula Girma",
    email: "alula@gmail.com",
    role: "ENDORSING_COMMITTEE",
  },
  {
    id: "d129e293-d9d6-4759-9705-1077c5a288ad",
    name: "Worku Bekele",
    email: "worku@gmail.com",
    role: "ENDORSING_COMMITTEE",
  },
  {
    id: "0e02469a-39df-4af4-9400-c08c383dd903",
    name: "Dawit Haile",
    email: "dawit@gmail.com",
    role: "ENDORSING_COMMITTEE",
  },
];

export async function fetchCommitteeMembers(): Promise<CommitteeUserItem[]> {
  try {
    const payload = await apiClient.get<any>("/users", {
      params: { role: "ENDORSING_COMMITTEE", isActive: true, pageSize: 100 },
    });
    const list = Array.isArray(payload) ? payload : payload?.data || [];
    if (list.length > 0) {
      const filtered = list.filter((u: any) => {
        const activeFlag = u.isActive !== false;
        const activeStatus = !u.status || u.status === "ACTIVE";
        const isCommitteeRole =
          !u.role ||
          u.role === "ENDORSING_COMMITTEE" ||
          u.role === "CommitteeMember" ||
          u.role === "EndorsingCommitteeMember" ||
          u.authRole === "ENDORSING_COMMITTEE" ||
          u.authRole === "CommitteeMember";
        return activeFlag && activeStatus && isCommitteeRole;
      });
      if (filtered.length > 0) {
        return filtered.map((u: any) => ({
          id: u.id,
          name: u.name || u.displayName || u.email,
          email: u.email,
          role: u.role || u.authRole || "ENDORSING_COMMITTEE",
        }));
      }
    }
  } catch {
    // Graceful fallback
  }
  return FALLBACK_COMMITTEE_MEMBERS;
}
