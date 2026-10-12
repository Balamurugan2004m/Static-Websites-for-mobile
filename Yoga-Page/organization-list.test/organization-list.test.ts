/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import OrganizationList from "./organization-list";

// ─── Theme wrapper ────────────────────────────────────────────────────────────
const renderWithTheme = (ui: React.ReactElement, mode: "light" | "dark" = "light") => {
  const theme = createTheme({ palette: { mode, primary: { main: "#244794" } } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// ─── Redux ────────────────────────────────────────────────────────────────────
jest.mock("react-redux", () => ({ useSelector: jest.fn(), useDispatch: jest.fn() }));

// ─── Router ───────────────────────────────────────────────────────────────────
jest.mock("react-router", () => ({ useNavigate: jest.fn() }));

// ─── Store (type-only import — mock as empty object) ─────────────────────────
jest.mock("../../store", () => ({}));

// ─── Service ──────────────────────────────────────────────────────────────────
jest.mock("../../services/provider-organization", () => ({
  getAllOrganizations: jest.fn(),
  searchOrganizations: jest.fn(),
}));

// ─── Redux actions ────────────────────────────────────────────────────────────
jest.mock("../../store/slice/ui-slice", () => ({
  addOrgTab:      jest.fn((p: any) => ({ type: "addOrgTab",      payload: p })),
  deleteOrgTab:   jest.fn((id: any) => ({ type: "deleteOrgTab",   payload: id })),
  deleteAllOrgTab: jest.fn(()       => ({ type: "deleteAllOrgTab" })),
}));

// ─── Paths ────────────────────────────────────────────────────────────────────
jest.mock("../../constants/paths", () => ({
  paths: {
    PROVIDER_MANAGEMENT_ORG:        { pathName: "/provider-management/provider-organization" },
    PROVIDER_MANAGEMENT_ORG_CREATE: { pathName: "/provider-management/provider-organization/create" },
    PROVIDER_MANAGEMENT_ORG_DETAILS:{ pathName: "/provider-management/provider-organization/:orgId" },
  },
}));

// ─── Shared component mocks ───────────────────────────────────────────────────
jest.mock("../../components/users/components/tabs-header", () => ({
  __esModule: true,
  default: ({ openTabs, onCloseTab, handleTabTitleClick, handleTabClick }: any) => (
    <div data-testid="tabs-header">
      {openTabs?.map((t: any) => (
        <button key={t.id} data-testid={`close-tab-${t.id}`} onClick={() => onCloseTab?.(String(t.id))}>
          close
        </button>
      ))}
      <button data-testid="tab-title-click" onClick={handleTabTitleClick}>Base</button>
      <button data-testid="tab-click" onClick={() => handleTabClick?.("Labcorp")}>Tab</button>
    </div>
  ),
}));

jest.mock("../../layouts/content-box", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="content-box">{children}</div>,
}));

jest.mock("../../ui/data-grid-table", () => ({
  __esModule: true,
  default: ({ rows, columns, loading, noRowsMessage }: any) => (
    <div data-testid="data-grid" data-loading={String(loading)}>
      <div data-testid="rows-count">{rows?.length ?? 0}</div>
      {rows?.length === 0 && noRowsMessage?.trim() && (
        <div data-testid="no-rows-msg">{noRowsMessage.trim()}</div>
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

jest.mock("../../components/users/utils/styles", () => ({
  getStyles: () => ({}),
}));

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORGS = [
  {
    Id: 1,
    OrganizationName: "Labcorp",
    OrganizationAddress1: "123 Main",
    OrganizationCity: "Houston",
    OrganizationCounty: "Harris",
    OrganizationNPINumber: "NPI001",
    OrganizationTaxIdNumber: "TAX001",
    OrganizationState: "TX",
    ServiceFacility: 2,
    OrganizationStatus: "Active",
  },
  {
    Id: 2,
    OrganizationName: "LabTest",
    OrganizationAddress1: "456 Oak",
    OrganizationCity: "Dallas",
    OrganizationCounty: "Dallas",
    OrganizationNPINumber: "NPI002",
    OrganizationTaxIdNumber: "TAX002",
    OrganizationState: "TX",
    ServiceFacility: 1,
    OrganizationStatus: "Inactive",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
describe("OrganizationList", () => {
  const { getAllOrganizations, searchOrganizations } =
    jest.requireMock("../../services/provider-organization");
  const { addOrgTab, deleteOrgTab } = jest.requireMock("../../store/slice/ui-slice");

  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "light" }, ui: { orgTabs: [] } })
    );
    (getAllOrganizations as jest.Mock).mockResolvedValue(MOCK_ORGS);
    (searchOrganizations as jest.Mock).mockResolvedValue([]);
  });

  // ─── Initial render ────────────────────────────────────────────────────────

  it("renders without crashing", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  it("renders 'Add Organization' button", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /add organization/i })).toBeInTheDocument();
  });

  it("renders the data grid", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    expect(screen.getByTestId("data-grid")).toBeInTheDocument();
  });

  // ─── Auto-load on mount ────────────────────────────────────────────────────

  it("calls getAllOrganizations on mount", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
  });

  it("populates the grid with results after mount load", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() =>
      expect(screen.getByTestId("rows-count")).toHaveTextContent(String(MOCK_ORGS.length))
    );
  });

  it("shows no-rows message when load returns empty array", async () => {
    (getAllOrganizations as jest.Mock).mockResolvedValue([]);
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    expect(screen.getByTestId("no-rows-msg")).toBeInTheDocument();
  });

  // ─── View button ───────────────────────────────────────────────────────────

  it("View button dispatches addOrgTab", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /view/i })[0]);
    expect(mockDispatch).toHaveBeenCalledWith(addOrgTab(expect.any(Object)));
  });

  it("View button navigates to org detail URL", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /view/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("/provider-management/provider-organization/")
    );
  });

  // ─── Add Organization ──────────────────────────────────────────────────────

  it("'Add Organization' navigates to create path", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /add organization/i }));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/provider-organization/create"
    );
  });

  // ─── Tab operations ────────────────────────────────────────────────────────

  it("closing a tab dispatches deleteOrgTab", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { orgTabs: [{ id: "1", email: "", userName: "Labcorp" }] },
      })
    );
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId("close-tab-1"));
    expect(mockDispatch).toHaveBeenCalledWith(deleteOrgTab(expect.any(String)));
  });

  it("clicking tab title navigates to base path", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId("tab-title-click"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-management/provider-organization");
  });

  // ─── Dark mode ─────────────────────────────────────────────────────────────

  it("renders correctly in dark mode", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "dark" }, ui: { orgTabs: [] } })
    );
    renderWithTheme(<OrganizationList />, "dark");
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  // ─── Window resize ─────────────────────────────────────────────────────────

  it("handles window resize event without error", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    window.innerWidth = 480;
    fireEvent(window, new Event("resize"));
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  // ─── handleTabClick ────────────────────────────────────────────────────────

  it("handleTabClick navigates to org detail URL when a matching tab exists", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { orgTabs: [{ id: "1", email: "", userName: "Labcorp" }] },
      })
    );
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    // The mock renders a "Tab" button that calls handleTabClick("Labcorp").
    // openTabs has a tab with userName="Labcorp" and id="1", so navigate should fire.
    fireEvent.click(screen.getByTestId("tab-click"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/provider-organization/1"
    );
  });

  it("handleTabClick does nothing when no tab matches the label", async () => {
    // openTabs is empty — no match for "Labcorp"
    renderWithTheme(<OrganizationList />);
    await waitFor(() => expect(getAllOrganizations).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId("tab-click"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ─── statusPillSx Inactive branch ─────────────────────────────────────────

  it("Inactive status chip renders for an org with Inactive status", async () => {
    renderWithTheme(<OrganizationList />);
    await waitFor(() => screen.getByTestId("row-2"));
    // row-2 has status "Inactive"; the DataGrid mock calls renderCell which renders the Chip
    expect(screen.getByTestId("row-2")).toBeInTheDocument();
    // The Chip label text for the Inactive row should appear
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
