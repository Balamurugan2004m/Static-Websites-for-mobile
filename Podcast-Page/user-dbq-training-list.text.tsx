/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import UserDbqTrainingList from "./user-dbq-training-list";
import { UserDbqTrainingListItem } from "../../services/user-dbq-training";

// ─── Theme wrapper ────────────────────────────────────────────────────────────
const renderWithTheme = (ui: React.ReactElement, mode: "light" | "dark" = "light") => {
  const theme = createTheme({ palette: { mode, primary: { main: "#244794" } } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// ─── Redux ────────────────────────────────────────────────────────────────────
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// ─── Router ───────────────────────────────────────────────────────────────────
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

// ─── Services ─────────────────────────────────────────────────────────────────
jest.mock("../../services/user-dbq-training", () => ({
  searchUserDbqTraining: jest.fn(),
  formatDisplayName: jest.fn((u: any) =>
    u.LastName && u.FirstName ? `${u.LastName}, ${u.FirstName}` : u.LastName || u.FirstName || ""
  ),
}));

// ─── Redux slice actions ──────────────────────────────────────────────────────
jest.mock("../../store/slice/ui-slice", () => ({
  addUserDbqTrainingTab:    jest.fn((p: any) => ({ type: "addUserDbqTrainingTab",    payload: p })),
  deleteUserDbqTrainingTab: jest.fn((id: any) => ({ type: "deleteUserDbqTrainingTab", payload: id })),
}));

// ─── Constants ────────────────────────────────────────────────────────────────
jest.mock("../../constants/paths", () => ({
  paths: {
    PROVIDER_MANAGEMENT_USER_DBQ_TRAINING:        { pathName: "/provider-management/user-dbq-training" },
    PROVIDER_MANAGEMENT_USER_DBQ_TRAINING_CREATE: { pathName: "/provider-management/user-dbq-training/create" },
    PROVIDER_MANAGEMENT_USER_DBQ_TRAINING_DETAILS:{ pathName: "/provider-management/user-dbq-training/:userId" },
    PROVIDER_MANAGEMENT_USER_CREATE:              { pathName: "/provider-management/users/create" },
  },
}));

// ─── MUI useMediaQuery mock ───────────────────────────────────────────────────
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(() => false),
}));

// ─── Shared component mocks ───────────────────────────────────────────────────
jest.mock("../../components/users/components/tabs-header", () => ({
  __esModule: true,
  default: ({ openTabs, onCloseTab, handleTabClick, handleTabTitleClick }: any) => (
    <div data-testid="tabs-header">
      {openTabs?.map((t: any) => (
        <button key={t.id} data-testid={`close-tab-${t.id}`} onClick={() => onCloseTab?.(String(t.id))}>
          close
        </button>
      ))}
      <button data-testid="tab-title-click" onClick={handleTabTitleClick}>Base</button>
      <button data-testid="tab-click" onClick={() => handleTabClick?.("1")}>Tab 1</button>
    </div>
  ),
}));

jest.mock("../../components/app-tooltip", () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

jest.mock("../../layouts/content-box", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="content-box">{children}</div>,
}));

