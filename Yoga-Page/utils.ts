/* eslint-disable @typescript-eslint/no-explicit-any */
type Training = {
    ProviderTrainingExipryDate: string | null;
    ProviderTrainingCertifiedDate: string | null;
    [key: string]: any;
};

function formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null; // invalid date
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function formatTrainingDates(data: Training[]): Training[] {
    return data.map((item) => ({
        Id: item?.Id,
        ProviderTrainingExipryDate: formatDate(item.ProviderTrainingExipryDate),
        ProviderTrainingCertifiedDate: formatDate(item.ProviderTrainingCertifiedDate),
    }));
}



type LicenceInput = {
    id?: string;
    StateId?: string | number | null;
    UserLicenceNumber: string;
    UserLicenceExpiryDate: string;
    UserLicenceStatus: string;
    state?: string;
    UserLicenceType: string;
    IsLicencePortable: boolean;
    [k: string]: any;
  };

type LicenceOutput = {
    UserNPINumber: string;
    UserLicenceNumber: string;
    UserLicenceExpiryDate: string;
    StateId: number | null;
    UserLicenceStatus: string;
    UserLicenceType: string;
    IsLicencePortable: boolean;
};

type StateItem = {
    StateNumber?: number | null; // small numeric id used in your licence objects
    CTRNumber?: string;
    Loc?: string;
    StateName: string;
    StateAbbreviation?: string;
    CommonwealthTerritoryMilitaryState?: string;
    OFOArea?: string;
    DefaultColor?: string;
    FIPSCode?: string;
    ShowState?: string;
    Latitude?: number | null;
    Longitude?: number | null;
    Id?: number | null; // fallback id if StateNumber not present
    [k: string]: any;
};

/**
 * Transform License records: attach UserNPINumber, remove unwanted keys,
 * and optionally resolve StateId from the `state` string using the provided states list.
 *
 * @param Licenses - raw License rows
 * @param userNPINumber - NPI number to attach to each output row
 * @param states - optional list of state objects to resolve StateId from state string
 */
export function transformLicenses(
    licences: LicenceInput[],
    userNPINumber: string,
    states?: StateItem[]
): LicenceOutput[] {
    const normalize = (s?: string) =>
        (s || "").toString().toLowerCase().trim();

    const findStateId = (stateStr?: string): number | null => {
        if (!states || !stateStr) return null;
        const needle = normalize(stateStr);

        const matched = states.find((st) => {
            const name = normalize(st.StateName);
            const abbr = normalize(st.StateAbbreviation);
            // exact matches first, then partial/inclusion matches for robustness
            if (!name) return false;
            if (name === needle) return true;
            if (abbr && abbr === needle) return true;
            if (name.includes(needle)) return true;
            if (needle.includes(name)) return true;
            if (abbr && needle.includes(abbr)) return true;
            return false;
        });

        if (!matched) return null;
        // prefer Id, fallback to StateNumber
        return (matched.Id ?? matched.StateNumber) ?? null;
    };

    return licences.map((licence) => {
        // If there is already a valid StateId (>0), keep it
        const existingStateId =
            licence.StateId && !isNaN(Number(licence.StateId))
                ? Number(licence.StateId)
                : null;

        // try to resolve from state string only if we don't already have a valid StateId
        const resolvedStateId =
            existingStateId ?? findStateId(licence.state) ?? null;

        return {
            UserNPINumber: userNPINumber,
            UserLicenceNumber: licence.UserLicenceNumber,
            UserLicenceExpiryDate: licence.UserLicenceExpiryDate,
            StateId: resolvedStateId,
            UserLicenceStatus: licence.UserLicenceStatus,
            UserLicenceType: licence.UserLicenceType,
            IsLicencePortable: licence.IsLicencePortable,
        };
    });
}

/**
 * Converts date strings (MM/DD/YYYY or YYYY-MM-DD) to ISO-8601 strings.
 * Returns null for empty or invalid dates to ensure correct handling of nullable date properties.
 */
