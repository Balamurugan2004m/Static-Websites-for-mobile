import {
  leftColumnFields,
  middleColumnFields,
  rightColumnFields,
  rightColumnSelectFields,
  editLeftColumnFields,
  editRightColumnFields,
  editAdminColumnFields,
} from "./provider-users-column";

describe("provider-users-column", () => {
  describe("leftColumnFields", () => {
    it("contains identity/contact fields in Figma order", () => {
      expect(leftColumnFields.map((f) => f.field)).toEqual([
        "ProfessionalTitle",
        "FirstName",
        "LastName",
        "PrintName",
        "Gender",
        "Email",
        "PhoneNumber",
        "VendorId",
        "DoB",
        "MedicalExperienceStartDate",
      ]);
    });

    it("has unique field names", () => {
      const fields = leftColumnFields.map((f) => f.field);
      expect(new Set(fields).size).toBe(fields.length);
    });
  });

  describe("middleColumnFields", () => {
    it("contains scheduling/facility fields in Figma order", () => {
      expect(middleColumnFields.map((f) => f.field)).toEqual([
        "MDEExperienceStartDate",
        "HoursPerWeek",
        "SchedulingType",
        "Specialities",
        "OrganizationId",
        "FacilityId",
        "UserSupplementalMapping",
        "ApproverOrganizationList",
        "FacilityIdApprover",
        "FacilityIdOther",
      ]);
    });
  });

  describe("rightColumnFields", () => {
    it("contains admin/credential fields", () => {
      expect(rightColumnFields.map((f) => f.field)).toEqual([
        "Affiliation",
        "VBATrainId",
        "Roles",
        "UserNPINumber",
        "UserSignedDate",
        "CredentialingStatus",
        "UserSpecialConsiderations",
      ]);
    });

    it("aliases rightColumnSelectFields", () => {
      expect(rightColumnSelectFields).toBe(rightColumnFields);
    });
  });

  describe("editLeftColumnFields (Figma 92:1786)", () => {
    it("contains identity/contact fields without Middle Name or Suffix", () => {
      expect(editLeftColumnFields.map((f) => f.field)).toEqual([
        "ProfessionalTitle",
        "FirstName",
        "LastName",
        "PrintName",
        "Gender",
        "Email",
        "PhoneNumber",
        "VendorId",
        "DoB",
        "MedicalExperienceStartDate",
      ]);
    });
  });

  describe("editRightColumnFields (Figma 92:1786)", () => {
    it("includes supplemental DBQs and time approvers before Other Facility", () => {
      expect(editRightColumnFields.map((f) => f.field)).toEqual([
        "MDEExperienceStartDate",
        "HoursPerWeek",
        "SchedulingType",
        "Specialities",
        "OrganizationId",
        "FacilityId",
        "UserSupplementalMapping",
        "ApproverOrganizationList",
        "FacilityIdApprover",
        "FacilityIdOther",
      ]);
    });
  });

  describe("editAdminColumnFields", () => {
    it("keeps affiliation and credential fields for edit", () => {
      expect(editAdminColumnFields.map((f) => f.field)).toContain("Affiliation");
      expect(editAdminColumnFields.map((f) => f.field)).toContain("Roles");
      expect(editAdminColumnFields.map((f) => f.field)).toContain("UserNPINumber");
    });
  });
});