jest.mock("../../ui/data-grid-table", () => ({
  __esModule: true,
  default: ({ rows, columns, loading, onRowClick, noRowsMessage }: any) => (
    <div data-testid="data-grid" data-loading={String(loading)}>
      <div data-testid="rows-count">{rows?.length ?? 0}</div>
      {rows?.length === 0 && noRowsMessage?.trim() && (
        <div data-testid="no-rows-msg">{noRowsMessage.trim()}</div>
      )}
      {rows?.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`} onClick={() => onRowClick?.(row)}>
          <span>{row.displayName}</span>
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

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_LIST_ITEMS: (UserDbqTrainingListItem & { id: string; displayName: string })[] = [
  {
    id: "1", Id: "1", UserName: "danieladams", FirstName: "adams", LastName: "daniel",
    Email: "danieladams@test.com", Roles: "Provider", NPI: "222222222", IsEnabled: true,
    displayName: "daniel, adams",
  },
  {
    id: "2", Id: "2", UserName: "janesmith", FirstName: "Jane", LastName: "Smith",
    Email: "janesmith@test.com", Roles: "Provider", NPI: "333333333", IsEnabled: false,
    displayName: "Smith, Jane",
  },
];

// ─── Test suite ───────────────────────────────────────────────────────────────
describe("UserDbqTrainingList component", () => {
  const { searchUserDbqTraining } = jest.requireMock("../../services/user-dbq-training");
  const { addUserDbqTrainingTab, deleteUserDbqTrainingTab } =
    jest.requireMock("../../store/slice/ui-slice");

  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui:    { userDbqTrainingTabs: [], openStates: { sideMenu: false } },
      })
    );
    (searchUserDbqTraining as jest.Mock).mockResolvedValue([]);
    (jest.requireMock("@mui/material").useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  // ─── Initial render ────────────────────────────────────────────────────

  it("renders without crashing", () => {
    renderWithTheme(<UserDbqTrainingList />);
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  it("shows info alert before any search", () => {
    renderWithTheme(<UserDbqTrainingList />);
    expect(
      screen.getByText(/Enter search criteria above to view provider training records/i)
    ).toBeInTheDocument();
  });

  it("renders search input field", () => {
    renderWithTheme(<UserDbqTrainingList />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("renders 'Add User' button", () => {
    renderWithTheme(<UserDbqTrainingList />);
    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
  });

  it("DataGrid starts with zero rows", () => {
    renderWithTheme(<UserDbqTrainingList />);
    expect(screen.getByTestId("rows-count")).toHaveTextContent("0");
  });

  // ─── Search interactions ───────────────────────────────────────────────

  it("typing updates the search input value", () => {
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "daniel" } });
    expect(input.value).toBe("daniel");
  });

  it("pressing Enter calls searchUserDbqTraining with the trimmed query", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: " daniel " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(searchUserDbqTraining).toHaveBeenCalledWith("daniel")
    );
  });

  it("pressing Enter hides the info alert", async () => {
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(
        screen.queryByText(/Enter search criteria above/i)
      ).not.toBeInTheDocument()
    );
  });

  it("search results appear in the grid after Enter search", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "daniel" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(screen.getByTestId("rows-count")).toHaveTextContent(String(MOCK_LIST_ITEMS.length))
    );
  });

  it("clicking 'Search' button calls searchUserDbqTraining", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "daniel" } });
    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
    await waitFor(() => expect(searchUserDbqTraining).toHaveBeenCalled());
  });

  it("empty query: sets hasSearched but does NOT call the API", async () => {
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(screen.queryByText(/Enter search criteria/i)).not.toBeInTheDocument()
    );
    expect(searchUserDbqTraining).not.toHaveBeenCalled();
    expect(screen.getByTestId("rows-count")).toHaveTextContent("0");
  });

  it("shows 0 rows on search error", async () => {
    (searchUserDbqTraining as jest.Mock).mockRejectedValue(new Error("Network error"));
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "fail" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(screen.getByTestId("rows-count")).toHaveTextContent("0")
    );
  });

  it("shows 'no users found' message when results are empty after search", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue([]);
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "nobody" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(screen.getByTestId("no-rows-msg")).toBeInTheDocument()
    );
  });

  // ─── Row click / navigation (Issue 2) ──────────────────────────────────

  it("clicking a row body does not dispatch addUserDbqTrainingTab or navigate", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "daniel" } });
    fireEvent.keyDown(screen.getByPlaceholderText("Search"), { key: "Enter" });
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getByTestId("row-1"));
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("clicking 'Edit' button dispatches addUserDbqTrainingTab and navigates to the details path", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "daniel" } });
    fireEvent.keyDown(screen.getByPlaceholderText("Search"), { key: "Enter" });
    await waitFor(() => screen.getByTestId("row-1"));
    const editButtons = screen.getAllByRole("button", { name: /^edit$/i });
    fireEvent.click(editButtons[0]);
    expect(mockDispatch).toHaveBeenCalledWith(
      addUserDbqTrainingTab(expect.objectContaining({ id: "1" }))
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/user-dbq-training/1"
    );
  });

  // ─── Action button ─────────────────────────────────────────────────────

  it("Edit action button renders in each data row", async () => {
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "daniel" } });
    fireEvent.keyDown(screen.getByPlaceholderText("Search"), { key: "Enter" });
    await waitFor(() => screen.getByTestId("row-1"));
    const editButtons = screen.getAllByRole("button", { name: /^edit$/i });
    expect(editButtons.length).toBe(MOCK_LIST_ITEMS.length);
  });

  // ─── Add User button ───────────────────────────────────────────────────

  it("clicking 'Add User' navigates to the create path", () => {
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/users/create"
    );
  });

  // ─── Tab click ─────────────────────────────────────────────────────────

  it("tab click uses the label as path when no matching tab exists", () => {
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.click(screen.getByTestId("tab-click"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/user-dbq-training/1"
    );
  });

  it("tab click uses the tab email when a matching tab is found", () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: {
          userDbqTrainingTabs: [{ id: "5", email: "u@test.com", userName: "1" }],
          openStates: { sideMenu: false },
        },
      })
    );
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.click(screen.getByTestId("tab-click"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/user-dbq-training/u@test.com"
    );
  });

  // ─── Tab operations ────────────────────────────────────────────────────

  it("closing a tab dispatches deleteUserDbqTrainingTab", () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "light" },
        ui: { userDbqTrainingTabs: [{ id: "5", email: "u@t.com", userName: "User" }], openStates: { sideMenu: false } },
      })
    );
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.click(screen.getByTestId("close-tab-5"));
    expect(mockDispatch).toHaveBeenCalledWith(
      deleteUserDbqTrainingTab(expect.anything())
    );
  });

  it("clicking tab title navigates to base path", () => {
    renderWithTheme(<UserDbqTrainingList />);
    fireEvent.click(screen.getByTestId("tab-title-click"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-management/user-dbq-training");
  });

  // ─── Dark mode ─────────────────────────────────────────────────────────

  it("renders correctly in dark mode", () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "dark" },
        ui: { userDbqTrainingTabs: [], openStates: { sideMenu: true } },
      })
    );
    renderWithTheme(<UserDbqTrainingList />, "dark");
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  // ─── Window resize ─────────────────────────────────────────────────────

  it("handles window resize without errors", () => {
    renderWithTheme(<UserDbqTrainingList />);
    window.innerWidth = 480;
    fireEvent(window, new Event("resize"));
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
  });

  // ─── Dark mode with search rows ────────────────────────────────────────────

  it("renders search rows in dark mode covering Status renderCell dark branches", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({
        theme: { mode: "dark" },
        ui: { userDbqTrainingTabs: [], openStates: { sideMenu: false } },
      })
    );
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />, "dark");
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "daniel" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(screen.getByTestId("rows-count")).toHaveTextContent("2")
    );
    // Click Edit on row 1 in dark mode
    const editButtons = screen.getAllByRole("button", { name: /^edit$/i });
    expect(editButtons.length).toBe(2);
    fireEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/provider-management/user-dbq-training/1"
    );
  });

  // ─── Mobile viewport ───────────────────────────────────────────────────────

  it("renders in mobile viewport covering isMobile branches", () => {
    (jest.requireMock("@mui/material").useMediaQuery as jest.Mock).mockReturnValue(true);
    window.innerWidth = 400;
    renderWithTheme(<UserDbqTrainingList />);
    expect(screen.getByTestId("tabs-header")).toBeInTheDocument();
    window.innerWidth = 1024;
  });

  // ─── Non-Enter key ─────────────────────────────────────────────────────────

  it("pressing a non-Enter key in search field does not call the API", () => {
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.keyDown(input, { key: "a", code: "KeyA" });
    expect(searchUserDbqTraining).not.toHaveBeenCalled();
  });

  // ─── formatDisplayName fallback ─────────────────────────────────────────────

  it("openDetails falls back to row.UserName as tabLabel when formatDisplayName returns empty string", async () => {
    const { formatDisplayName } = jest.requireMock("../../services/user-dbq-training");
    (formatDisplayName as jest.Mock).mockReturnValue("");
    (searchUserDbqTraining as jest.Mock).mockResolvedValue(MOCK_LIST_ITEMS);
    renderWithTheme(<UserDbqTrainingList />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "daniel" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => screen.getByTestId("row-1"));
    const editBtn = screen.getAllByRole("button", { name: /^edit$/i })[0];
    fireEvent.click(editBtn);
    expect(mockDispatch).toHaveBeenCalledWith(
      addUserDbqTrainingTab(expect.objectContaining({ userName: "danieladams" }))
    );
  });
});
