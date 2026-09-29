/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoleTypes } from "../../../services/account-users";

export const leftColumnFields = [
  { label: "First Name", field: "FirstName", type: "text", required: true },
  { label: "Last Name", field: "LastName", type: "text", required: true },
  { label: "Print Name", field: "PrintName", type: "text", required: true },
  { label: "Email Address", field: "Email", type: "email", required: true },
];

export const middleColumnFields = [
  { label: "Address Line-1", field: "AddressLine1", type: "text", required: true },
  { label: "Address Line-2", field: "AddressLine2", type: "text" },
  { label: "City", field: "City", type: "text", required: true },
  { label: "State", field: "State", type: "text", required: true },
  { label: "ZIP Code", field: "Zip", type: "text", required: true },
];

export const rightColumnSelectFields = [
  { label: "User Type", field: "UserTypeId", type: "select", options: ["Infinite", "LSGS", "VA"], required: true },
  { label: "Roles", field: "Roles", type: "select", options: ["Admin", "Manager", "User", "Viewer"], required: true },
  { label: "Manager", field: "ManagerId", type: "select", options: ["John Doe", "Jane Smith", "Mike Johnson"] },
  { label: "Skill Level", field: "SkillLevel", type: "select", options: ["Skill Level 01", "Skill Level 02", "Skill Level 03"], required: true },
  { label: "Clusters Assignment", field: "ClusterLookupValueMappings", type: "select", options: ["Cluster A", "Cluster B", "Cluster C", "GS6 / Clusters"] },
];

export const userTypeObjKey = {
  Infinite: 1,
  LSGS: 2,
  VA: 3,
} as const;

export const userTypeObjVal = {
  1: "Infinite",
  2: "LSGS",
  3: "VA",
} as const;

// Types
export type UserTypeKey = keyof typeof userTypeObjKey; // "Infinite" | "LSGS" | "VA"
export type UserTypeId = typeof userTypeObjKey[UserTypeKey]; // 1 | 2 | 3
export type UserTypeValue = typeof userTypeObjVal[UserTypeId]; // "Infinite" | "LSGS" | "VA"

export interface FormData {
  FirstName: string;
  LastName: string;
  PrintName: string;
  Email: string;
  PhoneNumber: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  State: string;
  Zip: string;
  UserName: string;
  UserTypeId?: number;
  Roles: RoleTypes[];
  ManagerId: number | null;
  SkillLevel: Record<string, unknown>;
  ManagerName: string;
  ClusterLookupValueMappings: number[];
}

export const toClusterId = (item: unknown): number | null => {
  if (typeof item === "number" && !Number.isNaN(item)) return item;
  if (typeof item === "string" && item.trim() !== "" && !Number.isNaN(Number(item))) {
    return Number(item);
  }
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if ("Id" in obj) return toClusterId(obj.Id);
    if ("id" in obj) return toClusterId(obj.id);
    if ("LookupValueId" in obj) return toClusterId(obj.LookupValueId);
    if ("lookupValueId" in obj) return toClusterId(obj.lookupValueId);
  }
  return null;
};

export const normalizeClusterIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value.map(toClusterId).filter((id): id is number => id != null);
};

const asClusterList = (clusters: unknown): any[] => {
  if (typeof clusters === "string") {
    try {
      return asClusterList(JSON.parse(clusters));
    } catch {
      return [];
    }
  }
  if (Array.isArray(clusters)) return clusters;
  if (!clusters || typeof clusters !== "object") return [];
  const o = clusters as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.Data)) return o.Data;
  if (Array.isArray(o.$values)) return o.$values;
  if (Array.isArray(o.result)) return o.result;
  if (Array.isArray(o.Result)) return o.Result;
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.Items)) return o.Items;
  if (Array.isArray(o.value)) return o.value;
  if (Array.isArray(o.Value)) return o.Value;
  return [];
};

export const toClusterSelectOptions = (clusters: unknown) => {
  return asClusterList(clusters)
    .map((c: any) => {
      const id = toClusterId(
        c?.keyValueId ?? c?.Id ?? c?.id ?? c?.LookupValueId ?? c?.lookupValueId
      );
      const label =
        c?.keyValue ?? c?.Description ?? c?.description ?? c?.Name ?? c?.name;
      if (id == null || label == null || String(label).trim() === "") return null;
      return {
        ...c,
        keyValue: String(label),
        keyValueId: String(id),
      };
    })
    .filter(Boolean) as Array<Record<string, unknown> & { keyValue: string; keyValueId: string }>;
};

export const INITIAL_FORM_DATA: FormData = {
  FirstName: "",
  LastName: "",
  Email: "",
  PrintName: "",
  PhoneNumber: "",
  AddressLine1: "",
  AddressLine2: "",
  City: "",
  State: "",
  Zip: "",
  UserName: "",
  UserTypeId: 0,
  Roles: [],
  SkillLevel: {},
  ManagerId: null,
  ManagerName: "",
  ClusterLookupValueMappings: [],
};
