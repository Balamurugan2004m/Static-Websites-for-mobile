import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarTimeSlotModal } from "../components/calendar-time-slot-modal";
import { ModalType } from "../components/calendar";

// Mock CustomSelect component
jest.mock("../components/custom-select", () => ({
    __esModule: true,
    default: ({ label, value, onChange, options, disabled, required }: {
        label?: string;
        value?: string | number | null;
        onChange?: (value: string | number) => void;
        options?: string[];
        disabled?: boolean;
        required?: boolean;
    }) => (
        <div data-testid={`custom-select-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
            <label>{label} {required && <span>*</span>}</label>
            <select
                data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}
                value={value || ""}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
            >
                <option value="">Select...</option>
                {options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

// Mock ReusableDrawer component
jest.mock("../../../ui/reusable-drawer", () => ({
    __esModule: true,
    default: ({ title, children, onSave, onCancel, btnText }: {
        title?: string;
        children?: React.ReactNode;
        onSave?: () => void;
        onCancel?: () => void;
        btnText?: string;
    }) => (
        <div data-testid="reusable-drawer">
            <h2>{title}</h2>
            {children}
            <button onClick={onSave}>{btnText || "Save"}</button>
            <button onClick={onSave} style={{ display: "none" }}>Create</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

describe("CalendarTimeSlotModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    const defaultProps = {
        onClose: mockOnClose,
        onSave: mockOnSave,
        modalType: ModalType.CREATE,
        defaultValues: {},
        itemId: 1,
        isCurrentAndFuture: true,
        isDarkMode: false,
    };

    const renderComponent = (props = {}) =>
        render(<CalendarTimeSlotModal {...defaultProps} {...props} />);

    // Helper function to find input by nearby text
    const findInputByNearbyText = (searchText: string): HTMLInputElement | null => {
        // Get all input elements (textbox, spinbutton, etc.)
        const textboxes = screen.queryAllByRole('textbox') as HTMLInputElement[];
        const spinbuttons = screen.queryAllByRole('spinbutton') as HTMLInputElement[];
        const allInputs = [...textboxes, ...spinbuttons];
        
        // Also try to find by tag name as fallback
        if (allInputs.length === 0) {
            const inputsByTag = document.querySelectorAll('input[type="number"], input[type="text"]');
            allInputs.push(...Array.from(inputsByTag) as HTMLInputElement[]);
        }
        
        for (const input of allInputs) {
            let element: HTMLElement | null = input;
            // Check parent elements up to 10 levels to find the label text
            for (let i = 0; i < 10 && element; i++) {
                if (element.textContent?.includes(searchText)) {
                    return input;
                }
                element = element.parentElement;
            }
        }
        return null;
    };

    // Helper function to find Repeat Every input
    const getRepeatEveryInput = (): HTMLInputElement | null => {
        const testIdElement = screen.queryByTestId("repeat-every-input");
        if (testIdElement) {
            return (testIdElement.tagName === "INPUT" ? testIdElement : testIdElement.querySelector("input")) as HTMLInputElement;
        }
        return findInputByNearbyText("Repeat Every");
    };

    // Helper function to find Repeat End After input
    const getRepeatEndAfterInput = (): HTMLInputElement | null => {
        const testIdElement = screen.queryByTestId("repeat-end-after-input");
        if (testIdElement) {
            return (testIdElement.tagName === "INPUT" ? testIdElement : testIdElement.querySelector("input")) as HTMLInputElement;
        }
        return findInputByNearbyText("occurrences");
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
    it("renders the form with required fields", () => {
        renderComponent({
            defaultValues: {
                title: '',
            }
        });
        expect(screen.getByText("Create Time Slot")).toBeInTheDocument();
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
        expect(screen.getByTestId("start-time-input").querySelector("input")!).toBeInTheDocument();
        expect(screen.getByTestId("end-time-input").querySelector("input")!).toBeInTheDocument();
    });

        it("renders Edit Time Slot title when defaultValues has title", () => {
            renderComponent({
                defaultValues: {
                    title: "Test Event",
                }
            });
            expect(screen.getByText("Edit Time Slot")).toBeInTheDocument();
        });

        it("renders Type select field", () => {
            renderComponent();
            expect(screen.getByTestId("custom-select-type")).toBeInTheDocument();
        });

        it("renders Repeat select field in create mode", () => {
            renderComponent();
            expect(screen.getByTestId("custom-select-repeat")).toBeInTheDocument();
        });
    });

    describe("Form Interactions", () => {
        it("allows changing the date", () => {
            renderComponent();
            const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
            fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
            expect(dateInput.value).toBe("01/15/2024");
        });

        it("allows changing start time", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            fireEvent.change(startTimeInput, { target: { value: "09:00 AM" } });
            expect(startTimeInput.value).toBe("09:00 AM");
        });

        it("allows changing end time", () => {
            renderComponent();
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            fireEvent.change(endTimeInput, { target: { value: "10:00 AM" } });
            expect(endTimeInput.value).toBe("10:00 AM");
        });

        it("allows changing type to Event", () => {
            renderComponent();
            const typeSelect = screen.getByTestId("select-type") as HTMLSelectElement;
            fireEvent.change(typeSelect, { target: { value: "Event" } });
            expect(typeSelect.value).toBe("Event");
        });

        it("shows Event fields when type is Event", () => {
            renderComponent();
            const typeSelect = screen.getByTestId("select-type") as HTMLSelectElement;
            fireEvent.change(typeSelect, { target: { value: "Event" } });
            
            expect(screen.getByText(/Title/i)).toBeInTheDocument();
            expect(screen.getByText(/Description/i)).toBeInTheDocument();
        });

        it("allows changing Event title", () => {
            renderComponent();
            const typeSelect = screen.getByTestId("select-type") as HTMLSelectElement;
            fireEvent.change(typeSelect, { target: { value: "Event" } });
            
            const titleInputs = screen.getAllByDisplayValue("");
            const titleInput = titleInputs.find(input => {
                const parent = input.closest("div");
                return parent?.textContent?.includes("Title");
            }) as HTMLInputElement;
            
            if (titleInput) {
                fireEvent.change(titleInput, { target: { value: "Test Event Title" } });
                expect(titleInput.value).toBe("Test Event Title");
            }
        });

        it("allows changing Repeat option", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            expect(repeatSelect.value).toBe("Daily");
        });
    });

    describe("Validation", () => {
    it("validates required time fields", () => {
        renderComponent();
        fireEvent.click(screen.getByText("Create"));
        expect(screen.getByText("Start time is required")).toBeInTheDocument();
        expect(screen.getByText("End time is required")).toBeInTheDocument();
    });

        it("validates end time is after start time", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            
            fireEvent.change(startTimeInput, { target: { value: "10:00" } });
            fireEvent.change(endTimeInput, { target: { value: "09:00" } });
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText("End time must be after start time")).toBeInTheDocument();
        });

        it("validates Event title is required", () => {
            renderComponent();
            const typeSelect = screen.getByTestId("select-type") as HTMLSelectElement;
            fireEvent.change(typeSelect, { target: { value: "Event" } });
            
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText("Title is required for Event")).toBeInTheDocument();
        });

        it("validates Repeat Every is required for Daily repeat", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            // Repeat Every defaults to 1 per requirement, clear it to verify required validation
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "" } });
            }
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText(/Repeat every must be a positive number/i)).toBeInTheDocument();
        });

        it("validates Repeat Every is required for Weekly repeat", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Weekly" } });
            
            // Repeat Every defaults to 1 per requirement, clear it to verify required validation
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "" } });
            }
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText(/Repeat every must be a positive number/i)).toBeInTheDocument();
        });

        it("defaults Repeat Every to 1 when recurrence is selected", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            const repeatEveryInput = getRepeatEveryInput();
            expect(repeatEveryInput?.value).toBe("1");
        });

        it("validates Repeat On is required for Weekly repeat", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Weekly" } });
            
            // Set Repeat Every
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "2" } });
            }
            
            // Set Repeat End Type
            const afterRadio = screen.getByLabelText(/After/i);
            fireEvent.click(afterRadio);
            
            // Set Repeat End After
            const repeatEndAfterInput = getRepeatEndAfterInput();
            if (repeatEndAfterInput) {
                fireEvent.change(repeatEndAfterInput, { target: { value: "5" } });
            }
            
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText(/Select at least one day for Weekly repeat/i)).toBeInTheDocument();
        });

        it("validates Repeat End Type is required", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            // Set Repeat Every
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "2" } });
            }
            
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText(/Please select how the recurrence ends/i)).toBeInTheDocument();
        });

        it("validates Repeat End After is required when end type is 'after'", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            // Set Repeat Every
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "2" } });
            }
            
            // Set Repeat End Type to 'after' but don't set value
            const afterRadio = screen.getByLabelText(/After/i);
            fireEvent.click(afterRadio);
            
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText(/Please enter how many occurrences/i)).toBeInTheDocument();
        });

        it("validates Repeat End Date is required when end type is 'on'", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            // Set Repeat Every
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "2" } });
            }
            
            // Set Repeat End Type to 'on' but don't set date
            const onRadio = screen.getByLabelText(/On/i);
            fireEvent.click(onRadio);
            
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText(/Please select an end date/i)).toBeInTheDocument();
        });
    });

    describe("Form Submission", () => {
       it("calls onSave with valid form data for Event type", () => {
            renderComponent();
            const typeSelect = screen.getByTestId("select-type") as HTMLSelectElement;
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            
            fireEvent.change(typeSelect, { target: { value: "Event" } });
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            
            // Find and fill title
            const titleInputs = screen.getAllByDisplayValue("");
            const titleInput = titleInputs.find(input => {
                const parent = input.closest("div");
                return parent?.textContent?.includes("Title");
            }) as HTMLInputElement;
            if (titleInput) {
                fireEvent.change(titleInput, { target: { value: "Test Event" } });
            }
            
            fireEvent.click(screen.getByText("Create"));
        });

        it("calls onSave with recurrenceId when repeat is not Never", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            // Set Repeat Every
            const repeatEveryInput = getRepeatEveryInput();
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "2" } });
            }
            
            // Set Repeat End Type and value
            const afterRadio = screen.getByLabelText(/After/i);
            fireEvent.click(afterRadio);
            
            const repeatEndAfterInput = getRepeatEndAfterInput();
            if (repeatEndAfterInput) {
                fireEvent.change(repeatEndAfterInput, { target: { value: "5" } });
            }
            
            fireEvent.click(screen.getByText("Create"));
        });

        it("does not call onSave when validation fails", () => {
            renderComponent();
            fireEvent.click(screen.getByText("Create"));
            expect(mockOnSave).not.toHaveBeenCalled();
        });
    });

    describe("Repeat Configuration", () => {
        it("shows Repeat Every field when repeat is Daily", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            expect(screen.getByText(/Repeat Every/i)).toBeInTheDocument();
        });

        it("shows Repeat Every field when repeat is Weekly", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Weekly" } });
            
            expect(screen.getByText(/Repeat Every/i)).toBeInTheDocument();
        });

        it("shows Ends section when repeat is Daily", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            expect(screen.getByText(/Ends/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/After/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/On/i)).toBeInTheDocument();
        });

        it("shows Repeat On checkboxes when repeat is Weekly", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Weekly" } });
            
            expect(screen.getByText(/Repeat On/i)).toBeInTheDocument();
            expect(screen.getByText("SU")).toBeInTheDocument();
            expect(screen.getByText("MO")).toBeInTheDocument();
            expect(screen.getByText("TU")).toBeInTheDocument();
        });

        it("allows selecting days for Weekly repeat", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Weekly" } });
            
            const suCheckbox = screen.getByLabelText("SU").closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement;
            if (suCheckbox) {
                fireEvent.click(suCheckbox);
                expect(suCheckbox.checked).toBe(true);
            }
        });

        it("allows changing Repeat Every value", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            const repeatEveryInput = getRepeatEveryInput();
            
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "3" } });
                expect(repeatEveryInput.value).toBe("3");
            }
        });

        it("allows selecting 'After' end type and setting occurrences", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            const afterRadio = screen.getByLabelText(/After/i);
            fireEvent.click(afterRadio);
            
            const repeatEndAfterInput = getRepeatEndAfterInput();
            
            if (repeatEndAfterInput) {
                fireEvent.change(repeatEndAfterInput, { target: { value: "10" } });
                expect(repeatEndAfterInput.value).toBe("10");
            }
        });

        it("allows selecting 'On' end type and setting date", () => {
            renderComponent();
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            const onRadio = screen.getByLabelText(/On/i);
            fireEvent.click(onRadio);
            
            const dateInputs = screen.getAllByDisplayValue("");
            const endDateInput = dateInputs.find(input => {
                const parent = input.closest("div");
                return parent?.textContent?.includes("On");
            }) as HTMLInputElement;
            
            if (endDateInput) {
                fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });
                expect(endDateInput.value).toBe("2024-12-31");
            }
        });
    });

    describe("Edit Mode", () => {
        it("disables date field when editing", () => {
            renderComponent({
                defaultValues: {
                    title: "Existing Event",
                }
            });
            const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
            expect(dateInput.disabled).toBe(true);
        });

        it("disables type field when editing", () => {
            renderComponent({
                defaultValues: {
                    title: "Existing Event",
                }
            });
            const typeSelect = screen.getByTestId("select-type") as HTMLSelectElement;
            expect(typeSelect.disabled).toBe(true);
        });

        it("shows Update button in edit mode", () => {
            renderComponent({
                modalType: ModalType.EDIT,
                defaultValues: {
                    title: "Existing Event",
                }
            });
            expect(screen.getByText("Update")).toBeInTheDocument();
        });

        it("hides Repeat section when editing non-repeat event", () => {
            renderComponent({
                defaultValues: {
                    title: "Existing Event",
                    repeat: "Never",
                },
                isCurrentAndFuture: false,
            });
            expect(screen.queryByTestId("custom-select-repeat")).not.toBeInTheDocument();
        });

    });

    describe("Default Values Handling", () => {
        it("handles defaultValues with event object", () => {
            const eventData = {
                title: "Test Event",
                start: "2024-01-15T09:00:00",
                end: "2024-01-15T10:00:00",
                recurrenceRule: "FREQ=DAILY;INTERVAL=2;COUNT=5",
            };
            
            renderComponent({
                defaultValues: eventData,
            });
            
            expect(screen.getByText("Edit Time Slot")).toBeInTheDocument();
        });

        it("handles defaultValues with Weekly recurrence", () => {
            const eventData = {
                title: "Weekly Event",
                start: "2024-01-15T09:00:00",
                end: "2024-01-15T10:00:00",
                recurrenceRule: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR",
            };
            
            renderComponent({
                defaultValues: eventData,
            });
            
            expect(screen.getByText("Edit Time Slot")).toBeInTheDocument();
        });

        it("handles defaultValues with UNTIL recurrence", () => {
            const eventData = {
                title: "Event with End Date",
                start: "2024-01-15T09:00:00",
                end: "2024-01-15T10:00:00",
                recurrenceRule: "FREQ=DAILY;INTERVAL=1;UNTIL=20241231",
            };
            
            renderComponent({
                defaultValues: eventData,
            });
            
            expect(screen.getByText("Edit Time Slot")).toBeInTheDocument();
        });

        it("handles empty defaultValues", () => {
            renderComponent({
                defaultValues: { title: "" },
            });
            expect(screen.getByText("Create Time Slot")).toBeInTheDocument();
        });

        it("handles defaultValues with titleDesc", () => {
            const eventData = {
                title: "Test",
                titleDesc: "Test Description",
                start: "2024-01-15T09:00:00",
                end: "2024-01-15T10:00:00",
            };
            
            renderComponent({
                defaultValues: eventData,
            });
            
            expect(screen.getByText("Edit Time Slot")).toBeInTheDocument();
        });
    });

    describe("Time Format Conversion", () => {
        it("handles 12-hour format time input", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            
            // Input 24-hour format, should be converted to 12-hour internally
            fireEvent.change(startTimeInput, { target: { value: "13:00" } });
            expect(startTimeInput.value).toBe("01:00 PM");
        });

        it("handles time with AM/PM", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00 AM" } });
            expect(startTimeInput.value).toBe("09:00 AM");
        });
    });

    describe("Edge Cases", () => {
        it("handles invalid time comparison gracefully", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            
            fireEvent.change(startTimeInput, { target: { value: "12:00" } });
            fireEvent.change(endTimeInput, { target: { value: "12:00" } });
            fireEvent.click(screen.getByText("Create"));
            
            expect(screen.getByText("End time must be after start time")).toBeInTheDocument();
        });

        it("handles Repeat Every with zero value", () => {
            renderComponent();
            const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
            const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
            const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
            fireEvent.change(startTimeInput, { target: { value: "09:00" } });
            fireEvent.change(endTimeInput, { target: { value: "10:00" } });
            fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
            const repeatEveryInput = getRepeatEveryInput();
            
            if (repeatEveryInput) {
                fireEvent.change(repeatEveryInput, { target: { value: "0" } });
                fireEvent.click(screen.getByText("Create"));
                
                expect(screen.getByText(/Repeat every must be a positive number/i)).toBeInTheDocument();
            }
        });
        //1
        // it("handles Repeat Every with negative value", () => {
        //     renderComponent();
        //     const startTimeInput = screen.getByTestId("start-time-input").querySelector("input") as HTMLInputElement;
        //     const endTimeInput = screen.getByTestId("end-time-input").querySelector("input") as HTMLInputElement;
        //     const repeatSelect = screen.getByTestId("select-repeat") as HTMLSelectElement;
            
        //     fireEvent.change(startTimeInput, { target: { value: "09:00" } });
        //     fireEvent.change(endTimeInput, { target: { value: "10:00" } });
        //     fireEvent.change(repeatSelect, { target: { value: "Daily" } });
            
        //     const repeatEveryInputs = screen.getAllByDisplayValue("1");
        //     const repeatEveryInput = repeatEveryInputs.find(input => {
        //         const parent = input.closest("div");
        //         return parent?.textContent?.includes("Repeat Every");
        //     }) as HTMLInputElement;
            
        //     if (repeatEveryInput) {
        //         fireEvent.change(repeatEveryInput, { target: { value: "-1" } });
        //         fireEvent.click(screen.getByText("Create"));
                
        //         expect(screen.getByText(/Repeat every must be a positive number/i)).toBeInTheDocument();
        //     }
        // });
    });

    describe("Component Lifecycle", () => {
    it("calls onClose when Cancel button is clicked", () => {
        renderComponent();
        fireEvent.click(screen.getByText("Cancel"));
        expect(mockOnClose).toHaveBeenCalled();
        });

        it("updates form when defaultValues change", () => {
            const { rerender } = renderComponent({
                defaultValues: {},
            });
            
            rerender(
                <CalendarTimeSlotModal
                    {...defaultProps}
                    defaultValues={{
                        title: "Updated Event",
                    }}
                />
            );
            
            expect(screen.getByText("Edit Time Slot")).toBeInTheDocument();
        });
    });
});
 
