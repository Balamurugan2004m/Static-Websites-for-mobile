import { mapToApiPayload, mapToEditApiPayload } from "./utils";

describe("provider-users utils", () => {
  describe("mapToEditApiPayload", () => {
    it("should include UserName in the mapped payload", () => {
      const input = {
        Id: "guid-123",
        UserId: 49,
        UserName: "CynthiaBool",
        FirstName: "Cynthia",
        LastName: "Bool",
        EmailAddress: "cynthia@example.com",
        NpiNumber: "1234567890",
      };

      const result = mapToEditApiPayload(input);
      expect(result.UserName).toBe("CynthiaBool");
      expect(result.UserId).toBe(49);
      expect(result.FirstName).toBe("Cynthia");
      expect(result.LastName).toBe("Bool");
    });

    it("should handle lowercase userName fallback and whitespace trim", () => {
      const input = {
        UserId: 123,
        userName: "  dr_test  ",
      };

      const result = mapToEditApiPayload(input);
      expect(result.UserName).toBe("dr_test");
    });

    it("should default UserName to empty string if not provided", () => {
      const input = {
        UserId: 123,
      };

      const result = mapToEditApiPayload(input);
      expect(result.UserName).toBe("");
    });
  });

  describe("mapToApiPayload", () => {
    it("should include UserName in the add provider payload", () => {
      const input = {
        UserId: 50,
        UserName: "NewProviderUser",
        FirstName: "John",
        LastName: "Doe",
      };

      const result = mapToApiPayload(input);
      expect(result.UserName).toBe("NewProviderUser");
      expect(result.UserId).toBe(50);
      expect(result.FirstName).toBe("John");
    });
  });
});
