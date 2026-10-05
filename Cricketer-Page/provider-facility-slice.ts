/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ClusterTypes,
  getClusters,
  getUserRoles,
  RoleTypes,
} from "../../services/account-users";
import { Affiliation, Facility, FacilityCPTCodesResponse, getAffiliations, getAllFacilities, getAllOrganizations, getAllStates, getFacilityCPTCodes, getSchedulingTypes, getSpecialties, Organization, ProfessionalTitle, SchedulingType, Specialty, State, getOtherFacility, getCredentialStatus, OtherFacility, CredentialStatusLookupValue } from "../../services/provider-users";
import { CalendarAdministrator, FacilityIdentifier, getAllCalendarAdministrators, getAllFacilityIdentifiers, getDtOnlyProviders, getFacilitySpecialityPriorityMapping, getProviderFacility } from "../../services/provider-facilities";
import { DiagnosticClaimItem, getAllSpecialAccomdationRequest, loadDiagnosticClaims } from "../../services/case-details";

interface CachedUser {
  data: any;
  isOpenTab: boolean;
  actualData: any;
}

interface ProviderFacilityState {
  professionalTitles: ProfessionalTitle[];
  allStates: State[];  //
  specialties: Specialty[];
  schedulingType: SchedulingType[];
  organizations: Organization[]; //
  diagnosticClaims: DiagnosticClaimItem[];
  calenderAdministrators: CalendarAdministrator[];
  clusters: ClusterTypes[];
  accommodations: any[];  //
  facilityIdentifiers: FacilityIdentifier[],
  userRoles: RoleTypes[];
  facility: Facility[];
  facilityCPTCodes: FacilityCPTCodesResponse[]; // Add facility CPT codes state
  affiliations: Affiliation[];
  otherFacilities: OtherFacility[]; // Add other facilities state
  credentialStatuses: CredentialStatusLookupValue[]; // Add credential statuses state
  skillsOption: string[];
  isLoading: boolean;
  error: string | null;
  // 🔹 new state for caching individual users
  providerFacilityByName: Record<string, CachedUser>;
  selectedTab: string;
}

const initialState: ProviderFacilityState = {
  professionalTitles: [],
  allStates: [],
  specialties: [],
  schedulingType: [],
  organizations: [],
  diagnosticClaims: [],
  calenderAdministrators: [],
  clusters: [],
  facilityIdentifiers: [],
  accommodations: [],
  userRoles: [],
  facility: [],
  facilityCPTCodes: [],
  affiliations: [],
  otherFacilities: [],
  credentialStatuses: [],
  skillsOption: ["Skill Level 01", "Skill Level 02", "Skill Level 03"],
  isLoading: false,
  error: null,
  providerFacilityByName: {},
  selectedTab: "",
};

// 🔹 Async thunks
export const fetchProviderFacilityData = createAsyncThunk(
  "providerUsers/fetchProviderFacilityData",
  async (_, { rejectWithValue }) => {
    try {
      const [organizations, diagnosticClaims, calenderAdministrators, clusters, accommodations, facilityIdentifiers, userRoles, facility, schedulingType, affiliations, specialties, allStates, otherFacilities, credentialStatuses] = await Promise.all([
        getAllOrganizations(),
        loadDiagnosticClaims(0, false),
        getAllCalendarAdministrators(),
        getClusters(),
        getAllSpecialAccomdationRequest(),
        getAllFacilityIdentifiers(),
        getUserRoles(),
        getAllFacilities(),
        getSchedulingTypes(),
        getAffiliations(),
        getSpecialties(),
        getAllStates(),
        getOtherFacility(),
        getCredentialStatus(),
      ]);
      return { organizations, diagnosticClaims, calenderAdministrators, clusters, accommodations, facilityIdentifiers, userRoles, facility, schedulingType, affiliations, specialties, allStates, otherFacilities, credentialStatuses };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch account user data");
    }
  }
);

export const fetchSpecialAccommodations = createAsyncThunk(
  "providerUsers/fetchSpecialAccommodations",
  async (_, { rejectWithValue }) => {
    try {
      const accommodations = await getAllSpecialAccomdationRequest();
      return accommodations;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch special accommodations");
    }
  }
);

// 🔹 New thunk with caching
export const fetchProviderFacilityById = createAsyncThunk(
  "providerUsers/fetchProviderFacilityById",
  async (username: string, { rejectWithValue }) => {
    try {
      const userData: any = await getProviderFacility(username);
      const DtOnlyProviders: any = await getDtOnlyProviders(username);
      const facilitySpecialityPriorityMapping = await getFacilitySpecialityPriorityMapping(username);
      return { username, data: { ...userData, DtOnlyProviders, SpecialtyPriorityMappings: facilitySpecialityPriorityMapping }, fromCache: false };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch user by username");
    }
  }
);