export const toIsoOrNull = (value: unknown): string | null => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const mm = Number(slash[1]);
        const dd = Number(slash[2]);
        const yyyy = Number(slash[3]);
        const date = new Date(Date.UTC(yyyy, mm - 1, dd));
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    const dash = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (dash) {
        const yyyy = Number(dash[1]);
        const mm = Number(dash[2]);
        const dd = Number(dash[3]);
        const date = new Date(Date.UTC(yyyy, mm - 1, dd));
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    const date = new Date(s);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Normalizes input arrays of items or objects into an array of positive numbers.
 * Ensures list fields always return an array of numbers to prevent null reference issues.
 */
export const toNumberArray = (items: any): number[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => Number(item?.Id ?? item?.FacilityId ?? item?.SchedulingTypeId ?? item?.code ?? item?.value ?? item))
        .filter((num) => Number.isFinite(num) && num > 0);
};

/**
 * Sanitizes provider licenses:
 * - Resolves valid StateId using the states reference list.
 * - Defaults UserLicenceStatus to "Active".
 * - Converts expiration dates to ISO-8601 strings.
 * - Filters out empty rows that lack a license number or valid state ID.
 */
export const sanitizeLicenses = (
    licences: any[] = [],
    defaultNpi: string = "",
    allStates: Array<{ Id?: number; StateNumber?: number; StateAbbreviation?: string; StateName?: string }> = []
) => {
    if (!Array.isArray(licences)) return [];

    const resolveStateId = (lic: any): number => {
        const directId = Number(lic?.StateId);
        if (Number.isFinite(directId) && directId > 0) return directId;

        const stateVal = lic?.state ?? lic?.State ?? lic?.StateAbbreviation;
        if (!stateVal || !allStates || allStates.length === 0) return 0;

        const s = String(stateVal).trim().toLowerCase();
        const matched = allStates.find((st) => {
            const idMatch = st.Id != null && String(st.Id) === s;
            const numMatch = st.StateNumber != null && String(st.StateNumber) === s;
            const abbrMatch = st.StateAbbreviation && st.StateAbbreviation.trim().toLowerCase() === s;
            const nameMatch = st.StateName && st.StateName.trim().toLowerCase() === s;
            return idMatch || numMatch || abbrMatch || nameMatch;
        });

        return matched?.Id != null ? Number(matched.Id) : (matched?.StateNumber != null ? Number(matched.StateNumber) : 0);
    };

    return licences
        .map((l: any) => {
            const stateId = resolveStateId(l);
            const licNum = String(l?.UserLicenceNumber ?? "").trim();
            const status = String(l?.UserLicenceStatus ?? "Active").trim() || "Active";
            return {
                UserNPINumber: String(l?.UserNPINumber || defaultNpi || "").trim(),
                UserLicenceNumber: licNum,
                UserLicenceExpiryDate: toIsoOrNull(l?.UserLicenceExpiryDate),
                StateId: stateId,
                UserLicenceStatus: status,
                UserLicenceType: String(l?.UserLicenceType ?? "").trim(),
                IsLicencePortable: Boolean(l?.IsLicencePortable),
            };
        })
        .filter((l) => l.UserLicenceNumber.length > 0 && l.StateId > 0);
};

/**
 * Extracts a string filename from string, array, or file object representations.
 */
const extractFileName = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length > 0) {
        return extractFileName(val[0]);
    }
    if (typeof val === "object") {
        if (val.file?.name) return String(val.file.name);
        if (val.name) return String(val.name);
        if (val.Path) return String(val.Path);
    }
    return "";
};

/**
 * Sanitizes education details:
 * - Filters out empty rows that lack DegreeType or MedicalSchool.
 * - Formats dates to ISO-8601 strings and extracts file names.
 */
