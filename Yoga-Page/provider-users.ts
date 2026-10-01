/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { API_URLS } from '../constants/api-urls';
import { apiClient } from './api-client';

export interface ProviderUser {
  Status: string | null;
  Locations: number;
  UserNPINumber: string | null;
  Id: string;
  UserId: number | null;
  OrganizationId: number | null;
  Affiliation: any;
  UserName: string;
  Password: string | null;
  ConfirmPassword: string | null;
  FirstName: string;
  LastName: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  AddressLine1: string;
  AddressLine2: string;
  Zip: string;
  City: string;
  State: string;
  Stations: any[] | null;
  ManagerId: number | null;
  ManagerName: string | null;
  SkillLevel: number | null;
  UserText: string | null;
  Roles: any[] | null;
  UserRolls: string;
  CreatedDateUtc: string;
  LastModifiedDateUtc: string;
  LastModifiedBy: number;
  TenantId: number;
  LockoutEnabled: boolean;
  UserBoardCertification: any[];
  UserRole: number;
  PrintName: string;
  IsEnabled: boolean;
  LastLoginDate: string | null;
  UserTypeId: number;
  UserTypeName: string;
  Gender: string | null;
  BackupUsers: any[] | null;
  BackupUserForUser: any[] | null;
  IsDeleted: boolean;
  IsCLCW_SME: boolean;
  Is1151_SME?: boolean;
  FacilityIdOther: any[] | null;
  FacilityId: any[] | null;
  Specialities: any[] | [];
  EmailConfirmed: boolean;
  LastPasswordChangedDateUtc: string;
  HoursPerWeek: number | null;
  Malpractice: string | null;
  ExpiryDate: string | null;
  SchedulingType: any[] | null;
  DoB: string | null;
  EnableResetMFA: boolean;
  VBATrainId: string | null;
  ClusterLookupValueMappings: any[] | null;
  RequiredCertificationCourses: any[] | [];
  SpecialtyCourses: any[] | [];
  RecertificationCourses: any[] | [];
  CredentialingStatus: string;
  UserSignedDate: string;
  UserSpecialConsiderations: string;
  ProfessionalTitle:string;
  MedicalExperienceStartDate: string | null;
  MDEExperienceStartDate: string | null;
  UserEducation: any[];
  DisableAlerts: boolean;
  VendorId?: string;
  ResidencyStatus?: boolean;
}

export const ProviderUserInitialState: ProviderUser = {
  Status: null,
  ProfessionalTitle: "",
  Locations: 0,
  UserNPINumber: null,
  UserEducation: [],
  Id: "",
  UserId: null,
  Affiliation: null,
  OrganizationId: null,
  UserName: "",
  DisableAlerts: false,
  ResidencyStatus: false,
  VendorId: "",
  Password: null,
  UserBoardCertification: [],
  MedicalExperienceStartDate: null,
  MDEExperienceStartDate: null,
  FacilityIdOther: [],
  FacilityId: [],
  ConfirmPassword: null,
  FirstName: "",
  LastName: "",
  FullName: "",
  RequiredCertificationCourses: [],
  SpecialtyCourses: [],
  Email: "",
  PhoneNumber: "",
  AddressLine1: "",
  AddressLine2: "",
  Zip: "",
  City: "",
  State: "",
  Stations: [],
  ManagerId: null,
  ManagerName: null,
  SkillLevel: null,
  UserText: null,
  UserSpecialConsiderations: "",
  Roles: [],
  UserRolls: "",
  CreatedDateUtc: "",
  LastModifiedDateUtc: "",
  LastModifiedBy: 0,
  TenantId: 0,
  LockoutEnabled: false,
  UserRole: 0,
  PrintName: "",
  IsEnabled: false,
  LastLoginDate: null,
  UserTypeId: 0,
  UserTypeName: "",
  Gender: null,
  BackupUsers: [],
  BackupUserForUser: [],
  IsDeleted: false,
  IsCLCW_SME: false,
  Is1151_SME: false,
  EmailConfirmed: false,
  LastPasswordChangedDateUtc: "",
  HoursPerWeek: null,
  Malpractice: null,
  ExpiryDate: null,
  SchedulingType: [],
  DoB: null,
  EnableResetMFA: false,
  VBATrainId: null,
  CredentialingStatus: "",
  ClusterLookupValueMappings: [],
  RecertificationCourses: [],
  Specialities: [],
  UserSignedDate: ""
};


