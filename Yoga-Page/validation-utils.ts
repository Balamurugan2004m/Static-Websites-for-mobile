/**
 * Validation utilities and constants replicating legacy validation rules.
 */

// WHATWG / HTML5 standard email regex, matching legacy jQuery Validate
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const FAX_REGEX = /^\+?[0-9]{6,16}$/;
export const NPI_REGEX = /^\d{10}$/;
export const TAX_ID_REGEX = /^\d{9}$/;
export const ZIP_REGEX = /^\d{5}$/;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Email address is required",
  EMAIL_INVALID: "Invalid Email Address",
  NAME_REQUIRED: "Organization name is required",
  PHONE_REQUIRED: "Primary phone number is required",
  PHONE_INVALID: "Not a valid Phone number",
  ALT_PHONE_INVALID: "Not a valid Phone number",
  FAX_REQUIRED: "Fax number is required",
  FAX_INVALID: "Not a valid Fax number.Minimum  6 Number and Maximum 16",
  NPI_INVALID: "NPI number must be exactly 10 digits",
  TAX_ID_INVALID: "Tax ID must be 9 digits",
  ADDRESS1_REQUIRED: "Address 1 is required",
  CITY_REQUIRED: "City is required",
  CITY_INVALID: "Enter only alphabets and numbers of City",
  COUNTY_REQUIRED: "County is required",
  COUNTY_INVALID: "Enter only alphabets and numbers of Contry",
  STATE_REQUIRED: "State is required",
  STATE_INVALID: "Enter only alphabets and numbers of State",
  ZIP_REQUIRED: "Zip code is required",
  ZIP_INVALID: "Zip code must be 5 digits",
  CMS_RATE_REQUIRED: "CMS rate percent is required",
  CMS_RATE_INVALID: "CMS rate percent must be between 0 and 100",
  CONTRACT_STATUS_REQUIRED: "Contract status is required",
} as const;

/**
 * Checks whether an email string matches the valid email format.
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates an email field value and returns an error message if invalid.
 * Empty string indicates valid.
 */
export const validateEmailField = (email: string, isRequired = true): string => {
  const trimmed = (email ?? "").trim();
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.EMAIL_REQUIRED : "";
  }
  if (!isValidEmail(trimmed)) {
    return VALIDATION_MESSAGES.EMAIL_INVALID;
  }
  return "";
};

/**
 * Validates a 10-digit phone field.
 */
export const validatePhoneField = (phone: string, isRequired = false, isAlt = false): string => {
  const trimmed = (phone ?? "").trim().replace(/\D/g, "");
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.PHONE_REQUIRED : "";
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return isAlt ? VALIDATION_MESSAGES.ALT_PHONE_INVALID : VALIDATION_MESSAGES.PHONE_INVALID;
  }
  return "";
};

/**
 * Validates a fax number (6 to 16 digits as per legacy).
 */
export const validateFaxField = (fax: string, isRequired = true): string => {
  const trimmed = (fax ?? "").trim().replace(/\D/g, "");
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.FAX_REQUIRED : "";
  }
  if (!FAX_REGEX.test(trimmed)) {
    return VALIDATION_MESSAGES.FAX_INVALID;
  }
  return "";
};

/**
 * Validates City field (non-empty and not pure digits).
 */
export const validateCityField = (city: string, isRequired = true): string => {
  const trimmed = (city ?? "").trim();
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.CITY_REQUIRED : "";
  }
  if (/^\d+$/.test(trimmed)) {
    return VALIDATION_MESSAGES.CITY_INVALID;
  }
  return "";
};

/**
 * Validates County field (non-empty and not pure digits).
 */
export const validateCountyField = (county: string, isRequired = true): string => {
  const trimmed = (county ?? "").trim();
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.COUNTY_REQUIRED : "";
  }
  if (/^\d+$/.test(trimmed)) {
    return VALIDATION_MESSAGES.COUNTY_INVALID;
  }
  return "";
};

/**
 * Validates State field (non-empty and not pure digits).
 */
