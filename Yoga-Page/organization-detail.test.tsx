/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

// ─── Constants & API URLs mock (must precede component import) ────────────────
jest.mock("../../constants/api-urls", () => ({
  API_URLS: {
    PROVIDER_ORGANIZATION: {
      GET: "mock-get-org",
      EDIT: "mock-edit-org",
      GET_USERS_FOR_ORG: "mock-get-users",
    },
    FACILITY: {
      GET_ALL: "mock-get-all-facilities",
    },
  },
}));

// ─── Services mocks ───────────────────────────────────────────────────────────
jest.mock("../../services/provider-users", () => ({
  getFacilitiesByOrganizationId: jest.fn(),
  getCredentialStatus: jest.fn().mockResolvedValue([]),
  getAllProviderUsers: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../utils/provider-staff-utils", () => ({
  getProviderUsersByIds: jest.fn(),
}));

jest.mock("../../services/provider-organization", () => ({
  CONTRACT_STATUS_OPTIONS: ["Active", "Inactive", "Contract in discussion"],
  getOrganizationById: jest.fn(),
  editOrganization: jest.fn(),
  getUsersForOrganization: jest.fn(),
  getOrganizationContractStatuses: jest.fn().mockResolvedValue([
    { LookupValueId: 1, Name: "Active" },
    { LookupValueId: 2, Name: "Inactive" },
  ]),
}));

jest.mock("../../services/account-users", () => ({
  resetPassword: jest.fn(),
  activateUser: jest.fn(),
}));

jest.mock("../../utils/toast", () => ({
  showToast: jest.fn(),
}));

import OrganizationDetails from "./organization-details";
import { resetPassword, activateUser } from "../../services/account-users";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";
import {
  getOrganizationById,
  editOrganization,
  getUsersForOrganization,
  getOrganizationContractStatuses,
} from "../../services/provider-organization";
import { getFacilitiesByOrganizationId } from "../../services/provider-users";
import { getProviderUsersByIds } from "../../utils/provider-staff-utils";