export interface UserEducation {
  DegreeType: string;
  MedicalSchool: string;
  DegreeReceivedDate: string; // ISO Date (yyyy-mm-dd)
  DegreeFile: string | null;
  DegreeVerifiedDate: string; // ISO Date (yyyy-mm-dd)
  DegreeVerificationFile: string | null;
  IsAPAAccredited: boolean;
  IsASHACertified: boolean;
  IsNLNACAccredited: boolean;
  IsCCNEAccredited: boolean;
  IsNCCPACertified: boolean;
}

export interface ProfessionalTitle {
  ProfessionalTitleName: string;
  ProfessionalTitleDescription: string;
  Id: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string | null;
  ModifiedBy: number | null;
}

export type ProfessionalTitlesResponse = ProfessionalTitle[];

export type UserEducationArray = UserEducation[];

export const initialUserEducation: UserEducation = {
  DegreeType: "",
  MedicalSchool: "",
  DegreeReceivedDate: "",
  DegreeFile: null,
  DegreeVerifiedDate: "",
  DegreeVerificationFile: null,
  IsAPAAccredited: false,
  IsASHACertified: false,
  IsNLNACAccredited: false,
  IsCCNEAccredited: false,
  IsNCCPACertified: false,
};

export const initialUserEducationArray: UserEducationArray = [
  { ...initialUserEducation }
];

export interface UserBoardCertification {
  UserBoard: string;
  UserBoardCertifiedDate: string; // ISO date string
  UserBoardExpirationDate: string; // ISO date string
}

export interface UserBoardCertificationArray {
  UserBoardCertification: UserBoardCertification[];
}

export const initialUserBoardCertification: UserBoardCertification = {
  UserBoard: "",
  UserBoardCertifiedDate: "",
  UserBoardExpirationDate: "",
};

/**
 * Types for user certifications API response.
 */
export interface CertificationCourse {
  Id: number;
  Lookup_Name: string | null;
  TrainingName: string;
  DocumentName: string | null;
  ProviderTrainingCertifiedDate: string | null;
  ProviderTrainingExipryDate: string | null;
  ExpiryInDays: number;
  ExpiryInMonths: number;
  ExpiryInYears: number;
  TrainingType: number;
  RecertificationId: number;
}

export interface UserCertificationsResponse {
  RequiredCertificationCourses: CertificationCourse[];
  RecertificationCourses: CertificationCourse[];
  SpecialtyCourses: CertificationCourse[];
}

/**
 * Types for organizations API response.
 */
export interface Organization {
  ServiceFacility: number;
  ProfessionalStaff: number;
  OrganizationName: string;
  OrganizationCounty: string;
  OrganizationAddress1: string;
  OrganizationAddress2: string;
  OrganizationCity: string;
  OrganizationState: string;
  OrganizationZip: string;
  OrganizationTaxIdNumber: string;
  OrganizationNPINumber: string;
  OrganizationPrimaryPhoneNumber: string;
  OrganizationAlternatePhoneNumber: string | null;
  OrganizationEmailId: string;
  OrganizationFaxNumber: string;
  IsOrganizationInfinite: boolean;
  IsPayableToOrg: boolean | null;
  CMSRatePercent: number;
  Id: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string | null;
  ModifiedBy: number | null;
}

export type OrganizationsResponse = Organization[];

/**
 * Types for facilities API response.
 */
