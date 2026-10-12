type ServiceModule = typeof import("./provider-organization");

jest.mock("./api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../constants/api-urls", () => ({
  __esModule: true,
  default: {
    ORGANIZATION: {
      GET_ALL_ORGANIZATIONS_PAGED: "/api/Organization/GetAllOrganizationsPaged",
      SAVE_ORGANIZATION: "/api/Organization/SaveOrganization",
      GET_ORGANIZATION_BY_ID: "/api/Organization/GetOrganizationById",
      UPDATE_ORGANIZATION: "/api/Organization/UpdateOrganization",
      GET_USERS_FOR_ORGANIZATION: "/api/Organization/GetUsersForOrganization",
    },
  },
}));

jest.mock("./provider-users", () => ({
  getCredentialStatus: jest.fn().mockResolvedValue([
    { LookupValueId: 1, Name: "Active" },
    { LookupValueId: 2, Name: "Inactive" },
    { LookupValueId: 3, Name: "Intermediate" },
  ]),
}));

let mod: ServiceModule;

beforeEach(async () => {
  jest.resetModules();
  mod = await import("./provider-organization");
});

describe("searchOrganizations", () => {
  it("returns all orgs for empty string query", async () => {
    const result = await mod.searchOrganizations("");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Labcorp");
  });

  it("returns [] for a whitespace-only query (no field contains spaces)", async () => {
    const result = await mod.searchOrganizations("   ");
    expect(result).toEqual([]);
  });

  it("finds by org name (case-insensitive exact)", async () => {
    const result = await mod.searchOrganizations("LABCORP");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Labcorp");
  });

  it("finds by partial name match", async () => {
    const result = await mod.searchOrganizations("lab");
    expect(result).toHaveLength(1);
  });

  it("finds by city (case-insensitive)", async () => {
    const result = await mod.searchOrganizations("lorem ipsum");
    expect(result).toHaveLength(1);
  });

  it("finds by npiNumber (case-insensitive)", async () => {
    const result = await mod.searchOrganizations("xxxxxxxxx");
    expect(result).toHaveLength(1);
  });

  it("returns [] when query matches nothing", async () => {
    const result = await mod.searchOrganizations("ZZZNOTFOUND999");
    expect(result).toEqual([]);
  });

  it("returned orgs have all required Organization fields", async () => {
    const [org] = await mod.searchOrganizations("");
    (["id", "name", "status", "facilities", "staff", "emailAddress", "npiNumber"] as const).forEach(
      (k) => expect(org).toHaveProperty(k)
    );
  });

  it("newly created org appears in subsequent search", async () => {
    await mod.createOrganization({
      name: "SearchTest Corp", emailAddress: "a@b.com", phoneNumber: "555",
      altPhoneNumber: "", faxNumber: "0", taxIdNumber: "T", npiNumber: "N",
      address1: "1 St", address2: "", city: "City", county: "Co", state: "TX",
      zip: "00000", isInfinite: false, isPayable: false, cmsRatePercent: "80",
      contractStatus: "Active",
    });
    const result = await mod.searchOrganizations("searchtest");
    expect(result.some((o) => o.name === "SearchTest Corp")).toBe(true);
  });
});

describe("getOrganization", () => {
  it("returns org by id", async () => {
    const org = await mod.getOrganization("1");
    expect(org).not.toBeNull();
    expect(org!.name).toBe("Labcorp");
  });

  it("returns null for unknown id", async () => {
    expect(await mod.getOrganization("9999")).toBeNull();
  });

  it("returned org has a non-empty facilities array", async () => {
    const org = await mod.getOrganization("1");
    expect(Array.isArray(org!.facilities)).toBe(true);
    expect(org!.facilities.length).toBeGreaterThanOrEqual(1);
  });

  it("returned org has a non-empty staff array", async () => {
    const org = await mod.getOrganization("1");
    expect(Array.isArray(org!.staff)).toBe(true);
    expect(org!.staff.length).toBeGreaterThanOrEqual(1);
  });

  it("first facility has hoursOfOperation with 7 days", async () => {
    const org = await mod.getOrganization("1");
    expect(org!.facilities[0].hoursOfOperation).toHaveLength(7);
  });
});

