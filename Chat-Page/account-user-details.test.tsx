/* eslint-disable @typescript-eslint/no-explicit-any */


jest.mock("../../constants/api-urls", () => ({
  API_URLS: {
    BASE_URL: "http://test.com",
  },
}));

jest.mock("../../services/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));


const mockDispatch = jest.fn();

jest.mock("../../store", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("../../store/slice/provider-users-slice", () => ({
  fetchProviderUsers: jest.fn(),
}));


import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountUserDetails from "./account-user-details";

/* ---------------- REDUX ---------------- */

const mockUseSelector = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: (fn: any) => mockUseSelector(fn),
}));

/* ---------------- ROUTER ---------------- */

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => jest.fn(),
  useParams: () => ({ userId: "test-user" }),
  useLocation: () => ({ pathname: "/configuration/users/test-user" }),
}));

/* ---------------- SLICE ---------------- */

jest.mock("../../store/slice/account-users-slice", () => ({
  fetchAccountUserByUsername: jest.fn(() => ({
    unwrap: () =>
      Promise.resolve({
        data: {
          FirstName: "John",
          LastName: "Doe",
          Email: "john@test.com",
          UserName: "john123",
          Roles: [],
          ClusterLookupValueMappings: [],
        },
      }),
  })),
  fetchAccountUserData: jest.fn(),
  setUserTabOpen: jest.fn(),
  cancelUpsertAccountUserData: jest.fn(),
  upsertAccountUserData: jest.fn(),
}));

/* ---------------- SERVICES ---------------- */

jest.mock("../../services/account-users", () => ({
  updateAccountUser: jest.fn(() => Promise.resolve({ success: true })),
  AccountUserInitialState: {
    FirstName: "",
    LastName: "",
    Email: "",
    UserName: "",
    Roles: [],
    ClusterLookupValueMappings: [],
  },
}));

/* ---------------- UI MOCKS ---------------- */

jest.mock("../../components/users/components/header-with-edit-actions", () => (props: any) => (
  <div>
    <button onClick={props.onEdit}>Edit</button>
    <button onClick={props.onSave}>Save</button>
    <button onClick={props.onCancel}>Cancel</button>
  </div>
));

jest.mock("../../components/users/components/form-field", () => (props: any) => (
  <input
    data-testid={`input-${props.field}`}
    data-required={props.required ? "true" : "false"}
    onChange={(e) => props.onChange(props.field, e.target.value)}
  />
));

jest.mock("../../components/users/components/tabs-header", () => () => <div>Tabs</div>);
jest.mock("../../components/users/components/select-filed", () => () => <div>Select</div>);
jest.mock("../../components/users/components/skeleton-loader", () => () => <div>Loading...</div>);
jest.mock("../../ui/confirmation-modal", () => () => <div>Modal</div>);

jest.mock("../../components/users/utils/util", () => ({
  leftColumnFields: [
    { field: "FirstName", label: "First Name", required: true },
    { field: "LastName", label: "Last Name", required: true },
    { field: "PrintName", label: "Print Name", required: true },
  ],

  middleColumnFields: [
    { field: "PhoneNumber", label: "Phone Number" },
    { field: "AddressLine1", label: "Address Line 1", required: true },
    { field: "City", label: "City", required: true },
    { field: "State", label: "State", required: true },
    { field: "Zip", label: "ZIP Code", required: true },
  ],

  rightColumnSelectFields: [],
  toClusterSelectOptions: jest.fn(() => []),
  normalizeClusterIds: jest.fn(() => []),
  userTypeObjKey: { Infinite: 1, LSGS: 2, VA: 3 },
  userTypeObjVal: { 1: "Infinite", 2: "LSGS", 3: "VA" },
}));
jest.mock("../../components/users/utils/styles", () => ({
  getStyles: () => ({
    container: {},
    paper: {},
    grid: {},
    accountUsersContainer: {},
    accountUsersPaper: {},
    accountUsersGrid: {},
    accountUsersHeader: {},

    accountUsersCancelBtn: {},
    accountUsersSaveBtn: {},
    accountUsersCloseIcon: {},

    accountUsersEditBtn: {},
    accountUsersEditBtnHover: {},

    input: {},

    label: {},
    formGroup: {},
  }),
}));

/* ---------------- RENDER ---------------- */

const renderComponent = () => render(<AccountUserDetails />);

/* ---------------- TESTS ---------------- */

describe("AccountUserDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSelector.mockImplementation((fn: any) =>
      fn({
        accountUsers: {
          managers: [],
          clusters: [],
          userRoles: [],
          lookUpValues: [],
          selectedTab: "",
          isLoading: false,
          accountUsersByName: {},
        },
        ui: {
          accountUsersTabs: ["test-user"],
        },
        theme: { mode: "light" },
      })
    );
  });

  it("renders component", () => {
    renderComponent();
    expect(screen.getByText("Tabs")).toBeInTheDocument();
  });

  it("renders inputs", () => {
    renderComponent();
    expect(screen.getByTestId("input-FirstName")).toBeInTheDocument();
    expect(screen.getByTestId("input-LastName")).toBeInTheDocument();
  });

  it("handles input change", () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("input-FirstName"), {
      target: { value: "John" },
    });

    expect(screen.getByTestId("input-FirstName")).toBeInTheDocument();
  });

  it("edit button works", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Edit"));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("cancel button works", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("multiple interactions", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByTestId("input-FirstName"), {
      target: { value: "Dheva" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it("loading state renders", () => {
    mockUseSelector.mockImplementation((fn: any) =>
      fn({
        accountUsers: {
          managers: [],
          clusters: [],
          userRoles: [],
          lookUpValues: [],
          selectedTab: "",
          isLoading: true,
          accountUsersByName: {},
        },
        ui: {
          accountUsersTabs: ["test-user"],
        },
        theme: { mode: "light" },
      })
    );

    renderComponent();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders tabs always", () => {
    renderComponent();
    expect(screen.getByText("Tabs")).toBeInTheDocument();
  });
  
  it("edit click multiple times works", () => {
    renderComponent();
  
    const editBtn = screen.getByText("Edit");
  
    fireEvent.click(editBtn);
    fireEvent.click(editBtn);
  
    expect(editBtn).toBeInTheDocument();
  });
  
  it("cancel without edit does not crash", () => {
    renderComponent();
  
    fireEvent.click(screen.getByText("Cancel"));
  
    expect(screen.getByText("Tabs")).toBeInTheDocument();
  });
  
  it("inputs exist after render", () => {
    renderComponent();
  
    expect(screen.getByTestId("input-FirstName")).toBeInTheDocument();
    expect(screen.getByTestId("input-LastName")).toBeInTheDocument();
  });

  it("marks Print Name, City, State, and ZIP Code as required", () => {
    renderComponent();

    expect(screen.getByTestId("input-PrintName")).toHaveAttribute("data-required", "true");
    expect(screen.getByTestId("input-City")).toHaveAttribute("data-required", "true");
    expect(screen.getByTestId("input-State")).toHaveAttribute("data-required", "true");
    expect(screen.getByTestId("input-Zip")).toHaveAttribute("data-required", "true");
  });
});
