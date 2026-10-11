/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

import AccommodationConfig from "./accommodation-config";
import { AccommodationItem } from "../../services/accommodation-config";

// ─── Theme wrapper ────────────────────────────────────────────────────────────
const renderWithTheme = (ui: React.ReactElement, mode: "light" | "dark" = "light") => {
  const theme = createTheme({ palette: { mode, primary: { main: "#244794" } } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// ─── Router ───────────────────────────────────────────────────────────────────
jest.mock("react-router", () => ({
  useNavigate: jest.fn(() => jest.fn()),
}));

// ─── Redux ────────────────────────────────────────────────────────────────────
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

// ─── Services ─────────────────────────────────────────────────────────────────
jest.mock("../../services/accommodation-config", () => ({
  getAccommodations:   jest.fn(),
  addAccommodation:    jest.fn(),
  deleteAccommodation: jest.fn(),
  editAccommodation:   jest.fn(),
}));

// ─── toast ────────────────────────────────────────────────────────────────────
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// ─── UI component mocks ───────────────────────────────────────────────────────
jest.mock("../../ui/data-grid-table", () => ({
  __esModule: true,
  default: ({ rows, columns, loading }: any) => (
    <div data-testid="data-grid" data-loading={String(loading)}>
      <div data-testid="rows-count">{rows?.length ?? 0}</div>
      {rows?.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns?.map((col: any) => (
            <div key={col.field}>
              {col.renderCell
                ? col.renderCell({ row, value: row[col.field] })
                : <span>{String(row[col.field] ?? "")}</span>
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../../layouts/content-box", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="content-box">{children}</div>,
}));

jest.mock("../../components/page-title-chip", () => ({
  __esModule: true,
  default: ({ title }: any) => <div data-testid="page-title-chip">{title}</div>,
}));

jest.mock("../../ui/confirmation-modal", () => ({
  __esModule: true,
  default: ({ open, title, onConfirm, onCancel, onClose }: any) =>
    open ? (
      <div data-testid="confirmation-modal">
        <span data-testid="modal-title">{title}</span>
        <button data-testid="confirm-btn" onClick={onConfirm}>Confirm</button>
        <button data-testid="cancel-btn"  onClick={onCancel}>Cancel</button>
        <button data-testid="close-btn"   onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// ─── Mock data ────────────────────────────────────────────────────────────────
const SEED_ROWS: AccommodationItem[] = [
  { id: "1", name: "Sign Language Interpreters", description: "Need Sign Language",   visibility: "Internal" },
  { id: "2", name: "Clutches",                   description: "Need Clutches",        visibility: "Internal" },
  { id: "3", name: "Hand Stick",                 description: "Need Hand Stick",      visibility: "Internal" },
];

const NEW_ITEM: AccommodationItem = {
  id: "99", name: "Wheelchair Ramp", description: "Need a ramp", visibility: "Internal",
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe("AccommodationConfig component", () => {
  const {
    getAccommodations,
    addAccommodation,
    deleteAccommodation,
  } = jest.requireMock("../../services/accommodation-config");

  const { toast } = jest.requireMock("react-toastify");

  beforeEach(() => {
    jest.clearAllMocks();
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "light" } })
    );
    (getAccommodations as jest.Mock).mockResolvedValue([...SEED_ROWS]);
    (addAccommodation    as jest.Mock).mockResolvedValue(NEW_ITEM);
    (deleteAccommodation as jest.Mock).mockResolvedValue(undefined);
  });

  // ─── Initial load ────────────────────────────────────────────────────────

  it("renders without crashing", async () => {
    renderWithTheme(<AccommodationConfig />);
    expect(screen.getByTestId("page-title-chip")).toBeInTheDocument();
  });

  it("shows the 'Veteran Accommodations' chip title", () => {
    renderWithTheme(<AccommodationConfig />);
    expect(screen.getByTestId("page-title-chip")).toHaveTextContent("Veteran Accommodations");
  });

  it("renders rows and add form in dark mode covering isDarkMode branches", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "dark" } })
    );
    renderWithTheme(<AccommodationConfig />, "dark");
    await waitFor(() => expect(getAccommodations).toHaveBeenCalled());
    // DataGrid rows render with isDarkMode=true → covers renderCell dark branches (lines 139-161)
    await waitFor(() =>
      expect(screen.getByTestId("rows-count")).toHaveTextContent("3")
    );
    // Click Add New Record → form renders with isDarkMode=true → covers lines 303-342, 390, 425
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    expect(screen.getByPlaceholderText("Type Name")).toBeInTheDocument();
  });

  it("calls getAccommodations on mount", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => expect(getAccommodations).toHaveBeenCalledTimes(1));
  });

  it("renders all loaded accommodation rows in the grid", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => {
      expect(screen.getByTestId("rows-count")).toHaveTextContent("3");
    });
  });

  it("shows the 'Add New Record' button in list view", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add new record/i })).toBeInTheDocument()
    );
  });

  // ─── Switching to add view ───────────────────────────────────────────────

  it("clicking 'Add New Record' shows the add form", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    expect(screen.getByPlaceholderText("Type Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type Description")).toBeInTheDocument();
  });

  it("clicking 'Add New Record' shows 'Add New Record' as a form heading", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    // The form heading is a Typography inside the form panel (distinct from list btn)
    const headings = screen.getAllByText(/add new record/i);
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking 'Cancel' from add form returns to list view", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add new record/i })).toBeInTheDocument()
    );
  });

  // ─── Validation ──────────────────────────────────────────────────────────

  it("shows 'Name Required' error when saving with empty name", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByText("Name Required")).toBeInTheDocument()
    );
    expect(addAccommodation).not.toHaveBeenCalled();
  });

  it("shows 'Description Required' error when name filled but description empty", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"), { target: { value: "New Item" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByText("Description Required")).toBeInTheDocument()
    );
    expect(addAccommodation).not.toHaveBeenCalled();
  });

  it("shows duplicate name error when name already exists (case-insensitive)", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"), { target: { value: "CLUTCHES" } });
    fireEvent.change(screen.getByPlaceholderText("Type Description"), { target: { value: "Desc" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByText(/name already exists/i)).toBeInTheDocument()
    );
    expect(addAccommodation).not.toHaveBeenCalled();
  });

  it("clears the description error when the user types in the description field", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"), { target: { value: "Unique Item" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() => screen.getByText("Description Required"));
    fireEvent.change(screen.getByPlaceholderText("Type Description"), { target: { value: "d" } });
    await waitFor(() =>
      expect(screen.queryByText("Description Required")).not.toBeInTheDocument()
    );
  });

  it("clears the name error when the user starts typing a new value", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() => screen.getByText("Name Required"));

    fireEvent.change(screen.getByPlaceholderText("Type Name"), { target: { value: "x" } });
    await waitFor(() =>
      expect(screen.queryByText("Name Required")).not.toBeInTheDocument()
    );
  });

  // ─── Successful save ─────────────────────────────────────────────────────

  it("calls addAccommodation with trimmed name and description on valid save", async () => {
    (getAccommodations as jest.Mock)
      .mockResolvedValueOnce([...SEED_ROWS])           // initial load
      .mockResolvedValueOnce([...SEED_ROWS, NEW_ITEM]); // post-save refresh

    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"),        { target: { value: "  Wheelchair Ramp  " } });
    fireEvent.change(screen.getByPlaceholderText("Type Description"), { target: { value: "  Need a ramp  " } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(addAccommodation).toHaveBeenCalledWith("Wheelchair Ramp", "Need a ramp")
    );
  });

  it("shows success toast after a successful save", async () => {
    (getAccommodations as jest.Mock)
      .mockResolvedValueOnce([...SEED_ROWS])
      .mockResolvedValueOnce([...SEED_ROWS, NEW_ITEM]);

    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"),        { target: { value: "New Ramp" } });
    fireEvent.change(screen.getByPlaceholderText("Type Description"), { target: { value: "Desc" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("The new record has been created and saved.")
    );
  });

  it("navigates back to list view after successful save", async () => {
    (getAccommodations as jest.Mock)
      .mockResolvedValueOnce([...SEED_ROWS])
      .mockResolvedValueOnce([...SEED_ROWS, NEW_ITEM]);

    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"),        { target: { value: "New Ramp" } });
    fireEvent.change(screen.getByPlaceholderText("Type Description"), { target: { value: "Desc" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add new record/i })).toBeInTheDocument()
    );
  });

  it("shows error toast when addAccommodation throws", async () => {
    (addAccommodation as jest.Mock).mockRejectedValue(new Error("Server error"));

    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByRole("button", { name: /add new record/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new record/i }));
    fireEvent.change(screen.getByPlaceholderText("Type Name"),        { target: { value: "X" } });
    fireEvent.change(screen.getByPlaceholderText("Type Description"), { target: { value: "D" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to save the accommodation.")
    );
  });

  // ─── Delete flow ─────────────────────────────────────────────────────────

  it("clicking 'Delete' in a row opens the confirmation modal", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => expect(screen.getByTestId("row-1")).toBeInTheDocument());

    // Delete button is rendered via renderCell in the actions column
    const deleteBtn = screen.getAllByRole("button", { name: /delete/i })[0];
    fireEvent.click(deleteBtn);
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
  });

  it("confirmation modal shows the 'Delete' title", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Delete");
  });

  it("clicking 'Confirm' in the modal calls deleteAccommodation", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() => expect(deleteAccommodation).toHaveBeenCalled());
  });

  it("clicking 'Confirm' removes the row from the grid", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("rows-count"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("rows-count")).toHaveTextContent("2")
    );
  });

  it("clicking 'Confirm' shows a success toast", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalled()
    );
  });

  it("modal onClose sets deleteTarget to null and closes the modal", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-btn"));
    await waitFor(() =>
      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument()
    );
    expect(deleteAccommodation).not.toHaveBeenCalled();
  });

  it("clicking 'Cancel' in the modal closes it without deleting", async () => {
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("cancel-btn"));
    await waitFor(() =>
      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument()
    );
    expect(deleteAccommodation).not.toHaveBeenCalled();
  });

  it("shows error toast when deleteAccommodation throws", async () => {
    (deleteAccommodation as jest.Mock).mockRejectedValue(new Error("Delete failed"));
    renderWithTheme(<AccommodationConfig />);
    await waitFor(() => screen.getByTestId("row-1"));
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to delete the record.")
    );
  });

  // ─── Dark mode ───────────────────────────────────────────────────────────

  it("renders correctly in dark mode", async () => {
    (useSelector as any).mockImplementation((fn: any) =>
      fn({ theme: { mode: "dark" } })
    );
    renderWithTheme(<AccommodationConfig />, "dark");
    await waitFor(() => expect(getAccommodations).toHaveBeenCalled());
    expect(screen.getByTestId("page-title-chip")).toBeInTheDocument();
  });

  // ─── Loading state ────────────────────────────────────────────────────────

  it("DataGrid shows loading=true while fetching initial data", () => {
    let resolveLoad!: (v: AccommodationItem[]) => void;
    (getAccommodations as jest.Mock).mockReturnValue(
      new Promise<AccommodationItem[]>((res) => { resolveLoad = res; })
    );
    renderWithTheme(<AccommodationConfig />);
    expect(screen.getByTestId("data-grid")).toHaveAttribute("data-loading", "true");
    resolveLoad([]);
  });
});