export const sanitizeEducation = (educationList: any[] = []) => {
    if (!Array.isArray(educationList)) return [];
    return educationList
        .filter((e: any) => e && (Boolean(e?.DegreeType?.trim()) || Boolean(e?.MedicalSchool?.trim())))
        .map((e: any) => ({
            DegreeType: String(e?.DegreeType ?? "").trim(),
            MedicalSchool: String(e?.MedicalSchool ?? "").trim(),
            DegreeReceivedDate: toIsoOrNull(e?.DegreeReceivedDate),
            DegreeFile: extractFileName(e?.DegreeFile),
            DegreeVerifiedDate: toIsoOrNull(e?.DegreeVerifiedDate),
            DegreeVerificationFile: extractFileName(e?.DegreeVerificationFile),
            IsAPAAccredited: Boolean(e?.IsAPAAccredited),
            IsASHACertified: Boolean(e?.IsASHACertified),
            IsNLNACAccredited: Boolean(e?.IsNLNACAccredited),
            IsCCNEAccredited: Boolean(e?.IsCCNEAccredited),
            IsNCCPACertified: Boolean(e?.IsNCCPACertified),
        }));
};

/**
 * Sanitizes board certifications:
 * - Filters out empty rows that lack UserBoard.
 * - Formats dates to ISO-8601 strings.
 */
export const sanitizeBoardCertification = (boardList: any[] = []) => {
    if (!Array.isArray(boardList)) return [];
    return boardList
        .filter((b: any) => b && Boolean(b?.UserBoard?.trim()))
        .map((b: any) => ({
            UserBoard: String(b?.UserBoard ?? "").trim(),
            UserBoardCertifiedDate: toIsoOrNull(b?.UserBoardCertifiedDate),
            UserBoardExpirationDate: toIsoOrNull(b?.UserBoardExpirationDate),
            IsAPAAccredited: Boolean(b?.IsAPAAccredited),
            IsASHACertified: Boolean(b?.IsASHACertified),
            IsNLNACAccredited: Boolean(b?.IsNLNACAccredited),
            IsCCNEAccredited: Boolean(b?.IsCCNEAccredited),
            IsNCCPACertified: Boolean(b?.IsNCCPACertified),
        }));
};

export const sanitizeCptCodeRanges = (ranges: any[] = []) => {
    if (!Array.isArray(ranges)) return [];
    return ranges.map((r: any) => ({
        CPTCodeRangeFrom: Number(r?.CPTCodeRangeFrom ?? 0),
        CPTCodeRangeTo: Number(r?.CPTCodeRangeTo ?? 0),
        RangeDesc: String(r?.RangeDesc ?? "").trim(),
        MappingFacilityId: r?.MappingFacilityId ? Number(r?.MappingFacilityId) : null,
        MappingFacilityName: String(r?.MappingFacilityName ?? "").trim(),
    }));
};

export const sanitizeSupplementalMapping = (mappingList: any[] = [], userId: number = 0, credentialingStatus: string = "") => {
    const isStatusActive = String(credentialingStatus ?? "").toLowerCase() === "active";
    if (!Array.isArray(mappingList)) return [];
    return mappingList
        .map((m: any) => {
            const dbqId = Number(m?.DbqMasterId ?? m?.code ?? m?.Id ?? m?.value ?? (typeof m === "number" ? m : 0));
            if (!dbqId || isNaN(dbqId)) return null;
            return {
                UserId: Number(m?.UserId || userId || 0),
                DbqMasterId: dbqId,
                IsActive: typeof m?.IsActive === "boolean" ? m.IsActive : (typeof m?.isActive === "boolean" ? m.isActive : isStatusActive),
            };
        })
        .filter((item): item is { UserId: number; DbqMasterId: number; IsActive: boolean } => item !== null);
};

/**
 * Sanitizes course records:
 * - Ensures valid course IDs.
 * - Only includes expiry date when certified date is present.
 */
