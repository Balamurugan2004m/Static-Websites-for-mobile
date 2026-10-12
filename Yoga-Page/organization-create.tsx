import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import { CharacterCountInput } from "../../ui/character-count-input";
import { ORG_FIELD_MAX_LENGTHS } from "../../constants/organization-limits";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";

import { RootState } from "../../store";
import ContentBox from "../../layouts/content-box";
import TabsHeader from "../../components/users/components/tabs-header";
import AppTooltip from "../../components/app-tooltip";
import { getStyles } from "../../components/users/utils/styles";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import {
  OrganizationDto,
  addOrganization,
  getOrganizationContractStatuses,
} from "../../services/provider-organization";
import {
  CredentialStatusLookupValue,
} from "../../services/provider-users";
import { deleteOrgTab } from "../../store/slice/ui-slice";
import RefreshIcon from "../../assets/icons/refresh-blue.svg";
import CaseTabCloseIcon from "../../assets/icons/case-tab-close.svg";

const P = THEME_PRIMITIVES;

import {
  validateOrganizationField,
  validateOrganizationForm,
} from "../../utils/validation-utils";

type FormData = {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  altPhoneNumber: string;
  faxNumber: string;
  taxIdNumber: string;
  npiNumber: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  isInfinite: boolean;
  isPayable: boolean;
  cmsRatePercent: string;
  contractStatus: string;
};

const INITIAL: FormData = {
  name: "", emailAddress: "", phoneNumber: "", altPhoneNumber: "",
  faxNumber: "", taxIdNumber: "", npiNumber: "",
  address1: "", address2: "", city: "", county: "", state: "", zip: "",
  isInfinite: false, isPayable: false, cmsRatePercent: "", contractStatus: "",
};

const BASE_PATH = paths.PROVIDER_MANAGEMENT_ORG.pathName;

const OrganizationCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [credentialStatuses, setCredentialStatuses] = useState<CredentialStatusLookupValue[]>([]);
  const [windowWidth] = useState(window.innerWidth);

  useEffect(() => {
    getOrganizationContractStatuses()
      .then(setCredentialStatuses)
      .catch(() => {});
  }, []);

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";
  const openTabs = useSelector((state: RootState) => state.ui.orgTabs);
  const openTabsRef = useRef(openTabs);
  openTabsRef.current = openTabs;

  const styles = useMemo(() => getStyles(theme, windowWidth), [theme, windowWidth]);
  const chipColor = theme.custom?.text?.chip?.color ?? theme.palette.primary.main;
  const activeTabColor = isDarkMode ? P.white : chipColor;

  const handleTabClick = useCallback(
    (tabLabel: string | number) => {
      const tab = openTabsRef.current.find((t) => t.userName === String(tabLabel));
      if (tab) navigate(`/provider-management/provider-organization/${tab.id}`);
    },
    [navigate]
  );

  const handleTabTitleClick = useCallback(() => navigate(BASE_PATH), [navigate]);

  const handleOnCloseTab = useCallback(
    (id: string | number) => { dispatch(deleteOrgTab(String(id))); },
    [dispatch]
  );

  const handleCreateTabClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(BASE_PATH);
    },
    [navigate]
  );

  const handleCreateTabRefresh = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(INITIAL);
    setFormErrors({});
  }, []);

  const validateSingleField = useCallback((field: keyof FormData, value: string | boolean): string => {
    return validateOrganizationField(field, value);
  }, []);

  const validateForm = useCallback(() => {
    const result = validateOrganizationForm(formData);
    setFormErrors(result.errors);
    return result;
  }, [formData]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleBlur = (field: keyof FormData) => {
    const err = validateSingleField(field, formData[field]);
    setFormErrors((prev) => {
      if (err) {
        return { ...prev, [field]: err };
      }
      if (prev[field]) {
        const rest = { ...prev };
        delete rest[field];
        return rest;
      }
      return prev;
    });
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const err = validateSingleField(field, value);
      if (err) {
        return { ...prev, [field]: err };
      }
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });
  };

  const handleSave = async () => {
    const { isValid, firstErrorField, errors } = validateForm();
    if (!isValid) {
      showToast(Object.values(errors)[0] || "Please fill all required fields", TOAST_TYPES.ERROR);
      if (firstErrorField) {
        const el = document.querySelector(
          `[name="${firstErrorField}"], [id="${firstErrorField}"], [data-field="${firstErrorField}"]`
        ) as HTMLElement | null;
        el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        setTimeout(() => el?.focus?.(), 250);
      }
      return;
    }

    setSaving(true);
    try {
      const dto: OrganizationDto = {
        Id: 0,
        OrganizationName: formData.name.trim(),
        OrganizationCounty: formData.county.trim(),
        OrganizationAddress1: formData.address1.trim(),
        OrganizationAddress2: formData.address2.trim(),
        OrganizationCity: formData.city.trim(),
        OrganizationState: formData.state.trim(),
        OrganizationZip: formData.zip.trim(),
        OrganizationTaxIdNumber: formData.taxIdNumber.trim(),
        OrganizationNPINumber: formData.npiNumber.trim(),
        OrganizationPrimaryPhoneNumber: formData.phoneNumber.trim(),
        OrganizationAlternatePhoneNumber: formData.altPhoneNumber.trim(),
        OrganizationEmailId: formData.emailAddress.trim(),
        OrganizationFaxNumber: formData.faxNumber.trim(),
        IsOrganizationInfinite: formData.isInfinite,
        IsPayableToOrg: formData.isPayable,
        ServiceFacility: 0,
        ProfessionalStaff: 0,
        CMSRatePercent: Number(formData.cmsRatePercent),
        OrganizationStatusId:
          credentialStatuses.find((s) => s.Name === formData.contractStatus)?.LookupValueId ?? 0,
      };
      await addOrganization(dto);
      showToast("Organization has been added successfully.", TOAST_TYPES.SUCCESS);
      navigate(BASE_PATH);
    } catch {
      showToast("Failed to create organization.", TOAST_TYPES.ERROR);
    } finally {
      setSaving(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────

  const inputSx = useCallback(
    (hasError: boolean) => ({
      width: "100%",
      height: 36,
      borderRadius: "8px",
      fontSize: 14,
      backgroundColor: isDarkMode ? P.secondaryElevatedDark : P.white,
      "& .MuiOutlinedInput-input": {
        padding: "8px 12px",
        fontSize: 14,
        color: isDarkMode ? P.white : P.black,
        "&::placeholder": { color: isDarkMode ? P.lightMutedText : P.labelMuted, opacity: 1 },
      },
      "& .MuiOutlinedInput-input[type=number]": {
        paddingRight: "2px",
        height: "100%",
        boxSizing: "border-box",
      },
      "& input[type=number]::-webkit-inner-spin-button": {
        height: "20px",
        margin: "auto 4px auto 0",
        opacity: 1,
        cursor: "pointer",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: hasError
          ? theme.palette.error.main
          : isDarkMode ? P.strokeDark : P.stroke,
      },
    }),
    [isDarkMode, theme.palette.error.main]
  );

  const labelSx = { fontSize: 13, color: isDarkMode ? P.lightMutedText : P.uploadButtonBg, mb: 0.25 };
  const fieldWrapSx = { display: "flex", flexDirection: "column" as const, gap: 0.25, mb: 1.5 };

  const renderField = (
    label: string,
    field: keyof FormData,
    placeholder?: string,
    required = false,
    type?: string
  ) => {
    const error = formErrors[field];
    const maxLength = ORG_FIELD_MAX_LENGTHS[field];
    return (
      <Box sx={fieldWrapSx}>
        <Typography sx={{ ...labelSx, display: "flex", alignItems: "center", gap: "3px" }}>
          {label}
          {required && <Box component="span" sx={{ color: P.dangerText }}>*</Box>}
        </Typography>
        <CharacterCountInput
          id={field}
          name={field}
          type={type}
          inputProps={{ "data-field": field, "data-dotphrase": "false" }}
          value={(formData[field] as string) ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          placeholder={placeholder ?? `Type ${label}`}
          error={Boolean(error)}
          sx={inputSx(Boolean(error))}
          maxLength={maxLength}
          helperText={
            error ? (
              <FormHelperText error sx={{ mx: 0, fontSize: 11, mt: 0 }}>
                {error}
              </FormHelperText>
            ) : undefined
          }
        />
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: isDarkMode ? P.black : "transparent", minHeight: "100%" }}>
      <TabsHeader
        baseTitle="Organization"
        basePath={BASE_PATH}
        openTabs={openTabs}
        onCloseTab={handleOnCloseTab}
        styles={styles}
        selectedTabs=""
        handleTabClick={handleTabClick}
        handleTabTitleClick={handleTabTitleClick}
        baseTitleTooltip="Return to Organization list"
        closeTabTooltipTitle="Close tab"
      >
        <Box
          sx={{
            ...styles.userTabs,
            width: "auto",
            minWidth: 160,
            gap: "4px",
            justifyContent: "flex-start",
            padding: "0 12.5px 0 8px",
          }}
        >
          <AppTooltip title="Reload tab data" placement="bottom" arrow>
            <IconButton
              size="small"
              onClick={handleCreateTabRefresh}
              sx={{ p: 0.25, width: 18, height: 18, minWidth: 18, minHeight: 18, color: activeTabColor, flexShrink: 0 }}
            >
              <Box
                component="img"
                src={RefreshIcon}
                alt="Refresh"
                sx={{ width: 14, height: 14, ...(isDarkMode ? { filter: "brightness(0) invert(1)" } : {}) }}
              />
            </IconButton>
          </AppTooltip>
          <Typography component="span" sx={styles.addUserAddText}>
            New Organization
          </Typography>
          <AppTooltip title="Close tab" placement="bottom" arrow>
            <IconButton
              size="small"
              aria-label="Close tab"
              onClick={handleCreateTabClose}
              sx={{ p: 0, width: 15, height: 15, minWidth: 15, minHeight: 15, ml: "auto", flexShrink: 0 }}
            >
              <Box
                component="img"
                src={CaseTabCloseIcon}
                alt="Close"
                sx={{ width: 15, height: 15, ...(isDarkMode ? { filter: "brightness(0) invert(1)" } : {}) }}
              />
            </IconButton>
          </AppTooltip>
        </Box>
      </TabsHeader>

      <ContentBox showBorder={false} sx={{ p: 0 }}>
        <Box p={0}>
          <Box
            data-dotphrase="false"
            sx={{
              backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
              borderRadius: "10px",
              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
              p: "16px 24px 20px",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: isDarkMode ? P.white : P.black }}>
                {formData.name || "New Organization"}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(BASE_PATH)}
                  sx={{
                    height: 34, borderRadius: "8px", textTransform: "none", fontWeight: 400,
                    fontSize: 14, px: 2.5,
                    backgroundColor: isDarkMode ? P.inputBgDark : P.cancelFilledButtonBg,
                    color: isDarkMode ? P.white : P.neutralButtonTextMedium, boxShadow: "none",
                    "&:hover": { backgroundColor: isDarkMode ? P.hoverSurfaceDark : P.cancelFilledButtonHover, boxShadow: "none" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  sx={{
                    height: 34, borderRadius: "8px", textTransform: "none", fontWeight: 400,
                    fontSize: 14, px: 2.5, backgroundColor: P.primary,
                    "&:hover": { backgroundColor: P.primaryHover },
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </Box>
            </Box>

            {/* 3-column form */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: "0 32px", alignItems: "start" }}>
              {/* Col 1 */}
              <Box>
                {renderField("Name", "name", "Organization Name", true)}
                {renderField("Email Address", "emailAddress", "Email Address", true, "email")}
                {renderField("Phone Number", "phoneNumber", "Phone Number", true, "number")}
                {renderField("Alternate Phone Number", "altPhoneNumber", "Alternate Number", false, "number")}
                {renderField("Fax Number", "faxNumber", "Fax Number", true, "number")}
                {renderField("Tax ID Number", "taxIdNumber", "Tax ID Number", false)}
                {renderField("NPI Number", "npiNumber", "NPI Number", false, "number")}
              </Box>

              {/* Col 2 */}
              <Box>
                {renderField("Address 1", "address1", "Address 1", true)}
                {renderField("Address 2", "address2", "Address 2")}
                {renderField("City", "city", "City", true)}
                {renderField("County", "county", "County", true)}
                {renderField("State", "state", "State", true)}
                {renderField("Zip", "zip", "Zip Code", true)}
              </Box>

              {/* Col 3 */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isInfinite}
                      onChange={(e) => handleChange("isInfinite", e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: isDarkMode ? P.white : P.black }}>Is Infinite</Typography>}
                  sx={{ mb: 1.5, display: "flex" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isPayable}
                      onChange={(e) => handleChange("isPayable", e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: isDarkMode ? P.white : P.black }}>Is Payable</Typography>}
                  sx={{ mb: 1.5, display: "flex" }}
                />
                {renderField("CMS Rate Percent", "cmsRatePercent", "CMS Rate", true, "number")}

                {/* Contract Status */}
                <Box sx={fieldWrapSx}>
                  <Typography sx={{ ...labelSx, display: "flex", alignItems: "center", gap: "3px" }}>
                    Contract Status <Box component="span" sx={{ color: P.dangerText }}>*</Box>
                  </Typography>
                  <Select
                    displayEmpty
                    value={formData.contractStatus}
                    onChange={(e) => handleChange("contractStatus", e.target.value)}
                    onBlur={() => handleBlur("contractStatus")}
                    error={Boolean(formErrors.contractStatus)}
                    sx={{
                      height: 36, borderRadius: "8px", fontSize: 14,
                      backgroundColor: isDarkMode ? P.secondaryElevatedDark : P.white,
                      color: isDarkMode ? P.white : P.black,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? P.strokeDark : P.stroke },
                      "& .MuiSelect-select": {
                        padding: "8px 12px",
                        fontSize: 14,
                        color: !formData.contractStatus
                          ? (isDarkMode ? P.lightMutedText : P.labelMuted)
                          : (isDarkMode ? P.white : P.black),
                      },
                      "& .MuiSvgIcon-root": { color: isDarkMode ? P.white : undefined },
                    }}
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: {
                        sx: {
                          backgroundColor: isDarkMode ? P.gridHeaderDark : P.white,
                          color: isDarkMode ? P.white : P.black,
                          "& .MuiMenuItem-root:hover": { backgroundColor: isDarkMode ? P.primary : undefined },
                        },
                      },
                    }}
                    renderValue={(val) => val || "Select"}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: isDarkMode ? P.lightMutedText : "text.secondary", fontSize: 14 }}>Select</Typography>
                    </MenuItem>
                    {credentialStatuses.map((s) => (
                      <MenuItem key={s.LookupValueId} value={s.Name} sx={{ fontSize: 14 }}>{s.Name}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.contractStatus && (
                    <FormHelperText error sx={{ mx: 0, fontSize: 11 }}>
                      {formErrors.contractStatus}
                    </FormHelperText>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ContentBox>
    </Box>
  );
};

export default OrganizationCreate;
