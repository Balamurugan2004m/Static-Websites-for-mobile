import { apiClient } from "./api-client";
import API_URLS from "../constants/api-urls";
import { CredentialStatusLookupValue, getCredentialStatus } from "./provider-users";

export interface OrgFacility {
  id: string;
  practiceName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  facilityStatus: "Active" | "Inactive";
  smartEnabled: boolean;
  // Detail-level fields
  npiNumber?: string;
  primaryPhone?: string;
  altPhone?: string;
  faxNumber?: string;
  email?: string;
  organization?: string;
  calendarAdministrator?: string;
  specialAccommodation?: string;
  address2?: string;
  county?: string;
  facilityIdentifier?: string;
  externalFacilityId?: string;
  facilityCluster?: string;
  hoursOfOperation?: DayHours[];
}

export interface DayHours {
  day: string;
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface OrgStaff {
  id: string;
  name: string;
  userName: string;
  securityUserId: string;
  emailAddress: string;
  roles: string[];
  npi: string;
  status: "Active" | "Inactive";
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  altPhoneNumber: string;
  faxNumber: string;
  taxIdNumber: string;
  npiNumber: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  isInfinite: boolean;
  isPayable: boolean;
  cmsRatePercent: string;
  contractStatus: string;
  serviceFacility: number;
  status: "Active" | "Inactive";
  facilities: OrgFacility[];
  staff: OrgStaff[];
}

export const CONTRACT_STATUS_OPTIONS = ["Active", "Inactive", "Contract in discussion"];

export interface OrganizationDto {
  Id: number;
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
  OrganizationAlternatePhoneNumber: string;
  OrganizationEmailId: string;
  OrganizationFaxNumber: string;
  IsOrganizationInfinite: boolean;
  IsPayableToOrg: boolean;
  ServiceFacility: number;
  ProfessionalStaff: number;
  CMSRatePercent: number;
  OrganizationStatusId: number;
  OrganizationStatus?: string;
  CreatedDate?: string;
  CreatedBy?: number;
  ModifiedDate?: string | null;
  ModifiedBy?: number | null;
}

export interface FacilityDto {
  Id: number;
  FacilityPracticeName: string;
  FacilityCounty: string;
  FacilityAddress1: string;
  FacilityAddress2: string | null;
  Address: string;
  FacilityCity: string;
  FacilityState: string;
  FacilityZip: string;
  FacilityPrimaryPhone: string;
  FacilityAlternatePhone: string | null;
  FacilityEmailId: string;
  FacilityFaxNumber: string;
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
  Latitude: string | null;
  Longitude: string | null;
  FacilityRemarks: string | null;
  CredentialStatus: string;
  IsSmart: string;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string;
  ModifiedBy: number;
}
// ─── Search types ─────────────────────────────────────────────────────────────
export interface OrgSearchFilter {
  Field: string;
  Operator: string;
  Logic: string;
  Value: string;
}

export interface OrgSearchRequest {
  Filters: OrgSearchFilter[];
}

export const searchOrganizationsApi = async (query: string): Promise<OrganizationDto[]> => {
  const body: OrgSearchRequest = {
    Filters: query.trim()
      ? [{ Field: "OrganizationName", Operator: "Contains", Logic: "AND", Value: query.trim() }]
      : [],
  };
  const result = await apiClient.post<OrganizationDto[]>(API_URLS.PROVIDER_ORGANIZATION.SEARCH, body);
  return Array.isArray(result) ? result : [];
};

export const getAllOrganizations = async (): Promise<OrganizationDto[]> => {
  try {
    const result = await apiClient.get<OrganizationDto[]>(API_URLS.PROVIDER_USERS.GET_ALL_ORGANIZATIONS);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    throw error;
  }
};

export const addOrganization = async (dto: OrganizationDto): Promise<boolean> => {
  try {
    return await apiClient.post<boolean>(API_URLS.PROVIDER_ORGANIZATION.ADD, dto);
  } catch (error) {
    console.error("Failed to add organization:", error);
    throw error;
  }
};

export const getOrganizationById = async (organizationId: number): Promise<OrganizationDto> => {
  try {
    return await apiClient.get<OrganizationDto>(
      `${API_URLS.PROVIDER_ORGANIZATION.GET}?organizationId=${organizationId}`
    );
  } catch (error) {
    console.error("Failed to get organization:", error);
    throw error;
  }
};

export const editOrganization = async (dto: OrganizationDto): Promise<boolean> => {
  try {
    return await apiClient.put<boolean>(API_URLS.PROVIDER_ORGANIZATION.EDIT, dto);
  } catch (error) {
    console.error("Failed to edit organization:", error);
    throw error;
  }
};

export const getAllFacilities = async (): Promise<FacilityDto[]> => {
  try {
    const result = await apiClient.get<FacilityDto[]>(API_URLS.FACILITY.GET_ALL);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch facilities:", error);
    throw error;
  }
};

export const getUsersForOrganization = async (organizationId: number): Promise<number[]> => {
  try {
    const result = await apiClient.get<number[]>(
      `${API_URLS.PROVIDER_ORGANIZATION.GET_USERS_FOR_ORG}?organizationId=${organizationId}`
    );
    const list = Array.isArray(result) ? result : [];
    return [...new Set(list)];
  } catch (error) {
    console.error("Failed to fetch users for organization:", error);
    throw error;
  }
};


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const makeHours = (): DayHours[] =>
  DAYS.map((day, i) => ({
    day,
    isOpen: i === 1 ? true : undefined,
    openTime: i === 1 ? "0:00 AM" : undefined,
    closeTime: i === 1 ? "0:00 AM" : undefined,
  }));

let MOCK_ORGS: Organization[] = [
  {
    id: "1",
    name: "Labcorp",
    emailAddress: "xxxx@acme.com",
    phoneNumber: "(407)548-8465",
    altPhoneNumber: "(000)000-0000",
    faxNumber: "9999999",
    taxIdNumber: "XXXXXXXXX",
    npiNumber: "XXXXXXXXX",
    address1: "XXXXXXXXX",
    address2: "XXXXXXXXX",
    city: "Lorem Ipsum",
    county: "Lorem Ipsum",
    state: "Lorem Ipsum",
    zip: "Lorem Ipsum",
    isInfinite: false,
    isPayable: false,
    cmsRatePercent: "XXXXXXXXX",
    contractStatus: "Active",
    serviceFacility: 0,
    status: "Active",
    facilities: [
      {
        id: "f1",
        practiceName: "John Holland, MD Office",
        address: "2086 Addison Ave E",
        city: "Twin Falls",
        state: "ID",
        zip: "83301",
        facilityStatus: "Inactive",
        smartEnabled: false,
        npiNumber: "NPI Number",
        primaryPhone: "2098905069",
        altPhone: "2098905069",
        faxNumber: "00000000000",
        email: "johndoe@gmail.com",
        organization: "Homayon Iraninezhad, DO PC",
        calendarAdministrator: "Mendelson, Daniel, Sai, Aishwarya",
        specialAccommodation: "Lorem Ipsum",
        address2: "Lorem Ipsum",
        county: "Lorem Ipsum",
        facilityIdentifier: "",
        externalFacilityId: "",
        facilityCluster: "",
        hoursOfOperation: makeHours(),
      },
    ],
    staff: [
      {
        id: "s1",
        name: "adams, danial",
        userName: "daniadams",
        securityUserId: "s1",
        emailAddress: "daniadams@deloitte.com",
        roles: [
          "Admin", "Billing Manager", "Billing Staff", "DiagnosticAdministrator", "DPM",
          "ExamLiaisons", "Final Case Reviewer", "FinalCaseReviewerAddClin", "FPMO PM",
          "IMO", "Lead Examiner", "MileageReports", "Provider", "ProviderHelpDesk",
          "ProviderManagementAdmin", "ProviderManagementUser", "ProviderSupportStaff",
          "QA DIRECTOR", "SystemAdministrator",
        ],
        npi: "222222222",
        status: "Active",
        isActive: true,
      },
      {
        id: "s2",
        name: "smith, jane",
        userName: "jsmith",
        securityUserId: "s2",
        emailAddress: "jsmith@example.com",
        roles: ["Provider"],
        npi: "333333333",
        status: "Inactive",
        isActive: false,
      },
    ],
  },
];

export const searchOrganizations = async (query: string): Promise<Organization[]> => {
  const q = query.toLowerCase();
  return MOCK_ORGS.filter(
    (o) =>
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.npiNumber.toLowerCase().includes(q)
  );
};

export const getOrganization = async (id: string): Promise<Organization | null> =>
  MOCK_ORGS.find((o) => o.id === id) ?? null;

export const createOrganization = async (
  data: Omit<Organization, "id" | "facilities" | "staff" | "serviceFacility" | "status">
): Promise<Organization> => {
  const org: Organization = {
    ...data,
    id: String(Date.now()),
    serviceFacility: 0,
    status: "Active",
    facilities: [],
    staff: [],
  };
  MOCK_ORGS = [...MOCK_ORGS, org];
  return org;
};

export const updateOrganization = async (
  id: string,
  data: Partial<Organization>
): Promise<Organization> => {
  MOCK_ORGS = MOCK_ORGS.map((o) => (o.id === id ? { ...o, ...data } : o));
  return MOCK_ORGS.find((o) => o.id === id)!;
};

export const getFacility = async (orgId: string, facilityId: string): Promise<OrgFacility | null> => {
  const org = MOCK_ORGS.find((o) => o.id === orgId);
  return org?.facilities.find((f) => f.id === facilityId) ?? null;
};

/**
 * Fetches organization contract statuses from lookup API, excluding internal "Intermediate" status per AC & legacy.
 */
export const getOrganizationContractStatuses = async (): Promise<CredentialStatusLookupValue[]> => {
  const statuses = await getCredentialStatus();
  return (statuses || []).filter(
    (status) => status.Name.toLowerCase() !== "intermediate"
  );
};

