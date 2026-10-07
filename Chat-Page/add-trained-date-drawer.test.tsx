/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import AddTrainedDateDrawer from "./add-trained-date-drawer";

// ─── Theme wrapper ────────────────────────────────────────────────────────────
const renderWithTheme = (ui: React.ReactElement, mode: "light" | "dark" = "light") => {
  const theme = createTheme({ palette: { mode, primary: { main: "#244794" } } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// ─── Static asset mock ────────────────────────────────────────────────────────
jest.mock("../../../assets/calendar-month.svg", () => "calendar-month-svg");

// ─── Theme primitives ─────────────────────────────────────────────────────────
jest.mock("../../../theme", () => ({
  THEME_PRIMITIVES: {
    white: "#ffffff",
    black: "#000000",
    mutedTextOnDark: "#aaaaaa",
    uploadButtonBg: "#757575",
    inputBgDark: "#1a1a2e",
    strokeDark: "#444444",
    stroke: "#e0e0e0",
  },
}));

// ─── ReusableDrawer ───────────────────────────────────────────────────────────
jest.mock("../../../ui/reusable-drawer", () => ({
  __esModule: true,
  default: ({ open, children, onSave, onCancel, disableSave, title }: any) =>
    open ? (
      <div data-testid="reusable-drawer">
        <span data-testid="drawer-title">{title}</span>
        {children}
        <button data-testid="drawer-save" onClick={onSave} disabled={!!disableSave}>
          Save
        </button>
        <button data-testid="drawer-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

// ─── MUI X DatePicker mocks ───────────────────────────────────────────────────
jest.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: any) => <>{children}</>,
}));
jest.mock("@mui/x-date-pickers/AdapterDateFns", () => ({
  AdapterDateFns: class {},
}));

/**
 * Minimal DatePicker stand-in:
 * – Renders an input whose value reflects whether a date is selected.
 * – onChange fires with June 15 2024 on any non-empty value, null on empty.
 */
jest.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: ({ value, onChange, onOpen, onClose, slots, slotProps }: any) => (
    <div data-testid="date-picker-wrapper">
      <input
        data-testid="date-picker-input"
        value={value instanceof Date || value ? "date-set" : ""}
        onChange={(e) =>
          onChange(e.target.value ? new Date(2024, 5, 15) : null)
        }
        onClick={() => slotProps?.textField?.onClick?.()}
      />
      <button data-testid="picker-open-btn" onClick={onOpen}>Open</button>
      <button data-testid="picker-close-btn" onClick={onClose}>Close</button>
      {slots?.openPickerIcon && (
        <div data-testid="picker-icon">{slots.openPickerIcon()}</div>
      )}
      {slotProps?.actionBar && (
        <div
          data-testid="picker-action-bar"
          data-actions={JSON.stringify(slotProps.actionBar.actions)}
        >
          {slotProps.actionBar.actions?.map((act: string) => (
            <button key={act} data-testid={`picker-action-${act}`}>
              {act}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

// ─── Test suite ───────────────────────────────────────────────────────────────
describe("AddTrainedDateDrawer component", () => {
  const mockOnClose = jest.fn();
  const mockOnSave  = jest.fn();

  const defaultProps = {
    open:        true,
    isDarkMode:  false,
    initialDate: null as string | null | undefined,
    onClose:     mockOnClose,
    onSave:      mockOnSave,
  };

  beforeEach(() => jest.clearAllMocks());

  // ─── Visibility ─────────────────────────────────────────────────────────

  it("does not render when open=false", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} open={false} />);
    expect(screen.queryByTestId("reusable-drawer")).not.toBeInTheDocument();
  });

  it("renders the drawer when open=true", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    expect(screen.getByTestId("reusable-drawer")).toBeInTheDocument();
  });

  it("shows 'Add Trained Date' as the drawer title", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    expect(screen.getByTestId("drawer-title")).toHaveTextContent("Add Trained Date");
  });

  it("renders the 'Trained Date' label", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    expect(screen.getByText("Trained Date")).toBeInTheDocument();
  });

  // ─── disableSave logic ───────────────────────────────────────────────────

  it("Save is disabled when initialDate is null", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate={null} />);
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
  });

  it("Save is disabled when initialDate is undefined", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate={undefined} />);
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
  });

  it("Save is disabled when initialDate is an invalid date string", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="not-a-date" />);
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
  });

  it("Save is enabled when initialDate is a valid MM/dd/yyyy string", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="06/15/2024" />);
    expect(screen.getByTestId("drawer-save")).not.toBeDisabled();
  });

  // ─── Date picker interaction ──────────────────────────────────────────────

  it("selecting a date via picker enables the Save button", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate={null} />);
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
    fireEvent.change(screen.getByTestId("date-picker-input"), { target: { value: "date-chosen" } });
    expect(screen.getByTestId("drawer-save")).not.toBeDisabled();
  });

  it("clearing a previously selected date disables Save", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="06/15/2024" />);
    expect(screen.getByTestId("drawer-save")).not.toBeDisabled();
    fireEvent.change(screen.getByTestId("date-picker-input"), { target: { value: "" } });
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
  });

  // ─── onSave ───────────────────────────────────────────────────────────────

  it("clicking Save calls onSave with the formatted MM/dd/yyyy date (from initialDate)", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="06/15/2024" />);
    fireEvent.click(screen.getByTestId("drawer-save"));
    expect(mockOnSave).toHaveBeenCalledWith("06/15/2024");
  });

  it("clicking Save after picker selection calls onSave with '06/15/2024'", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate={null} />);
    fireEvent.change(screen.getByTestId("date-picker-input"), { target: { value: "date-chosen" } });
    fireEvent.click(screen.getByTestId("drawer-save"));
    // Our mock DatePicker onChange provides new Date(2024, 5, 15) → "06/15/2024"
    expect(mockOnSave).toHaveBeenCalledWith("06/15/2024");
  });

  it("onSave is called exactly once per Save click", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="06/15/2024" />);
    fireEvent.click(screen.getByTestId("drawer-save"));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it("onSave is NOT called when Save button is disabled (no date)", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate={null} />);
    // Button is disabled — cannot click it normally; verify no call occurred
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  // ─── onClose / Cancel ─────────────────────────────────────────────────────

  it("clicking Cancel calls onClose", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId("drawer-cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("clicking Cancel does NOT call onSave", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="06/15/2024" />);
    fireEvent.click(screen.getByTestId("drawer-cancel"));
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("asks for confirmation when Cancel is clicked after the date changes", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate={null} />);
    fireEvent.change(screen.getByTestId("date-picker-input"), { target: { value: "06/15/2024" } });
    fireEvent.click(screen.getByTestId("drawer-cancel"));
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^yes$/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the drawer open when No is clicked on the unsaved-changes warning", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} initialDate="06/15/2024" />);
    fireEvent.change(screen.getByTestId("date-picker-input"), { target: { value: "" } });
    fireEvent.click(screen.getByTestId("drawer-cancel"));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("reusable-drawer")).toBeInTheDocument();
  });

  // ─── Re-open / re-initialization ─────────────────────────────────────────

  it("resets to null when re-opened with null initialDate after having a date", () => {
    const theme = createTheme({ palette: { mode: "light", primary: { main: "#244794" } } });
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <AddTrainedDateDrawer {...defaultProps} open={false} initialDate="06/15/2024" />
      </ThemeProvider>
    );
    rerender(
      <ThemeProvider theme={theme}>
        <AddTrainedDateDrawer {...defaultProps} open={true} initialDate={null} />
      </ThemeProvider>
    );
    expect(screen.getByTestId("drawer-save")).toBeDisabled();
  });

  it("initializes with a valid date when re-opened with a new initialDate", () => {
    const theme = createTheme({ palette: { mode: "light", primary: { main: "#244794" } } });
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <AddTrainedDateDrawer {...defaultProps} open={false} initialDate={null} />
      </ThemeProvider>
    );
    rerender(
      <ThemeProvider theme={theme}>
        <AddTrainedDateDrawer {...defaultProps} open={true} initialDate="06/15/2024" />
      </ThemeProvider>
    );
    expect(screen.getByTestId("drawer-save")).not.toBeDisabled();
  });

  // ─── textField onClick (slotProps) ───────────────────────────────────────

  it("clicking the date input (slotProps.textField.onClick) calls setPickerOpen(true)", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId("date-picker-input"));
    expect(screen.getByTestId("reusable-drawer")).toBeInTheDocument();
  });

  // ─── Picker open/close callbacks ─────────────────────────────────────────

  it("onOpen callback sets picker to open state without crashing", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId("picker-open-btn"));
    expect(screen.getByTestId("reusable-drawer")).toBeInTheDocument();
  });

  it("onClose callback sets picker to closed state without crashing", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId("picker-close-btn"));
    expect(screen.getByTestId("reusable-drawer")).toBeInTheDocument();
  });

  it("openPickerIcon slot renders the calendar icon element", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    expect(screen.getByTestId("picker-icon")).toBeInTheDocument();
  });

  // ─── Dark mode ────────────────────────────────────────────────────────────

  it("renders correctly in dark mode", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} isDarkMode={true} />, "dark");
    expect(screen.getByTestId("reusable-drawer")).toBeInTheDocument();
    expect(screen.getByText("Trained Date")).toBeInTheDocument();
  });

  // ─── slotProps.actionBar (Issue 4) ────────────────────────────────────────

  it("configures actionBar with 'clear' and 'today' actions (Issue 4)", () => {
    renderWithTheme(<AddTrainedDateDrawer {...defaultProps} />);
    const actionBar = screen.getByTestId("picker-action-bar");
    expect(actionBar).toBeInTheDocument();
    expect(actionBar.getAttribute("data-actions")).toBe(JSON.stringify(["clear", "today"]));
    expect(screen.getByTestId("picker-action-clear")).toBeInTheDocument();
    expect(screen.getByTestId("picker-action-today")).toBeInTheDocument();
  });
});