export const sanitizeCourses = (courses: any[] = []) => {
    if (!Array.isArray(courses)) return [];
    return courses
        .filter((c: any) => c && Number(c?.Id ?? 0) > 0)
        .map((c: any) => {
            const certDate = toIsoOrNull(c?.ProviderTrainingCertifiedDate);
            const expiryDate = certDate ? toIsoOrNull(c?.ProviderTrainingExipryDate) : null;
            return {
                Id: Number(c?.Id ?? 0),
                Lookup_Name: c?.Lookup_Name ?? null,
                TrainingName: String(c?.TrainingName ?? "").trim(),
                DocumentName: c?.DocumentName ?? null,
                ProviderTrainingCertifiedDate: certDate,
                ProviderTrainingExipryDate: expiryDate,
                ExpiryInDays: Number(c?.ExpiryInDays ?? 0),
                ExpiryInMonths: Number(c?.ExpiryInMonths ?? 0),
                ExpiryInYears: Number(c?.ExpiryInYears ?? 0),
                TrainingType: Number(c?.TrainingType ?? 0),
                RecertificationId: c?.RecertificationId ? Number(c.RecertificationId) : null,
            };
        });
};

/**
 * Maps form data to the provider creation API payload.
 * Sanitizes nested arrays, dates, specialties, and numeric identifiers.
 */
export const mapToApiPayload = (data: any, allStates: any[] = []) => {
    const npi = String(data?.NpiNumber || data?.UserNPINumber || "").trim();
    const userId = Number(data?.UserId || data?.Id || data?.id) || 0;
    const credStatus = String(data?.CredentialingStatus || "").trim() || "Active";

    const roles = (Array.isArray(data?.Role) && data.Role.length > 0)
        ? data.Role
        : (data?.Roles?.filter((r: { IsSelected: any; }) => r.IsSelected).map((r: { Name: any; }) => r.Name) || []);

    const specialities = (data?.Specialities || []).filter(
        (s: any) => s && Number(s.Id ?? 0) > 0 && Boolean(s.SpecialityDescription?.trim())
    ).map((s: any) => ({
        Id: Number(s.Id),
        SpecialityCode: String(s.SpecialityCode || s.SpecialityDescription || "").slice(0, 15).trim(),
        SpecialityDescription: String(s.SpecialityDescription).trim(),
    }));

    const specialityIds = specialities.map((s: { Id: number }) => s.Id).filter((id: number) => id > 0);

    return {
        UserId: userId,
        OrganizationId: Number(data?.OrganizationId) || null,
        FirstName: String(data?.FirstName || ""),
        LastName: String(data?.LastName || ""),
        PrintName: String(data?.PrintName || ""),
        Gender: String(data?.Gender || ""),
        EmailAddress: String(data?.EmailAddress || data?.Email || ""),
        PhoneNumber: String(data?.PhoneNumber || "").replace(/\D/g, ""),
        NpiNumber: npi,
        ProfessionalTitle: String(data?.ProfessionalTitle || ""),
        FacilityId: toNumberArray(data?.FacilityId),
        FacilityIdOther: toNumberArray(data?.FacilityIdOther),
        FacilityIdApprover: toNumberArray(data?.FacilityIdApprover),
        ApproverOrganizationList: toNumberArray(data?.ApproverOrganizationList),
        Affiliation: Number(data?.Affiliation?.AffiliationTypeId ?? data?.Affiliation ?? 0),
        Role: roles,
        Speciality: specialityIds.length > 0 ? specialityIds : toNumberArray(data?.Speciality),
        Specialities: specialities,
        DoB: toIsoOrNull(data?.DoB),
        MedicalExperienceStartDate: toIsoOrNull(data?.MedicalExperienceStartDate),
        MDEExperienceStartDate: toIsoOrNull(data?.MDEExperienceStartDate),
        UserSignedDate: toIsoOrNull(data?.UserSignedDate),
        CredentialingStatus: credStatus,
        UserSpecialConsiderations: String(data?.UserSpecialConsiderations || ""),
        DisableAlerts: !!data?.DisableAlerts,
        ResidencyStatus: !!data?.ResidencyStatus,
        VendorId: String(data?.VendorId || ""),
        VBATrainId: String(data?.VBATrainId || ""),
        IsCLCW_SME: !!data?.IsCLCW_SME,
        Is1151_SME: !!data?.Is1151_SME,
        HoursPerWeek: Number(data?.HoursPerWeek) || 0,
        SchedulingType: toNumberArray(data?.SchedulingType),
        UserSupplementalMapping: sanitizeSupplementalMapping(data?.UserSupplementalMapping, userId, credStatus),

        // arrays (safe defaults)
        UserLicences: sanitizeLicenses(data?.UserLicences, npi, allStates),
        UserEducation: sanitizeEducation(data?.UserEducation),
        UserBoardCertification: sanitizeBoardCertification(data?.UserBoardCertification),
        UserCertificationDetails: [],
        RequiredCertificationCourses: sanitizeCourses(data?.RequiredCertificationCourses),
        RecertificationCourses: sanitizeCourses(data?.RecertificationCourses),
        SpecialtyCourses: sanitizeCourses(data?.SpecialtyCourses),
        CPTCodeList: Array.isArray(data?.CPTCodeList) ? data.CPTCodeList.map(String) : [],
        CPTCodeRangeList: sanitizeCptCodeRanges(data?.CPTCodeRangeList),

        MalPracticeCarrier: String(data?.MalPracticeCarrier || data?.Malpractice || "Default"),
        MalPracticeExpiryDate: toIsoOrNull(data?.MalPracticeExpiryDate || data?.ExpiryDate),
    };
};

