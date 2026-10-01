export type ProviderFieldConfig = {
  label: string;
  field: string;
  type?: string;
  required?: boolean;
  options?: string[];
  maxLength?: number;
  placeholder?: string;
};

export const leftColumnFields: ProviderFieldConfig[] = [
  { label: "Professional Title", required: true, field: "ProfessionalTitle", type: "select", options: ["professional 1", "professional 2"], placeholder: "-- Select Professional Title --" },
  { label: "First Name", field: "FirstName", required: true, type: "text", maxLength: 100, placeholder: "Type First Name" },
  { label: "Last Name", field: "LastName", type: "text", required: true, maxLength: 100, placeholder: "Type Last Name" },
  { label: "Print Name", field: "PrintName", type: "text", required: true, maxLength: 100, placeholder: "Type Print Name" },
  { label: "Gender", field: "Gender", type: "select", options: ["Male", "Female"], required: true, placeholder: "--Select--" },
  { label: "Email Address", field: "Email", type: "email", required: true, maxLength: 100, placeholder: "Type Email Address" },
  { label: "Phone Number", field: "PhoneNumber", type: "tel", required: true, maxLength: 13, placeholder: "Phone Number" },
  { label: "Vendor ID", field: "VendorId", type: "text", required: true, maxLength: 100, placeholder: "Type Vendor ID" },
  { label: "Date of Birth", field: "DoB", type: "date", required: true },
  { label: "Medical Experience Start Date", field: "MedicalExperienceStartDate", type: "date" },
];

export const middleColumnFields: ProviderFieldConfig[] = [
  { label: "MDE Experience Start Date", field: "MDEExperienceStartDate", type: "date" },
  { label: "Hours Per Week", field: "HoursPerWeek", type: "text", required: true, maxLength: 3, placeholder: "Type Hours Per Week" },
  { label: "Scheduling Type", field: "SchedulingType", type: "multiSelect", required: true, placeholder: "Select SchedulingType..." },
  { label: "Specialty", field: "Specialities", type: "multiSelect", required: true, placeholder: "Select speciality..." },
  { label: "Organization", field: "OrganizationId", type: "select", options: ["professional 1", "professional 2"], required: true, placeholder: "Select organization..." },
  { label: "Primary Facility", field: "FacilityId", type: "multiSelect", options: ["professional 1", "professional 2"], required: true, placeholder: "Select facility..." },
  { label: "Supplemental DBQs", field: "UserSupplementalMapping", type: "multiSelect", placeholder: "Select DBQ..." },
  { label: "Organization Facility Time Approver", field: "ApproverOrganizationList", type: "multiSelect", placeholder: "Selected organization..." },
  { label: "Facility Time Approver", field: "FacilityIdApprover", type: "multiSelect", placeholder: "Selected Facilities..." },
  { label: "Other Facility", field: "FacilityIdOther", type: "multiSelect", options: ["professional 1", "professional 2"], placeholder: "Select facility..." },
];

export const rightColumnFields: ProviderFieldConfig[] = [
  { label: "Affiliation", field: "Affiliation", type: "select", options: ["professional 1", "professional 2"], required: true, placeholder: "-- Select Affiliation --" },
  { label: "VBA Train ID", field: "VBATrainId", type: "text", maxLength: 10, placeholder: "Type VBA Train ID" },
  { label: "Roles", field: "Roles", type: "select", options: ["Admin", "Manager", "User", "Viewer"], required: true, placeholder: "Select Roles" },
  { label: "NPI Number", field: "UserNPINumber", type: "number", required: true, maxLength: 10, placeholder: "Type NPI Number" },
  { label: "Contract Signed Date", field: "UserSignedDate", type: "date", required: true },
  { label: "Credential Status", field: "CredentialingStatus", type: "select", options: ["Active", "InActive", "Contract in discussion"], required: true, placeholder: "Select" },
  { label: "Special Considerations", field: "UserSpecialConsiderations", type: "text", maxLength: 1000, placeholder: "Type Special Considerations" },
];

export const editLeftColumnFields: ProviderFieldConfig[] = [
  { label: "Professional Title", required: true, field: "ProfessionalTitle", type: "select", placeholder: "-- Select Professional Title --" },
  { label: "First Name", field: "FirstName", required: true, type: "text", maxLength: 100, placeholder: "Type First Name" },
  { label: "Last Name", field: "LastName", type: "text", required: true, maxLength: 100, placeholder: "Type Last Name" },
  { label: "Print Name", field: "PrintName", type: "text", required: true, maxLength: 100, placeholder: "Type Print Name" },
  { label: "Gender", field: "Gender", type: "select", options: ["Male", "Female"], required: true, placeholder: "--Select--" },
  { label: "Email Address", field: "Email", type: "email", required: true, maxLength: 100, placeholder: "Type Email Address" },
  { label: "Phone Number", field: "PhoneNumber", type: "tel", required: true, maxLength: 13, placeholder: "Phone Number" },
  { label: "Vendor ID", field: "VendorId", type: "text", required: true, maxLength: 100, placeholder: "Type Vendor ID" },
  { label: "Date of Birth", field: "DoB", type: "date", required: true },
  { label: "Medical Experience Start Date", field: "MedicalExperienceStartDate", type: "date" },
];

export const editRightColumnFields: ProviderFieldConfig[] = [
  { label: "MDE Experience Start Date", field: "MDEExperienceStartDate", type: "date" },
  { label: "Hours Per Week", field: "HoursPerWeek", type: "text", required: true, maxLength: 3, placeholder: "Type Hours Per Week" },
  { label: "Scheduling Type", field: "SchedulingType", type: "multiSelect", required: true, placeholder: "Select SchedulingType..." },
  { label: "Specialty", field: "Specialities", type: "multiSelect", required: true, placeholder: "Select speciality..." },
  { label: "Organization", field: "OrganizationId", type: "select", required: true, placeholder: "Select organization..." },
  { label: "Primary Facility", field: "FacilityId", type: "multiSelect", required: true, placeholder: "Select facility..." },
  { label: "Supplemental DBQs", field: "UserSupplementalMapping", type: "multiSelect", placeholder: "Select DBQ..." },
  { label: "Organization Facility Time Approver", field: "ApproverOrganizationList", type: "multiSelect", placeholder: "Selected organization..." },
  { label: "Facility Time Approver", field: "FacilityIdApprover", type: "multiSelect", placeholder: "Selected Facilities..." },
  { label: "Other Facility", field: "FacilityIdOther", type: "multiSelect", placeholder: "Select facility..." },
];

export const editAdminColumnFields: ProviderFieldConfig[] = [
  { label: "Affiliation", field: "Affiliation", type: "select", required: true, placeholder: "-- Select Affiliation --" },
  { label: "VBA Train ID", field: "VBATrainId", type: "text", maxLength: 10, placeholder: "Type VBA Train ID" },
  { label: "Roles", field: "Roles", type: "select", options: ["Admin", "Manager", "User", "Viewer"], required: true, placeholder: "Select Roles" },
  { label: "NPI Number", field: "UserNPINumber", type: "number", required: true, maxLength: 10, placeholder: "Type NPI Number" },
  { label: "Contract Signed Date", field: "UserSignedDate", type: "date", required: true },
  { label: "Credential Status", field: "CredentialingStatus", type: "select", options: ["Active", "InActive", "Contract in discussion"], required: true, placeholder: "Select" },
  { label: "Special Considerations", field: "UserSpecialConsiderations", type: "text", maxLength: 1000, placeholder: "Type Special Considerations" },
];

export const rightColumnSelectFields = rightColumnFields;