export const validateStateField = (state: string, isRequired = true): string => {
  const trimmed = (state ?? "").trim();
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.STATE_REQUIRED : "";
  }
  if (/^\d+$/.test(trimmed)) {
    return VALIDATION_MESSAGES.STATE_INVALID;
  }
  return "";
};

/**
 * Validates NPI number (optional or 10 digits).
 */
export const validateNpiField = (npi: string): string => {
  const trimmed = (npi ?? "").trim();
  if (!trimmed) return "";
  return NPI_REGEX.test(trimmed) ? "" : VALIDATION_MESSAGES.NPI_INVALID;
};

/**
 * Validates Tax ID (optional or 9 digits).
 */
export const validateTaxIdField = (taxId: string): string => {
  const trimmed = (taxId ?? "").trim();
  if (!trimmed) return "";
  return TAX_ID_REGEX.test(trimmed) ? "" : VALIDATION_MESSAGES.TAX_ID_INVALID;
};

/**
 * Validates Zip code (5 digits).
 */
export const validateZipField = (zip: string, isRequired = true): string => {
  const trimmed = (zip ?? "").trim();
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.ZIP_REQUIRED : "";
  }
  return ZIP_REGEX.test(trimmed) ? "" : VALIDATION_MESSAGES.ZIP_INVALID;
};

/**
 * Validates CMS rate percent (0-100).
 */
export const validateCmsRateField = (cmsRate: string, isRequired = true): string => {
  const trimmed = (cmsRate ?? "").trim();
  if (!trimmed) {
    return isRequired ? VALIDATION_MESSAGES.CMS_RATE_REQUIRED : "";
  }
  const num = Number(trimmed);
  if (isNaN(num) || num < 0 || num > 100) {
    return VALIDATION_MESSAGES.CMS_RATE_INVALID;
  }
  return "";
};

/**
 * Unified field validator for Organization fields replicating legacy rules.
 */
export const validateOrganizationField = (
  field: string,
  value: string | boolean
): string => {
  const strVal = typeof value === "string" ? value : "";
  switch (field) {
    case "name":
      return !strVal.trim() ? VALIDATION_MESSAGES.NAME_REQUIRED : "";
    case "emailAddress":
      return validateEmailField(strVal, true);
    case "phoneNumber":
      return validatePhoneField(strVal, true, false);
    case "altPhoneNumber":
      return validatePhoneField(strVal, false, true);
    case "faxNumber":
      return validateFaxField(strVal, true);
    case "npiNumber":
      return validateNpiField(strVal);
    case "taxIdNumber":
      return validateTaxIdField(strVal);
    case "address1":
      return !strVal.trim() ? VALIDATION_MESSAGES.ADDRESS1_REQUIRED : "";
    case "city":
      return validateCityField(strVal, true);
    case "county":
      return validateCountyField(strVal, true);
    case "state":
      return validateStateField(strVal, true);
    case "zip":
      return validateZipField(strVal, true);
    case "cmsRatePercent":
      return validateCmsRateField(strVal, true);
    case "contractStatus":
      return !strVal.trim() ? VALIDATION_MESSAGES.CONTRACT_STATUS_REQUIRED : "";
    default:
      return "";
  }
};

/**
 * Validates all fields of an organization form.
 */
export const validateOrganizationForm = <T extends object>(
  formData: T
): { isValid: boolean; firstErrorField: string; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  const data = formData as Record<string, string | boolean>;
  const fieldsToValidate = [
    "name",
    "emailAddress",
    "phoneNumber",
    "altPhoneNumber",
    "faxNumber",
    "taxIdNumber",
    "npiNumber",
    "address1",
    "city",
    "county",
    "state",
    "zip",
    "cmsRatePercent",
    "contractStatus",
  ];

  fieldsToValidate.forEach((field) => {
    const err = validateOrganizationField(field, data[field] ?? "");
    if (err) {
      errors[field] = err;
    }
  });

  const firstErrorField = Object.keys(errors)[0] || "";
  return { isValid: Object.keys(errors).length === 0, firstErrorField, errors };
};