export interface Facility {
  FacilityPracticeName: string;
  FacilityCounty: string;
  FacilityAddress1: string;
  FacilityAddress2: string | null;
  FacilityCity: string;
  FacilityState: string;
  FacilityZip: string;
  FacilityPrimaryPhone: string;
  FacilityAlternatePhone: string | null;
  FacilityEmailId: string;
  FacilityFaxNumber: string | null;
  FacilityNPINumber: string;
  IsDisabledAccessible: boolean;
  IsServiceAnimalFriendly: boolean;
  IsPreferred: boolean;
  IsInfinite: boolean;
  FacilityOfficeAdminSignature: string | null;
  FacilityOfficeAdminPrintName: string | null;
  FacilityContactPerson: string;
  SignedDate: string;
  OrganizationId: number;
  StateId: number;
  FacilityContactPersonPhoneNumber: string;
  ExternalId: string | null;
  FacilityAppointmentThresholdTime: number;
  TimeZone: string;
  ContactUserId: number | null;
  HasInternetConnectivity: boolean;
  IsElectronicSubmission: boolean;
  ContactEmailAddress: string;
  FacilityUuid: string;
  IsLab: boolean;
  FacilityIdentifier: string | null;
  Latitude: number | null;
  Longitude: number | null;
  FacilityRemarks: string | null;
  CredentialStatus: string;
  IsSmart: string;
  Id: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string;
  ModifiedBy: number;
}

export type FacilitiesResponse = Facility[];

/**
 * Types for facility CPT codes API response.
 */
export interface CPTCode {
  [key: string]: any;
}

export interface CPTCodeRange {
  [key: string]: any;
}

export interface FacilityCPTCodesResponse {
  CPTCodeList: CPTCode[];
  CPTCodeRangeList: CPTCodeRange[];
}

export interface DiagnosticTypeDto {
  Table?: string;
  table?: string;
  CptCodeValue?: string;
  cptCodeValue?: string;
  ClaimCondition?: string;
  claimCondition?: string;
  Description?: string | null;
  description?: string | null;
  Id?: number | null;
  id?: number | null;
  ClinCode?: string | null;
  dbqMasterId?: number;
}

export interface DiagnosticListItem {
  label: string;
  value: string;
  ids: string[];
  highlighted: boolean;
  DiagnosticCode: string;
  DiagnosticName: string;
}

const normalizeCptId = (value: unknown): string => String(value ?? "").trim();

const pickFirstString = (...values: unknown[]): string => {
  for (const value of values) {
    const text = normalizeCptId(value);
    if (text) return text;
  }
  return "";
};

const unwrapArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["Data", "data", "Result", "result", "Content", "content", "Items", "items"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    for (const value of Object.values(obj)) {
      if (Array.isArray(value) && value.some((item) => item && typeof item === "object")) {
        return value as T[];
      }
    }
  }
  return [];
};

const unwrapFacilityCpt = (
  payload: unknown
): FacilityCPTCodesResponse => {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const nested = (obj.Data ?? obj.data ?? obj.Result ?? obj.result ?? obj) as Record<
      string,
      unknown
    >;
    return {
      CPTCodeList: (nested.CPTCodeList ?? nested.cptCodeList ?? []) as CPTCode[],
      CPTCodeRangeList: (nested.CPTCodeRangeList ?? nested.cptCodeRangeList ?? []) as CPTCodeRange[],
    };
  }
  return { CPTCodeList: [], CPTCodeRangeList: [] };
};

const toCptCodeString = (item: unknown): string => {
  if (item == null) return "";
  if (typeof item === "string" || typeof item === "number") return normalizeCptId(item);
  const obj = item as Record<string, unknown>;
  return pickFirstString(obj.Table, obj.table, obj.code, obj.value, obj.CPTCode, obj.Id, obj.id);
};

const isIdCovered = (
  ids: string[],
  facilityCodes: Set<string>,
  ranges: Array<{ from: number; to: number }>
): boolean => {
  if (ids.some((id) => facilityCodes.has(id))) return true;
  return ids.some((id) => {
    const n = Number(id);
    return Number.isFinite(n) && ranges.some((r) => n >= r.from && n <= r.to);
  });
};

