/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { RootState } from "../../store";
import {
  FormData,
  INITIAL_FORM_DATA,
  leftColumnFields,
  middleColumnFields,
  rightColumnSelectFields,
  userTypeObjKey,
  normalizeClusterIds,
  toClusterSelectOptions,
} from "../../components/users/utils/util";
import { getStyles } from "../../components/users/utils/styles";
import { createAccountUser, fetchAccountUserData } from "../../store/slice/account-users-slice";

import FormField from "../../components/users/components/form-field";
import SelectField from "../../components/users/components/select-filed";
import HeaderWithEditActions from "../../components/users/components/header-with-edit-actions";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";
import { ConfirmationModal } from "../../ui";
import AppTooltip from "../../components/app-tooltip";
import PageTitleChip from "../../components/page-title-chip";
import SkeletonLoader from "../../components/users/components/skeleton-loader";
import { THEME_PRIMITIVES } from "../../theme";
import WarningIcon from "../../assets/warning_icon.svg";

// Regex constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    managers,
    clusters,
    userRoles,
    lookUpValues,
    skillsOption,
    isLoading,
  } = useSelector((state: RootState) => state.accountUsers);
  const fetchedDropdownData = useRef(false);
  const mode = useSelector((state: RootState) => state?.theme?.mode || "light");
  const isDarkMode = mode === 'dark';

  /** -------------------------
   *  Effects
   * ------------------------- */
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 useEffect(() => {
        if (!fetchedDropdownData.current) {
            fetchedDropdownData.current = true;
            dispatch(fetchAccountUserData() as any);
        }
    }, [dispatch]);

  /** -------------------------
   *  Validation
   * ------------------------- */
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    const requiredFields: Record<string, string> = {
      FirstName: "First name is required",
      LastName: "Last name is required",
      PrintName: "Print name is required",
      Email: "Email is required",
      UserName: "Username is required",
      AddressLine1: "Address Line 1 is required",
      City: "City is required",
      State: "State is required",
      Zip: "ZIP Code is required",
      UserTypeId: "User type is required",
      SkillLevel: "Skill level is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      const value = formData[field as keyof FormData];
      if (field === "SkillLevel") {
        if (!value || typeof value !== "object" || !Object.keys(value).length) {
          errors[field] = message;
        }
      } else if (field === "UserTypeId") {
        if (!value || value === 0) errors[field] = message;
      } else if (!value?.toString().trim()) {
        errors[field] = message;
      }
    });

    if (formData.Email && !EMAIL_REGEX.test(formData.Email)) {
      errors.Email = "Please enter a valid email address";
    }
    if (formData.PhoneNumber && !PHONE_REGEX.test(formData.PhoneNumber.replace(/\s/g, ""))) {
      errors.PhoneNumber = "Please enter a valid phone number";
    }
    if (!formData.Roles?.length) {
      errors.Roles = "At least one role is required";
    }
    if (formData.UserName && !/^[a-zA-Z0-9_]+$/.test(formData.UserName)) {
      errors.UserName = "Username can only contain letters, numbers, and underscores";
    }

    const firstErrorField = Object.keys(errors)[0];
    setFormErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      firstErrorField,
      errors,
    };
  }, [formData]);

  /** -------------------------
   *  Handlers
   * ------------------------- */
  const handleSpecialFieldMapping = useCallback(
    (field: string, value: string | string[]) => {
      const mapping: Record<string, (val: string | string[]) => Partial<FormData>> = {
        ManagerId: (val) => {
          const manager = managers.find((el) => el.UserName === val);
          return { ManagerName: manager?.FullName || "", ManagerId: manager?.UserId ?? null };
        },
        ClusterLookupValueMappings: (val) => ({
          ClusterLookupValueMappings: normalizeClusterIds(val),
        }),
        Roles: (val) => {
          const selectedNames = Array.isArray(val) ? val : [val];
          const selectedRoles = userRoles.filter((r) => selectedNames.includes(r.Name));
          return { Roles: selectedRoles };
        },
        SkillLevel: (val) => {
          const lookup = lookUpValues?.find((el) => el.Description === val);
          return { SkillLevel: lookup || {} };
        },
      };
      return mapping[field]?.(value);
    },
    [managers, userRoles, lookUpValues]
  );

  const handleChange = useCallback(
    (field: string, value: string | string[]) => {
      const normalizedField =
        field === "Skill Level" ? "SkillLevel" : ['User Type', 'UserType'].includes(field) ? "UserTypeId" : field;

      setFormData((prev) => {
        const special = handleSpecialFieldMapping(normalizedField, value);
        if (special) return { ...prev, ...special };
        if (prev[normalizedField as keyof FormData] === value) return prev;
        return { ...prev, [normalizedField]: value };
      });

      setFormErrors((prev) => {
        if (!prev[normalizedField]) return prev;
        // Remove the normalizedField key from errors without using an unused variable
        const rest = { ...prev };
        delete rest[normalizedField];
        return rest;
      });
    },
    [handleSpecialFieldMapping]
  );

  const resetFormData = () => {
    setFormData(INITIAL_FORM_DATA);
  }

  const handleSave = useCallback(async () => {
    const { isValid, firstErrorField, errors } = validateForm();
    if (!isValid) {
      showToast(Object.values(errors)[0] || "Please fill all required fields", TOAST_TYPES.ERROR);
      if (firstErrorField) {
        const firstInvalidField = document.querySelector(
          `[name="${firstErrorField}"], [id="${firstErrorField}"], [data-field="${firstErrorField}"]`
        ) as HTMLElement | null;
        firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => firstInvalidField?.focus(), 250);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const { UserTypeId, Roles, ManagerId } = formData;
      const payload: any = {
        ...formData,
        TenantId: 1,
        SkillLevel: formData.SkillLevel?.LookupValueId,
      }; 

      if (UserTypeId && userTypeObjKey[UserTypeId as unknown as keyof typeof userTypeObjKey]) {
        payload.UserTypeId = userTypeObjKey[UserTypeId as unknown as keyof typeof userTypeObjKey];
      } else {
        delete payload.UserTypeId;
      }

      if (Roles?.length) {
        const rolesId = Roles.map((r) => r.ApplicationRoleId);
        payload.Roles = userRoles.map((role) => ({
          ...role,
          IsSelected: rolesId.includes(role.ApplicationRoleId),
        }));
      }

      if (!ManagerId) delete payload.ManagerId;

      const res = await dispatch(createAccountUser(payload) as any).unwrap();
      if (res) {
        showToast("User created successfully", TOAST_TYPES.SUCCESS);
        resetFormData();
        navigate('/configuration/users');
        return
      }
      if (!res) {
        showToast(res?.Response || "Failed to create user", TOAST_TYPES.ERROR);
      }
    } catch (err) {
      console.error("Failed to create user:", { err });
      showToast("Failed to create user", TOAST_TYPES.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formData, dispatch, userRoles, navigate]);

  const isFormDirty = useCallback(() => {
    const textFields: (keyof FormData)[] = [
      "FirstName",
      "LastName",
      "PrintName",
      "Email",
      "PhoneNumber",
      "AddressLine1",
      "AddressLine2",
      "City",
      "State",
      "Zip",
      "UserName",
    ];

    for (const key of textFields) {
      if ((formData[key] ?? "").toString().trim() !== "") {
        return true;
      }
    }

    if (formData.UserTypeId && formData.UserTypeId !== 0) return true;
    if (formData.ManagerId !== null && formData.ManagerId !== undefined) return true;
    if (formData.SkillLevel && Object.keys(formData.SkillLevel).length > 0) return true;
    if (formData.Roles && formData.Roles.length > 0) return true;
    if (formData.ClusterLookupValueMappings && formData.ClusterLookupValueMappings.length > 0) return true;

    return false;
  }, [formData]);

  const executeLeave = useCallback(() => {
    setUnsavedModalOpen(false);
    navigate("/configuration/users");
  }, [navigate]);

  const handleCancel = useCallback(() => {
    if (isFormDirty()) {
      setUnsavedModalOpen(true);
    } else {
      executeLeave();
    }
  }, [isFormDirty, executeLeave]);
  
  const handleOpenRefreshDialog = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setRefreshDialogOpen(true);
  }, []);

  const handleAddUserLabelClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleCloseToUsersClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleCancel();
  }, [handleCancel]);

  /** -------------------------
   *  Memos
   * ------------------------- */
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
      // Figma Edit Form 341:1091 — white filled inputs, no border
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

  const selectOptions = useMemo(
    () => ({
      clusters: toClusterSelectOptions(clusters),
      managers: managers.map((m) => ({ ...m, keyValue: m.FullName, keyValueId: m.UserName })),
      userRoles: userRoles.map((r) => r.Name),
    }),
    [clusters, managers, userRoles]
  );

  const getSelectFieldValue = useCallback(
    (field: string) => {
      switch (field) {
        case "Roles": return formData.Roles.map((r) => r.Name);
        case "ManagerId":
          return formData.ManagerName;
        case "ClusterLookupValueMappings":
          return normalizeClusterIds(formData.ClusterLookupValueMappings).map(String);
        case "SkillLevel":
          return formData.SkillLevel?.Description || "";
        case "UserTypeId":
            return formData.UserTypeId;
          default:
            return formData[field as keyof FormData];
      }
    },
    [formData]
  );

  const getSelectOptions = useCallback(
    (field: string, defaultOptions: string[]) => {
      switch (field) {
        case "Roles": return selectOptions.userRoles;
        case "ManagerId": return selectOptions.managers;
        case "ClusterLookupValueMappings": return selectOptions.clusters;
        case "SkillLevel": return skillsOption;
        default: return defaultOptions;
      }
    },
    [selectOptions, skillsOption]
  );

  /** -------------------------
   *  Render
   * ------------------------- */
  const chipText = theme.custom?.text?.chip;
  const chipColor = chipText?.color ?? theme.palette.primary.main;
  const activeTabColor = isDarkMode ? THEME_PRIMITIVES.white : chipColor;

  return (
    <Box>
      {/* Header Navigation */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <PageTitleChip title="Users" sx={styles.userTitle} onClick={handleCancel} />
        <Box onClick={handleCancel} sx={styles.userTabs}>
          <AppTooltip title="Refresh" placement="bottom" arrow>
            <IconButton
              size="small"
              onClick={handleOpenRefreshDialog}
              sx={{
                p: 0.25,
                width: 18,
                height: 18,
                minWidth: 18,
                minHeight: 18,
                color: activeTabColor,
                mr: 1,
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </AppTooltip>
          <Typography onClick={handleAddUserLabelClick} component="span" sx={styles.addUserAddText}>Add User</Typography>
          <AppTooltip title="Close and return to users" placement="bottom" arrow>
            <IconButton size="small" onClick={handleCloseToUsersClick} sx={{ ...styles.addUserCloseIcon, border: `1px solid ${activeTabColor}` }}>
              <CloseRoundedIcon sx={{ fontSize: 12, color: activeTabColor }} />
            </IconButton>
          </AppTooltip>
        </Box>
      </Box>

      {/* Main Form — skeleton while dropdown reference data loads; save uses local isSubmitting only */}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div style={styles.accountUsersContainer}>
          <div style={styles.accountUsersPaper}>
            <HeaderWithEditActions
              title="Add User"
              isEditing
              saving={isSubmitting}
              onEdit={() => setIsSubmitting(true)}
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
                {leftColumnFields.map(({ field, label, type, required }) => (
                  <FormField
                    key={field}
                    label={label}
                    field={field}
                    isAdding
                    type={type || "text"}
                    value={String(formData[field as keyof FormData] || "")}
                    onChange={handleChange}
                    error={formErrors[field]}
                    styles={styles}
                    themeErrorColor={theme.palette.error.main}
                    required={required ?? false}
                    showTypePlaceholder
                  />
                ))}
                <FormField
                  key="UserName"
                  label="Username"
                  field="UserName"
                  type="text"
                  required
                  isAdding
                  value={formData.UserName}
                  onChange={handleChange}
                  error={formErrors.UserName}
                  styles={styles}
                  themeErrorColor={theme.palette.error.main}
                  showTypePlaceholder
                />
                <FormField
                  key="PhoneNumber"
                  label="Phone Number"
                  field="PhoneNumber"
                  type="tel"
                  isAdding
                  value={String(formData.PhoneNumber || "")}
                  onChange={handleChange}
                  error={formErrors.PhoneNumber}
                  styles={styles}
                  themeErrorColor={theme.palette.error.main}
                  showTypePlaceholder
                />
                <FormField
                  key="Zip"
                  label="ZIP Code"
                  field="Zip"
                  type="text"
                  required
                  isAdding
                  value={String(formData.Zip || "")}
                  onChange={handleChange}
                  error={formErrors.Zip}
                  styles={styles}
                  themeErrorColor={theme.palette.error.main}
                  showTypePlaceholder
                />
              </Box>

              <Box sx={styles.formColumn}>
                {middleColumnFields
                  .filter(({ field }) => field !== "Zip")
                  .map(({ field, label, type, required }) => (
                  <FormField
                    key={field}
                    label={label}
                    field={field}
                    isAdding
                    type={type || "text"}
                    value={String(formData[field as keyof FormData] || "")}
                    onChange={handleChange}
                    error={formErrors[field]}
                    styles={styles}
                    themeErrorColor={theme.palette.error.main}
                    required={required ?? false}
                    showTypePlaceholder
                  />
                ))}
              </Box>

              <Box sx={styles.formColumn}>
                {rightColumnSelectFields.map(({ field, label, options, required }) => (
                  <SelectField
                    key={field}
                    label={label}
                    field={field}
                    isAdding
                    options={getSelectOptions(field, options)}
                    value={getSelectFieldValue(field)}
                    onChange={handleChange}
                    isMulti={field === "ClusterLookupValueMappings"}
                    styles={styles}
                    formData={formData}
                    handleFormChange={handleChange}
                    required={required ?? false}
                    error={formErrors[field]}
                    accountUsersForm
                  />
                ))}
              </Box>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        open={refreshDialogOpen}
        title="Alert!"
        description="Refreshing this tab will reload the latest data for this tab. Any unsaved changes on this tab will be lost. Other open tabs will remain unchanged. Do you wish to continue?"
        confirmLabel="Yes"
        cancelLabel="Cancel"
        onConfirm={() => { setRefreshDialogOpen(false); resetFormData() }}
        onCancel={() => {
          setRefreshDialogOpen(false);
        }}
        onClose={() => {
          setRefreshDialogOpen(false);
        }}
        isDarkMode={isDarkMode}
      />
      <ConfirmationModal
        open={unsavedModalOpen}
        title="Warning!"
        highlightMessage={"You have unsaved changes. If you leave now, they'll be lost.\nDo you want to continue?"}
        confirmLabel="Yes"
        cancelLabel="No"
        warningIcon={WarningIcon}
        showHighlight
        showCloseIcon
        highlightMarginBottom={0}
        onConfirm={executeLeave}
        onCancel={() => setUnsavedModalOpen(false)}
        onClose={() => setUnsavedModalOpen(false)}
        isDarkMode={isDarkMode}
        dialogSx={{
          width: "530px !important",
          maxWidth: "530px !important",
          borderRadius: "10px !important",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15) !important",
          backgroundColor: isDarkMode ? `${THEME_PRIMITIVES.secondaryElevatedDark} !important` : "#FFFFFF !important",
          "& .MuiDialogTitle-root": {
            p: 0,
            backgroundColor: isDarkMode ? `${THEME_PRIMITIVES.secondaryElevatedDark} !important` : "#F5F5F5 !important",
          },
          "& .MuiDialogTitle-root > .MuiBox-root": {
            px: "24px !important",
            height: "54px !important",
            borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.12)" : "#E0E0E0"} !important`,
            backgroundColor: isDarkMode ? `${THEME_PRIMITIVES.secondaryElevatedDark} !important` : "#F5F5F5 !important",
          },
          "& .MuiDialogContent-root": {
            px: "24px !important",
            pt: "20px !important",
            pb: "20px !important",
            borderTop: "none !important",
            borderBottom: "none !important",
            backgroundColor: isDarkMode ? `${THEME_PRIMITIVES.gridHeaderDark} !important` : "#FFFFFF !important",
          },
          "& .MuiDialogActions-root": {
            px: "24px !important",
            py: "14px !important",
            borderTop: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.12)" : "#E0E0E0"} !important`,
            backgroundColor: isDarkMode ? `${THEME_PRIMITIVES.secondaryElevatedDark} !important` : "#F5F5F5 !important",
            gap: "12px !important",
          },
        }}
        titleSx={{
          fontSize: "16px !important",
          fontWeight: "700 !important",
          color: isDarkMode ? "#FFFFFF !important" : "#1C1B1F !important",
        }}
        closeIconSx={{
          color: isDarkMode ? "#FFFFFF !important" : "#000000 !important",
          fontSize: "20px !important",
          stroke: isDarkMode ? "#FFFFFF" : "#000000",
          strokeWidth: 0.8,
        }}
        confirmButtonSx={{
          width: "90px",
          height: "34px",
          minWidth: "90px",
          padding: 0,
          borderRadius: "10px",
          backgroundColor: "#244794",
          color: "#FFFFFF",
          fontSize: "14px",
          fontWeight: 400,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#244794",
            boxShadow: "none",
          },
        }}
        cancelButtonSx={{
          width: "90px",
          height: "34px",
          minWidth: "90px",
          padding: 0,
          borderRadius: "10px",
          backgroundColor: isDarkMode ? THEME_PRIMITIVES.inputBgDark : "#E5E3E3",
          border: "none",
          color: isDarkMode ? "#FFFFFF" : "#454545",
          fontSize: "14px",
          fontWeight: 400,
          textTransform: "none",
          textDecoration: "none !important",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: isDarkMode ? THEME_PRIMITIVES.inputBgDark : "#DCDADA",
            boxShadow: "none",
            textDecoration: "none !important",
          },
        }}
      />
    </Box>
  );
};

export default AddUser;