describe("createOrganization", () => {
  const BASE_DATA = {
    name: "Test Corp", emailAddress: "test@corp.com", phoneNumber: "555-1234",
    altPhoneNumber: "", faxNumber: "555-9999", taxIdNumber: "TX123", npiNumber: "NPI999",
    address1: "123 Test St", address2: "", city: "Testville", county: "Test County",
    state: "TX", zip: "12345", isInfinite: false, isPayable: true,
    cmsRatePercent: "80", contractStatus: "Active",
  };

  it("creates and returns a new org with the supplied name", async () => {
    const org = await mod.createOrganization(BASE_DATA);
    expect(org.name).toBe("Test Corp");
  });

  it("assigns a truthy id to the new org", async () => {
    const org = await mod.createOrganization(BASE_DATA);
    expect(org.id).toBeTruthy();
  });

  it("new org status is Active", async () => {
    const org = await mod.createOrganization(BASE_DATA);
    expect(org.status).toBe("Active");
  });

  it("new org has empty facilities and staff arrays", async () => {
    const org = await mod.createOrganization(BASE_DATA);
    expect(org.facilities).toEqual([]);
    expect(org.staff).toEqual([]);
  });

  it("new org serviceFacility is 0", async () => {
    const org = await mod.createOrganization(BASE_DATA);
    expect(org.serviceFacility).toBe(0);
  });

  it("new org is retrievable via getOrganization", async () => {
    const created = await mod.createOrganization(BASE_DATA);
    const found = await mod.getOrganization(created.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test Corp");
  });
});

describe("updateOrganization", () => {
  it("updates org name and returns the updated org", async () => {
    const updated = await mod.updateOrganization("1", { name: "Updated Corp" });
    expect(updated.name).toBe("Updated Corp");
  });

  it("partial update preserves unmodified fields", async () => {
    const updated = await mod.updateOrganization("1", { name: "New Name" });
    expect(updated.emailAddress).toBe("xxxx@acme.com");
  });

  it("change is reflected in subsequent getOrganization call", async () => {
    await mod.updateOrganization("1", { contractStatus: "Inactive" });
    const org = await mod.getOrganization("1");
    expect(org!.contractStatus).toBe("Inactive");
  });

  it("can update boolean fields (isInfinite)", async () => {
    const updated = await mod.updateOrganization("1", { isInfinite: true });
    expect(updated.isInfinite).toBe(true);
  });
});

describe("getFacility", () => {
  it("returns facility by orgId and facilityId", async () => {
    const facility = await mod.getFacility("1", "f1");
    expect(facility).not.toBeNull();
    expect(facility!.practiceName).toBe("John Holland, MD Office");
  });

  it("returns null for unknown facilityId", async () => {
    expect(await mod.getFacility("1", "f9999")).toBeNull();
  });

  it("returns null for unknown orgId", async () => {
    expect(await mod.getFacility("9999", "f1")).toBeNull();
  });

  it("returned facility has hoursOfOperation array with 7 entries", async () => {
    const facility = await mod.getFacility("1", "f1");
    expect(Array.isArray(facility!.hoursOfOperation)).toBe(true);
    expect(facility!.hoursOfOperation).toHaveLength(7);
  });

  it("returned facility has facilityStatus field", async () => {
    const facility = await mod.getFacility("1", "f1");
    expect(["Active", "Inactive"]).toContain(facility!.facilityStatus);
  });
});

describe("CONTRACT_STATUS_OPTIONS", () => {
  it("exports an array with exactly 3 entries", () => {
    expect(mod.CONTRACT_STATUS_OPTIONS).toHaveLength(3);
  });

  it("contains Active, Inactive, and Contract in discussion", () => {
    expect(mod.CONTRACT_STATUS_OPTIONS).toContain("Active");
    expect(mod.CONTRACT_STATUS_OPTIONS).toContain("Inactive");
    expect(mod.CONTRACT_STATUS_OPTIONS).toContain("Contract in discussion");
  });
});

describe("getOrganizationContractStatuses", () => {
  it("filters out Intermediate status and returns only Active and Inactive", async () => {
    const statuses = await mod.getOrganizationContractStatuses();
    expect(statuses).toHaveLength(2);
    expect(statuses.map((s) => s.Name)).toEqual(["Active", "Inactive"]);
  });
});