// 🔹 Fetch facility CPT codes
export const fetchFacilityCPTCodes = createAsyncThunk(
  "providerUsers/fetchFacilityCPTCodes",
  async (facilityId: number[], { rejectWithValue }) => {
    try {
      const response = await getFacilityCPTCodes(facilityId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch facility CPT codes");
    }
  }
);

// 🔹 Slice
const providerUsersSlice = createSlice({
  name: "providerUsers",
  initialState,
  reducers: {
    clearAccountUsersError(state) {
      state.error = null;
    },

    // Update isOpenTab explicitly
    setUserTabOpen(
      state,
      action: PayloadAction<{ username: string; isOpenTab: boolean }>
    ) {
      const { username, isOpenTab } = action.payload;
      if (!state.providerFacilityByName[username]) {
        state.providerFacilityByName[username] = { data: null, isOpenTab, actualData: null };
      } else {
        state.providerFacilityByName[username].isOpenTab = isOpenTab;
      }
    },

    // Upsert cached user data (used to persist draft edits per user)
    upsertAccountUserData(
      state,
      action: PayloadAction<{ username: string; data: any }>
    ) {
      const { username, data } = action.payload;
      const existing = state.providerFacilityByName[username];
      state.providerFacilityByName[username] = {
        data,
        isOpenTab: existing?.isOpenTab ?? false,
        actualData: existing?.actualData ?? null,
      };
    },

    setSelectedTab(
      state, action: PayloadAction<{ username: string }>
    ) {
      const { username } = action.payload;
      state.selectedTab = username;
    },
    cancelUpsertProviderFacilityData(
      state,
      action: PayloadAction<{ username: string }>
    ) {
      const { username } = action.payload;
      const existing = state.providerFacilityByName[username];
      state.providerFacilityByName[username] = {
        data: existing?.actualData,
        isOpenTab: existing?.isOpenTab ?? false,
        actualData: existing?.actualData ?? null,
      };
    },

    deleteAccountUserByUsername(
      state,
      action: PayloadAction<{ username: string }>
    ) {
      const { username } = action.payload;
      if (state.providerFacilityByName[username]) {
        delete state.providerFacilityByName[username];
        // Also clear selectedTab if it matches the deleted user
        if (state.selectedTab === username) {
          state.selectedTab = "";
          console.info('🔥 Cleared selectedTab for deleted user:', username);
        }
      } else {
        console.info('🔥 User not found for deletion:', username);
      }
    },

    resetAccountUsersByName(state) {
      state.providerFacilityByName = {};
    },

    addSpecialAccommodation(state, action: PayloadAction<{ Name: string; Description?: string; Id?: number; LookupTypeId?: number }>) {
      if (!state.accommodations.some((a: any) => a.Name?.toLowerCase() === action.payload.Name.toLowerCase())) {
        state.accommodations.push({
          Id: action.payload.Id || Date.now(),
          LookupTypeId: action.payload.LookupTypeId || 0,
          Name: action.payload.Name,
          Description: action.payload.Description || "",
          IsActive: true,
          CreatedDate: new Date().toISOString(),
          CreatedBy: null,
          ModifiedDate: null,
          ModifiedBy: null,
        });
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch global data
      .addCase(fetchProviderFacilityData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderFacilityData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allStates = action.payload.allStates;
        state.specialties = action.payload.specialties;
        state.schedulingType = action.payload.schedulingType;
        state.organizations = action.payload.organizations;
        state.diagnosticClaims = action.payload.diagnosticClaims;
        state.calenderAdministrators = action.payload.calenderAdministrators;
        state.clusters = action.payload.clusters;
        state.accommodations = action.payload.accommodations;
        state.facilityIdentifiers = action.payload.facilityIdentifiers;
        state.userRoles = action.payload.userRoles;
        state.facility = action.payload.facility;
        state.affiliations = action.payload.affiliations;
        state.otherFacilities = action.payload.otherFacilities;
        state.credentialStatuses = action.payload.credentialStatuses;
      })
      .addCase(fetchProviderFacilityData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single user with caching
      .addCase(fetchProviderFacilityById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProviderFacilityById.fulfilled, (state, action) => {
        state.isLoading = false;
        const { username, data } = action.payload;
        state.providerFacilityByName[username] = {
          data,
          isOpenTab:
            state.providerFacilityByName[username]?.isOpenTab ?? false, // keep tab state if exists
          actualData: data
        };
      })
      .addCase(fetchProviderFacilityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch facility CPT codes
      .addCase(fetchFacilityCPTCodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacilityCPTCodes.fulfilled, (state, action: PayloadAction<FacilityCPTCodesResponse>) => {
        state.isLoading = false;
        // store as a single-item list for now; adjust if you want map by facility
        state.facilityCPTCodes = [action.payload];
      })
      .addCase(fetchFacilityCPTCodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSpecialAccommodations.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.accommodations = action.payload;
        }
      });
  },
});

export const { clearAccountUsersError, deleteAccountUserByUsername, setUserTabOpen, upsertAccountUserData, cancelUpsertProviderFacilityData, resetAccountUsersByName, setSelectedTab, addSpecialAccommodation } =
 providerUsersSlice.actions;
export default providerUsersSlice.reducer;
