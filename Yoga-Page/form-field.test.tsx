import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import FormField from "./form-field";

const renderWithTheme = (ui: React.ReactElement) => {
    const theme = createTheme({
        palette: { mode: "light" },
    });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("FormField", () => {
    it("renders label and input with value", () => {
        renderWithTheme(
            <FormField
                label="Email"
                field="email"
                value="user@example.com"
                onChange={jest.fn()}
            />
        );

        expect(screen.getByText("Email")).toBeInTheDocument();
        const input = screen.getByDisplayValue("user@example.com") as HTMLInputElement;
        expect(input).toBeInTheDocument();
    });

    it("shows required asterisk when required is true", () => {
        renderWithTheme(
            <FormField
                label="Name"
                field="name"
                required
                value=""
                onChange={jest.fn()}
            />
        );

        // Asterisk rendered next to label
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("is readOnly when not adding or editing", () => {
        renderWithTheme(
            <FormField
                label="Name"
                field="name"
                value="John"
                onChange={jest.fn()}
            />
        );
        const input = screen.getByDisplayValue("John") as HTMLInputElement;
        expect(input.readOnly).toBe(true);
    });

    it("is editable when isEditing is true", () => {
        renderWithTheme(
            <FormField
                label="Name"
                field="name"
                value="John"
                isEditing
                onChange={jest.fn()}
            />
        );
        const input = screen.getByDisplayValue("John") as HTMLInputElement;
        expect(input.readOnly).toBe(false);
    });

    it("is editable when isAdding is true", () => {
        renderWithTheme(
            <FormField
                label="Name"
                field="name"
                value=""
                isAdding
                onChange={jest.fn()}
            />
        );
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.readOnly).toBe(false);
    });

    it("calls onChange with field and new value", () => {
        const onChange = jest.fn();
        renderWithTheme(
            <FormField
                label="Name"
                field="name"
                value=""
                isEditing
                onChange={onChange}
            />
        );
        const input = screen.getByRole("textbox") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "Alice" } });
        expect(onChange).toHaveBeenCalledWith("name", "Alice");
    });

    it("renders error message when error provided", () => {
        renderWithTheme(
            <FormField
                label="Name"
                field="name"
                value=""
                onChange={jest.fn()}
                error="Name is required"
            />
        );
        expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    it("handles disabled state", () => {
        renderWithTheme(
            <FormField
                label="Email"
                field="email"
                value="test@example.com"
                onChange={jest.fn()}
                disabled={true}
                isEditing={true}
            />
        );

        const input = screen.getByDisplayValue("test@example.com") as HTMLInputElement;
        expect(input.disabled).toBe(true);
    });

    it("handles different input types", () => {
        renderWithTheme(
            <FormField
                label="Date"
                field="date"
                type="date"
                value="2024-01-01"
                onChange={jest.fn()}
                isEditing={true}
            />
        );

        const input = screen.getByDisplayValue("2024-01-01") as HTMLInputElement;
        expect(input.type).toBe("date");
    });

    it("handles textarea type", () => {
        renderWithTheme(
            <FormField
                label="Description"
                field="description"
                type="textarea"
                value="Some description"
                onChange={jest.fn()}
                isEditing={true}
            />
        );

        const textarea = screen.getByDisplayValue("Some description") as HTMLTextAreaElement;
        expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("calls onChange for textarea", () => {
        const onChange = jest.fn();
        renderWithTheme(
            <FormField
                label="Description"
                field="description"
                type="textarea"
                value=""
                onChange={onChange}
                isEditing={true}
            />
        );

        const textarea = screen.getByRole("textbox");
        fireEvent.change(textarea, { target: { value: "New description" } });
        expect(onChange).toHaveBeenCalledWith("description", "New description");
    });

    it("applies custom styles", () => {
        const customStyles = {
            formGroup: { marginBottom: "20px" },
            label: { color: "blue" },
            input: { backgroundColor: "yellow" },
        };

        renderWithTheme(
            <FormField
                label="Test"
                field="test"
                value=""
                onChange={jest.fn()}
                styles={customStyles}
            />
        );

        const label = screen.getByText("Test");
        expect(label).toBeInTheDocument();
    });

    it("handles borderIncludedField fields correctly", () => {
        renderWithTheme(
            <FormField
                label="VBA Train ID"
                field="VBATrainId"
                value=""
                isEditing={true} // Fixed: Added true flag to trigger the placeholder conditional logic
                onChange={jest.fn()}
            />
        );

        const input = screen.getByPlaceholderText("Type VBA Train ID");
        expect(input).toBeInTheDocument();
    });

    it("handles empty value with borderIncludedField", () => {
        renderWithTheme(
            <FormField
                label="User Special Considerations"
                field="UserSpecialConsiderations"
                value=""
                isEditing={true} // Fixed: Added true flag to trigger the placeholder conditional logic
                onChange={jest.fn()}
            />
        );

        const input = screen.getByPlaceholderText("Type User Special Considerations");
        expect(input).toBeInTheDocument();
    });

    it("renders custom placeholder when provided", () => {
        renderWithTheme(
            <FormField
                label="First Name"
                field="FirstName"
                placeholder="First Name"
                value=""
                isEditing={true}
                onChange={jest.fn()}
            />
        );

        const input = screen.getByPlaceholderText("First Name");
        expect(input).toBeInTheDocument();
    });

    it("falls back to label as placeholder when isEditing and no placeholder or borderIncludedField", () => {
        renderWithTheme(
            <FormField
                label="First Name"
                field="FirstName"
                value=""
                isEditing={true}
                onChange={jest.fn()}
            />
        );

        const input = screen.getByPlaceholderText("First Name");
        expect(input).toBeInTheDocument();
    });

    it("handles isDrawer prop", () => {
        renderWithTheme(
            <FormField
                label="Test"
                field="test"
                value=""
                onChange={jest.fn()}
                isDrawer={true}
                isEditing={true}
            />
        );

        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
    });

    it("handles themeErrorColor prop", () => {
        renderWithTheme(
            <FormField
                label="Test"
                field="test"
                value=""
                onChange={jest.fn()}
                error="Custom error"
                themeErrorColor="#FF0000"
            />
        );

        const errorText = screen.getByText("Custom error");
        expect(errorText).toBeInTheDocument();
    });
});