/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo, useRef, useDeferredValue } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { showToast } from "../../../utils/toast";
import { TOAST_TYPES } from "../../../types/toast-types";
import { deleteProviderUserTab, deleteAllProviderUserTab } from "../../../store/slice/ui-slice";
import { RootState, useAppDispatch } from "../../../store";
import { getDrawerComponentStyles, getThemeStyles, getStyles } from "../../../components/users/utils/styles";
import TabsHeader from "../../../components/users/components/tabs-header";
import SkeletonLoader from "../../../components/users/components/skeleton-loader";
import HeaderWithEditActions from "../../../components/users/components/header-with-edit-actions";
import FormField from "../../../components/users/components/form-field";
import { ConfirmationModal } from "../../../ui";
import { cancelUpsertAccountUserData, deleteAccountUserByUsername, fetchProviderUserData, setSelectedTab, setUserTabOpen, upsertAccountUserData } from "../../../store/slice/provider-users-slice";
import { userTypeObjVal } from "../../../components/users/utils/util";
import { leftColumnFields, middleColumnFields, rightColumnFields, ProviderFieldConfig } from "../../../components/users/utils/provider-users-column";
import RenderField from "../../../components/users/components/render-field";
import AccordionComponent from "../../../components/users/components/accordion";
import LicenseTable, { LicenseTableRef } from "../tables/license-table";
import ReusableDrawer from "../../../ui/reusable-drawer";
import DynamicForm from "../forms/dynamic-form";
import { boardCertificationFormField, educationalFormField } from "../forms/fields";
import AccordionDataGrid from "../../../components/users/components/accordion-grid";
import { addAccountUser, addProviderUser, CertificationCourse, type DiagnosticListItem, editProviderUser, getDiagnosticListWithColoring, getFacilityCPTCodes, getProviderUserById, getUserCertifications, initialUserBoardCertification, initialUserEducation, mapFacilityCptCodesToOptions, ProviderUser, ProviderUserInitialState, remapCptSelectOptions, toCptSelectOption, UserBoardCertification, UserEducation } from "../../../services/provider-users";
import { GridRowModel } from "@mui/x-data-grid";
import MultiSelectWithChips, { SelectOption } from "../../../components/users/components/multi-select-with-chips";
import { useTableColumns } from "../tables/table-columns";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { getAccountUserByUsername } from "../../../services/account-users";
import RefreshIcon from "../../../assets/icons/refresh.svg"; 
import { mapToAddUserApiPayload, mapToApiPayload, mapToEditApiPayload } from "../utils";
import { THEME_PRIMITIVES } from "../../../theme";
import { getAllDbqMaster } from "../../../services/case-details";

// import { formatTrainingDates, transformLicenses } from "../utils";

// -------- Validation --------
interface FormErrors {
    [key: string]: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const P = THEME_PRIMITIVES;

// CRITICAL: Create selector outside component to prevent recreation
const selectProviderUserState = (state: RootState) => ({
    userRoles: state.providerUser.userRoles,
    professionalTitles: state.providerUser.professionalTitles,
    otherFacilities: state.providerUser.otherFacilities,
    credentialStatuses: state.providerUser.credentialStatuses,
    allStates: state.providerUser.allStates,
    specialties: state.providerUser.specialties,
    organizations: state.providerUser.organizations,
    facility: state.providerUser.facility,
    schedulingType: state.providerUser.schedulingType,
    affiliations: state.providerUser.affiliations,
    selectedTab: state.providerUser.selectedTab,
    isLoading: state.providerUser.isLoading,
    cptCatalog: state.providerUser.cptCatalog,
});

const selectOpenTabs = (state: RootState) => state.ui.providerUsersTabs;
const selectDarkMode = (state: RootState) => state?.theme?.mode;
const selectProviderUsersByName = (state: RootState) => state.providerUser.providerUsersByName;

// ENHANCED: Super aggressive memoization with custom equality
const MemoizedRenderField = React.memo(RenderField, (prevProps, nextProps) => {
    const fieldValue = prevProps.formData[prevProps.fieldConfig.field];
    const nextFieldValue = nextProps.formData[nextProps.fieldConfig.field];

    return (
        prevProps.fieldConfig.field === nextProps.fieldConfig.field &&
        fieldValue === nextFieldValue &&
        prevProps.isEditing === nextProps.isEditing &&
        prevProps.accountUsersForm === nextProps.accountUsersForm &&
        (prevProps.errors?.[prevProps.fieldConfig.field] === nextProps.errors?.[nextProps.fieldConfig.field])
        && prevProps.isDarkMode === nextProps.isDarkMode
        && prevProps.selectOptions === nextProps.selectOptions
    );
});
MemoizedRenderField.displayName = 'MemoizedRenderField';

// BEST: Ultra-aggressive memoization for heavy components
const MemoizedAccordionDataGrid = React.memo(AccordionDataGrid, (prevProps, nextProps) => {
    return (
        prevProps.title === nextProps.title &&
        prevProps.rows === nextProps.rows && // Strict reference equality
        prevProps.showAddButton === nextProps.showAddButton &&
        prevProps.isDarkMode === nextProps.isDarkMode &&
        prevProps.columns === nextProps.columns &&
        prevProps.expanded === nextProps.expanded &&
        prevProps.footer === nextProps.footer &&
        prevProps.wrappedColumnHeaders === nextProps.wrappedColumnHeaders &&
        prevProps.headerBgColor === nextProps.headerBgColor
    );
});
MemoizedAccordionDataGrid.displayName = 'MemoizedAccordionDataGrid';

const MemoizedFormField = React.memo(FormField, (prevProps, nextProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.isEditing === nextProps.isEditing &&
        prevProps.error === nextProps.error
        && prevProps.isDarkMode === nextProps.isDarkMode
    );
});
MemoizedFormField.displayName = 'MemoizedFormField';

// Memoized accordion — must include children so controlled fields inside (e.g. CPT Codes) update.
const MemoizedAccordionComponent = React.memo(AccordionComponent, (prevProps, nextProps) => {
    return (
        prevProps.title === nextProps.title &&
        prevProps.showAddButton === nextProps.showAddButton &&
        prevProps.isDarkMode === nextProps.isDarkMode &&
        prevProps.btnText === nextProps.btnText &&
        prevProps.expanded === nextProps.expanded &&
        prevProps.children === nextProps.children &&
        prevProps.onBtnClick === nextProps.onBtnClick &&
        prevProps.detailsPadding === nextProps.detailsPadding &&
        prevProps.headerBgColor === nextProps.headerBgColor
    );
});
MemoizedAccordionComponent.displayName = 'MemoizedAccordionComponent';

// BEST: Memoized MultiSelectWithChips
const MemoizedMultiSelectWithChips = React.memo(MultiSelectWithChips, (prevProps, nextProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.options === nextProps.options &&
        prevProps.isDark === nextProps.isDark &&
        prevProps.variant === nextProps.variant
    );
});
MemoizedMultiSelectWithChips.displayName = 'MemoizedMultiSelectWithChips';

// ---------- MAIN COMPONENT ----------
const initialBoardCertificationValues = {
    UserBoard: "",
    UserBoardCertifiedDate: "",
    UserBoardExpirationDate: "",
};

type BottomAccordionKey =
    | "education"
    | "boardCertification"
    | "cptCodes"
    | "cptCodeRanges"
    | "userLicenses"
    | "requiredCertificationCourses"
    | "recertificationCourses"
    | "specialtyCourses";

const createBottomAccordionState = (expanded: boolean): Record<BottomAccordionKey, boolean> => ({
    education: expanded,
    boardCertification: expanded,
    cptCodes: expanded,
    cptCodeRanges: expanded,
    userLicenses: expanded,
    requiredCertificationCourses: expanded,
    recertificationCourses: expanded,
    specialtyCourses: expanded,
});