const catalogKeys = (item: DiagnosticTypeDto): string[] => {
  const keys = [
    pickFirstString(item.Table, item.table, item.CptCodeValue, item.cptCodeValue),
    pickFirstString(item.Id, item.id),
  ].filter(Boolean);
  return Array.from(new Set(keys));
};

const catalogLabel = (item: DiagnosticTypeDto, fallbackId: string): string => {
  const table = pickFirstString(item.Table, item.table, item.CptCodeValue, item.cptCodeValue);
  const description = pickFirstString(
    item.ClaimCondition,
    item.claimCondition,
    item.Description,
    item.description
  );
  if (table && description) return `${table} ${description}`;
  return description || table || fallbackId;
};

const buildFacilityCoverage = (facilityCpt: FacilityCPTCodesResponse) => {
  const facilityCodes = new Set(
    (facilityCpt.CPTCodeList ?? []).map(toCptCodeString).filter(Boolean)
  );
  const ranges = (facilityCpt.CPTCodeRangeList ?? [])
    .map((r) => {
      const row = r as Record<string, unknown>;
      return {
        from: Number(row.CPTCodeRangeFrom ?? row.cptCodeRangeFrom ?? row.from),
        to: Number(row.CPTCodeRangeTo ?? row.cptCodeRangeTo ?? row.to),
      };
    })
    .filter((r) => Number.isFinite(r.from) && Number.isFinite(r.to));
  return { facilityCodes, ranges };
};

export const getDiagnosticListWithColoring = async (
  facilityIds: number[] = [],
  prefetchedFacilityCpt?: FacilityCPTCodesResponse | null
): Promise<DiagnosticListItem[]> => {
  try {
    const diagnosticTypesRaw = await apiClient.get<unknown>(
      API_URLS.CASEDETAILS.GET_DIAGNOSTIC_TYPES
    );
    const types = unwrapArray<DiagnosticTypeDto>(diagnosticTypesRaw);

    let coverage = { facilityCodes: new Set<string>(), ranges: [] as Array<{ from: number; to: number }> };
    if (prefetchedFacilityCpt) {
      coverage = buildFacilityCoverage(unwrapFacilityCpt(prefetchedFacilityCpt));
    } else if (facilityIds.length > 0) {
      try {
        coverage = buildFacilityCoverage(
          unwrapFacilityCpt(await getFacilityCPTCodes(facilityIds))
        );
      } catch (facilityError) {
        console.error("Failed to fetch facility CPT codes for coloring:", facilityError);
      }
    }

    const hasCoverage = coverage.facilityCodes.size > 0 || coverage.ranges.length > 0;

    return types.map((c) => {
      const keys = catalogKeys(c);
      const value = keys[0] || "";
      const label = catalogLabel(c, value);
      return {
        label,
        value,
        ids: keys,
        highlighted: hasCoverage && isIdCovered(keys, coverage.facilityCodes, coverage.ranges),
        DiagnosticCode: value,
        DiagnosticName: label,
      };
    });
  } catch (error) {
    console.error("Failed to fetch diagnostic list with coloring:", error);
    throw error;
  }
};

const indexDiagnosticCatalog = (diagnosticCatalog: DiagnosticListItem[]) => {
  const byId = new Map<string, DiagnosticListItem>();
  diagnosticCatalog.forEach((item) => {
    [item.value, item.DiagnosticCode, ...(item.ids ?? [])].forEach((id) => {
      const key = normalizeCptId(id);
      if (key) byId.set(key, item);
    });
  });
  return byId;
};

export const toCptSelectOption = (
  item: DiagnosticListItem,
  highlighted = item.highlighted
): { code: string; label: string; highlighted: boolean } => ({
  code: item.value,
  label: item.label,
  highlighted,
});

