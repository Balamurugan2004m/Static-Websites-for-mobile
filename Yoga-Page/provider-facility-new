/* eslint-disable @typescript-eslint/no-explicit-any */
export const leftColumnFields = [
    { label: "Practice Name", required: true, field: "FacilityPracticeName", type: "text" },
    { label: "NPI Number", field: "FacilityNPINumber", type: "number" },
    { label: "Primary Phone", field: "FacilityPrimaryPhone", type: "number", required: true, },
    { label: "Alternate Phone", field: "FacilityAlternatePhone", type: "number" },
    { label: "Fax Number", field: "FacilityFaxNumber", type: "number", required: true, },
    { label: "Email", field: "FacilityEmailId", type: "email", required: true, },
    { label: "Organization", field: "OrganizationId", type: "select", required: true },
    { label: "Calendar Administrator", field: "CalendarAdmin", type: "multiSelect", required: false },
    { label: "Special Accommodation", field: "FacilityAccommodationLookupValueMappings", type: "multiSelect", required: false },
   ];

   export const leftEditColumnFields = [
    { label: "Practice Name", required: true, field: "FacilityPracticeName", type: "text" },
    { label: "NPI Number", field: "FacilityNPINumber", type: "number", disabled: true },
    { label: "Primary Phone", field: "FacilityPrimaryPhone", type: "number", required: true, },
    { label: "Alternate Phone", field: "FacilityAlternatePhone", type: "number" },
    { label: "Fax Number", field: "FacilityFaxNumber", type: "number", required: true, },
    { label: "Email", field: "FacilityEmailId", type: "email", required: true, },
    { label: "Organization", field: "OrganizationId", type: "select", required: true },
    { label: "Calendar Administrator", field: "CalendarAdmin", type: "multiSelect", required: false },
    { label: "Special Accommodation", field: "FacilityAccomodationLookupValueMappings", type: "multiSelect", required: false },
   ];
   
   
  export const rightColumnSelectFields = [
    { label: "Address 1", field: "FacilityAddress1", type: "text", required: true },
    { label: "Address 2", field: "FacilityAddress2", type: "text" },
    { label: "City", field: "FacilityCity", type: "text", required: true },
    { label: "County", field: "FacilityCounty", type: "text", required: true},
    { label: "State", field: "FacilityState", type: "select", required: true },
    { label: "Zip", field: "FacilityZip", type: "text", required: true },
    { label: "Facility Identifier", field: "FacilityIdentifier", type: "select" },
    { label: "External Facility ID", field: "ExternalId", type: "text" },
    { label: "Facility Cluster", field: "FacilityClusterId", type: "select", required: true },
  ];

  export const rightEditColumnSelectFields = [
    { label: "Address 1", field: "FacilityAddress1", type: "text", disabled: true, required: true },
    { label: "Address 2", field: "FacilityAddress2", disabled: true, type: "text" },
    { label: "City", field: "FacilityCity", type: "text", disabled: true, required: true },
    { label: "County", field: "FacilityCounty", type: "text", disabled: true, required: true},
    { label: "State", field: "FacilityState", type: "select", disabled: true, required: true},
    { label: "Zip", field: "FacilityZip", type: "text", disabled: true },
    { label: "Facility Identifier", field: "FacilityIdentifier", type: "select" },
    { label: "External Facility ID", field: "ExternalId", type: "text" },
    { label: "Facility Cluster", field: "FacilityClusterId", type: "select", required: true },
  ];

  export const generalInformationFields = [
    { label: "Does your office have internet connectivity?", field: "HasInternetConnectivity", type: "radio", options: ['Yes', 'No'], required: true },
    { label: "Does your office complete exam documents electronically?", field: "IsElectronicSubmission", type: "radio", options: ['Yes', 'No'], required: true },
    { label: "Threshold Time(in minutes)", field: "FacilityAppointmentThresholdTime", type: "number", required: true },
    { label: "Time Zone", field: "TimeZone", type: "select", required: true },
    { label: "Contract Status", field: "FacilityCredentialingStatus", type: "select", options: ['Active', 'InActive'], required: true },
  ];

  export const facilityContactLeft = [
    { label: "First Name", field: "FacilityContactPersonFirstName", type: "text" },
    { label: "Last Name", field: "FacilityContactPersonLastName", type: "text" },
  ]

  export const facilityContactRight = [
    { label: "Phone Number", field: "FacilityContactPersonPhoneNumber", type: "text" },
    { label: "Email", field: "ContactEmailAddress", type: "text" },
  ]

  export const cptCodeFields = [
    { label: "", field: "CPTCodeList", type: "multiSelect" },
  ]

  export const facilityRemarks = [
    { label: "", field: "FacilityRemarks", type: "textarea" },
  ]

  export const smartQueue = [
    { label: "Enable Smart Facility Option", field: "SmartFacility", type: "select", required: true, options: ['Yes', 'No'] },
    { label: "Threshold Hours per day", field: "ThresholdPerDay", type: "number", min: 0, required: true },
    { label: "Enable AutoScheduling for ACE", field: "IsAutoScheduleAce", type: "select", required: true, options: ['Yes', 'No'] },
    { label: "Enable AutoScheduling for Telehealth", field: "IsAutoScheduleTelehealth", type: "select", required: false, options: ['Yes', 'No'] },
    { label: "Enable AutoScheduling for in Person", field: "IsAutoScheduleInPerson", type: "select", required: false, options: ['Yes', 'No'] },
  ];

  export const timeZoneOptions = [
    { keyValue: "AST", keyValueId: "AST" },
    { keyValue: "EST", keyValueId: "EST" },
    { keyValue: "CST", keyValueId: "CST" },
    { keyValue: "MST", keyValueId: "MST" },
    { keyValue: "MT (Arizona)", keyValueId: "MT" },
    { keyValue: "PST", keyValueId: "PST" },
    { keyValue: "AKST", keyValueId: "AKST" },
    { keyValue: "HST", keyValueId: "HST" },
    { keyValue: "SST", keyValueId: "SST" },
    { keyValue: "CHST", keyValueId: "CHST" },
  ];
  
  export function buildFacilityPayload(form: any = {}) {
    return {
      ExternalId: form.ExternalId ?? "",
      FacilityPracticeName: form.FacilityPracticeName ?? "",
      FacilityNPINumber: form.FacilityNPINumber ?? "",
      FacilityPrimaryPhone: form.FacilityPrimaryPhone ?? "",
      FacilityAlternatePhone: form.FacilityAlternatePhone ?? "",
      FacilityEmailId: form.FacilityEmailId ?? "",
      FacilityAddress1: form.FacilityAddress1 ?? "",
      FacilityAddress2: form.FacilityAddress2 ?? "",
      FacilityCity: form.FacilityCity ?? "",
      FacilityCounty: form.FacilityCounty ?? "",
      FacilityState: form.FacilityState ?? "",
      FacilityClusterId: form.FacilityClusterId ?? 0,
      FacilityZip: form.FacilityZip ?? "",

      CPTCodeList: form.CPTCodeList.map((item: any) => String(item.code)),
      FacilityAccommodationLookupValueMappings: form.FacilityAccommodationLookupValueMappings.map((item: any) => item.Name),
      FacilityIdentifier: form.FacilityIdentifier ? String(form.FacilityIdentifier) : "",
      
      HasInternetConnectivity: form?.HasInternetConnectivity === 'Yes' ? true : false,
      IsElectronicSubmission: form?.IsElectronicSubmission === 'Yes' ? true : false,
      // CalendarAdmin: form?.CalendarAdmin ?? [],
       CalendarAdmin: normalizeToStringArray(
      form.CalendarAdmin
    ),
  
      FacilityContactPersonFirstName: form.FacilityContactPersonFirstName ?? "",
      FacilityContactPersonLastName: form.FacilityContactPersonLastName ?? "",
      FacilityContactPersonPhoneNumber: form.FacilityContactPersonPhoneNumber ?? "",
      ContactEmailAddress: form.ContactEmailAddress ?? "",
      OrganizationId: Number(form.OrganizationId ?? 0),
      FacilityCredentialingStatus: form.FacilityCredentialingStatus ?? "",
      FacilityFaxNumber: form.FacilityFaxNumber ?? "",
      TimeZone: form.TimeZone ?? "",
      FacilityAppointmentThresholdTime: form.FacilityAppointmentThresholdTime ?? "",
      FacilityContactPerson: form.FacilityContactPerson ?? "",
      FacilityRemarks: form.FacilityRemarks ?? ""
    };
  }

  export function normalizeToStringArray(list: any[]): string[] {
    if (!Array.isArray(list)) return [];
  
    return list.map((item: any) => {
      if (typeof item === "string") return item;
      if (typeof item?.code !== "undefined") return String(item.code);
      if (item?.label) return item.label;
      return String(item);
    });
  }
  
  export function buildFacilityDetailsPayload(form: any = {}) {
    return {
      FacilityNPINumber: form.FacilityNPINumber ?? "",
      ExternalId: form.ExternalId ?? "",
      Id: form.Id ?? 0,
      FacilityPracticeName: form.FacilityPracticeName ?? "",
      FacilityCounty: form.FacilityCounty ?? "",
      FacilityAddress1: form.FacilityAddress1 ?? "",
      FacilityAddress2: form.FacilityAddress2 ?? "",
      FacilityCity: form.FacilityCity ?? "",
      FacilityState: form.FacilityState ?? "",
      FacilityZip: form.FacilityZip ?? "",
      FacilityPrimaryPhone: form.FacilityPrimaryPhone ?? "",
      FacilityAlternatePhone: form.FacilityAlternatePhone ?? "",
      FacilityEmailId: form.FacilityEmailId ?? "",
      FacilityFaxNumber: form.FacilityFaxNumber ?? "",
  
      IsDisabledAccessible: form.IsDisabledAccessible ?? false,
      IsServiceAnimalFriendly: form.IsServiceAnimalFriendly ?? false,
      IsPreferred: form.IsPreferred ?? false,
      IsInfinite: form.IsInfinite ?? false,
  
      FacilityOfficeAdminSignature: form.FacilityOfficeAdminSignature ?? "",
      FacilityOfficeAdminPrintName: form.FacilityOfficeAdminPrintName ?? "",
      FacilityContactPerson: form.FacilityContactPerson ?? "",
      FacilityContactPersonFirstName: form.FacilityContactPersonFirstName ?? "",
      FacilityContactPersonLastName: form.FacilityContactPersonLastName ?? "",
      SignedDate: form.SignedDate ?? "",
  
      OrganizationId: Number(form.OrganizationId ?? 0),
      StateId: Number(form.StateId ?? 0),
      FacilityContactPersonPhoneNumber: form.FacilityContactPersonPhoneNumber ?? "",
  
      FacilityAppointmentThresholdTime: form.FacilityAppointmentThresholdTime ?? "",
      TimeZone: form.TimeZone ?? "",
  
      ContactUserId: Number(form.ContactUserId ?? 0),
      HasInternetConnectivity: form?.HasInternetConnectivity === 'Yes' ? true : false,
      IsElectronicSubmission: form?.IsElectronicSubmission === 'Yes' ? true : false,
      ContactEmailAddress: form.ContactEmailAddress ?? "",
  
      DaysOfWeek: Array.isArray(form.DaysOfWeek)
        ? form.DaysOfWeek.map((d: any) => ({
            DayOfWeek: d.DayOfWeek ?? "",
            Open: d.Open ?? "",
            Close: d.Close ?? ""
          }))
        : [],
  
      Capabilities: Array.isArray(form.Capabilities)
        ? form.Capabilities.map((c: any) => String(c))
        : [],
  
      FacilitySpecialties: Array.isArray(form.FacilitySpecialties)
        ? form.FacilitySpecialties.map((s: any) => ({
            Id: s.Id ?? 0,
            SpecialityCode: s.SpecialityCode ?? "",
            SpecialityDescription: s.SpecialityDescription ?? ""
          }))
        : [],
  
      FacilityCredentialingStatus: form.FacilityCredentialingStatus ?? "",
  
      CPTCodeList: normalizeToStringArray(form.CPTCodeList),
    FacilityAccommodationLookupValueMappings: normalizeToStringArray(
      form.FacilityAccomodationLookupValueMappings
    ),
      
    CalendarAdmin: normalizeToStringArray(
      form.CalendarAdmin
    ),
  
      CPTCodeRangeList: Array.isArray(form.CPTCodeRangeList)
        ? form.CPTCodeRangeList.map((r: any) => ({
            CPTCodeRangeFrom: r.CPTCodeRangeFrom ?? 0,
            CPTCodeRangeTo: r.CPTCodeRangeTo ?? 0,
            RangeDesc: r.RangeDesc ?? "",
            MappingFacilityId: r.MappingFacilityId ?? 0,
            MappingFacilityName: r.MappingFacilityName ?? ""
          }))
        : [],
  
      FacilityIdentifier: String(form.FacilityIdentifier ?? ""),
  
      // FacilityLookupValueMappings: Array.isArray(form.FacilityLookupValueMappings)
      //   ? form.FacilityLookupValueMappings.map((item: any) => String(item))
      //   : [],
  
      FacilityRemarks: form.FacilityRemarks ?? "",
      FacilityClusterId: Number(form.FacilityClusterId ?? 0)
    };
  }
  

  export function mapSelectedCodes(selectedList: any[], masterList: any[]) {
    if (!Array.isArray(selectedList) || !Array.isArray(masterList)) return [];

    const findMatch = (rawCode: any) => {
      if (rawCode == null || rawCode === "") return undefined;
      const rawStr = String(rawCode);
      return masterList.find(
        (m) =>
          String(m?.code) === rawStr ||
          String(m?.Id) === rawStr ||
          String(m?.FacilityId) === rawStr ||
          String(m?.FacilityUuid) === rawStr ||
          String(m?.SchedulingTypeId) === rawStr ||
          String(m?.DbqMasterId) === rawStr
      );
    };

    return selectedList.flatMap((item) => {
      if (item && typeof item === "object" && "code" in item && item.label) {
        return [{ code: item.code, label: item.label }];
      }

      const rawCode =
        typeof item === "object" && item != null
          ? item.code ??
            item.Id ??
            item.SchedulingTypeId ??
            item.FacilityId ??
            item.FacilityUuid ??
            item.DbqMasterId ??
            item.SpecialityId
          : item;

      const match = findMatch(rawCode);
      if (match) {
        return [{ code: match.code, label: match.label }];
      }

      if (typeof item === "object" && item != null) {
        const fallbackLabel =
          item.label ||
          item.FacilityPracticeName ||
          item.FaciltiyName ||
          item.SpecialityDescription ||
          item.SchedulingTypeValue ||
          item.DBQName ||
          item.Description ||
          "";
        if (fallbackLabel && rawCode != null && rawCode !== "") {
          return [{ code: rawCode, label: fallbackLabel }];
        }
      }

      return [];
    });
  }
  
  