export const mapToEditApiPayload = (data: any, allStates: any[] = []) => {
    const npi = String(data?.NpiNumber || data?.UserNPINumber || "").trim();
    const userId = Number(data?.UserId || data?.Id || data?.id) || 0;
    const credStatus = String(data?.CredentialingStatus || "").trim() || "Active";

    const roles = Array.isArray(data?.Role) && data.Role.length > 0
        ? data.Role
        : (data?.Roles?.filter((r: any) => r.IsSelected).map((r: any) => r.Name) || []);

    const specialities = (data?.Specialities || []).filter(
        (s: any) => s && Number(s.Id ?? 0) > 0 && Boolean(s.SpecialityDescription?.trim())
    ).map((s: any) => ({
        Id: Number(s.Id),
        SpecialityCode: String(s.SpecialityCode || s.SpecialityDescription || "").slice(0, 15).trim(),
        SpecialityDescription: String(s.SpecialityDescription).trim(),
    }));

    const specialityIds = specialities.map((s: { Id: number }) => s.Id).filter((id: number) => id > 0);

    return {
        Id: String(data?.Id || ""),
        UserId: userId,

        // Basic
        FirstName: String(data?.FirstName || ""),
        LastName: String(data?.LastName || ""),
        PrintName: String(data?.PrintName || ""),
        Gender: String(data?.Gender || ""),
        EmailAddress: String(data?.EmailAddress || data?.Email || ""),
        PhoneNumber: String(data?.PhoneNumber || "").replace(/\D/g, ""),
        NpiNumber: npi,
        ProfessionalTitle: String(data?.ProfessionalTitle || ""),
        DoB: toIsoOrNull(data?.DoB),
        VendorId: String(data?.VendorId || ""),
        VBATrainId: String(data?.VBATrainId || ""),
        ResidencyStatus: !!data?.ResidencyStatus,

        // Org / Facility
        OrganizationId: Number(data?.OrganizationId) || null,
        FacilityId: toNumberArray(data?.FacilityId),
        FacilityIdOther: toNumberArray(data?.FacilityIdOther),
        FacilityIdApprover: toNumberArray(data?.FacilityIdApprover),
        FacilityNPINumber: String(data?.FacilityNPINumber || ""),
        FacilityExternalId: String(data?.FacilityExternalId || ""),
        Affiliation: Number(data?.Affiliation?.AffiliationTypeId ?? data?.Affiliation ?? 0),
        ApproverOrganizationList: toNumberArray(data?.ApproverOrganizationList),

        // Roles
        Role: roles,

        // Specialities
        Speciality: specialityIds.length > 0 ? specialityIds : toNumberArray(data?.Speciality),
        Specialities: specialities,
        SpecialityDescription: String(data?.SpecialityDescription || ""),

        // Licensing
        UserLicences: sanitizeLicenses(data?.UserLicences, npi, allStates),

        // Certification / Courses
        UserCertificationDetails: [],
        RequiredCertificationCourses: sanitizeCourses(data?.RequiredCertificationCourses),
        RecertificationCourses: sanitizeCourses(data?.RecertificationCourses),
        SpecialtyCourses: sanitizeCourses(data?.SpecialtyCourses),

        // Codes
        CPTCodeList: Array.isArray(data?.CPTCodeList) ? data.CPTCodeList.map(String) : [],
        CPTCodeRangeList: sanitizeCptCodeRanges(data?.CPTCodeRangeList),

        // Flags
        IsCLCW_SME: !!data?.IsCLCW_SME,
        Is1151_SME: !!data?.Is1151_SME,
        DisableAlerts: !!data?.DisableAlerts,

        // Status
        CredentialingStatus: credStatus,
        UserSignedDate: toIsoOrNull(data?.UserSignedDate),
        UserSpecialConsiderations: String(data?.UserSpecialConsiderations || ""),

        // Experience
        MedicalExperienceStartDate: toIsoOrNull(data?.MedicalExperienceStartDate),
        MDEExperienceStartDate: toIsoOrNull(data?.MDEExperienceStartDate),

        // Education
        UserEducation: sanitizeEducation(data?.UserEducation),

        // Board Certification
        UserBoardCertification: sanitizeBoardCertification(data?.UserBoardCertification),

        // Misc
        LanguagesSpoken: Array.isArray(data?.LanguagesSpoken) ? data.LanguagesSpoken : [],
        StateId: Number(data?.StateId) || null,
        HoursPerWeek: Number(data?.HoursPerWeek) || 0,
        SchedulingType: toNumberArray(data?.SchedulingType),

        // Audit
        CreatedDate: toIsoOrNull(data?.CreatedDate),
        CreatedBy: Number(data?.CreatedBy) || 0,

        // Malpractice
        MalPracticeCarrier: String(data?.MalPracticeCarrier || data?.Malpractice || "Default"),
        MalPracticeExpiryDate: toIsoOrNull(data?.MalPracticeExpiryDate || data?.ExpiryDate),

        // Supplemental Mapping
        UserSupplementalMapping: sanitizeSupplementalMapping(data?.UserSupplementalMapping, userId, credStatus),
    };
};