const toIsoOrNull = (value: unknown): string | null => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    // Check DD/MM/YYYY
    const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const dd = Number(slash[1]);
        const mm = Number(slash[2]);
        const yyyy = Number(slash[3]);
        const date = new Date(Date.UTC(yyyy, mm - 1, dd));
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    // Check YYYY-MM-DD
    const dash = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (dash) {
        const yyyy = Number(dash[1]);
        const mm = Number(dash[2]);
        const dd = Number(dash[3]);
        const date = new Date(Date.UTC(yyyy, mm - 1, dd));
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    const date = new Date(s);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/** Normalize date strings to DD/MM/YYYY for UI display & input. */
const toDateInputString = (value: unknown): string => {
    if (value == null || value === "") return "";
    const s = String(value).trim();
    if (!s) return "";
    const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const dd = slash[1].padStart(2, "0");
        const mm = slash[2].padStart(2, "0");
        return `${dd}/${mm}/${slash[3]}`;
    }
    const dash = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (dash) {
        const yyyy = dash[1];
        const mm = dash[2].padStart(2, "0");
        const dd = dash[3].padStart(2, "0");
        return `${dd}/${mm}/${yyyy}`;
    }
    const t = Date.parse(s);
    if (Number.isNaN(t)) return "";
    const d = new Date(t);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${mo}/${y}`;
};

const toNumberArray = (items: any): number[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => Number(item?.Id ?? item?.SchedulingTypeId ?? item?.code ?? item?.value ?? item))
        .filter((num) => Number.isFinite(num));
};

const toFacilityIdArray = (items: any): number[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) =>
            Number(
                item?.code ??
                    item?.FacilityId ??
                    item?.Id ??
                    item?.value ??
                    item
            )
        )
        .filter((num) => Number.isFinite(num) && num > 0);
};

const toCertificationPayload = (courses: CertificationCourse[] = []): CertificationCourse[] =>
    (courses || []).map((course) => ({
        ...course,
        ProviderTrainingCertifiedDate: toIsoOrNull(course?.ProviderTrainingCertifiedDate),
        ProviderTrainingExipryDate: toIsoOrNull(course?.ProviderTrainingExipryDate),
    }));

const getErrorMessage = (error: any, fallback: string): string => {
    const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.title ||
        (Array.isArray(error?.response?.data?.errors) ? error.response.data.errors.join(", ") : null) ||
        error?.message;

    return typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : fallback;
};

const inFlightUserDetailsRequests = new Map<string, Promise<ProviderUser>>(); // duplicate request prevention

let inFlightUserCertificationsRequest: Promise<any> | null = null;

const fetchUserCertificationsDeduped = async (): Promise<any> => {
    if (inFlightUserCertificationsRequest) return inFlightUserCertificationsRequest;

    inFlightUserCertificationsRequest = (async () => {
        try {
            return await getUserCertifications();
        } finally {
            // ensure new calls later will re-fetch
            inFlightUserCertificationsRequest = null;
        }
    })();

    return inFlightUserCertificationsRequest;
};

const ProviderUserDetails: React.FC = () => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    // Optimized selectors
    const providerUserState = useSelector(selectProviderUserState, shallowEqual);
    const openTabs = useSelector(selectOpenTabs);
    const dark_mode = useSelector(selectDarkMode);
    const providerUsersByName = useSelector(selectProviderUsersByName);
    const { userRoles, professionalTitles, otherFacilities, credentialStatuses, allStates, specialties, organizations, facility, schedulingType, affiliations, selectedTab, isLoading: accountUserLoading, cptCatalog } = providerUserState;

    // Computed values - Fix isDarkMode with proper fallback
    const isDarkMode = useMemo(() => dark_mode === "dark", [dark_mode]);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isCreate = useMemo(() => location.pathname.endsWith('/create'), [location.pathname]);
    const userId = params?.userId ?? "";

    const isOpenTab = useMemo(() =>
        providerUsersByName[userId]?.isOpenTab ?? false,
        [providerUsersByName, userId]
    );
    const isOpenTabWithCreateMode = useMemo(() => isCreate || isOpenTab, [isCreate, isOpenTab]);
    const cptCatalogRef = useRef<DiagnosticListItem[]>([]);

    const applyProviderUserData = useCallback((data: ProviderUser) => {
        setFormData(data);
        setActualFormData(data);
        setUserEducation(Array.isArray((data as any)?.UserEducation) ? (data as any).UserEducation : []);
        setBoardCertificationData(Array.isArray((data as any)?.UserBoardCertification) ? (data as any).UserBoardCertification : []);
        const savedCodes: string[] = Array.isArray((data as any)?.CPTCodeList)
            ? (data as any).CPTCodeList.map(String)
            : [];
        if (savedCodes.length > 0) {
            setSelectedGPTCodes(
                mapFacilityCptCodesToOptions(savedCodes, cptCatalogRef.current, false)
            );
        }
    }, []);

    // State management
    const windowWidthRef = useRef(window.innerWidth);
    const providerLookupFetchStartedRef = useRef(false);
    const createCertificationsFetchStartedRef = useRef(false);
    const userDetailsRequestRef = useRef<{ userId: string; request: Promise<ProviderUser> } | null>(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [openEducationalDrawer, setOpenEducationalDrawer] = useState(false);
    const [openBoardCertificationDrawer, setOpenBoardCertificationDrawer] = useState(false);

    // Form states
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<ProviderUser>(() => ({ ...ProviderUserInitialState }));
    const [, setActualFormData] = useState<ProviderUser>(() => ({ ...ProviderUserInitialState }));
    const [mode, setMode] = useState<"add" | "edit">("add");

    // Data states
    const [userEducation, setUserEducation] = useState<Array<UserEducation>>([]);
    const [boardCertificationData, setBoardCertificationData] = useState<Array<UserBoardCertification>>([]);
    const [selectedGPTCodes, setSelectedGPTCodes] = useState<SelectOption[]>([]);
    const [cptOptions, setCptOptions] = useState<SelectOption[]>([]);
    const [supplementalDbqOptions, setSupplementalDbqOptions] = useState<Array<{ label: string; code: number }>>([]);
    const [cptOptionsLoading, setCptOptionsLoading] = useState(false);
    const cptOptionsFetchedRef = useRef(false);
    const [userEducationValues, setUserEducationValues] = useState<UserEducation>(initialUserEducation);
    const [userBoardCertValues, setUserBoardCertValues] = useState<UserBoardCertification>(initialUserBoardCertification);
    const [requiredCertificationCourses, setRequiredCertificationCourses] = useState<CertificationCourse[]>(
        Array.isArray(formData?.RequiredCertificationCourses) ? formData.RequiredCertificationCourses : []
    );
    const [recertificationCourses, setRecertificationCourses] = useState<CertificationCourse[]>(
        Array.isArray(formData?.RecertificationCourses) ? formData.RecertificationCourses : []
    );
    const [specialtyCourses, setSpecialtyCourses] = useState<CertificationCourse[]>(
        Array.isArray(formData?.SpecialtyCourses) ? formData.SpecialtyCourses : []
    );
    const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
    const [bottomAccordionsExpanded, setBottomAccordionsExpanded] = useState<Record<BottomAccordionKey, boolean>>(
        () => createBottomAccordionState(true)
    );

    // ★★★ KEY SOLUTION: Defer heavy data updates ★★★
    const deferredUserEducation = useDeferredValue(userEducation);
    const deferredBoardCertificationData = useDeferredValue(boardCertificationData);
    const deferredRequiredCourses = useDeferredValue(requiredCertificationCourses);
    const deferredRecertCourses = useDeferredValue(recertificationCourses);
    const deferredSpecialtyCourses = useDeferredValue(specialtyCourses);

    // Stable callbacks
    const processRequiredCertificationCoursesUpdate = useCallback(
        async (
            newRow: GridRowModel & {
                ProviderTrainingCertifiedDate?: string | Date;
                ProviderTrainingExipryDate?: Date;
            }
        ) => {
            // Clone the new row
            const updatedRow = { ...newRow, isNew: false };

            // If certified date exists, add 5 years to compute expiry
            if (updatedRow.ProviderTrainingCertifiedDate) {
                const certifiedDate = new Date(updatedRow.ProviderTrainingCertifiedDate);
                const expiryDate = new Date(certifiedDate);
                expiryDate.setFullYear(certifiedDate.getFullYear() + 5);

                // ✅ keep it as a Date object (not ISO string)
                updatedRow.ProviderTrainingExipryDate = expiryDate;
            }

            setRequiredCertificationCourses((prevCourses: any) => {
                if (!Array.isArray(prevCourses)) return [];
                return prevCourses.map((el) =>
                    el.Id === newRow.Id ? { ...el, ...updatedRow } : el
                );
            });

            return updatedRow;
        },
        []
    );



    const processRecertificationCoursesUpdate = useCallback(
        async (
            newRow: GridRowModel & {
                ProviderTrainingCertifiedDate?: string | Date;
                ProviderTrainingExipryDate?: Date;
            }
        ) => {
            const updatedRow = { ...newRow, isNew: false };

            if (updatedRow.ProviderTrainingCertifiedDate) {
                const certifiedDate = new Date(updatedRow.ProviderTrainingCertifiedDate);
                const expiryDate = new Date(certifiedDate);
                expiryDate.setFullYear(certifiedDate.getFullYear() + 5);

                // ✅ keep it as a Date object (not ISO string)
                updatedRow.ProviderTrainingExipryDate = expiryDate;
            }

            setRecertificationCourses((prevCourses: any) => {
                if (!Array.isArray(prevCourses)) return [];
                return prevCourses.map((el) =>
                    el.Id === newRow.Id ? { ...el, ...updatedRow } : el
                );
            });

            return updatedRow;
        },
        []
    );

    const getCertifications = useCallback(async () => {
        try {
            const res = await fetchUserCertificationsDeduped();
            if (!res) return;
            const {
                RequiredCertificationCourses = [],
                RecertificationCourses = [],
                SpecialtyCourses = [],
            } = res;
            setRecertificationCourses(RecertificationCourses);
            setRequiredCertificationCourses(RequiredCertificationCourses);
            setSpecialtyCourses(SpecialtyCourses);
            setFormData(prevState => {
                return {
                    ...prevState,
                    RequiredCertificationCourses,
                    RecertificationCourses,
                    SpecialtyCourses,
                };
            });
        } catch (error) {
            console.error("Failed to fetch certifications:", error);
        }
    }, []);

    const processSpecialtyCoursesUpdate = useCallback(
        async (
            newRow: GridRowModel & {
                ProviderTrainingCertifiedDate?: string | Date;
                ProviderTrainingExipryDate?: string;
            }
        ) => {
            const updatedRow = { ...newRow, isNew: false };

            if (updatedRow.ProviderTrainingCertifiedDate) {
                const certifiedDate = new Date(updatedRow.ProviderTrainingCertifiedDate);
                const expiryDate = new Date(certifiedDate);
                expiryDate.setFullYear(certifiedDate.getFullYear() + 5);
                updatedRow.ProviderTrainingExipryDate = expiryDate.toISOString();
            }

            setSpecialtyCourses((prevCourses: any) => {
                if (!Array.isArray(prevCourses)) return [];
                return prevCourses.map((el) =>
                    el.Id === newRow.Id ? { ...el, ...updatedRow } : el
                );
            });

            return updatedRow;
        },
        []
    );


    // Validation — field order matches DOM (left → middle → Username → right) for scroll-to-first-error
    const validateForm = useCallback((): { isValid: boolean; firstError?: string; firstErrorField?: string } => {
        const newErrors: FormErrors = {};

        const includeRequired = (f: any) => {
            if (!f?.required) return false;
            if (f?.field === "UserSignedDate" && !isCreate) return false;
            return true;
        };

        const leftRequired = leftColumnFields.filter(includeRequired);
        const middleRequired = middleColumnFields.filter(includeRequired);
        const rightRequired = rightColumnFields.filter(includeRequired);

        const validateConfigField = (cfg: any): string => {
            const value = (formData as any)?.[cfg.field];
            let error = "";

            if (cfg.field === "PhoneNumber" || cfg.type === "tel") {
                const str = String(value ?? "").trim();
                const digits = str.replace(/\D/g, "");
                if (!str) {
                    error = `${cfg.label} is required`;
                } else if (digits.length !== 10) {
                    error = "Phone number must be exactly 10 digits";
                }
                return error;
            }

            if (cfg.field === "UserNPINumber") {
                const str = String(value ?? "").trim();
                if (!str) {
                    error = "NPI Number is required";
                } else if (!/^\d{10}$/.test(str)) {
                    error = "NPI Number must be exactly 10 digits";
                }
                return error;
            }

            if (cfg.field === "HoursPerWeek") {
                const str = String(value ?? "").trim();
                if (!str) {
                    error = `${cfg.label} is required`;
                } else if (!/^\d{1,3}$/.test(str) || Number(str) <= 0) {
                    error = "Hours Per Week must be between 1 and 999";
                }
                return error;
            }

            switch (cfg.type) {
                case "multiSelect": {
                    if (!Array.isArray(value) || value.length === 0) {
                        error = `${cfg.label} is required`;
                    }
                    break;
                }
                case "email": {
                    const str = String(value ?? "").trim();
                    if (!str) {
                        error = `${cfg.label} is required`;
                    } else if (!emailRegex.test(str)) {
                        error = "Invalid email format";
                    }
                    break;
                }
                case "select": {
                    if (cfg.field === "Roles") {
                        const hasSelected = Array.isArray(value) && value.some((r: any) => r?.IsSelected);
                        if (!hasSelected) error = "At least one role is required";
                    } else if (value == null || (typeof value === "string" && !String(value).trim())) {
                        error = `${cfg.label} is required`;
                    }
                    break;
                }
                case "number":
                case "date":
                case "text":
                default: {
                    if (value == null || (typeof value === "string" && !String(value).trim())) {
                        error = `${cfg.label} is required`;
                    }
                    break;
                }
            }

            return error;
        };

        let firstErrorField: string | undefined;
        let firstError: string | undefined;

        const record = (fieldKey: string, message: string) => {
            newErrors[fieldKey] = message;
            if (!firstErrorField) {
                firstErrorField = fieldKey;
                firstError = message;
            }
        };

        for (const cfg of leftRequired) {
            const err = validateConfigField(cfg);
            if (err) record(cfg.field, err);
        }

        for (const cfg of middleRequired) {
            const err = validateConfigField(cfg);
            if (err) record(cfg.field, err);
        }

        const userNameVal = (formData as any)?.UserName;
        if (!String(userNameVal ?? "").trim()) {
            record("UserName", "Username is required");
        }

        for (const cfg of rightRequired) {
            const err = validateConfigField(cfg);
            if (err) record(cfg.field, err);
        }

        setErrors(newErrors);
        return {
            isValid: Object.keys(newErrors).length === 0,
            firstError,
            firstErrorField,
        };
    }, [formData, isCreate]);

    // Data loading
    // ★★★ ULTRA-FAST handleChange - prioritizes form inputs ★★★
    const handleChange = useCallback(
        (fieldName: string, value: string | string[] | number | boolean) => {
            // IMMEDIATE update for form fields (high priority)
            let field = fieldName;
            if (field === "Skill Level") field = "SkillLevel";
            if (["User Type", "UserType"].includes(field)) field = "UserTypeId";
            if (["Credential Status", "CredentialingStatus"].includes(field)) field = "CredentialingStatus";

            // Clear errors immediately
            setErrors(prev => {
                if (!prev[field]) return prev;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [field]: removed, ...rest } = prev;
                return rest;
            });

            // Update form data immediately (high priority)
            let processedValue = value;
            if (field === "OrganizationId" && typeof value === "string") {
                const parsed = Number(value);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    processedValue = parsed;
                }
            }

            setFormData(prev => {
                if (field === "Roles") {
                    const updatedRoles = (prev.Roles || []).map(role => ({
                        ...role,
                        IsSelected: Array.isArray(value) ? value.includes(role.Name) : false,
                    }));
                    const next = { ...prev, Roles: updatedRoles };
                    if (userId) dispatch(upsertAccountUserData({ username: userId, data: next }));
                    return next;
                }

                if ((prev as any)[field] === processedValue) return prev;
                const next = { ...prev, [field]: processedValue };
                if (userId) dispatch(upsertAccountUserData({ username: userId, data: next }));
                return next;
            });
        },
        [dispatch, userId]
    );

    // Handlers
    const handleOpenTab = useCallback((username: string, isOpenTab: boolean) => {
        dispatch(setUserTabOpen({ username, isOpenTab }));
    }, [dispatch]);

    const updateUser = useCallback(async () => {
        const roleNames = (formData?.Roles || [])
            .filter((role: any) => role?.IsSelected)
            .map((role: any) => String(role?.Name ?? ""));
        const selectedRoles = (formData?.Roles || []);
        const userLicences = (licenseTableRef.current?.getLicenses() || []).map((lic: any) => ({
            UserNPINumber: String(formData?.UserNPINumber ?? ""),
            UserLicenceNumber: String(lic?.UserLicenceNumber ?? ""),
            UserLicenceExpiryDate: toIsoOrNull(lic?.UserLicenceExpiryDate),
            StateId: Number(lic?.StateId ?? 0),
            UserLicenceStatus: String(lic?.UserLicenceStatus ?? ""),
            UserLicenceType: String(lic?.UserLicenceType ?? ""),
            IsLicencePortable: Boolean(lic?.IsLicencePortable),
        }));

        const requiredCoursesPayload = toCertificationPayload(requiredCertificationCourses);
        const recertCoursesPayload = toCertificationPayload(recertificationCourses);
        const specialtyCoursesPayload = toCertificationPayload(specialtyCourses);

        const rawSpecialities = Array.isArray(formData?.Specialities) && formData.Specialities.length > 0
            ? formData.Specialities
            : Array.isArray((formData as any)?.Speciality)
            ? (formData as any).Speciality
            : [];

        const mappedSpecialities = rawSpecialities
            .map((item: any) => {
                const id = Number(
                    item?.Id ??
                    item?.code ??
                    item?.value ??
                    (typeof item === "number" ? item : 0)
                );
                const itemLabel = String(item?.label ?? item?.SpecialityDescription ?? "").trim().toLowerCase();
                const matched = specialties?.find(
                    (s: any) =>
                        (id > 0 && s.Id === id) ||
                        (itemLabel && s.SpecialityDescription?.trim().toLowerCase() === itemLabel)
                );
                if (matched) {
                    return {
                        Id: matched.Id,
                        SpecialityCode: matched.SpecialityCode ?? "",
                        SpecialityDescription: matched.SpecialityDescription ?? "",
                    };
                }
                if (id > 0) {
                    return {
                        Id: id,
                        SpecialityCode: String(item?.SpecialityCode ?? ""),
                        SpecialityDescription: String(item?.SpecialityDescription ?? item?.label ?? ""),
                    };
                }
                if (item && typeof item === "object" && (item.SpecialityCode || item.SpecialityDescription)) {
                    return {
                        Id: Number(item.Id ?? 0),
                        SpecialityCode: String(item.SpecialityCode ?? ""),
                        SpecialityDescription: String(item.SpecialityDescription ?? ""),
                    };
                }
                return null;
            })
            .filter((s: any): s is { Id: number; SpecialityCode: string; SpecialityDescription: string } =>
                s !== null && (s.Id > 0 || Boolean(s.SpecialityDescription))
            );

        const specialityIds = mappedSpecialities.map((s: { Id: number }) => s.Id).filter((id: number) => id > 0);
        const phoneDigits = String(formData?.PhoneNumber ?? "").replace(/\D/g, "");

        const payload = {
            ...formData,
            PhoneNumber: phoneDigits,
            NpiNumber: String(formData?.UserNPINumber ?? ""),
            EmailAddress: String((formData as any)?.EmailAddress ?? formData?.Email ?? ""),
            Role: roleNames,
            FacilityId: toNumberArray(formData?.FacilityId),
            FacilityIdOther: toNumberArray(formData?.FacilityIdOther),
            FacilityIdApprover: toNumberArray((formData as any)?.FacilityIdApprover),
            ApproverOrganizationList: toNumberArray((formData as any)?.ApproverOrganizationList),
            UserSupplementalMapping: Array.isArray((formData as any)?.UserSupplementalMapping)
                ? (formData as any).UserSupplementalMapping
                : [],
            Speciality: specialityIds.length > 0 ? specialityIds : toNumberArray(formData?.Specialities),
            SchedulingType: toNumberArray(formData?.SchedulingType),
            Specialities: mappedSpecialities,
            UserLicences: userLicences,
            UserBoardCertification: (boardCertificationData?.length ? boardCertificationData : (formData?.UserBoardCertification || [])).map((item: any) => ({
                ...item,
                UserBoardCertifiedDate: toIsoOrNull(item?.UserBoardCertifiedDate),
                UserBoardExpirationDate: toIsoOrNull(item?.UserBoardExpirationDate),
            })),
            UserEducation: (userEducation?.length ? userEducation : (formData?.UserEducation || [])).map((item: any) => ({
                ...item,
                DegreeReceivedDate: toIsoOrNull(item?.DegreeReceivedDate),
                DegreeVerifiedDate: toIsoOrNull(item?.DegreeVerifiedDate),
            })),
            UserCertificationDetails: [
                ...requiredCoursesPayload,
                ...recertCoursesPayload,
                ...specialtyCoursesPayload,
            ],
            RequiredCertificationCourses: requiredCoursesPayload,
            RecertificationCourses: recertCoursesPayload,
            SpecialtyCourses: specialtyCoursesPayload,
            CPTCodeList: selectedGPTCodes.map((item: any) => String(item?.value ?? item?.code ?? item?.label ?? "")),
            Affiliation: Number((formData as any)?.Affiliation?.AffiliationTypeId ?? formData?.Affiliation ?? 0),
            MalPracticeCarrier: String((formData as any)?.MalPracticeCarrier ?? formData?.Malpractice ?? ""),
            DoB: toIsoOrNull(formData?.DoB),
            MedicalExperienceStartDate: toIsoOrNull(formData?.MedicalExperienceStartDate),
            MDEExperienceStartDate: toIsoOrNull(formData?.MDEExperienceStartDate),
            UserSignedDate: toIsoOrNull(formData?.UserSignedDate),
            MalPracticeExpiryDate: toIsoOrNull((formData as any)?.MalPracticeExpiryDate ?? formData?.ExpiryDate),
        };

        try {
            if (isCreate) {
                const accountPayload: any = mapToAddUserApiPayload({
                    ...formData,
                    PhoneNumber: phoneDigits,
                    Roles: selectedRoles,
                });

                const res = await addAccountUser(accountPayload);
                await addProviderUser(mapToApiPayload({...payload, UserId: res}));
            } else {
                await editProviderUser(mapToEditApiPayload({ ...payload }));
            }
        } catch (error: any) {
            const action = isCreate ? "create provider user" : "update provider user";
            console.error(`Failed to ${action}.`, error);
            throw error;
        }
    }, [boardCertificationData, formData, isCreate, recertificationCourses, requiredCertificationCourses, selectedGPTCodes, specialtyCourses, userEducation]);
   
    const handleSave = useCallback(async () => {
        const { isValid, firstError, firstErrorField } = validateForm();
        if (!isValid) {
            showToast(firstError ?? "Please fill all mandatory fields.", TOAST_TYPES.ERROR);
            if (firstErrorField) {
                const scrollToField = () => {
                    const el = document.querySelector(
                        `[data-provider-user-field="${CSS.escape(firstErrorField)}"]`
                    );
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                };
                requestAnimationFrame(() => requestAnimationFrame(scrollToField));
            }
            return;
        }
        setSaving(true);
        try {
            await updateUser();
            showToast(isCreate ? "Provider user created successfully." : "Provider user updated successfully.", TOAST_TYPES.SUCCESS);
            if (isCreate) {
                setErrors({});
                setFormData({ ...ProviderUserInitialState });
                setActualFormData({ ...ProviderUserInitialState });
                setMode("add");
                setUserEducation([]);
                setBoardCertificationData([]);
                setSelectedGPTCodes([]);
                setUserEducationValues(initialUserEducation);
                setUserBoardCertValues(initialUserBoardCertification);
                setRequiredCertificationCourses([]);
                setRecertificationCourses([]);
                setSpecialtyCourses([]);
                setOpenEducationalDrawer(false);
                setOpenBoardCertificationDrawer(false);
                setRefreshDialogOpen(false);
                dispatch(setSelectedTab({ username: "" }));
                navigate("/provider-management/users");
            } else {
                if (userId) dispatch(upsertAccountUserData({ username: userId, data: formData }));
                handleOpenTab(userId, false);
            }
        } catch (error: any) {
            showToast(getErrorMessage(error, isCreate ? "Failed to create provider user." : "Failed to update provider user."), TOAST_TYPES.ERROR);
        } finally {
            setSaving(false);
        }
    }, [dispatch, formData, handleOpenTab, isCreate, navigate, updateUser, userId, validateForm]);

    const handleCancel = useCallback(() => {
        if (isCreate) {
            navigate("/provider-management/users");
        }
        handleOpenTab(userId, false);
        setErrors({});
        if (userId) dispatch(cancelUpsertAccountUserData({ username: userId }));
    }, [dispatch, handleOpenTab, isCreate, navigate, userId]);

    const handleEditClick = useCallback(() => {
        handleOpenTab(userId, true);
    }, [handleOpenTab, userId]);

    // Education handlers
    const handleAddEducationalDetails = useCallback(() => {
        setBottomAccordionsExpanded((prev) => ({ ...prev, education: true }));
        setMode("add");
        setOpenEducationalDrawer(true);
    }, []);

    const handleEducationSave = useCallback(() => {
        setUserEducation(prev => [...prev, userEducationValues]);
        setUserEducationValues(initialUserEducation);
        setOpenEducationalDrawer(false);
    }, [userEducationValues]);

    const handleGetEducationalFormData = useCallback((val: any) => {
        setUserEducationValues(val);
    }, []);

    // Board certification handlers
    const handleAddBoardCertificationDetails = useCallback(() => {
        setBottomAccordionsExpanded((prev) => ({ ...prev, boardCertification: true }));
        setMode("add");
        setOpenBoardCertificationDrawer(true);
    }, []);

    const handleUserBoardCertificationSave = useCallback(() => {
        setBoardCertificationData(prev => [...prev, userBoardCertValues]);
        setUserBoardCertValues(initialUserBoardCertification);
        setOpenBoardCertificationDrawer(false);
    }, [userBoardCertValues]);

    const handleGetBoardCertificationFormData = useCallback((val: any) => {
        setUserBoardCertValues(val);
    }, []);

    const handleCPTCodeBtnClick = useCallback(async () => {
        const facilityIds = toFacilityIdArray(formData?.FacilityId);
        if (facilityIds.length === 0) {
            showToast("Select a Primary Facility first.", TOAST_TYPES.WARNING);
            return;
        }

        try {
            const facilityCpt = await getFacilityCPTCodes(facilityIds);
            const facilityCodes = (facilityCpt?.CPTCodeList ?? [])
                .map((c) =>
                    typeof c === "string" || typeof c === "number"
                        ? String(c)
                        : String((c as any)?.Table ?? (c as any)?.code ?? (c as any)?.value ?? (c as any)?.Id ?? "")
                )
                .filter(Boolean);
            const facilityCodeSet = new Set(facilityCodes);

            let catalog = cptCatalogRef.current;
            if (catalog.length === 0) {
                catalog = await getDiagnosticListWithColoring(facilityIds, facilityCpt);
                cptCatalogRef.current = catalog;
                cptOptionsFetchedRef.current = true;
            }

            const mappedOptions: SelectOption[] = catalog.map((item) =>
                toCptSelectOption(
                    item,
                    item.ids.some((id) => facilityCodeSet.has(id)) || facilityCodeSet.has(item.value)
                )
            );
            setCptOptions(mappedOptions);

            const fetchedSelection = mapFacilityCptCodesToOptions(facilityCodes, catalog, true);
            setSelectedGPTCodes((prev) => {
                const remappedPrev = remapCptSelectOptions(prev, catalog, facilityCodeSet);
                const byCode = new Map(remappedPrev.map((o) => [String(o.code), o] as const));
                fetchedSelection.forEach((option) => {
                    byCode.set(String(option.code), option);
                });
                return Array.from(byCode.values());
            });

            const ranges = facilityCpt?.CPTCodeRangeList ?? [];
            if (ranges.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    CPTCodeRangeList: ranges,
                }) as ProviderUser);
            }

            showToast("CPT codes fetched successfully.", TOAST_TYPES.SUCCESS);
        } catch (error) {
            console.error("Failed to fetch CPT codes:", error);
            showToast("Failed to fetch CPT codes.", TOAST_TYPES.ERROR);
        }
    }, [formData?.FacilityId]);

    useEffect(() => {
        if (!cptCatalog?.length) return;
        cptCatalogRef.current = cptCatalog;
        cptOptionsFetchedRef.current = true;
        setCptOptions(cptCatalog.map((item) => toCptSelectOption(item)));
        setSelectedGPTCodes((prev) =>
            prev.length > 0 ? remapCptSelectOptions(prev, cptCatalog) : prev
        );
    }, [cptCatalog]);

    const handleCptDropdownOpen = useCallback(() => {
        if (cptCatalogRef.current.length > 0 || cptOptionsFetchedRef.current) return;
        cptOptionsFetchedRef.current = true;
        setCptOptionsLoading(true);
        getDiagnosticListWithColoring([])
            .then((data) => {
                cptCatalogRef.current = data;
                setCptOptions(data.map((item) => toCptSelectOption(item)));
                setSelectedGPTCodes((prev) =>
                    prev.length > 0 ? remapCptSelectOptions(prev, data) : prev
                );
            })
            .catch((error) => {
                console.error("Failed to load CPT options:", error);
                cptOptionsFetchedRef.current = false;
            })
            .finally(() => setCptOptionsLoading(false));
    }, []);

    const handleAddClick = useCallback(() => {
        setBottomAccordionsExpanded((prev) => ({ ...prev, userLicenses: true }));
        licenseTableRef.current?.addRow();
    }, []);

    const handleBottomAccordionExpandedChange = useCallback((key: BottomAccordionKey, expanded: boolean) => {
        setBottomAccordionsExpanded((prev) => {
            if (prev[key] === expanded) return prev;
            return { ...prev, [key]: expanded };
        });
    }, []);

    // Effects
    useEffect(() => {
        if (!isOpenTabWithCreateMode) return;
        setBottomAccordionsExpanded(createBottomAccordionState(true));
    }, [isOpenTabWithCreateMode]);

    useEffect(() => {
        if (isCreate && Array.isArray(userRoles) && userRoles.length > 0) {
            setFormData(prevState => {
                if (JSON.stringify(prevState.Roles) !== JSON.stringify(userRoles)) {
                    return {
                        ...prevState,
                        Roles: userRoles
                    };
                }
                return prevState;
            });
            if (!createCertificationsFetchStartedRef.current) {
                createCertificationsFetchStartedRef.current = true;
                getCertifications();
            }
        }
    }, [isCreate, userRoles, getCertifications]);

    // Sync course arrays from formData only when not creating a user
    useEffect(() => {
        if (!isCreate) {
            if (formData?.RecertificationCourses)
                setRecertificationCourses(formData.RecertificationCourses);
            if (formData?.RequiredCertificationCourses)
                setRequiredCertificationCourses(formData.RequiredCertificationCourses);
            if (formData?.SpecialtyCourses)
                setSpecialtyCourses(formData.SpecialtyCourses);
        }
    }, [formData?.RecertificationCourses, formData?.RequiredCertificationCourses, formData?.SpecialtyCourses, isCreate]);

    useEffect(() => {
        const hasData =
            affiliations?.length > 0 ||
            userRoles.length > 0 ||
            facility?.length > 0 ||
            allStates?.length > 0 ||
            specialties?.length > 0 ||
            professionalTitles?.length > 0 ||
            otherFacilities?.length > 0 ||
            credentialStatuses?.length > 0 ||
            schedulingType?.length > 0 ||
            organizations?.length > 0;

        if (!hasData && !providerLookupFetchStartedRef.current) {
            providerLookupFetchStartedRef.current = true;
            dispatch(fetchProviderUserData() as any);
        }
    }, [dispatch, affiliations?.length, userRoles.length, facility?.length, allStates?.length, specialties?.length, professionalTitles?.length, schedulingType?.length, organizations?.length, otherFacilities?.length, credentialStatuses?.length]);

    useEffect(() => {
        let isMounted = true;
        getAllDbqMaster()
            .then((data) => {
                if (!isMounted || !Array.isArray(data)) return;
                const mapped = data.map((item) => ({
                    label: item.Description || item.DBQName || `DBQ ${item.Id}`,
                    code: item.Id,
                }));
                setSupplementalDbqOptions(mapped);
            })
            .catch((err) => {
                console.error("Failed to load DBQ master items", err);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;

        const loadUserData = async () => {
            setLoading(true);
            try {
                const cachedUser = providerUsersByName[userId]?.data;
                if (cachedUser) {
                    if (isMounted) {
                        applyProviderUserData(cachedUser);
                    }
                    return;
                }

                let request =
                    userDetailsRequestRef.current?.userId === userId
                        ? userDetailsRequestRef.current.request
                        : inFlightUserDetailsRequests.get(userId);
                if (!request) {
                    request = (async () => {
                        const accountUserData = await getAccountUserByUsername(userId);
                        const providerUserId = Number(accountUserData?.UserId ?? 0);
                        const providerUserData = providerUserId > 0 ? await getProviderUserById(providerUserId) : {};
                        const mergedData: ProviderUser = {
                            ...ProviderUserInitialState,
                            ...accountUserData,
                            ...providerUserData,
                            UserId: providerUserId || (providerUserData as any)?.UserId || null,
                        };
                        // API often returns NpiNumber; form + ProviderUser type use UserNPINumber (see mapToEditApiPayload).
                        const npiRaw =
                            mergedData.UserNPINumber ??
                            (mergedData as any).NpiNumber ??
                            null;
                        const accountDoB =
                            (accountUserData as any)?.DoB ??
                            (accountUserData as any)?.DateOfBirth ??
                            null;
                        // Normalize all form date fields to yyyy-MM-dd for HTML date inputs.
                        const normalizedDateFields: Partial<ProviderUser> = {
                            DoB: toDateInputString(accountDoB),
                            MedicalExperienceStartDate: toDateInputString(mergedData.MedicalExperienceStartDate),
                            MDEExperienceStartDate: toDateInputString(mergedData.MDEExperienceStartDate),
                        };

                        // Contract signed date may arrive under alternate backend keys.
                        const signedRaw =
                            mergedData.UserSignedDate ??
                            (mergedData as any).userSignedDate ??
                            (mergedData as any).SignedDate ??
                            "";
                        return {
                            ...mergedData,
                            ...normalizedDateFields,
                            UserNPINumber:
                                npiRaw == null || npiRaw === "" ? null : String(npiRaw),
                            UserSignedDate: toDateInputString(signedRaw),
                        };
                    })();
                    inFlightUserDetailsRequests.set(userId, request);
                }
                userDetailsRequestRef.current = { userId, request };

                const mergedData = await request;

                if (isMounted) {
                    applyProviderUserData(mergedData);
                    dispatch(upsertAccountUserData({ username: userId, data: mergedData }));
                }
            } catch (error: any) {
                console.error("Failed to load account/provider user data:", error);
                showToast(getErrorMessage(error, "Failed to load user data."), TOAST_TYPES.ERROR);
            } finally {
                inFlightUserDetailsRequests.delete(userId);
                if (isMounted) setLoading(false);
            }
        };

        loadUserData();
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    useEffect(() => {
        const handleResize = () => {
            const newWidth = window.innerWidth;
            if (Math.abs(windowWidthRef.current - newWidth) > 50) {
                windowWidthRef.current = newWidth;
                setWindowWidth(newWidth);
            }
        };

        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!openTabs?.length && !isCreate) {
            navigate(`/provider-management/users`, { replace: true });
        }
        return () => {
            if (!location?.pathname.startsWith('/provider-management/users')) {
                dispatch(deleteAllProviderUserTab());
            }
        };
    }, [openTabs?.length, navigate, location?.pathname, dispatch, isCreate]);

    // Memoized values
    const styles = useMemo(() => {
        const baseStyles = getStyles(theme, windowWidth);

        return {
            ...baseStyles,
            editBtn: baseStyles.accountUsersEditBtn,
            editBtnHover: baseStyles.accountUsersEditBtnHover,
            cancelBtn: baseStyles.accountUsersCancelBtn,
            saveBtn: baseStyles.accountUsersSaveBtn,
            closeIcon: baseStyles.accountUsersCloseIcon,
            header: {
                ...baseStyles.accountUsersHeader,
            },
            grid: {
                ...baseStyles.grid,
                gap: isMobile ? 20 : 280,
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingLeft: "60px",
            },
            formGroup: {
                ...baseStyles.formGroup,
                marginBottom: 14,
            },
            input: {
                ...baseStyles.input,
                ...(isDarkMode
                    ? {
                          background: P.secondaryElevatedDark,
                          backgroundColor: P.secondaryElevatedDark,
                      }
                    : {}),
            },
        };
    }, [theme, windowWidth, isMobile, isDarkMode]);
    const chipText = theme.custom?.text?.chip;
    const chipColor = chipText?.color ?? theme.palette.primary.main;
    const providerUserTheme = useMemo(() => getThemeStyles(isDarkMode), [isDarkMode]);
    const drawerStyles = useMemo(() => getDrawerComponentStyles(providerUserTheme), [providerUserTheme]);
    const selectOptions = useMemo(() => {
        return {
            professionalTitles: professionalTitles?.map(item => ({
                ...item,
                keyValue: item.ProfessionalTitleDescription,
                keyValueId: item.ProfessionalTitleName
            })) || [],
            otherFacilities: otherFacilities?.map(item => {
                return({
                ...item,
                label: item.FaciltiyName,
                code: item.FacilityId
            })}) || [],
            credentialStatuses: credentialStatuses?.map(item => ({
                ...item,
                keyValue: item.Description,
                keyValueId: item.Name
            })) || [],
            specialties: specialties?.map(item => ({
                ...item,
                label: item.SpecialityDescription,
                code: item.Id
            })) || [],
            schedulingType: schedulingType?.map(item => ({
                ...item,
                label: item.SchedulingTypeValue,
                code: item.SchedulingTypeId
            })) || [],
            affiliations: affiliations?.map(item => ({
                ...item,
                keyValue: item.AffiliationTypeValue,
                keyValueId: item.AffiliationTypeId
            })) || [],
            facility: facility?.map(item => ({
                ...item,
                label: item.FacilityPracticeName,
                // Use numeric Id so selected FacilityId values from the API match options
                code: item.Id
            })) || [],
            organizations: organizations?.map(item => ({
                ...item,
                keyValue: item.OrganizationName,
                keyValueId: item.Id
            })) || [],
            approverOrganizations: organizations?.map(item => ({
                ...item,
                label: item.OrganizationName,
                code: item.Id,
            })) || [],
            supplementalDbqs: supplementalDbqOptions,
            userRoles: userRoles?.map(role => ({
                ...role,
                keyValue: role.Name,
                keyValueId: role.ApplicationRoleId
            })) || [],
        };
    }, [professionalTitles, otherFacilities, credentialStatuses, specialties, schedulingType, affiliations, facility, organizations, userRoles, supplementalDbqOptions]);

    const {
        educationalColumns,
        boardCertificationColumns,
        CPTCodeRangesColumns,
        requiredCertificationCoursesColumns,
        reCertificationCoursesColumns,
        specialtyCoursesColumns,
    } = useTableColumns(windowWidth, isMobile, isOpenTabWithCreateMode);

    const licenseTableRef = useRef<LicenseTableRef>(null);

    const renderProviderField = useCallback(
        (
            fieldConfig: ProviderFieldConfig,
            extra?: { disabled?: boolean }
        ) => (
            <Box key={fieldConfig.field} data-provider-user-field={fieldConfig.field} sx={{ width: "100%" }}>
                <MemoizedRenderField
                    fieldConfig={fieldConfig}
                    formData={formData}
                    errors={errors}
                    isEditing={isOpenTabWithCreateMode}
                    styles={styles}
                    professionalTitles={professionalTitles}
                    otherFacilities={otherFacilities}
                    credentialStatuses={credentialStatuses}
                    schedulingType={schedulingType}
                    specialties={specialties}
                    affiliations={affiliations}
                    organizations={organizations}
                    userTypeObjVal={userTypeObjVal}
                    selectOptions={selectOptions}
                    handleChange={handleChange}
                    isDarkMode={isDarkMode}
                    required={fieldConfig?.required ?? false}
                    disabled={extra?.disabled}
                    accountUsersForm
                />
            </Box>
        ),
        [
            formData,
            errors,
            isOpenTabWithCreateMode,
            styles,
            professionalTitles,
            otherFacilities,
            credentialStatuses,
            schedulingType,
            specialties,
            affiliations,
            organizations,
            selectOptions,
            handleChange,
            isDarkMode,
        ]
    );

    const leftColumnFieldNodes = useMemo(
        () => leftColumnFields.map((fieldConfig) => renderProviderField(fieldConfig)),
        [renderProviderField]
    );

    const handleCopyCurrentFacility = useCallback(() => {
        const primary = Array.isArray(formData?.FacilityId) ? formData.FacilityId : [];
        if (!primary.length) {
            showToast("Select a Primary Facility first.", TOAST_TYPES.WARNING);
            return;
        }
        const existingOther = Array.isArray(formData?.FacilityIdOther) ? formData.FacilityIdOther : [];
        const byCode = new Map<string, any>();
        [...existingOther, ...primary].forEach((item: any) => {
            const code = String(
                item?.code ?? item?.Id ?? item?.FacilityId ?? item?.FacilityUuid ?? item ?? ""
            );
            if (!code || code === "undefined" || code === "null") return;
            if (byCode.has(code)) return;
            if (item && typeof item === "object") {
                byCode.set(code, {
                    ...item,
                    code: item.code ?? item.Id ?? item.FacilityId ?? code,
                    label:
                        item.label ??
                        item.FacilityPracticeName ??
                        item.FaciltiyName ??
                        String(code),
                });
            } else {
                byCode.set(code, { code, label: String(item) });
            }
        });
        handleChange("FacilityIdOther", Array.from(byCode.values()));
        showToast("Primary facility copied to Other Facility.", TOAST_TYPES.SUCCESS);
    }, [formData?.FacilityId, formData?.FacilityIdOther, handleChange]);

    const middleColumnFieldNodes = useMemo(
        () =>
            middleColumnFields.map((fieldConfig) => (
                <React.Fragment key={fieldConfig.field}>
                    {renderProviderField(fieldConfig)}
                    {isOpenTabWithCreateMode && fieldConfig.field === "FacilityIdOther" && (
                        <Box sx={{ mt: 0.5, mb: 1.5 }}>
                            <Button
                                variant="contained"
                                onClick={handleCopyCurrentFacility}
                                sx={{
                                    height: 34,
                                    borderRadius: "10px",
                                    textTransform: "none",
                                    fontWeight: 400,
                                    fontSize: 14,
                                    px: 1.25,
                                    backgroundColor: P.primary,
                                    "&:hover": {
                                        backgroundColor: P.primaryHover,
                                    },
                                }}
                            >
                                Copy Current Facilities
                            </Button>
                        </Box>
                    )}
                </React.Fragment>
            )),
        [renderProviderField, isOpenTabWithCreateMode, handleCopyCurrentFacility]
    );

    const rightColumnFieldNodesBeforeUsername = useMemo(() => {
        const before = ["Affiliation", "VBATrainId", "Roles"];
        return rightColumnFields
            .filter((f) => before.includes(f.field))
            .map((fieldConfig) => renderProviderField(fieldConfig));
    }, [renderProviderField]);

    const rightColumnFieldNodesAfterUsername = useMemo(() => {
        const after = ["UserNPINumber", "UserSignedDate", "CredentialingStatus", "UserSpecialConsiderations"];
        return rightColumnFields
            .filter((f) => after.includes(f.field))
            .map((fieldConfig) =>
                renderProviderField(fieldConfig, {
                    disabled: fieldConfig.field === "UserSignedDate" && !isCreate,
                })
            );
    }, [renderProviderField, isCreate]);

    // ★★★ KEY: Use deferred values for row data ★★★
    const RequiredCertificationCoursesRows = useMemo(() => {
        return (deferredRequiredCourses || []).map((certificate: CertificationCourse, index: number) => ({
            ...certificate,
            id: certificate.Id || index,
        }));
    }, [deferredRequiredCourses]);

    const reCertificationCoursesRows = useMemo(() => {
        return (deferredRecertCourses || []).map((certificate, index) => ({
            ...certificate,
            id: certificate.Id || index,
        }));
    }, [deferredRecertCourses]);

    const specialtyCoursesRows = useMemo(() => {
        return (deferredSpecialtyCourses || []).map((certificate, index) => ({
            ...certificate,
            id: certificate.Id || index,
        }));
    }, [deferredSpecialtyCourses]);

    const educationDetailsRow = useMemo(() => {
        return deferredUserEducation?.map((edu, index) => ({
            ...edu,
            id: index,
        })) || [];
    }, [deferredUserEducation]);

    const boardCertRows = useMemo(() => {
        return deferredBoardCertificationData?.map((cert, index) => ({
            ...cert,
            id: index,
        })) || [];
    }, [deferredBoardCertificationData]);

    const cptCodeRangeRows = useMemo(() => {
        const ranges = (formData as { CPTCodeRangeList?: Record<string, unknown>[] })?.CPTCodeRangeList || [];

        return ranges.map((range: Record<string, unknown>, index: number) => ({
            ...range,
            id: (range as { id?: unknown; Id?: unknown })?.id ?? (range as { Id?: unknown })?.Id ?? index,
        }));
    }, [formData]);

    const handleTabClick = useCallback((username: string) => {
        dispatch(setSelectedTab({ username }));
        navigate(`/provider-management/users/${username}`);
    }, [dispatch, navigate]);

    const handleTabTitleClick = useCallback(() => {
        dispatch(setSelectedTab({ username: "" }));
        navigate("/provider-management/users");
    }, [dispatch, navigate]);

    const handleOnCloseTab = useCallback((id: string, username: string) => {
        dispatch(deleteProviderUserTab(id));
        dispatch(setSelectedTab({ username: "" }));
        dispatch(deleteAccountUserByUsername({ username: username }));
    }, [dispatch]);

    const onCreateRefreshPromptOpen = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setRefreshDialogOpen(true);
    }, []);

    const onCreateTabCloseClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleCancel();
    }, [handleCancel]);
    const onCreateAddUserTextClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleTabsHeaderCloseTab = useCallback((id: string | number, username: string) => {
        handleOnCloseTab(String(id), username);
    }, [handleOnCloseTab]);
    const handleTabsHeaderTabClick = useCallback((id: string | number) => {
        handleTabClick(String(id));
    }, [handleTabClick]);

    const handleRefreshConfirm = useCallback(() => {
        setRefreshDialogOpen(false);
        setFormData(ProviderUserInitialState);
    }, []);

    const handleRefreshClose = useCallback(() => {
        setRefreshDialogOpen(false);
    }, []);

    const detailsTitle = isCreate
        ? "Add User"
        : [formData?.LastName, formData?.FirstName].filter(Boolean).join(",");

    // Render helpers
    const renderTabsOrBreadcrumb = useMemo(() => {
        if (isCreate) {
            return (
                <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="h6" sx={styles.userTitle} onClick={handleCancel}>
                        Users
                    </Typography>
                    <Box onClick={handleCancel} sx={styles.userTabs}>
                        <Tooltip title="Refresh" sx={{ mr: 1 }}>
                            <IconButton
                                size="small"
                                onClick={onCreateRefreshPromptOpen}
                                sx={{
                                    p: 0.25,
                                    width: 18,
                                    height: 18,
                                    minWidth: 18,
                                    minHeight: 18,
                                    color: chipColor,
                                }}
                            >
                                <Box
                                    component="img"
                                    src={RefreshIcon}
                                    alt="Refresh"
                                    sx={{ width: 14, height: 14 }}
                                />
                            </IconButton>
                        </Tooltip>
                        <Typography component="span" sx={styles.addUserAddText} onClick={onCreateAddUserTextClick}>
                            Add User
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={onCreateTabCloseClick}
                            sx={styles.addUserCloseIcon}
                        >
                            <CloseRoundedIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                        </IconButton>
                    </Box>
                </Box>
            );
        }

        return (
            <TabsHeader
                baseTitle="Users"
                basePath="/provider-management/users"
                openTabs={openTabs}
                onCloseTab={handleTabsHeaderCloseTab}
                styles={styles}
                selectedTabs={selectedTab}
                handleTabClick={handleTabsHeaderTabClick}
                handleTabTitleClick={handleTabTitleClick}
            />
        );
    }, [isCreate, openTabs, styles, selectedTab, handleTabTitleClick, handleCancel, chipColor, theme.palette.text.secondary, handleTabsHeaderCloseTab, handleTabsHeaderTabClick, onCreateRefreshPromptOpen, onCreateTabCloseClick, onCreateAddUserTextClick]);

    const isClcwSme = !!formData?.IsCLCW_SME;
    const is1151Sme = !!(formData as { Is1151_SME?: boolean })?.Is1151_SME;

    const renderCheckboxes = useMemo(() => (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "16px 25px",
                minHeight: 60,
                boxSizing: "border-box",
                px: "16px",
                py: 1,
                borderTop: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke}`,
                borderBottom: "none",
            }}
        >
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isClcwSme}
                        disabled={!isOpenTabWithCreateMode}
                        onChange={(e) => handleChange("IsCLCW_SME", e.target.checked)}
                        size="small"
                        sx={{
                            p: 0,
                            mr: "10px",
                            color: isDarkMode ? P.white : P.uploadButtonBg,
                            "&.Mui-checked": {
                                color: isDarkMode ? P.white : P.primary,
                            },
                            ...(isDarkMode
                                ? {
                                      "&.Mui-disabled, &.Mui-checked.Mui-disabled": {
                                          color: P.white,
                                          opacity: 1,
                                      },
                                  }
                                : {}),
                            "& .MuiSvgIcon-root": {
                                fontSize: 15,
                                color: "inherit",
                            },
                        }}
                    />
                }
                label="CLCW SME"
                sx={{
                    m: 0,
                    gap: 0,
                    alignItems: "center",
                    ".MuiFormControlLabel-label, &.Mui-disabled .MuiFormControlLabel-label": {
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: "normal",
                        color: isDarkMode ? P.white : P.black,
                    },
                }}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={is1151Sme}
                        disabled={!isOpenTabWithCreateMode}
                        onChange={(e) => handleChange("Is1151_SME", e.target.checked)}
                        size="small"
                        sx={{
                            p: 0,
                            mr: "10px",
                            color: isDarkMode ? P.white : P.uploadButtonBg,
                            "&.Mui-checked": {
                                color: isDarkMode ? P.white : P.primary,
                            },
                            ...(isDarkMode
                                ? {
                                      "&.Mui-disabled, &.Mui-checked.Mui-disabled": {
                                          color: P.white,
                                          opacity: 1,
                                      },
                                  }
                                : {}),
                            "& .MuiSvgIcon-root": {
                                fontSize: 15,
                                color: "inherit",
                            },
                        }}
                    />
                }
                label="1151 SME"
                sx={{
                    m: 0,
                    gap: 0,
                    alignItems: "center",
                    ".MuiFormControlLabel-label, &.Mui-disabled .MuiFormControlLabel-label": {
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: "normal",
                        color: isDarkMode ? P.white : P.black,
                    },
                }}
            />
        </Box>
    ), [
        isClcwSme,
        is1151Sme,
        handleChange,
        isDarkMode,
        isOpenTabWithCreateMode,
    ]);

    if (loading || accountUserLoading) {
        return (
            <Box sx={{ marginBottom: "20px" }}>
                {renderTabsOrBreadcrumb}
                <SkeletonLoader />
            </Box>
        );
    }

    return (
        <Box sx={{ marginBottom: "20px", minWidth: 0, width: "100%" }}>
            {renderTabsOrBreadcrumb}

            <div
                style={{
                    ...styles.accountUsersContainer,
                    minHeight: "auto",
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    paddingBottom: 0,
                }}
            >
                <div style={styles.accountUsersPaper}>
                    <HeaderWithEditActions
                        title={detailsTitle}
                        isEditing={isOpenTabWithCreateMode}
                        saving={saving}
                        onEdit={handleEditClick}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        styles={styles}
                        isCreate={isCreate}
                        headerPadding="15px 22px"
                    />
                    <div
                        style={{
                            ...(styles.accountUsersGrid as React.CSSProperties),
                            padding: "14px 22px 24px",
                            boxSizing: "border-box",
                            background: styles.accountUsersPaper.background,
                        }}
                    >
                        <Box sx={styles.formColumn}>
                            {leftColumnFieldNodes}
                        </Box>

                        <Box sx={styles.formColumn}>
                            {middleColumnFieldNodes}
                        </Box>

                        <Box sx={styles.formColumn}>
                            {rightColumnFieldNodesBeforeUsername}

                            <Box data-provider-user-field="UserName" sx={{ width: "100%" }}>
                                <MemoizedFormField
                                    key="UserName"
                                    label="Username"
                                    field="UserName"
                                    type="text"
                                    data-testid={`input-UserName`}
                                    value={formData?.UserName ?? ""}
                                    isEditing={isOpenTabWithCreateMode}
                                    onChange={handleChange}
                                    styles={styles}
                                    required={true}
                                    maxLength={100}
                                    placeholder="Type User Name"
                                    error={errors.UserName}
                                    isDarkMode={isDarkMode}
                                />
                            </Box>

                            {rightColumnFieldNodesAfterUsername}

                            <FormGroup sx={{ gap: "10px" }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!formData?.DisableAlerts}
                                            disabled={!isOpenTabWithCreateMode}
                                            onChange={(e) => handleChange("DisableAlerts", e.target.checked)}
                                            sx={{
                                                p: 0,
                                                mr: "10px",
                                                color: isDarkMode ? P.white : P.uploadButtonBg,
                                                "&.Mui-checked": {
                                                    color: isDarkMode ? P.white : P.primary,
                                                },
                                                ...(isDarkMode
                                                    ? {
                                                          "&.Mui-disabled, &.Mui-checked.Mui-disabled": {
                                                              color: P.white,
                                                              opacity: 1,
                                                          },
                                                      }
                                                    : {}),
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 20,
                                                    marginBottom: 0,
                                                    color: "inherit",
                                                },
                                            }}
                                        />
                                    }
                                    label="Disable Alert Emails"
                                    sx={{
                                        m: 0,
                                        alignItems: "center",
                                        ".MuiFormControlLabel-label, &.Mui-disabled .MuiFormControlLabel-label": {
                                            fontSize: 14,
                                            fontWeight: 400,
                                            lineHeight: "normal",
                                            marginBottom: 0,
                                            color: isDarkMode ? P.white : P.black,
                                        },
                                    }}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!formData?.ResidencyStatus}
                                            disabled={!isOpenTabWithCreateMode}
                                            onChange={(e) => handleChange("ResidencyStatus", e.target.checked)}
                                            sx={{
                                                p: 0,
                                                mr: "10px",
                                                color: isDarkMode ? P.white : P.uploadButtonBg,
                                                "&.Mui-checked": {
                                                    color: isDarkMode ? P.white : P.primary,
                                                },
                                                ...(isDarkMode
                                                    ? {
                                                          "&.Mui-disabled, &.Mui-checked.Mui-disabled": {
                                                              color: P.white,
                                                              opacity: 1,
                                                          },
                                                      }
                                                    : {}),
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 20,
                                                    marginBottom: 0,
                                                    color: "inherit",
                                                },
                                            }}
                                        />
                                    }
                                    label="Residency Status"
                                    sx={{
                                        m: 0,
                                        alignItems: "center",
                                        ".MuiFormControlLabel-label, &.Mui-disabled .MuiFormControlLabel-label": {
                                            fontSize: 14,
                                            fontWeight: 400,
                                            lineHeight: "normal",
                                            marginBottom: 0,
                                            color: isDarkMode ? P.white : P.black,
                                        },
                                    }}
                                />
                            </FormGroup>
                        </Box>
                    </div>
                </div>

                <MemoizedAccordionDataGrid
                    title="Educational Details"
                    onBtnClick={handleAddEducationalDetails}
                    columns={educationalColumns}
                    rows={educationDetailsRow}
                    isDarkMode={isDarkMode}
                    headerBgColor={isDarkMode ? P.black : undefined}
                    styles={styles}
                    showAddButton={isOpenTabWithCreateMode}
                    expanded={bottomAccordionsExpanded.education}
                    onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("education", expanded)}
                    accordionKey="education"
                    wrappedColumnHeaders
                />

                <MemoizedAccordionDataGrid
                    title="Board Certification Details"
                    onBtnClick={handleAddBoardCertificationDetails}
                    columns={boardCertificationColumns}
                    rows={boardCertRows}
                    isDarkMode={isDarkMode}
                    headerBgColor={isDarkMode ? P.black : undefined}
                    styles={styles}
                    showAddButton={isOpenTabWithCreateMode}
                    expanded={bottomAccordionsExpanded.boardCertification}
                    onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("boardCertification", expanded)}
                    accordionKey="boardCertification"
                    footer={renderCheckboxes}
                />
                <>
                            {/* CPT Codes — use non-memo accordion so selection state always re-renders */}
                            <AccordionComponent
                                styles={styles}
                                isDarkMode={isDarkMode}
                                headerBgColor={isDarkMode ? P.black : undefined}
                                title="CPT Codes"
                                btnText={windowWidth > 600 ? "Fetch CPT codes from facility" : "Fetch codes"}
                                isFetchCPT={true}
                                showAddButton={isOpenTabWithCreateMode}
                                variant=""
                                onBtnClick={handleCPTCodeBtnClick}
                                expanded={bottomAccordionsExpanded.cptCodes}
                                onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("cptCodes", expanded)}
                                accordionKey="cptCodes"
                                detailsPadding="12px 16px 16px"
                            >
                                <MultiSelectWithChips
                                    options={cptOptions}
                                    value={selectedGPTCodes}
                                    onChange={setSelectedGPTCodes}
                                    onOpen={handleCptDropdownOpen}
                                    loading={cptOptionsLoading}
                                    placeholder="Choose test purpose"
                                    width="100%"
                                    isDark={isDarkMode}
                                    variant="cptCodes"
                                />
                            </AccordionComponent>

                            <MemoizedAccordionDataGrid
                                title="CPT Code Ranges"
                                columns={CPTCodeRangesColumns}
                                rows={cptCodeRangeRows}
                                isDarkMode={isDarkMode}
                                headerBgColor={isDarkMode ? P.black : undefined}
                                styles={styles}
                                showAddButton={false}
                                expanded={bottomAccordionsExpanded.cptCodeRanges}
                                onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("cptCodeRanges", expanded)}
                                accordionKey="cptCodeRanges"
                            />
                </>
                <MemoizedAccordionComponent
                    styles={styles}
                    isDarkMode={isDarkMode}
                    headerBgColor={isDarkMode ? P.black : undefined}
                    title="User License(s)"
                    showAddButton={isOpenTabWithCreateMode}
                    btnText={windowWidth > 600 ? "Add new license" : "Add"}
                    onBtnClick={handleAddClick}
                    expanded={bottomAccordionsExpanded.userLicenses}
                    onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("userLicenses", expanded)}
                    accordionKey="userLicenses"
                >
                    <LicenseTable
                        ref={licenseTableRef}
                        allStates={allStates}
                        isDarkMode={isDarkMode}
                        styles={styles}
                        isEdit={isOpenTabWithCreateMode}
                    />
                </MemoizedAccordionComponent>

                <MemoizedAccordionDataGrid
                    title="Required Certification Courses"
                    columns={requiredCertificationCoursesColumns}
                    showAddButton={false}
                    processRowUpdate={processRequiredCertificationCoursesUpdate}
                    rows={RequiredCertificationCoursesRows}
                    isDarkMode={isDarkMode}
                    headerBgColor={isDarkMode ? P.black : undefined}
                    styles={styles}
                    expanded={bottomAccordionsExpanded.requiredCertificationCourses}
                    onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("requiredCertificationCourses", expanded)}
                    accordionKey="requiredCertificationCourses"
                />

                <MemoizedAccordionDataGrid
                    title="Recertification Courses"
                    columns={reCertificationCoursesColumns}
                    showAddButton={false}
                    processRowUpdate={processRecertificationCoursesUpdate}
                    rows={reCertificationCoursesRows}
                    isDarkMode={isDarkMode}
                    headerBgColor={isDarkMode ? P.black : undefined}
                    styles={styles}
                    expanded={bottomAccordionsExpanded.recertificationCourses}
                    onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("recertificationCourses", expanded)}
                    accordionKey="recertificationCourses"
                />

                <MemoizedAccordionDataGrid
                    title="Specialty Courses"
                    columns={specialtyCoursesColumns}
                    showAddButton={false}
                    processRowUpdate={processSpecialtyCoursesUpdate}
                    rows={specialtyCoursesRows}
                    isDarkMode={isDarkMode}
                    headerBgColor={isDarkMode ? P.black : undefined}
                    styles={styles}
                    expanded={bottomAccordionsExpanded.specialtyCourses}
                    onExpandedChange={(expanded) => handleBottomAccordionExpandedChange("specialtyCourses", expanded)}
                    accordionKey="specialtyCourses"
                />
            </div>

            <ReusableDrawer
                open={openEducationalDrawer}
                onClose={() => setOpenEducationalDrawer(false)}
                title={mode === "add" ? "Add Educational Details" : "Edit Educational Details"}
                onSave={handleEducationSave}
                onCancel={() => setOpenEducationalDrawer(false)}
                isDark={isDarkMode}
                drawerWidth={{ xs: "100%", sm: 600 }}
                cancelBtnVariant="contained"
            >
                <DynamicForm
                    fields={educationalFormField}
                    initialValues={userEducationValues}
                    onChange={handleGetEducationalFormData}
                    styles={drawerStyles}
                    isDark={isDarkMode}
                    inputBackground={isDarkMode ? P.secondaryElevatedDark : undefined}
                    theme={providerUserTheme}
                />
            </ReusableDrawer>

            <ReusableDrawer
                open={openBoardCertificationDrawer}
                onClose={() => setOpenBoardCertificationDrawer(false)}
                title={mode === "add" ? "Add Board Certification" : "Edit Board Certification"}
                onSave={handleUserBoardCertificationSave}
                onCancel={() => setOpenBoardCertificationDrawer(false)}
                isDark={isDarkMode}
                drawerWidth={{ xs: "100%", sm: 600 }}
                cancelBtnVariant="contained"
            >
                <DynamicForm
                    fields={boardCertificationFormField}
                    initialValues={initialBoardCertificationValues}
                    onChange={handleGetBoardCertificationFormData}
                    styles={drawerStyles}
                    isDark={isDarkMode}
                    inputBackground={isDarkMode ? P.secondaryElevatedDark : undefined}
                    theme={providerUserTheme}
                />
            </ReusableDrawer>

            <ConfirmationModal
                open={refreshDialogOpen}
                title="Alert!"
                description="Refreshing this tab will reload the latest data for this tab. Any unsaved changes on this tab will be lost. Other open tabs will remain unchanged. Do you wish to continue?"
                confirmLabel="Yes"
                cancelLabel="Cancel"
                onConfirm={handleRefreshConfirm}
                onCancel={handleRefreshClose}
                onClose={handleRefreshClose}
                isDarkMode={isDarkMode}
            />
        </Box>
    );
};

export default ProviderUserDetails;
