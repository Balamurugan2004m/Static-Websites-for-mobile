import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AccountUserTab {
  id: string;
  email: string;
  userName: string;
}

interface UIState {
  openStates: Record<string, boolean>;
  accountUsersTabs: AccountUserTab[];
  providerUsersTabs: AccountUserTab[];
  providerFacilityTabs: AccountUserTab[];
  userDbqTrainingTabs: AccountUserTab[];
  orgTabs: AccountUserTab[];
}

const initialState: UIState = {
  openStates: {}, // initially no UI elements are open
  accountUsersTabs: [],
  providerUsersTabs: [],
  providerFacilityTabs: [],
  userDbqTrainingTabs: [],
  orgTabs: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setOpenState(state, action: PayloadAction<{ key: string; isOpen: boolean }>) {
      state.openStates[action.payload.key] = action.payload.isOpen;
    },
    toggleOpenState(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.openStates[key] = !state.openStates[key];
    },
    closeAll(state) {
      state.openStates = {};
    },
    // Add account user tab
    addAccountUserTab(state, action: PayloadAction<AccountUserTab>) {
      const exists = state.accountUsersTabs.some(
        (tab) => tab.id === action.payload.id
      );

      if (!exists) {
        state.accountUsersTabs.push(action.payload);
      }
    },
    // Edit account user tab
    editAccountUserTab(state, action: PayloadAction<{ id: string; updates: Partial<AccountUserTab> }>) {
      const { id, updates } = action.payload || {};
      const tabIndex = state.accountUsersTabs.findIndex(tab => tab.id === id);
      if (tabIndex !== -1) {
        state.accountUsersTabs[tabIndex] = { ...state.accountUsersTabs[tabIndex], ...updates };
      }
    },
    // Delete account user tab
    deleteAccountUserTab(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.accountUsersTabs = state.accountUsersTabs.filter(tab => Number(tab.id) !== Number(id));
    },
     // Delete all account user tab
    deleteAllAccountUserTab(state) {
      state.accountUsersTabs = [];
    },
    addProviderUserTab(state, action: PayloadAction<AccountUserTab>) {
      const exists = state.providerUsersTabs.some(
        (tab) =>
          (action.payload.userName && tab.userName === action.payload.userName) ||
          (action.payload.id != null && tab.id != null && Number(tab.id) === Number(action.payload.id))
      );

      if (!exists) {
        state.providerUsersTabs.push(action.payload);
      }
    },
    deleteProviderUserTab(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.providerUsersTabs = state.providerUsersTabs.filter(
        (tab) => Number(tab.id) !== Number(id)
      );
    },
    deleteAllProviderUserTab(state) {
      state.providerUsersTabs = [];
    },
    addProviderFacilityTab(state, action: PayloadAction<AccountUserTab>) {
      const exists = state.providerFacilityTabs.some(
        (tab) => tab.id === action.payload.id
      );

      if (!exists) {
        state.providerFacilityTabs.push(action.payload);
      }
    },
    deleteProviderFacilityTab(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.providerFacilityTabs = state.providerFacilityTabs.filter(
        (tab) => Number(tab.id) !== Number(id)
      );
    },
    deleteAllProviderFacilityTab(state) {
      state.providerFacilityTabs = [];
    },
    addUserDbqTrainingTab(state, action: PayloadAction<AccountUserTab>) {
      const exists = state.userDbqTrainingTabs.some(
        (tab) => tab.id === action.payload.id
      );
      if (!exists) {
        state.userDbqTrainingTabs.push(action.payload);
      }
    },
    deleteUserDbqTrainingTab(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.userDbqTrainingTabs = state.userDbqTrainingTabs.filter(
        (tab) => Number(tab.id) !== Number(id)
      );
    },
    deleteAllUserDbqTrainingTab(state) {
      state.userDbqTrainingTabs = [];
    },
    addOrgTab(state, action: PayloadAction<AccountUserTab>) {
      const exists = state.orgTabs.some((tab) => tab.id === action.payload.id);
      if (!exists) state.orgTabs.push(action.payload);
    },
    deleteOrgTab(state, action: PayloadAction<string>) {
      state.orgTabs = state.orgTabs.filter((tab) => tab.id !== action.payload);
    },
    deleteAllOrgTab(state) {
      state.orgTabs = [];
    },
  },
});

export const {
  setOpenState,
  toggleOpenState,
  closeAll,
  addAccountUserTab,
  editAccountUserTab,
  deleteAccountUserTab,
  deleteAllAccountUserTab,
  addProviderUserTab,
  deleteProviderUserTab,
  deleteAllProviderUserTab,
  addProviderFacilityTab,
  deleteProviderFacilityTab,
  deleteAllProviderFacilityTab,
  addUserDbqTrainingTab,
  deleteUserDbqTrainingTab,
  deleteAllUserDbqTrainingTab,
  addOrgTab,
  deleteOrgTab,
  deleteAllOrgTab,
} = uiSlice.actions;
export default uiSlice.reducer;