export const mapToAddUserApiPayload = (data: any) => {
  const roles = Array.isArray(data?.Roles) ? data.Roles : [];
  const selectedRoleNames = Array.isArray(data?.Role) && data.Role.length > 0
    ? data.Role
    : roles.filter((r: any) => r?.IsSelected).map((r: any) => r?.Name);

  return {
    FirstName: String(data?.FirstName ?? "").trim(),
    LastName: String(data?.LastName ?? "").trim(),
    Email: String(data?.EmailAddress ?? data?.Email ?? "").trim(),
    PrintName: String(data?.PrintName ?? "").trim() || [data?.FirstName, data?.LastName].filter(Boolean).join(" "),
    PhoneNumber: String(data?.PhoneNumber ?? "").replace(/\D/g, ""),
    Gender: String(data?.Gender ?? ""),
    AddressLine1: String(data?.AddressLine1 ?? "").trim() || "New York",
    AddressLine2: String(data?.AddressLine2 ?? ""),
    City: String(data?.City ?? ""),
    State: String(data?.State ?? ""),
    Zip: String(data?.Zip ?? ""),
    UserName: String(data?.UserName ?? "").trim(),
    VendorId: String(data?.VendorId ?? ""),
    VBATrainId: String(data?.VBATrainId ?? ""),
    ResidencyStatus: !!data?.ResidencyStatus,
    UserTypeId: Number(data?.UserTypeId || 1),
    SkillLevel: typeof data?.SkillLevel === "object" && data?.SkillLevel !== null
      ? Number(data?.SkillLevel?.LookupValueId ?? 0)
      : Number(data?.SkillLevel ?? 0),
    TenantId: Number(data?.TenantId || 1),
    IsEnabled: true,
    Roles: roles,
    Role: selectedRoleNames,
  };
};

