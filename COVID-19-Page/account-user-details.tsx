/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, useTheme } from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { deleteAccountUserTab, deleteAllAccountUserTab } from "../../store/slice/ui-slice";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store";
import { useLocation, useNavigate, useParams } from "react-router";
import { leftColumnFields, middleColumnFields, rightColumnSelectFields, UserTypeId, UserTypeKey, userTypeObjKey, userTypeObjVal, normalizeClusterIds, toClusterSelectOptions } from "../../components/users/utils/util";
import { getStyles } from "../../components/users/utils/styles";
import { AccountUser, AccountUserInitialState, updateAccountUser } from "../../services/account-users";
import { cancelUpsertAccountUserData, deleteAccountUserByUsername, fetchAccountUserByUsername, fetchAccountUserData, setSelectedTab, setUserTabOpen, upsertAccountUserData } from "../../store/slice/account-users-slice";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";
import HeaderWithEditActions from "../../components/users/components/header-with-edit-actions";
import TabsHeader from "../../components/users/components/tabs-header";
import FormField from "../../components/users/components/form-field";
import SelectField from "../../components/users/components/select-filed";
import ConfirmationModal from "../../ui/confirmation-modal";
import SkeletonLoader from "../../components/users/components/skeleton-loader";
import { THEME_PRIMITIVES } from "../../theme";

// -------- Validation --------
interface FormErrors {
    [key: string]: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

const validationRules = {
    FirstName: (value: string) => (!(value ?? "").trim() ? "First name is required" : ""),
    LastName: (value: string) => (!(value ?? "").trim() ? "Last name is required" : ""),
    PrintName: (value: string) => (!(value ?? "").trim() ? "Print name is required" : ""),
    Email: (value: string) => {
        if (!(value ?? "").trim()) return "Email is required";
        return !EMAIL_REGEX.test(value) ? "Invalid email format" : "";
    },
    UserName: (value: string) => (!(value ?? "").trim() ? "Username is required" : ""),
    AddressLine1: (value: string) => (!(value ?? "").trim() ? "Address Line 1 is required" : ""),
    City: (value: string) => (!(value ?? "").trim() ? "City is required" : ""),
    State: (value: string) => (!(value ?? "").trim() ? "State is required" : ""),
    Zip: (value: string) => (!(value ?? "").trim() ? "ZIP Code is required" : ""),
};

// ---------- MAIN COMPONENT ----------
const AccountUserDetails: React.FC = () => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const { managers, clusters, userRoles, lookUpValues, selectedTab, isLoading: accountUserLoading } = useSelector((state: RootState) => state.accountUsers);
    const openTabs = useSelector((state: RootState) => state.ui.accountUsersTabs);
    const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<AccountUser>(() => (AccountUserInitialState));
    const [actualFormData, setActualFormData] = useState<AccountUser>(() => (AccountUserInitialState));
    const accountLookupFetchStartedRef = useRef(false);
    const accountUserRequestRef = useRef<{ username: string; request: Promise<any> } | null>(null);

    // ---------- VALIDATION ----------
    const validateField = useCallback((fieldName: string, value: string): string => {
        const rule = validationRules[fieldName as keyof typeof validationRules];
        return rule ? rule(value) : "";
    }, []);

    const mode = useSelector((state: RootState) => state?.theme?.mode);
    const isDarkMode = mode === "dark";
    const isOpenTab = useSelector(
        (state: RootState) =>
            state.accountUsers.accountUsersByName[params?.userId ?? ""]?.isOpenTab ?? false
    );

