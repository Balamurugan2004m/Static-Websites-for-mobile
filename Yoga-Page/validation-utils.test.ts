import {
  isValidEmail,
  validateEmailField,
  validatePhoneField,
  validateFaxField,
  validateCityField,
  validateCountyField,
  validateStateField,
  validateNpiField,
  validateTaxIdField,
  validateZipField,
  validateCmsRateField,
  validateOrganizationField,
  validateOrganizationForm,
  VALIDATION_MESSAGES,
} from "./validation-utils";

describe("validation-utils", () => {
  describe("isValidEmail & EMAIL_REGEX", () => {
    it("returns true for standard valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(isValidEmail("first.last@subdomain.org")).toBe(true);
      expect(isValidEmail("123@456.com")).toBe(true);
      expect(isValidEmail("user_name@domain-name.com")).toBe(true);
    });

    it("trims whitespace around email", () => {
      expect(isValidEmail("  test@example.com  ")).toBe(true);
    });

    it("returns false for invalid email formats", () => {
      expect(isValidEmail("abc123")).toBe(false);
      expect(isValidEmail("plainaddress")).toBe(false);
      expect(isValidEmail("@missingusername.com")).toBe(false);
      expect(isValidEmail("username@.com")).toBe(false);
      expect(isValidEmail("username@com")).toBe(false);
      expect(isValidEmail("username@domain..com")).toBe(false);
      expect(isValidEmail("username@domain.com.")).toBe(false);
      expect(isValidEmail("user name@domain.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("validateEmailField", () => {
    it("returns required message when email is empty and required", () => {
      expect(validateEmailField("", true)).toBe(VALIDATION_MESSAGES.EMAIL_REQUIRED);
      expect(validateEmailField("   ", true)).toBe(VALIDATION_MESSAGES.EMAIL_REQUIRED);
    });

    it("returns empty string when email is empty and not required", () => {
      expect(validateEmailField("", false)).toBe("");
      expect(validateEmailField("   ", false)).toBe("");
    });

    it("returns 'Invalid Email Address' when email is invalid", () => {
      expect(validateEmailField("abc123", true)).toBe(VALIDATION_MESSAGES.EMAIL_INVALID);
      expect(validateEmailField("abc123", false)).toBe(VALIDATION_MESSAGES.EMAIL_INVALID);
      expect(validateEmailField("user@", true)).toBe(VALIDATION_MESSAGES.EMAIL_INVALID);
      expect(validateEmailField("user@domain", true)).toBe(VALIDATION_MESSAGES.EMAIL_INVALID);
    });

    it("returns empty string when email is valid", () => {
      expect(validateEmailField("test@example.com", true)).toBe("");
      expect(validateEmailField("test@example.com", false)).toBe("");
    });
  });

  describe("validatePhoneField", () => {
    it("validates 10-digit primary phone", () => {
      expect(validatePhoneField("", true)).toBe(VALIDATION_MESSAGES.PHONE_REQUIRED);
      expect(validatePhoneField("123", true)).toBe(VALIDATION_MESSAGES.PHONE_INVALID);
      expect(validatePhoneField("1234567890", true)).toBe("");
      expect(validatePhoneField("(123) 456-7890", true)).toBe("");
    });

    it("validates alternate phone", () => {
      expect(validatePhoneField("", false, true)).toBe("");
      expect(validatePhoneField("123", false, true)).toBe(VALIDATION_MESSAGES.ALT_PHONE_INVALID);
      expect(validatePhoneField("1234567890", false, true)).toBe("");
    });
  });

  describe("validateFaxField", () => {
    it("validates 6-16 digit fax as per legacy", () => {
      expect(validateFaxField("", true)).toBe(VALIDATION_MESSAGES.FAX_REQUIRED);
      expect(validateFaxField("12345", true)).toBe(VALIDATION_MESSAGES.FAX_INVALID); // < 6 digits
      expect(validateFaxField("123456", true)).toBe(""); // 6 digits min
      expect(validateFaxField("1234567890", true)).toBe(""); // 10 digits
      expect(validateFaxField("1234567890123456", true)).toBe(""); // 16 digits max
      expect(validateFaxField("12345678901234567", true)).toBe(VALIDATION_MESSAGES.FAX_INVALID); // > 16 digits
    });
  });

  describe("validateCityField", () => {
    it("validates city is required and not pure numbers", () => {
      expect(validateCityField("", true)).toBe(VALIDATION_MESSAGES.CITY_REQUIRED);
      expect(validateCityField("12345", true)).toBe(VALIDATION_MESSAGES.CITY_INVALID);
      expect(validateCityField("New York", true)).toBe("");
      expect(validateCityField("City 1", true)).toBe("");
    });
  });

  describe("validateCountyField", () => {
    it("validates county is required and not pure numbers", () => {
      expect(validateCountyField("", true)).toBe(VALIDATION_MESSAGES.COUNTY_REQUIRED);
      expect(validateCountyField("999", true)).toBe(VALIDATION_MESSAGES.COUNTY_INVALID);
      expect(validateCountyField("Orange", true)).toBe("");
      expect(validateCountyField("County 2", true)).toBe("");
    });
  });

  describe("validateStateField", () => {
    it("validates state is required and not pure numbers", () => {
      expect(validateStateField("", true)).toBe(VALIDATION_MESSAGES.STATE_REQUIRED);
      expect(validateStateField("12", true)).toBe(VALIDATION_MESSAGES.STATE_INVALID);
      expect(validateStateField("TX", true)).toBe("");
      expect(validateStateField("California", true)).toBe("");
    });
  });

  describe("validateNpiField", () => {
    it("validates optional 10-digit NPI", () => {
      expect(validateNpiField("")).toBe("");
      expect(validateNpiField("123")).toBe(VALIDATION_MESSAGES.NPI_INVALID);
      expect(validateNpiField("1234567890")).toBe("");
    });
  });

  describe("validateTaxIdField", () => {
    it("validates optional 9-digit Tax ID", () => {
      expect(validateTaxIdField("")).toBe("");
      expect(validateTaxIdField("12345")).toBe(VALIDATION_MESSAGES.TAX_ID_INVALID);
      expect(validateTaxIdField("123456789")).toBe("");
    });
  });

  describe("validateZipField", () => {
    it("validates 5-digit zip code", () => {
      expect(validateZipField("", true)).toBe(VALIDATION_MESSAGES.ZIP_REQUIRED);
      expect(validateZipField("123", true)).toBe(VALIDATION_MESSAGES.ZIP_INVALID);
      expect(validateZipField("12345", true)).toBe("");
    });
  });

  describe("validateCmsRateField", () => {
    it("validates 0-100 CMS rate", () => {
      expect(validateCmsRateField("", true)).toBe(VALIDATION_MESSAGES.CMS_RATE_REQUIRED);
      expect(validateCmsRateField("-5", true)).toBe(VALIDATION_MESSAGES.CMS_RATE_INVALID);
      expect(validateCmsRateField("105", true)).toBe(VALIDATION_MESSAGES.CMS_RATE_INVALID);
      expect(validateCmsRateField("abc", true)).toBe(VALIDATION_MESSAGES.CMS_RATE_INVALID);
      expect(validateCmsRateField("80", true)).toBe("");
      expect(validateCmsRateField("0", true)).toBe("");
      expect(validateCmsRateField("100", true)).toBe("");
    });
  });

  describe("validateOrganizationField", () => {
    it("delegates to proper validator for each organization field", () => {
      expect(validateOrganizationField("name", "")).toBe(VALIDATION_MESSAGES.NAME_REQUIRED);
      expect(validateOrganizationField("name", "Org")).toBe("");

      expect(validateOrganizationField("emailAddress", "invalid")).toBe(VALIDATION_MESSAGES.EMAIL_INVALID);
      expect(validateOrganizationField("emailAddress", "valid@domain.com")).toBe("");

      expect(validateOrganizationField("phoneNumber", "123")).toBe(VALIDATION_MESSAGES.PHONE_INVALID);
      expect(validateOrganizationField("phoneNumber", "1234567890")).toBe("");

      expect(validateOrganizationField("altPhoneNumber", "123")).toBe(VALIDATION_MESSAGES.ALT_PHONE_INVALID);
      expect(validateOrganizationField("altPhoneNumber", "")).toBe("");

      expect(validateOrganizationField("faxNumber", "123")).toBe(VALIDATION_MESSAGES.FAX_INVALID);
      expect(validateOrganizationField("faxNumber", "123456")).toBe("");

      expect(validateOrganizationField("city", "12345")).toBe(VALIDATION_MESSAGES.CITY_INVALID);
      expect(validateOrganizationField("city", "Dallas")).toBe("");

      expect(validateOrganizationField("county", "12345")).toBe(VALIDATION_MESSAGES.COUNTY_INVALID);
      expect(validateOrganizationField("county", "Dallas")).toBe("");

      expect(validateOrganizationField("state", "12345")).toBe(VALIDATION_MESSAGES.STATE_INVALID);
      expect(validateOrganizationField("state", "TX")).toBe("");

      expect(validateOrganizationField("address1", "")).toBe(VALIDATION_MESSAGES.ADDRESS1_REQUIRED);
      expect(validateOrganizationField("address1", "123 Main")).toBe("");

      expect(validateOrganizationField("zip", "123")).toBe(VALIDATION_MESSAGES.ZIP_INVALID);
      expect(validateOrganizationField("zip", "75001")).toBe("");

      expect(validateOrganizationField("cmsRatePercent", "")).toBe(VALIDATION_MESSAGES.CMS_RATE_REQUIRED);
      expect(validateOrganizationField("cmsRatePercent", "50")).toBe("");

      expect(validateOrganizationField("contractStatus", "")).toBe(VALIDATION_MESSAGES.CONTRACT_STATUS_REQUIRED);
      expect(validateOrganizationField("contractStatus", "Active")).toBe("");

      expect(validateOrganizationField("unknownField", "anything")).toBe("");
    });
  });

  describe("validateOrganizationForm", () => {
    it("returns invalid when required fields are missing", () => {
      const result = validateOrganizationForm({});
      expect(result.isValid).toBe(false);
      expect(result.firstErrorField).toBe("name");
      expect(result.errors.name).toBe(VALIDATION_MESSAGES.NAME_REQUIRED);
    });

    it("returns valid when all fields satisfy legacy constraints", () => {
      const validForm = {
        name: "Acme Health",
        emailAddress: "info@acme.org",
        phoneNumber: "2145551234",
        altPhoneNumber: "",
        faxNumber: "2145551234",
        taxIdNumber: "123456789",
        npiNumber: "1234567890",
        address1: "100 Medical Way",
        address2: "",
        city: "Dallas",
        county: "Dallas",
        state: "TX",
        zip: "75201",
        isInfinite: false,
        isPayable: false,
        cmsRatePercent: "15",
        contractStatus: "Active",
      };
      const result = validateOrganizationForm(validForm);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });
});