export const mapFacilityCptCodesToOptions = (
  facilityCodes: string[],
  diagnosticCatalog: DiagnosticListItem[] = [],
  highlighted = true
): Array<{ code: string; label: string; highlighted: boolean }> => {
  const byId = indexDiagnosticCatalog(diagnosticCatalog);

  return facilityCodes
    .map((raw) => normalizeCptId(raw))
    .filter(Boolean)
    .map((code) => {
      const match = byId.get(code);
      return {
        code: match?.value || code,
        label: match?.label || code,
        highlighted,
      };
    });
};

export const remapCptSelectOptions = (
  selected: Array<{ code: string | number; label: string; highlighted?: boolean }>,
  diagnosticCatalog: DiagnosticListItem[],
  highlightIds?: Set<string>
): Array<{ code: string; label: string; highlighted: boolean }> => {
  const byId = indexDiagnosticCatalog(diagnosticCatalog);
  return selected.map((sel) => {
    const key = normalizeCptId(sel.code);
    const match = byId.get(key);
    if (!match) {
      return {
        code: key,
        label: sel.label || key,
        highlighted: highlightIds?.has(key) ?? Boolean(sel.highlighted),
      };
    }
    const highlighted = highlightIds
      ? match.ids.some((id) => highlightIds.has(normalizeCptId(id))) ||
        highlightIds.has(normalizeCptId(match.value))
      : Boolean(sel.highlighted);
    return toCptSelectOption(match, highlighted);
  });
};

/**
 * Types for facility affiliations API response.
 */
export interface Affiliation {
  AffiliationTypeId: number;
  AffiliationTypeValue: string;
}

/**
 * Types for scheduling type API response.
 */
export interface SchedulingType {
  SchedulingTypeId: number;
  SchedulingTypeValue: string;
  Id: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string | null;
  ModifiedBy: number | null;
}

/**
 * Types for specialty API response.
 */
export interface Specialty {
  SpecialityCode: string;
  SpecialityDescription: string;
  SpecialityCategory: string;
  Id: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string | null;
  ModifiedBy: number | null;
}

/**
 * Types for states API response.
 */
export interface State {
  StateNumber: number;
  CTRNumber: string;
  Loc: string;
  StateName: string;
  StateAbbreviation: string;
  CommonwealthTerritoryMilitaryState: string;
  OFOArea: string;
  DefaultColor: string;
  FIPSCode: string;
  ShowState: string;
  Latitude: number | null;
  Longitude: number | null;
  Id: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string | null;
  ModifiedBy: number | null;
}

export type StatesResponse = State[];

export interface OtherFacility {
  FaciltiyName: string;
  FacilityCounty: string;
  FacilityAddress1: string;
  FacilityAddress2: string | null;
  FacilityCity: string;
  FacilityState: string;
  FacilityZip: string;
  FacilityPrimaryPhone: string;
  FacilityAlternatePhone: string | null;
  FacilityEmailId: string;
  FacilityFaxNumber: string | null;
  FacilityNPINumber: string;
  IsDisabledAccessible: boolean;
  IsServiceAnimalFriendly: boolean;
  IsPreferred: boolean;
  IsInfinite: boolean;
  FacilityOfficeAdminSignature: string | null;
  FacilityOfficeAdminPrintName: string | null;
  FacilityContactPerson: string;
  SignedDate: string;
  OrganizationId: number;
  StateId: number;
  FacilityContactPersonPhoneNumber: string;
  ExternalId: string | null;
  FacilityAppointmentThresholdTime: number;
  TimeZone: string;
  ContactUserId: number | null;
  HasInternetConnectivity: boolean;
  IsElectronicSubmission: boolean;
  ContactEmailAddress: string;
  FacilityUuid: string;
  IsLab: boolean;
  FacilityIdentifier: string | null;
  Latitude: number | null;
  Longitude: number | null;
  FacilityRemarks: string | null;
  CredentialStatus: string;
  IsSmart: string;
  FacilityId: number;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string;
  ModifiedBy: number;
}

/**
 * Type for Credential Status Lookup Value.
 */
export interface CredentialStatusLookupValue {
  LookupValueId: number;
  LookupTypeId: number;
  Name: string;
  Description: string;
}