    const validateForm = useCallback(() => {
        const newErrors = Object.keys(validationRules).reduce<FormErrors>((acc, field) => {
            const value = formData[field as keyof typeof formData] as string;
            const error = validateField(field, value);
            if (error) acc[field] = error;
            return acc;
        }, {});

        if (!formData.UserTypeId || formData.UserTypeId === 0) {
            newErrors.UserTypeId = "User type is required";
        }
        if (!formData.SkillLevel) {
            newErrors.SkillLevel = "Skill level is required";
        }
        if (!(formData.Roles || []).some((role) => role?.IsSelected === true)) {
            newErrors.Roles = "At least one role is required";
        }
        if (formData.PhoneNumber && !PHONE_REGEX.test(formData.PhoneNumber.replace(/\s/g, ""))) {
            newErrors.PhoneNumber = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        const firstErrorField = Object.keys(newErrors)[0];
        return {
            isValid: Object.keys(newErrors).length === 0,
            firstErrorField,
            errors: newErrors,
        };
    }, [formData, validateField]);
    // ---------- EFFECTS ----------
    useEffect(() => {
        if (!accountLookupFetchStartedRef.current) {
            accountLookupFetchStartedRef.current = true;
            dispatch(fetchAccountUserData() as any);
        }
    }, [dispatch]);

    useEffect(() => {
        if (params.userId) loadUserData(params.userId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.userId]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Only close all tabs if we are navigating away from the users section entirely.
    useEffect(() => {
        if (!openTabs?.length) {
            navigate(`/configuration/users`, { replace: true });
        }
        return () => {
            // Only close all tabs if we are leaving the /configuration/users route entirely
            if (!location?.pathname.startsWith('/configuration/users')) {
                dispatch(deleteAllAccountUserTab());
            }
        };
    }, [openTabs, navigate, location, dispatch]);

    const accountUsersByName = useSelector(
        (state: RootState) => state.accountUsers.accountUsersByName
    );

    const loadUserData = useCallback(
        async (username: string) => {
            setLoading(true);
            try {
                if (accountUsersByName[username]?.data) {
                    // use cached data
                    setFormData(accountUsersByName[username].data);
                    if (!actualFormData?.FirstName || !actualFormData?.LastName) {
                        setActualFormData(accountUsersByName[username]?.actualData || accountUsersByName[username]?.data);
                    }
                } else {
                    let request =
                        accountUserRequestRef.current?.username === username
                            ? accountUserRequestRef.current.request
                            : null;
                    if (!request) {
                        request = dispatch(fetchAccountUserByUsername(username)).unwrap();
                        accountUserRequestRef.current = { username, request };
                    }
                    const result = await request;
                    let data = { ...result?.data };
                    if (data) {
                        const managerId = data.ManagerId;
                        if (managerId) {
                            const managerData = managers?.find(el => Number(el?.UserId) === Number(managerId));
                            data = { ...data, ManagerName: managerData?.FullName || "" }
                        }
                        setFormData(data);
                        setActualFormData(accountUsersByName[username]?.actualData || data);
                    }
                }
            } catch (error: any) {
                console.error("Failed to load user data:", error);
            } finally {
                setLoading(false);
            }
        },
        [accountUsersByName, actualFormData?.FirstName, actualFormData?.LastName, dispatch, managers]
    );

    const handleRefreshClick = async () => {
        if (formData?.UserName) {
            dispatch(deleteAccountUserByUsername({ username: formData?.UserName }));
            const result = await dispatch(fetchAccountUserByUsername(formData?.UserName)).unwrap();
            let data = { ...result?.data };
            if (data) {
                const managerId = data.ManagerId;
                if (managerId) {
                    const managerData = managers?.find(el => Number(el?.UserId) === Number(managerId));
                    data = { ...data, ManagerName: managerData?.FullName || "" }
                }
                setFormData(data);
                setActualFormData(accountUsersByName[formData?.UserName]?.actualData || data);
            }
        }
    };
    
    const updateUser = useCallback(async () => {
        const { Id, FirstName, LastName, PrintName, Email, PhoneNumber, AddressLine1, AddressLine2, City, State, Zip, UserName,
            UserTypeId, Roles, ManagerId, ManagerName, SkillLevel, ClusterLookupValueMappings } = formData;

        const updateAccountUserResult = await updateAccountUser({
            Id,
            FirstName,
            LastName,
            PrintName,
            Email,
            PhoneNumber,
            AddressLine1,
            AddressLine2,
            City,
            State,
            Zip,
            UserName,
            UserTypeId,
            Roles,
            ManagerId,
            ManagerId_input: ManagerName || undefined,
            SkillLevel,
            ClusterLookupValueMappings,
        });
         return updateAccountUserResult;
    }, [formData]);

    const handleOpenTab = useCallback((username: string, isOpenTab: boolean) => {
        dispatch(
            setUserTabOpen({
                username,
                isOpenTab: isOpenTab, // set to true on click
            })
        );
    }, [dispatch]);

    // ---------- HANDLERS ----------
    const handleChange = useCallback((fieldName: string, value: string | string[] | number) => {
        let field = fieldName;

        if (field === 'Skill Level') {
            field = 'SkillLevel';
        }
        if (['User Type', 'UserType'].includes(field)) {
            field = 'UserTypeId';
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }

        if (field === 'Roles') {
            const updatedRoles = (formData?.Roles || []).map(role => ({
                ...role,
                IsSelected: Array.isArray(value) ? value.includes(role.Name) : false,
            }));
            setFormData(prev => {
                const next = { ...prev, Roles: updatedRoles } as AccountUser;
                if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: next }));
                return next;
            });
            return;
        }

        if (field === "UserTypeId") {
            setFormData((prev) => {
                const next = {
                    ...prev,
                    UserTypeId: userTypeObjKey[value as UserTypeKey] as UserTypeId,
                } as AccountUser;
                if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: next }));
                return next;
            });
            return;
        }

        if (field === 'ManagerId') {
            const managersData = (managers || []).find(el => el.UserName === value);
            if (managersData) {
                setFormData(prev => {
                    const next = { ...prev, ManagerId: managersData?.UserId, ManagerName: managersData?.FullName } as AccountUser;
                    if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: next }));
                    return next;
                });
            }
            return;
        }

        if (field === 'SkillLevel') {
            const lookUp = (lookUpValues || []).find(el => el.Description === value);
            if (lookUp) {
                setFormData(prev => {
                    const next = { ...prev, SkillLevel: lookUp?.LookupValueId } as AccountUser;
                    if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: next }));
                    return next;
                });
            }
            return;
        }

        if (field === "ClusterLookupValueMappings") {
            const selectedClusters = normalizeClusterIds(value);
            setFormData((prev) => {
                const next = {
                    ...prev,
                    ClusterLookupValueMappings: selectedClusters,
                } as AccountUser;
                if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: next }));
                return next;
            });
            return;
        }

        setFormData(prev => {
            if ((prev as any)[field] === value) return prev;
            const next = { ...prev, [field]: value } as AccountUser;
            if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: next }));
            return next;
        });
    }, [errors, formData?.Roles, params.userId, dispatch, managers, lookUpValues]);

    const handleSave = useCallback(async () => {
        const { isValid, firstErrorField, errors: validationErrors } = validateForm();
        if (!isValid) {
            if (firstErrorField) {
                const firstInvalidField = document.querySelector(
                    `[name="${firstErrorField}"], [id="${firstErrorField}"], [data-field="${firstErrorField}"]`
                ) as HTMLElement | null;
                firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => firstInvalidField?.focus(), 250);
            }
            showToast(Object.values(validationErrors)[0] || "Please fill all required fields", TOAST_TYPES.ERROR);
            return;
        }
        setSaving(true);
        try {
            await updateUser();
            showToast("User has been saved successfully.", TOAST_TYPES.SUCCESS);
            // After successful save, keep cache in sync with latest formData
            if (params?.userId) dispatch(upsertAccountUserData({ username: params.userId, data: formData }));
        } catch {
            showToast("Failed to update User", TOAST_TYPES.ERROR);
        } finally {
            setSaving(false);
            // setIsEditing(false);
            handleOpenTab(params?.userId ?? "", false);
        }
    }, [dispatch, formData, handleOpenTab, params.userId, updateUser, validateForm]);

    const handleCancel = useCallback(() => {
        // setIsEditing(false);
        handleOpenTab(params?.userId ?? "", false);
        setErrors({});
        // setFormData(actualFormData);
        if (params?.userId) dispatch(cancelUpsertAccountUserData({ username: params.userId ?? "" }));
    }, [dispatch, handleOpenTab, params.userId]);

    // ---------- MEMOS ----------
    const styles = useMemo(() => {
        const base = getStyles(theme, windowWidth);
        return {
            ...base,
            cancelBtn: base.accountUsersCancelBtn,
            saveBtn: base.accountUsersSaveBtn,
            closeIcon: base.accountUsersCloseIcon,
            header: base.accountUsersHeader,
            editBtn: base.accountUsersEditBtn,
            editBtnHover: base.accountUsersEditBtnHover,
            label: {
                ...base.label,
                marginBottom: 9,
                fontWeight: 400,
                color: theme.palette.mode === "dark" ? THEME_PRIMITIVES.lightMutedText : "#757575",
            },
            formGroup: { ...base.formGroup, marginBottom: 24 },
            input: {
                ...base.input,
                background: theme.palette.mode === "dark" ? THEME_PRIMITIVES.secondaryElevatedDark : THEME_PRIMITIVES.white,
                border: "none",
                borderRadius: 10,
                height: "32px",
                padding: "8px 14px",
                boxSizing: "border-box" as const,
            },
        };
    }, [theme, windowWidth]);

    const selectOptions = useMemo(() => ({
        clusters: toClusterSelectOptions(clusters),
        managers: managers.map(manager => ({ ...manager, keyValue: manager.FullName, keyValueId: manager.UserName })),
        userRoles: userRoles.map(role => ({ ...role, keyValue: role.Name, keyValueId: role.ApplicationRoleId })),
    }), [clusters, managers, userRoles]);

    const handleEditClick = () => {
        // setIsEditing(true);
        handleOpenTab(params?.userId ?? "", true);
    };

    const handleTabClick = (username: string) => {
        dispatch(setSelectedTab({ username }));
        navigate(`/configuration/users/${username}`);
    }

    const handleTabTitleClick = () => {
        dispatch(setSelectedTab({ username: "" }));
        navigate("/configuration/users");
    }

    const handleOnCloseTab = (id: string, username: string) => {
        dispatch(deleteAccountUserTab(id));
        dispatch(deleteAccountUserByUsername({ username: username }));
        dispatch(setSelectedTab({ username: "" }));
    }

    return (
        <Box>
            <TabsHeader
                baseTitle="Users"
                basePath="/configuration/users"
                openTabs={openTabs}
                onCloseTab={(id: string | number, username: string) => handleOnCloseTab(String(id), username)}
                styles={styles}
                selectedTabs={selectedTab}
                handleRefreshClick={() => setRefreshDialogOpen(true)}
                handleTabClick={(id: string | number) => handleTabClick(String(id))}
                handleTabTitleClick={handleTabTitleClick}
                baseTitleTooltip="Return to user list"
                refreshTooltipTitle="Reload user data"
                closeTabTooltipTitle="Close tab and return to users"
            />

            {loading || accountUserLoading ? <SkeletonLoader /> : <div style={styles.accountUsersContainer}>
                <div style={styles.accountUsersPaper}>
                    <HeaderWithEditActions
                        title={`${formData?.LastName ?? ""}, ${formData?.FirstName ?? ""}`}
                        isEditing={isOpenTab}
                        saving={saving}
                        onEdit={() => handleEditClick()}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        styles={styles}
                        headerPadding="15px 22px"
                    />
                    <div
                        style={{
                            ...(styles.accountUsersGrid as React.CSSProperties),
                            padding: "14px 22px 24px",
                            boxSizing: "border-box",
                            background: styles.accountUsersPaper?.background,
                        }}
                    >
                        <Box sx={styles.formColumn}>
                            {leftColumnFields.map(fieldConfig => (
                                <FormField
                                    key={fieldConfig.field}
                                    data-testid={`input-${fieldConfig.field}`}
                                    label={fieldConfig.label}
                                    field={fieldConfig.field}
                                    type={fieldConfig.type || "text"}
                                    value={formData[fieldConfig.field as keyof typeof formData] as string || ""}
                                    isEditing={isOpenTab}
                                    onChange={handleChange}
                                    styles={styles}
                                    error={errors[fieldConfig.field]}
                                    required={fieldConfig?.required ?? false}
                                    showTypePlaceholder
                                />
                            ))}
                            <FormField
                                key="UserName"
                                label="Username"
                                field="UserName"
                                type="text"
                                data-testid={`input-UserName`}
                                value={formData?.UserName ?? ""}
                                isEditing={isOpenTab}
                                onChange={handleChange}
                                styles={styles}
                                error={errors.UserName}
                                required={true}
                                showTypePlaceholder
                            />
                            <FormField
                                key="PhoneNumber"
                                label="Phone Number"
                                field="PhoneNumber"
                                type="tel"
                                data-testid={`input-PhoneNumber`}
                                value={formData?.PhoneNumber ?? ""}
                                isEditing={isOpenTab}
                                onChange={handleChange}
                                styles={styles}
                                error={errors.PhoneNumber}
                                showTypePlaceholder
                            />
                        </Box>

                        <Box sx={styles.formColumn}>
                            {middleColumnFields.map(fieldConfig => (
                                <FormField
                                    key={fieldConfig.field}
                                    data-testid={`input-${fieldConfig.field}`}
                                    label={fieldConfig.label}
                                    field={fieldConfig.field}
                                    type={fieldConfig.type || "text"}
                                    value={formData[fieldConfig.field as keyof typeof formData] as string || ""}
                                    isEditing={isOpenTab}
                                    onChange={handleChange}
                                    styles={styles}
                                    error={errors[fieldConfig.field]}
                                    required={fieldConfig?.required ?? false}
                                    showTypePlaceholder
                                />
                            ))}
                        </Box>

                        <Box sx={styles.formColumn}>
                            {rightColumnSelectFields.map(fieldConfig => (
                                <SelectField
                                    key={fieldConfig.field}
                                    data-testid={`input-${fieldConfig.field}`}
                                    isMulti={fieldConfig.field === "ClusterLookupValueMappings"}
                                    label={fieldConfig.label}
                                    field={fieldConfig.field}
                                    required={fieldConfig?.required ?? false}
                                    options={
                                        fieldConfig.field === "Roles"
                                            ? formData.Roles?.map(r => r.Name)
                                            : fieldConfig.field === "ClusterLookupValueMappings"
                                                ? selectOptions.clusters
                                                : fieldConfig.field === "ManagerId"
                                                    ? selectOptions.managers
                                                    : fieldConfig.options
                                    }
                                    value={
                                        fieldConfig.field === "Roles"
                                            ? formData.Roles?.filter(r => r.IsSelected)?.map(r => r.Name)
                                            : fieldConfig.field === "ClusterLookupValueMappings"
                                                ? normalizeClusterIds(formData.ClusterLookupValueMappings).map(String)
                                                : fieldConfig.field === "ManagerId"
                                                    ? formData.ManagerName
                                                    : fieldConfig.field === "SkillLevel"
                                                        ? lookUpValues.find(el => el.LookupValueId === formData.SkillLevel)?.Description
                                                        : fieldConfig.field === "UserTypeId"
                                                            ? (formData.UserTypeId ? userTypeObjVal[formData.UserTypeId as keyof typeof userTypeObjVal] : "")
                                                            : (formData[fieldConfig.field as keyof typeof formData] as string)
                                    }
                                    isEditing={isOpenTab}
                                    onChange={handleChange}
                                    styles={styles}
                                    formData={formData}
                                    handleFormChange={handleChange as (field: string, value: string | string[]) => void}
                                    accountUsersForm
                                />
                            ))}
                        </Box>
                    </div>
                </div>
            </div>}
            <ConfirmationModal
                open={refreshDialogOpen}
                title="Alert!"
                description="Refreshing this tab will reload the latest data for this tab. Any unsaved changes on this tab will be lost. Other open tabs will remain unchanged. Do you wish to continue?"
                confirmLabel="Yes"
                cancelLabel="Cancel"
                onConfirm={() => { setRefreshDialogOpen(false); handleRefreshClick() }}
                onCancel={() => {
                    setRefreshDialogOpen(false);
                }}
                onClose={() => {
                    setRefreshDialogOpen(false);
                }}
                isDarkMode={isDarkMode}
            />
        </Box>
    );
};

export default AccountUserDetails;