// ─── Theme wrapper ────────────────────────────────────────────────────────────
const renderWithTheme = (ui: React.ReactElement, mode: "light" | "dark" = "light") => {
  const theme = createTheme({ palette: { mode, primary: { main: "#244794" } } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// ─── Redux ────────────────────────────────────────────────────────────────────
jest.mock("react-redux", () => ({ useSelector: jest.fn(), useDispatch: jest.fn() }));

// ─── Router ───────────────────────────────────────────────────────────────────
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

// ─── Store ────────────────────────────────────────────────────────────────────
jest.mock("../../store", () => ({}));

// ─── Confirmation Modal Mock ──────────────────────────────────────────────────
jest.mock("../../ui/confirmation-modal", () => ({
  __esModule: true,
  default: function MockConfirmationModal(props: any) {
    if (!props.open) return null;
    return (
      <div data-testid="confirmation-modal">
        <div data-testid="modal-title">{props.title}</div>
        <div data-testid="modal-highlight">{props.highlightMessage}</div>
        <button onClick={props.onConfirm}>{props.confirmLabel ?? "confirm"}</button>
        <button onClick={props.onCancel}>{props.cancelLabel ?? "cancel"}</button>
      </div>
    );
  },
}));

// ─── Redux actions ────────────────────────────────────────────────────────────
jest.mock("../../store/slice/ui-slice", () => ({
  addOrgTab: jest.fn((p: any) => ({ type: "addOrgTab", payload: p })),
  deleteOrgTab: jest.fn((id: any) => ({ type: "deleteOrgTab", payload: id })),
  addProviderFacilityTab: jest.fn((p: any) => ({ type: "addProviderFacilityTab", payload: p })),
  addProviderUserTab: jest.fn((p: any) => ({ type: "addProviderUserTab", payload: p })),
}));

jest.mock("../../store/slice/provider-facility-slice", () => ({
  setSelectedTab: jest.fn((p: any) => ({ type: "setSelectedTab", payload: p })),
}));

jest.mock("../../store/slice/provider-users-slice", () => ({
  setSelectedTab: jest.fn((p: any) => ({ type: "setSelectedTab", payload: p })),
}));

// ─── Paths ────────────────────────────────────────────────────────────────────
jest.mock("../../constants/paths", () => ({
  paths: {
    PROVIDER_MANAGEMENT_ORG:          { pathName: "/provider-management/provider-organization" },
    PROVIDER_MANAGEMENT_ORG_DETAILS:  { pathName: "/provider-management/provider-organization/:orgId" },
    PROVIDER_MANAGEMENT_ORG_FACILITY: { pathName: "/provider-management/provider-organization/:orgId/facility/:facilityId" },
    PROVIDER_MANAGEMENT_FACILITIES:   { pathName: "/provider-management/facilities" },
    PROVIDER_MANAGEMENT_USERS:        { pathName: "/provider-management/users" },
  },
}));

// ─── Shared component mocks ───────────────────────────────────────────────────
jest.mock("../../components/users/components/tabs-header", () => ({
  __esModule: true,
  default: ({ openTabs, onCloseTab, handleTabTitleClick, handleTabClick, handleRefreshClick }: any) => (
    <div data-testid="tabs-header">
      {openTabs?.map((t: any) => (
        <button key={t.id} data-testid={`close-tab-${t.id}`} onClick={() => onCloseTab?.(String(t.id))}>
          close
        </button>
      ))}
      <button data-testid="tab-title-click" onClick={handleTabTitleClick}>Base</button>
      <button data-testid="tab-click" onClick={() => handleTabClick?.("Labcorp")}>Tab</button>
      <button data-testid="refresh-click" onClick={handleRefreshClick}>Refresh</button>
    </div>
  ),
}));

jest.mock("../../layouts/content-box", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="content-box">{children}</div>,
}));

jest.mock("../../ui/data-grid-table", () => ({
  __esModule: true,
  default: ({ rows, columns, noRowsMessage }: any) => (
    <div data-testid="data-grid">
      {rows?.length === 0 && noRowsMessage?.trim() && (
        <div data-testid="no-rows-msg">{noRowsMessage}</div>
      )}
      {rows?.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns?.map((col: any) => (
            <span key={col.field}>
              {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : null}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../../ui/common-accordion", () => ({
  __esModule: true,
  default: ({ children, title }: any) => (
    <div data-testid={`accordion-${(title ?? "").toLowerCase().replace(/\s+/g, "-")}`}>
      {children}
    </div>
  ),
}));

jest.mock("../../components/users/utils/styles", () => ({
  getStyles: () => ({}),
}));

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORG_DTO = {
  Id: 1,
  OrganizationName: "Labcorp",
  OrganizationCounty: "Harris",
  OrganizationAddress1: "123 Main St",
  OrganizationAddress2: "Suite 100",
  OrganizationCity: "Houston",
  OrganizationState: "TX",
  OrganizationZip: "77001",
  OrganizationTaxIdNumber: "123456789",
  OrganizationNPINumber: "1234567890",
  OrganizationPrimaryPhoneNumber: "1234567890",
  OrganizationAlternatePhoneNumber: "0987654321",
  OrganizationEmailId: "contact@labcorp.com",
  OrganizationFaxNumber: "1122334455",
  IsOrganizationInfinite: false,
  IsPayableToOrg: false,
  ServiceFacility: 2,
  ProfessionalStaff: 1,
  CMSRatePercent: 10,
  OrganizationStatusId: 1,
  OrganizationStatus: "Active",
};

const MOCK_FACILITY_DTOS = [
  {
    FacilityId: "f1",
    FaciltiyName: "John Holland, MD Office",
    FacilityAddress1: "2086 Addison Ave E",
    FacilityCity: "Twin Falls",
    FacilityState: "ID",
    FacilityZip: "83301",
    CredentialStatus: "Inactive",
    IsSmart: "false",
    FacilityNPINumber: "1234567890",
    FacilityPrimaryPhone: "2081234567",
    FacilityEmailId: "facility@labcorp.com",
    FacilityCounty: "Twin Falls",
  },
];

const MOCK_STAFF_USERS = [
  {
    Id: "s1",
    UserId: "s1",
    FullName: "adams, danial",
    UserName: "daniadams",
    Email: "daniadams@deloitte.com",
    UserRolls: "Admin, Provider",
    UserNPINumber: "222222222",
    IsEnabled: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
describe("OrganizationDetails", () => {
  const { addOrgTab, deleteOrgTab } = jest.requireMock("../../store/slice/ui-slice");

  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useParams as any).mockReturnValue({ orgId: "1" });
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "light" }, ui: { orgTabs: [] } })
    );
    (getOrganizationById as jest.Mock).mockResolvedValue(MOCK_ORG_DTO);
    (getFacilitiesByOrganizationId as jest.Mock).mockResolvedValue(MOCK_FACILITY_DTOS);
    (getUsersForOrganization as jest.Mock).mockResolvedValue(["s1"]);
    (getProviderUsersByIds as jest.Mock).mockResolvedValue(MOCK_STAFF_USERS);
    (editOrganization as jest.Mock).mockResolvedValue(true);
    (getOrganizationContractStatuses as jest.Mock).mockResolvedValue([
      { LookupValueId: 1, Name: "Active" },
      { LookupValueId: 2, Name: "Inactive" },
    ]);
  });

  // ─── Loading / not found ───────────────────────────────────────────────────

  it("shows loading state while org is being fetched", () => {
    (getOrganizationById as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderWithTheme(<OrganizationDetails />);
    expect(document.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  it("shows 'Organization not found.' when getOrganizationById returns null", async () => {
    (getOrganizationById as jest.Mock).mockResolvedValue(null);
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() =>
      expect(screen.getByText("Organization not found.")).toBeInTheDocument()
    );
  });

  // ─── Loaded state ──────────────────────────────────────────────────────────

  it("displays org name after loading", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() =>
      expect(screen.getAllByText("Labcorp").length).toBeGreaterThan(0)
    );
  });

  it("dispatches addOrgTab after org loads", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(addOrgTab(expect.any(Object)))
    );
  });

  it("renders facility list accordion", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getAllByText("Labcorp"));
    expect(screen.getByTestId("accordion-facility-list")).toBeInTheDocument();
  });

  it("renders organization staff accordion", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getAllByText("Labcorp"));
    expect(screen.getByTestId("accordion-organization-staff")).toBeInTheDocument();
  });

  it("renders facility row f1", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-f1"));
    expect(screen.getByTestId("row-f1")).toBeInTheDocument();
  });

  it("renders staff row s1", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    expect(screen.getByTestId("row-s1")).toBeInTheDocument();
  });

  // ─── Edit / Cancel ─────────────────────────────────────────────────────────

  it("clicking Edit button shows Save and Cancel buttons", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("clicking Cancel in edit mode restores view-only Edit button", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
  });

  // ─── Save ──────────────────────────────────────────────────────────────────

  it("Save calls editOrganization", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(editOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ OrganizationName: "Labcorp" })
      )
    );
  });

  it("Save success shows success toast", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        "Organization has been edited and saved successfully.",
        TOAST_TYPES.SUCCESS
      )
    );
  });

  it("Save failure shows error toast", async () => {
    (editOrganization as jest.Mock).mockRejectedValue(new Error("fail"));
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith("Failed to save organization.", TOAST_TYPES.ERROR)
    );
  });

  // ─── Facility Row → View ───────────────────────────────────────────────────

  it("clicking View in facility row navigates to facility detail URL", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-f1"));
    const facilityRow = screen.getByTestId("row-f1");
    const viewBtn = within(facilityRow).getByRole("button", { name: /view/i });
    fireEvent.click(viewBtn);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/provider-management/facilities/f1")
    );
  });

  // ─── Staff toggle → confirm dialog ────────────────────────────────────────

  it("toggling an active staff Switch opens 'Before you Continue' dialog", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const staffRow = screen.getByTestId("row-s1");
    const switchInput = staffRow.querySelector("input[type='checkbox']");
    expect(switchInput).not.toBeNull();
    fireEvent.click(switchInput!);
    await waitFor(() => expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument());
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Before you Continue");
    expect(screen.getByTestId("modal-highlight")).toHaveTextContent(
      /You are about to disable MDE login/i
    );
  });

  it("toggling an inactive staff Switch opens enable confirmation dialog", async () => {
    (getProviderUsersByIds as jest.Mock).mockResolvedValue([
      { ...MOCK_STAFF_USERS[0], IsEnabled: false },
    ]);
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const switchInput = screen.getByTestId("row-s1").querySelector("input[type='checkbox']")!;
    fireEvent.click(switchInput);
    await waitFor(() => expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument());
    expect(screen.getByTestId("modal-highlight")).toHaveTextContent(
      /You are about to enable MDE login/i
    );
  });

  it("disables staff after confirmation and shows success toast", async () => {
    const mockActivateUser = activateUser as jest.MockedFunction<typeof activateUser>;
    mockActivateUser.mockResolvedValueOnce({ Enabled: false, SecurityUserId: "s1" } as any);

    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const switchInput = screen.getByTestId("row-s1").querySelector("input[type='checkbox']")!;
    fireEvent.click(switchInput);
    await waitFor(() => screen.getByTestId("confirmation-modal"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(mockActivateUser).toHaveBeenCalledWith("s1", false);
      expect(showToast).toHaveBeenCalledWith("User is Disabled", TOAST_TYPES.SUCCESS);
    });
  });

  it("enables staff after confirmation and shows success toast", async () => {
    const mockActivateUser = activateUser as jest.MockedFunction<typeof activateUser>;
    mockActivateUser.mockResolvedValueOnce({ Enabled: true, SecurityUserId: "s1" } as any);
    (getProviderUsersByIds as jest.Mock).mockResolvedValue([
      { ...MOCK_STAFF_USERS[0], IsEnabled: false },
    ]);

    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const switchInput = screen.getByTestId("row-s1").querySelector("input[type='checkbox']")!;
    fireEvent.click(switchInput);
    await waitFor(() => screen.getByTestId("confirmation-modal"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(mockActivateUser).toHaveBeenCalledWith("s1", true);
      expect(showToast).toHaveBeenCalledWith("User is Enabled", TOAST_TYPES.SUCCESS);
    });
  });

  it("Cancel in confirm dialog closes it without deactivating staff", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const switchInput = screen.getByTestId("row-s1").querySelector("input[type='checkbox']")!;
    fireEvent.click(switchInput);
    await waitFor(() => screen.getByTestId("confirmation-modal"));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument()
    );
  });

  it("Continue in confirm dialog closes the dialog", async () => {
    const mockActivateUser = activateUser as jest.MockedFunction<typeof activateUser>;
    mockActivateUser.mockResolvedValueOnce({ Enabled: false, SecurityUserId: "s1" } as any);

    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const switchInput = screen.getByTestId("row-s1").querySelector("input[type='checkbox']")!;
    fireEvent.click(switchInput);
    await waitFor(() => screen.getByTestId("confirmation-modal"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() =>
      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument()
    );
  });

  // ─── Staff Menu → Reset Password ──────────────────────────────────────────

  it("Reset Password from staff menu opens confirmation modal", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const staffRow = screen.getByTestId("row-s1");
    const moreBtn = within(staffRow).getByRole("button", { name: /staff actions/i });
    fireEvent.click(moreBtn);
    await waitFor(() => screen.getByText("Reset Password"));
    fireEvent.click(screen.getByText("Reset Password"));
    await waitFor(() => expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument());
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Reset Password");
    expect(screen.getByTestId("modal-highlight")).toHaveTextContent(
      "Are you sure you want to reset the user's password?"
    );
  });

  it("resets password after confirming from staff menu", async () => {
    const mockResetPassword = resetPassword as jest.MockedFunction<typeof resetPassword>;
    mockResetPassword.mockResolvedValueOnce({ success: true } as any);

    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const staffRow = screen.getByTestId("row-s1");
    const moreBtn = within(staffRow).getByRole("button", { name: /staff actions/i });
    fireEvent.click(moreBtn);
    await waitFor(() => screen.getByText("Reset Password"));
    fireEvent.click(screen.getByText("Reset Password"));
    await waitFor(() => screen.getByTestId("confirmation-modal"));
    fireEvent.click(screen.getByRole("button", { name: /yes/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("daniadams");
      expect(screen.getByTestId("modal-highlight")).toHaveTextContent(
        "Password successfully sent to registered email address"
      );
    });
  });

  // ─── Tab operations ────────────────────────────────────────────────────────

  it("closing a tab dispatches deleteOrgTab", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { orgTabs: [{ id: "2", email: "", userName: "Other Corp" }] },
      })
    );
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("close-tab-2"));
    fireEvent.click(screen.getByTestId("close-tab-2"));
    expect(mockDispatch).toHaveBeenCalledWith(deleteOrgTab(expect.any(String)));
  });

  it("closing the current org's own tab navigates to base path", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { orgTabs: [{ id: "1", email: "", userName: "Labcorp" }] },
      })
    );
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("close-tab-1"));
    fireEvent.click(screen.getByTestId("close-tab-1"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/provider-organization"
    );
  });

  it("clicking tab title navigates to base path", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("tab-title-click"));
    fireEvent.click(screen.getByTestId("tab-title-click"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-management/provider-organization");
  });

  // ─── Dark mode ─────────────────────────────────────────────────────────────

  it("renders correctly in dark mode", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "dark" }, ui: { orgTabs: [] } })
    );
    renderWithTheme(<OrganizationDetails />, "dark");
    await waitFor(() => screen.getAllByText("Labcorp"));
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  // ─── handleRefreshClick ───────────────────────────────────────────────────

  it("handleRefreshClick triggers a second getOrganizationById call", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => expect(getOrganizationById).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("refresh-click"));
    await waitFor(() => expect(getOrganizationById).toHaveBeenCalledTimes(2));
  });

  // ─── handleTabClick ───────────────────────────────────────────────────────

  it("handleTabClick navigates to org URL when matching tab exists", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { orgTabs: [{ id: "1", email: "", userName: "Labcorp" }] },
      })
    );
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getAllByText("Labcorp"));
    fireEvent.click(screen.getByTestId("tab-click"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/provider-organization/1"
    );
  });

  it("handleTabClick does nothing when no tab matches the label", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getAllByText("Labcorp"));
    fireEvent.click(screen.getByTestId("tab-click"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ─── handleOnCloseTab — close current tab with remaining tabs ─────────────

  it("closing current tab when other tabs remain navigates to the last remaining tab", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: {
          orgTabs: [
            { id: "1", email: "", userName: "Labcorp" },
            { id: "3", email: "", userName: "Other Corp" },
          ],
        },
      })
    );
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("close-tab-1"));
    fireEvent.click(screen.getByTestId("close-tab-1"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/provider-organization/3"
    );
  });

  it("closing a non-current tab dispatches deleteOrgTab but does not navigate", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { orgTabs: [{ id: "2", email: "", userName: "Other Corp" }] },
      })
    );
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("close-tab-2"));
    fireEvent.click(screen.getByTestId("close-tab-2"));
    expect(mockDispatch).toHaveBeenCalledWith(deleteOrgTab(expect.any(String)));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ─── renderViewField empty value ──────────────────────────────────────────

  it("renderViewField shows em dash for an empty field value", async () => {
    (getOrganizationById as jest.Mock).mockResolvedValue({
      ...MOCK_ORG_DTO,
      OrganizationAddress2: null,
    });
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getAllByText("Labcorp"));
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  // ─── handleChange boolean in edit mode ────────────────────────────────────

  it("isInfinite checkbox in edit mode is interactive and updates form state", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    const [isInfiniteCheckbox] = screen.getAllByRole("checkbox");
    expect(isInfiniteCheckbox).not.toBeChecked();
    fireEvent.click(isInfiniteCheckbox);
    expect(isInfiniteCheckbox).toBeChecked();
  });

  // ─── renderEditField onChange in edit mode ───────────────────────────────

  it("changing a text field in edit mode fires handleChange and updates form", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    const nameInput = screen.getByPlaceholderText("Type Name");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });
    expect(nameInput).toHaveValue("Updated Name");
  });

  // ─── isPayable checkbox in edit mode ─────────────────────────────────────

  it("isPayable checkbox in edit mode is interactive and updates form state", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    const checkboxes = screen.getAllByRole("checkbox");
    const isPayableCheckbox = checkboxes[1];
    expect(isPayableCheckbox).not.toBeChecked();
    fireEvent.click(isPayableCheckbox);
    expect(isPayableCheckbox).toBeChecked();
  });

  // ─── staff menu "View" item ───────────────────────────────────────────────

  it("clicking View in staff menu closes the staff menu", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const staffRow = screen.getByTestId("row-s1");
    const moreBtn = within(staffRow).getByRole("button", { name: /staff actions/i });
    fireEvent.click(moreBtn);
    const viewMenuItem = await screen.findByRole("menuitem", { name: /^view$/i });
    fireEvent.click(viewMenuItem);
    await waitFor(() =>
      expect(screen.queryByRole("menuitem", { name: /^view$/i })).not.toBeInTheDocument()
    );
  });

  // ─── Reset Password modal "Done" button ───────────────────────────────────

  it("clicking cancel in Reset Password modal closes it", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-s1"));
    const staffRow = screen.getByTestId("row-s1");
    const moreBtn = within(staffRow).getByRole("button", { name: /staff actions/i });
    fireEvent.click(moreBtn);
    await waitFor(() => screen.getByText("Reset Password"));
    fireEvent.click(screen.getByText("Reset Password"));
    await waitFor(() => screen.getByTestId("confirmation-modal"));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument()
    );
  });

  // ─── Inactive status pill in facilityColumns ──────────────────────────────

  it("facility with Inactive status renders an Inactive chip", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByTestId("row-f1"));
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  // ─── Field-level validation in edit mode ──────────────────────────────────

  it("shows error on blur when editing email to an invalid format", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    const emailInput = screen.getByPlaceholderText("Type Email Address");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText("Invalid Email Address")).toBeInTheDocument();
  });

  it("shows error on blur when editing fax to less than 6 digits", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    const faxInput = screen.getByPlaceholderText("Type Fax Number");
    fireEvent.change(faxInput, { target: { value: "123" } });
    fireEvent.blur(faxInput);

    expect(await screen.findByText(/Not a valid Fax number/i)).toBeInTheDocument();
  });

  it("shows error on blur when editing city to pure numbers", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    const cityInput = screen.getByPlaceholderText("Type City");
    fireEvent.change(cityInput, { target: { value: "12345" } });
    fireEvent.blur(cityInput);

    expect(await screen.findByText("Enter only alphabets and numbers of City")).toBeInTheDocument();
  });

  it("blocks Save and shows error toast when saving with invalid fields", async () => {
    renderWithTheme(<OrganizationDetails />);
    await waitFor(() => screen.getByRole("button", { name: /^edit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    const emailInput = screen.getByPlaceholderText("Type Email Address");
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText("Invalid Email Address")).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith("Invalid Email Address", TOAST_TYPES.ERROR);
    expect(editOrganization).not.toHaveBeenCalled();
  });
});