export interface ProviderAddUserRole {
  Name: string;
  NormalizedName: string;
  Description: string;
  TenantId: number;
  IsActive: boolean;
  UserTypeRole: number;
  IsProvider: boolean;
  ApplicationRoleId: string;
  IsSelected: boolean;
}

export interface ProviderAddUserBackupUser {
  UserId: number;
  Priority: number;
}

export interface ProviderAddUserPayload {
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  AddressLine1: string;
  AddressLine2: string;
  Zip: string;
  City: string;
  State: string;
  Stations: number[];
  ManagerId: number;
  ManagerName: string;
  SkillLevel: number;
  UserText: string;
  Roles: ProviderAddUserRole[];
  CreatedDateUtc: string;
  LastModifiedDateUtc: string;
  LastModifiedBy: number;
  TenantId: number;
  IsEnabled: boolean;
  PrintName: string;
  Gender: string;
  LastLoginDate: string;
  UserTypeId: number;
  UserTypeName: string;
  IsCLCW_SME: boolean;
  EmailConfirmed: boolean;
  HoursPerWeek: number;
  Malpractice: string;
  ExpiryDate: string;
  SchedulingType: number[];
  DoB: string;
  EnableResetMFA: boolean;
  VBATrainId: string;
  ClusterLookupValueMappings: number[];
  LastLoginFormattedDate: string;
  IsGoogleAuthEnabled: boolean;
  GoogleAuthSecretKey: string;
  BackupUsers: ProviderAddUserBackupUser[];
  Role: string[];
  VendorId?: string;
  ResidencyStatus?: boolean;
}

/**
 * Fetch all provider users for a given tenant.
 * @param tenantId Tenant ID (default: 1)
 * @returns Promise<ProviderUser[]>
 */
export const getAllProviderUsers = async (tenantId: number = 1): Promise<ProviderUser[]> => {
  try {
    return await apiClient.get(API_URLS.PROVIDER_USERS.GET_ALL, {
      params: { tenantId }
    });
  } catch (error) {
    console.error('Failed to fetch provider users:', error);
    throw error;
  }
};

export const getProviderUserByUsername = async (userName: string, tenantId = 1): Promise<ProviderUser> => {
  try {
    return await apiClient.get<ProviderUser>(API_URLS.PROVIDER_USERS.GET, {
      params: { tenantId, UserName: userName }
    });

  } catch (error) {
    console.error('Failed to fetch account user by username:', error);
    throw error;
  }
};

export const getProviderUserById = async (userId: number, tenantId = 1): Promise<ProviderUser> => {
  try {
    return await apiClient.get<ProviderUser>(API_URLS.PROVIDER_USERS.GET, {
      params: { tenantId, UserId: userId }
    });
  } catch (error) {
    console.error("Failed to fetch provider user by id:", error);
    throw error;
  }
};

export const getFacilitiesByOrganizationId = async (organizationId: number): Promise<OtherFacility[]> => {
  try {
    const result = await apiClient.get<OtherFacility[]>(
      `${API_URLS.PROVIDER_USERS.OTHER_FACILITY}?organizationId=${organizationId}`
    );
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch facilities for organization:", error);
    return [];
  }
};

/**
 * Fetch professional titles.
 * @returns Promise<ProfessionalTitlesResponse>
 */
export const getTitles = async (): Promise<ProfessionalTitlesResponse> => {
  try {
   return await apiClient.get(API_URLS.PROVIDER_USERS.GET_TITLES);
  } catch (error) {
    console.error('Failed to fetch professional titles:', error);
    throw error;
  }
};


/**
 * Fetch certifications for a given user.
 * @param userId User ID
 * @returns Promise<UserCertificationsResponse>
 */
export const getUserCertifications = async (): Promise<UserCertificationsResponse> => {
  try {
    // NOTE: Replace the URL below with the actual endpoint for user certifications.
    return await apiClient.get(API_URLS.PROVIDER_USERS.GET_CERTIFICATES, {
      // params: { userId }
    });
  } catch (error) {
    console.error('Failed to fetch user certifications:', error);
    throw error;
  }
};

