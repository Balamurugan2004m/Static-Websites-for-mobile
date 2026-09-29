import {
    leftColumnFields,
    middleColumnFields,
    rightColumnSelectFields,
    userTypeObjKey,
    userTypeObjVal,
    INITIAL_FORM_DATA,
    normalizeClusterIds,
    toClusterId,
    toClusterSelectOptions,
  } from "./util";
  
  jest.mock("../../../services/account-users", () => ({
    RoleTypes: {
      Admin: "Admin",
      Manager: "Manager",
      User: "User",
      Viewer: "Viewer",
    },
  }));
  
  describe("util.ts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("leftColumnFields should be defined", () => {
      expect(leftColumnFields).toBeDefined();
    });
  
    it("leftColumnFields should have correct length", () => {
      expect(leftColumnFields.length).toBeGreaterThan(0);
    });
  
    it("leftColumnFields contains First Name field", () => {
      const field = leftColumnFields.find(f => f.field === "FirstName");
      expect(field?.label).toBe("First Name");
      expect(field?.required).toBe(true);
    });

    it("leftColumnFields is identity-only (no address fields)", () => {
      expect(leftColumnFields.find(f => f.field === "AddressLine2")).toBeUndefined();
      expect(leftColumnFields.find(f => f.field === "PhoneNumber")).toBeUndefined();
    });

    it("middleColumnFields includes ZIP Code (edit/view; Add User moves it left)", () => {
      expect(middleColumnFields.find(f => f.field === "Zip")?.label).toBe("ZIP Code");
      expect(leftColumnFields.find(f => f.field === "Zip")).toBeUndefined();
    });

    it("Phone Number is not in middle column (rendered on left after Username per Figma)", () => {
      expect(middleColumnFields.find(f => f.field === "PhoneNumber")).toBeUndefined();
    });

    it("middleColumnFields contains optional AddressLine2", () => {
      const field = middleColumnFields.find(f => f.field === "AddressLine2");
      expect(field?.required).toBeUndefined();
    });

    it("PrintName is required", () => {
      expect(leftColumnFields.find(f => f.field === "PrintName")?.required).toBe(true);
    });

    it("City, State, and Zip are required in middleColumnFields", () => {
      expect(middleColumnFields.find(f => f.field === "City")?.required).toBe(true);
      expect(middleColumnFields.find(f => f.field === "State")?.required).toBe(true);
      expect(middleColumnFields.find(f => f.field === "Zip")?.required).toBe(true);
    });

    it("middleColumnFields has no tel type (Phone is on left column)", () => {
      expect(middleColumnFields.find(f => f.type === "tel")).toBeUndefined();
    });
  
    it("all leftColumnFields have label and field", () => {
      leftColumnFields.forEach(f => {
        expect(f.label).toBeTruthy();
        expect(f.field).toBeTruthy();
      });
    });
  
    it("leftColumnFields includes email type", () => {
      const emailField = leftColumnFields.find(f => f.type === "email");
      expect(emailField).toBeDefined();
    });
  
    it("rightColumnSelectFields should be defined", () => {
      expect(rightColumnSelectFields).toBeDefined();
    });
  
    it("rightColumnSelectFields has correct length", () => {
      expect(rightColumnSelectFields.length).toBeGreaterThan(0);
    });
  
    it("User Type field has required true", () => {
      const field = rightColumnSelectFields.find(f => f.field === "UserTypeId");
      expect(field?.required).toBe(true);
    });
  
    it("Roles field has options", () => {
      const field = rightColumnSelectFields.find(f => f.field === "Roles");
      expect(field?.options.length).toBeGreaterThan(0);
    });
  
    it("Manager field is optional", () => {
      const field = rightColumnSelectFields.find(f => f.field === "ManagerId");
      expect(field?.required).toBeUndefined();
    });
  
    it("all select fields have options array", () => {
      rightColumnSelectFields.forEach(f => {
        expect(Array.isArray(f.options)).toBe(true);
      });
    });
  
    it("userTypeObjKey should map correctly", () => {
      expect(userTypeObjKey.Infinite).toBe(1);
      expect(userTypeObjKey.LSGS).toBe(2);
      expect(userTypeObjKey.VA).toBe(3);
    });
  
    it("userTypeObjVal should map correctly", () => {
      expect(userTypeObjVal[1]).toBe("Infinite");
      expect(userTypeObjVal[2]).toBe("LSGS");
      expect(userTypeObjVal[3]).toBe("VA");
    });
  
    it("userTypeObjKey and userTypeObjVal should be consistent", () => {
      Object.entries(userTypeObjKey).forEach(([key, value]) => {
        expect(userTypeObjVal[value]).toBe(key);
      });
    });
  
    it("INITIAL_FORM_DATA should be defined", () => {
      expect(INITIAL_FORM_DATA).toBeDefined();
    });
  
    it("INITIAL_FORM_DATA default strings should be empty", () => {
      expect(INITIAL_FORM_DATA.FirstName).toBe("");
      expect(INITIAL_FORM_DATA.LastName).toBe("");
      expect(INITIAL_FORM_DATA.Email).toBe("");
    });
  
    it("INITIAL_FORM_DATA Roles should be empty array", () => {
      expect(Array.isArray(INITIAL_FORM_DATA.Roles)).toBe(true);
      expect(INITIAL_FORM_DATA.Roles.length).toBe(0);
    });
  
    it("INITIAL_FORM_DATA ManagerId should be null", () => {
      expect(INITIAL_FORM_DATA.ManagerId).toBeNull();
    });
  
    it("INITIAL_FORM_DATA SkillLevel should be object", () => {
      expect(typeof INITIAL_FORM_DATA.SkillLevel).toBe("object");
    });
  
    it("INITIAL_FORM_DATA ClusterLookupValueMappings should be array", () => {
      expect(Array.isArray(INITIAL_FORM_DATA.ClusterLookupValueMappings)).toBe(true);
    });
  
    it("INITIAL_FORM_DATA UserTypeId should be 0", () => {
      expect(INITIAL_FORM_DATA.UserTypeId).toBe(0);
    });
  
    it("all required left fields are marked correctly", () => {
      const requiredFields = leftColumnFields.filter(f => f.required);
      expect(requiredFields.length).toBeGreaterThan(0);
    });
  
    it("all required right fields are marked correctly", () => {
      const requiredFields = rightColumnSelectFields.filter(f => f.required);
      expect(requiredFields.length).toBeGreaterThan(0);
    });
  
    it("every right column field has type select", () => {
      rightColumnSelectFields.forEach(f => {
        expect(f.type).toBe("select");
      });
    });
  
    it("field names in leftColumnFields are unique", () => {
      const fields = leftColumnFields.map(f => f.field);
      const unique = new Set(fields);
      expect(unique.size).toBe(fields.length);
    });

    it("field names in middleColumnFields are unique", () => {
      const fields = middleColumnFields.map(f => f.field);
      const unique = new Set(fields);
      expect(unique.size).toBe(fields.length);
    });
  
    it("field names in rightColumnSelectFields are unique", () => {
      const fields = rightColumnSelectFields.map(f => f.field);
      const unique = new Set(fields);
      expect(unique.size).toBe(fields.length);
    });

    it("toClusterId normalizes number, string, and { Id }", () => {
      expect(toClusterId(5736)).toBe(5736);
      expect(toClusterId("5736")).toBe(5736);
      expect(toClusterId({ Id: 5736 })).toBe(5736);
      expect(toClusterId({ Id: "5741" })).toBe(5741);
      expect(toClusterId(null)).toBeNull();
      expect(toClusterId("")).toBeNull();
    });

    it("normalizeClusterIds returns numeric Ids from mixed shapes", () => {
      expect(normalizeClusterIds([5736, "5737", { Id: 5741 }, { Id: "5744" }, null])).toEqual([
        5736, 5737, 5741, 5744,
      ]);
      expect(normalizeClusterIds(undefined)).toEqual([]);
    });

    it("toClusterSelectOptions maps Description/Id to string keyValue/keyValueId", () => {
      const options = toClusterSelectOptions([
        { Id: 5736, Description: "Cat A", Name: "1" },
        { Id: 5741, Description: "MRI", Name: "10" },
      ]);
      expect(options).toEqual([
        expect.objectContaining({ keyValue: "Cat A", keyValueId: "5736" }),
        expect.objectContaining({ keyValue: "MRI", keyValueId: "5741" }),
      ]);
    });
  });
