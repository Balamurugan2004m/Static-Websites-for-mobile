import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "./sidebar";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const mockNavigate = jest.fn();
let mockPathname = "/home";

jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useLocation: () => ({ pathname: mockPathname }),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../contexts/AuthContext", () => ({
    useAuth: () => ({
        hasClaim: () => true,
    }),
}));

const createMockStore = (mode: "light" | "dark" = "light") =>
    configureStore({
        reducer: {
            theme: () => ({ mode }),
            authUser: () => ({ authUser: null }),
        },
    });

const renderWithProviders = (
    ui: React.ReactElement,
    mode: "light" | "dark" = "light"
) => {
    const theme = createTheme();
    const store = createMockStore(mode);

    return render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <MemoryRouter>{ui}</MemoryRouter>
            </ThemeProvider>
        </Provider>
    );
};

describe("Sidebar Component", () => {
    const toggleDrawer = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname = "/home";
    });

    test("shows only icons when collapsed", () => {
        renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        expect(screen.queryByText("Home")).not.toBeInTheDocument();
        expect(screen.queryByText("Work Queues")).not.toBeInTheDocument();
        expect(screen.getAllByRole("button")).toHaveLength(7);
    });

    test("renders the main menu items when open", () => {
        renderWithProviders(<Sidebar open={true} toggleDrawer={toggleDrawer} />);

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Work Queues")).toBeInTheDocument();
        expect(screen.getByText("Reports")).toBeInTheDocument();
        expect(screen.getByText("Travel")).toBeInTheDocument();
        expect(screen.getByText("Billing")).toBeInTheDocument();
        expect(screen.getByText("System Notifications")).toBeInTheDocument();
        expect(screen.getByText("Administration")).toBeInTheDocument();
    });

    test("navigates directly when a main menu item is clicked", () => {
        renderWithProviders(<Sidebar open={true} toggleDrawer={toggleDrawer} />);

        fireEvent.click(screen.getByText("Home"));

        expect(mockNavigate).toHaveBeenCalledWith("/home");
        expect(toggleDrawer).toHaveBeenCalled();
    });

    test("opens the administration submenu from the main menu and closes the main menu", () => {
        renderWithProviders(<Sidebar open={true} toggleDrawer={toggleDrawer} />);

        fireEvent.click(screen.getByText("Administration"));

        expect(toggleDrawer).toHaveBeenCalled();
    });

    test("opens the reports submenu from the main menu and closes the main menu", () => {
        renderWithProviders(<Sidebar open={true} toggleDrawer={toggleDrawer} />);

        fireEvent.click(screen.getByText("Reports"));

        expect(toggleDrawer).toHaveBeenCalled();
    });

    test("shows the reports submenu when reports is active and main menu is closed", () => {
        mockPathname = "/va-reports";
        renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        expect(screen.getByText("VA Reports")).toBeInTheDocument();
        expect(screen.getByText("Monthly Reports")).toBeInTheDocument();
        expect(screen.getByText("Exam Archive")).toBeInTheDocument();
        expect(screen.queryByText("Work Queues")).not.toBeInTheDocument();
    });

    test("closes the submenu from the bottom close icon", () => {
        mockPathname = "/va-reports";
        renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        fireEvent.click(screen.getAllByRole("button").at(-1)!);

        expect(screen.queryByText("VA Reports")).not.toBeInTheDocument();
        expect(screen.queryByText("Monthly Reports")).not.toBeInTheDocument();
    });

    test("shows the travel submenu when travel is active and main menu is closed", () => {
        mockPathname = "/travel-instance-claim-report";
        renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        expect(screen.getByText("Travel Instance Claim Report")).toBeInTheDocument();
        expect(screen.getByText("Travel Payment Upload")).toBeInTheDocument();
    });

    test("shows the billing submenu when billing is active and main menu is closed", () => {
        mockPathname = "/vbms-invoice-files";
        renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        expect(screen.getByText("VBMS Invoice Files")).toBeInTheDocument();
        expect(screen.getByText("Lab & Non-Lab Price Upload")).toBeInTheDocument();
        expect(screen.getByText("Billing Rate Master")).toBeInTheDocument();
    });

    test("shows the administration submenu with nested provider management items", () => {
        mockPathname = "/configuration/users";
        renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        expect(screen.getAllByText("Users")).toHaveLength(2);
        expect(screen.getByText("Roles")).toBeInTheDocument();
        expect(screen.getByText("DBQ Builder")).toBeInTheDocument();
        expect(screen.getByText("Provider Management")).toBeInTheDocument();
        expect(screen.getByText("Organizations")).toBeInTheDocument();
        expect(screen.getByText("Facilities")).toBeInTheDocument();
        expect(screen.getByText("User DBQ Training")).toBeInTheDocument();
        expect(screen.getByText("Availability Calendar")).toBeInTheDocument();
    });

    test("renders FontAwesome icons for Provider Management and its sub items", () => {
        mockPathname = "/configuration/users";
        const { container } = renderWithProviders(<Sidebar open={false} toggleDrawer={toggleDrawer} />);

        expect(container.querySelectorAll('[data-icon="dashboard"]')).toHaveLength(2);
        expect(container.querySelector('[data-icon="building"]')).toBeInTheDocument();
        expect(container.querySelector('[data-icon="hospital-o"]')).toBeInTheDocument();
        expect(container.querySelector('[data-icon="user"]')).toBeInTheDocument();
        expect(container.querySelector('[data-icon="certificate"]')).toBeInTheDocument();
        expect(container.querySelector('[data-icon="upload"]')).toBeInTheDocument();
    });

    test("keeps home selected for the home route", () => {
        mockPathname = "/home";
        renderWithProviders(<Sidebar open={true} toggleDrawer={toggleDrawer} />);

        expect(screen.getByText("Home").closest("div.MuiButtonBase-root")).toHaveClass("Mui-selected");
    });

    test("keeps administration selected for configuration routes", () => {
        mockPathname = "/configuration/users";
        renderWithProviders(<Sidebar open={true} toggleDrawer={toggleDrawer} />);

        expect(screen.getByText("Administration").closest("div.MuiButtonBase-root")).toHaveClass("Mui-selected");
    });
});