/**
 * Fetch all organizations.
 * @returns Promise<OrganizationsResponse>
 */
export const getAllOrganizations = async (): Promise<OrganizationsResponse> => {
  try {
    return await apiClient.get(API_URLS.PROVIDER_USERS.GET_ALL_ORGANIZATIONS);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    throw error;
  }
};

/**
 * Fetch all facilities.
 * @returns Promise<FacilitiesResponse>
 */
export const getAllFacilities = async (): Promise<FacilitiesResponse> => {
  try {
    return await apiClient.get(API_URLS.PROVIDER_USERS.GET_ALL_FACILITY);
  } catch (error) {
    console.error('Failed to fetch facilities:', error);
    throw error;
  }
};

export const getFacilitiesForProvider = async (userId: number): Promise<FacilitiesResponse> => {
  try {
    return await apiClient.get(API_URLS.PROVIDER_HOME.GET_FACILITY_FOR_PROVIDER, {
      params: {userId}
    })
  } catch (error) {
    console.error('Failed to fetch facilities:', error);
    throw error;
  }
}

/**
 * Fetch CPT codes for a facility.
 * @param facilityId Facility ID
 * @returns Promise<FacilityCPTCodesResponse>
 */
export const getFacilityCPTCodes = async (
  facilityIds: number[] = []
): Promise<FacilityCPTCodesResponse> => {
  try {
    return await apiClient.post(
      API_URLS.PROVIDER_USERS.GET_FACILITY_CPT_CODES,
      {
        Facilities: facilityIds, // 👈 must be an array, as API expects
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch facility CPT codes:", error);
    throw error;
  }
};




/**
 * Fetch affiliations for provider users.
 * @returns Promise<Affiliation[]>
 */
export const getAffiliations = async (): Promise<Affiliation[]> => {
  try {
   return await apiClient.get(
      API_URLS.PROVIDER_USERS.GET_AFFILIATIONS,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch affiliations:", error);
    throw error;
  }
};

/**
 * Fetch scheduling types for provider users.
 * @returns Promise<SchedulingType[]>
 */
export const getSchedulingTypes = async (): Promise<SchedulingType[]> => {
  try {
    return await apiClient.get(
      API_URLS.PROVIDER_USERS.GET_SCHEDULING_TYPE,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch scheduling types:", error);
    throw error;
  }
};

/**
 * Fetch specialties for provider users.
 * @returns Promise<Specialty[]>
 */
export const getSpecialties = async (): Promise<Specialty[]> => {
  try {
    return await apiClient.get(
      API_URLS.PROVIDER_USERS.GET_SPECIALTIES,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch specialties:", error);
    throw error;
  }
};

/**
 * Fetch all states.
 * @returns Promise<StatesResponse>
 */
export const getAllStates = async (): Promise<StatesResponse> => {
  try {
     return await apiClient.get(
      API_URLS.PROVIDER_USERS.GET_ALL_STATES,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch states:", error);
    throw error;
  }
};

/**
 * Edit provider user information.
 * @param userData - The provider user data to update.
 * @returns Promise<any>
 */
export const editProviderUser = async (userData: any): Promise<any> => {
  try {
    const response = await apiClient.put(
      API_URLS.PROVIDER_USERS.EDIT_PROVIDER_USER,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to edit provider user:", error);
    throw error;
  }
};

/**
 * Fetch all facilities by organisation (OTHER_FACILITY).
 * @returns Promise<OtherFacility[]>
 */
export const getOtherFacility = async (): Promise<OtherFacility[]> => {
  try {
    return await apiClient.get(
      API_URLS.PROVIDER_USERS.OTHER_FACILITY,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch facilities by organisation:", error);
    throw error;
  }
};

/**
 * Fetch credential status lookup values.
 * @returns Promise<CredentialStatusLookupValue[]>
 */
export const getCredentialStatus = async (): Promise<CredentialStatusLookupValue[]> => {
  try {
    return await apiClient.get(
      API_URLS.PROVIDER_USERS.CREDENTIAL_STATUS,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch credential status lookup values:", error);
    throw error;
  }
};

/**
 * Add a new provider user.
 * @param data - The payload for the new provider user.
 * @returns Promise<any>
 */
export const addProviderUser = async (data: any): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await apiClient.post(
      API_URLS.PROVIDER_USERS.ADD_PROVIDER_USER,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to add provider user:", error);
    throw error;
  }
};

/**
 * Add a user via the provider 'ADD_USER' endpoint.
 * @param data - The payload for the new user.
 * @returns Promise<any>
 */
export const addAccountUser = async (
  data: ProviderAddUserPayload
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await apiClient.post(
      API_URLS.USERS.ADD_USER,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to add account user:", error);
    throw error;
  }
};

/**
 * Add a user via the provider 'ADD_USER' endpoint.
 * @param data - The payload for the new user.
 * @returns Promise<any>
 */
export const addProviderAccountUser = async (
  data: ProviderAddUserPayload
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await apiClient.post(
      API_URLS.PROVIDER_USERS.ADD_USER,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to add provider account user:", error);
    throw error;
  }
};

// =====================================================================
// Search Provider Users API
// -----
// Matches the `SearchProviderUsers` request/response contract:
//   Request  : { TenantId, Filters: [{ Field, Operator, Logic, Value }, ...], ProviderRoles }
//   Response : [...]
// Supported fields:    UserName, Email, FirstName, LastName, PrintName
// Supported operators: Contains, Equals, StartsWith
// Supported logic:     And, Or
// =====================================================================

export type ProviderUserFilterField =
  | 'UserName'
  | 'Email'
  | 'FirstName'
  | 'LastName'
  | 'PrintName';

export type ProviderUserFilterOperator = 'Contains' | 'Equals' | 'StartsWith';

export type ProviderUserFilterLogic = 'And' | 'Or';

export interface ProviderUserSearchFilter {
  Field: ProviderUserFilterField;
  Operator: ProviderUserFilterOperator;
  Logic: ProviderUserFilterLogic;
  Value: string;
}

export interface ProviderUserSearchRequest {
  TenantId: number;
  Filters: ProviderUserSearchFilter[];
  ProviderRoles: string;
}

export type ProviderUserSearchResponseItem = Partial<ProviderUser> & Record<string, any>;
export type ProviderUserSearchResponse = ProviderUserSearchResponseItem[];

/**
 * Calls the real `SearchProviderUsers` endpoint.
 *
 * - Fields:    UserName, Email, FirstName, LastName, PrintName
 * - Operators: Contains, Equals, StartsWith
 * - Logic:     And, Or
 * - Response: Provider user array
 */
export const searchProviderUsers = async (
  request: ProviderUserSearchRequest
): Promise<ProviderUserSearchResponse> => {
  try {
    return await apiClient.post<ProviderUserSearchResponse>(
      API_URLS.PROVIDER_USERS.SEARCH,
      request
    );
  } catch (error) {
    console.error('Failed to search provider users:', error);
    throw error;
  }
};

/**
 * Adapts the BE's PascalCase search response item into the full `ProviderUser`
 * shape used by the existing UI components and Redux slices. Unknown fields
 * in the initial state keep their default values.
 */
export const mapSearchProviderUserToProviderUser = (
  item: ProviderUserSearchResponseItem
): ProviderUser => ({
  ...ProviderUserInitialState,
  ...item,
});

export const getFacilityUsers = async (facilityId: string): Promise<number[]> => {
  try {
    const result = await apiClient.get<number[]>(
      `${API_URLS.PROVIDER_DBQ_BURDEN_TIME.GET_USERS_FOR_FACILITY}?facilityId=${facilityId}`
    );
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch users for facility:", error);
    return [];
  }
};


