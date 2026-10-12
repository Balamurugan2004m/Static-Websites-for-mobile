import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { CharacterCountInput } from "../../ui/character-count-input";
import {
  validateOrganizationField,
  validateOrganizationForm,
} from "../../utils/validation-utils";
import { ORG_FIELD_MAX_LENGTHS } from "../../constants/organization-limits";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";

import { RootState } from "../../store";
import ContentBox from "../../layouts/content-box";
import DataGridTable from "../../ui/data-grid-table";
import ConfirmationModal from "../../ui/confirmation-modal";
import TabsHeader from "../../components/users/components/tabs-header";
import RowActionMenu from "../../components/row-action-menu";
import { getStyles } from "../../components/users/utils/styles";
import AccordionComponent from "../../ui/common-accordion";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import { resetPassword, activateUser } from "../../services/account-users";
import {
  OrgFacility,
  Organization,
  OrgStaff,
  OrganizationDto,
  editOrganization,
  getOrganizationById,
  getOrganizationContractStatuses,
  getUsersForOrganization,
} from "../../services/provider-organization";
import {
  CredentialStatusLookupValue,
  getFacilitiesByOrganizationId,
  ProviderUser,
} from "../../services/provider-users";
import { getProviderUsersByIds } from "../../utils/provider-staff-utils";

function dtoToOrg(dto: OrganizationDto): Organization {
  return {
    id: String(dto.Id),
    name: dto.OrganizationName,
    emailAddress: dto.OrganizationEmailId,
    phoneNumber: dto.OrganizationPrimaryPhoneNumber,
    altPhoneNumber: dto.OrganizationAlternatePhoneNumber,
    faxNumber: dto.OrganizationFaxNumber,
    taxIdNumber: dto.OrganizationTaxIdNumber,
    npiNumber: dto.OrganizationNPINumber,
    address1: dto.OrganizationAddress1,
    address2: dto.OrganizationAddress2 ?? "",
    city: dto.OrganizationCity,
    county: dto.OrganizationCounty,
    state: dto.OrganizationState,
    zip: dto.OrganizationZip,
    isInfinite: dto.IsOrganizationInfinite,
    isPayable: dto.IsPayableToOrg,
    cmsRatePercent: String(dto.CMSRatePercent),
    contractStatus: dto.OrganizationStatus ?? "",
    serviceFacility: dto.ServiceFacility,
    status: dto.OrganizationStatus === "Active" ? "Active" : "Inactive",
    facilities: [],
    staff: [],
  };
}

function formToDto(
  form: FormData,
  original: OrganizationDto,
  statuses: CredentialStatusLookupValue[]
): OrganizationDto {
  return {
    ...original,
    OrganizationName: form.name,
    OrganizationEmailId: form.emailAddress,
    OrganizationPrimaryPhoneNumber: form.phoneNumber,
    OrganizationAlternatePhoneNumber: form.altPhoneNumber,
    OrganizationFaxNumber: form.faxNumber,
    OrganizationTaxIdNumber: form.taxIdNumber,
    OrganizationNPINumber: form.npiNumber,
    OrganizationAddress1: form.address1,
    OrganizationAddress2: form.address2,
    OrganizationCity: form.city,
    OrganizationCounty: form.county,
    OrganizationState: form.state,
    OrganizationZip: form.zip,
    IsOrganizationInfinite: form.isInfinite,
    IsPayableToOrg: form.isPayable,
    CMSRatePercent: Number(form.cmsRatePercent),
    OrganizationStatus: form.contractStatus,
    OrganizationStatusId:
      statuses.find((s) => s.Name === form.contractStatus)?.LookupValueId ??
      original.OrganizationStatusId,
  };
}
import {
  addOrgTab,
  deleteOrgTab,
  addProviderFacilityTab,
  addProviderUserTab,
} from "../../store/slice/ui-slice";
import { setSelectedTab } from "../../store/slice/provider-facility-slice";
import { setSelectedTab as setUserSelectedTab } from "../../store/slice/provider-users-slice";

const P = THEME_PRIMITIVES;

type FormData = Omit<Organization, "id" | "facilities" | "staff" | "serviceFacility" | "status">;

const EMPTY_FORM: FormData = {
  name: "",
  emailAddress: "",
  phoneNumber: "",
  altPhoneNumber: "",
  faxNumber: "",
  taxIdNumber: "",
  npiNumber: "",
  address1: "",
  address2: "",
  city: "",
  county: "",
  state: "",
  zip: "",
  isInfinite: false,
  isPayable: false,
  cmsRatePercent: "",
  contractStatus: "",
};

function toForm(org: Organization): FormData {
  const { id: _id, facilities: _facilities, staff: _staff, serviceFacility: _sf, status: _status, ...rest } = org;
  return rest;
}

const BASE_PATH = paths.PROVIDER_MANAGEMENT_ORG.pathName;

const OrganizationDetails = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const [org, setOrg] = useState<Organization | null>(null);
  const [orgDto, setOrgDto] = useState<OrganizationDto | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staffActiveMap, setStaffActiveMap] = useState<Record<string, boolean>>({});
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: "activate" | "resetPassword" | "resetPasswordSuccess";
    staffId?: string;
    userId: string;
    userName: string;
    isDisabled: boolean;
    title: string;
    highlightMessage?: string;
  }>({
    type: "activate",
    userId: "",
    userName: "",
    isDisabled: false,
    title: "",
  });
  const [credentialStatuses, setCredentialStatuses] = useState<CredentialStatusLookupValue[]>([]);
  const [orgStaff, setOrgStaff] = useState<ProviderUser[]>([]);
  const [orgStaffLoading, setOrgStaffLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";
  const openTabs = useSelector((state: RootState) => state.ui.orgTabs);
  const openTabsRef = useRef(openTabs);
  const credentialStatusFetchStartedRef = useRef(false);
  const orgDetailsFetchStartedRef = useRef<string | null>(null);
  const orgStaffFetchStartedRef = useRef<string | null>(null);
  openTabsRef.current = openTabs;

  const styles = useMemo(() => getStyles(theme, windowWidth), [theme, windowWidth]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (credentialStatusFetchStartedRef.current) return;
    credentialStatusFetchStartedRef.current = true;
    getOrganizationContractStatuses()
      .then(setCredentialStatuses)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!orgId) return;
    if (orgStaffFetchStartedRef.current === orgId) return;
    orgStaffFetchStartedRef.current = orgId;
    const numericId = Number(orgId);
    setOrgStaffLoading(true);
    getUsersForOrganization(numericId)
      .then((ids) => getProviderUsersByIds(ids))
      .then(setOrgStaff)
      .catch(() => setOrgStaff([]))
      .finally(() => setOrgStaffLoading(false));
  }, [orgId]);

  // Register tab for this org
  useEffect(() => {
    if (org && orgId) {
      dispatch(addOrgTab({ id: orgId, email: "", userName: org.name }));
    }
  }, [org, orgId, dispatch]);

  const load = useCallback(async () => {
    if (!orgId) return;
    const numericId = Number(orgId);
    setLoading(true);
    try {
      const [dto, facilityDtos] = await Promise.all([
        getOrganizationById(numericId),
        getFacilitiesByOrganizationId(numericId),
      ]);

      if (!dto) {
        setOrg(null);
        return;
      }

      setOrgDto(dto);
      const mapped = dtoToOrg(dto);

      mapped.facilities = (facilityDtos || []).map<OrgFacility>((f) => ({
        id: String(f.FacilityId),
        practiceName: f.FaciltiyName,
        address: f.FacilityAddress1,
        city: f.FacilityCity,
        state: f.FacilityState,
        zip: f.FacilityZip,
        facilityStatus: f.CredentialStatus === "Active" ? "Active" : "Inactive",
        smartEnabled: f.IsSmart?.toLowerCase() === "yes" || f.IsSmart === "true",
        npiNumber: f.FacilityNPINumber,
        primaryPhone: f.FacilityPrimaryPhone,
        altPhone: f.FacilityAlternatePhone ?? "",
        faxNumber: f.FacilityFaxNumber ?? "",
        email: f.FacilityEmailId,
        address2: f.FacilityAddress2 ?? "",
        county: f.FacilityCounty,
      }));

      mapped.staff = [] as OrgStaff[];

      setOrg(mapped);
      setFormData(toForm(mapped));
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    if (orgDetailsFetchStartedRef.current === orgId) return;
    orgDetailsFetchStartedRef.current = orgId;
    void load();
  }, [load, orgId]);

  useEffect(() => {
    if (org) {
      setStaffActiveMap((prev) => {
        const next: Record<string, boolean> = {};
        org.staff.forEach((s) => {
          next[s.id] = s.id in prev ? prev[s.id] : s.isActive;
        });
        return next;
      });
    }
  }, [org]);

  useEffect(() => {
    if (orgStaff.length) {
      setStaffActiveMap((prev) => {
        const next = { ...prev };
        orgStaff.forEach((u) => {
          if (!(u.Id in next)) next[u.Id] = u.IsEnabled;
        });
        return next;
      });
    }
  }, [orgStaff]);

  const handleResetPasswordClick = useCallback((userName: string) => {
    setModalContent({
      type: "resetPassword",
      userId: "",
      userName,
      isDisabled: false,
      title: "Reset Password",
      highlightMessage: "Are you sure you want to reset the user's password?",
    });
    setConfirmationModalOpen(true);
  }, []);

  const resetModalContent = useCallback(() => {
    setModalContent({
      type: "activate",
      userId: "",
      userName: "",
      isDisabled: false,
      title: "",
    });
  }, []);

  const handleConfirmationCancel = useCallback(() => {
    setConfirmationModalOpen(false);
    resetModalContent();
  }, [resetModalContent]);

  const handleConfirmModal = useCallback(async () => {
    if (modalContent.type === "resetPasswordSuccess") {
      setConfirmationModalOpen(false);
      resetModalContent();
      return;
    }

    if (modalContent.type === "resetPassword") {
      if (!modalContent.userName) {
        showToast("Username not found", TOAST_TYPES.WARNING);
        setConfirmationModalOpen(false);
        resetModalContent();
        return;
      }
      try {
        await resetPassword(modalContent.userName);
        setModalContent((prev) => ({
          ...prev,
          type: "resetPasswordSuccess",
          title: "Reset Password",
          highlightMessage: "Password successfully sent to registered email address",
        }));
      } catch {
        showToast("Failed to reset user's password.", TOAST_TYPES.ERROR);
        setConfirmationModalOpen(false);
        resetModalContent();
      }
      return;
    }

    const { userId, isDisabled, staffId } = modalContent;
    if (!userId) {
      showToast("UserId not found", TOAST_TYPES.WARNING);
      setConfirmationModalOpen(false);
      resetModalContent();
      return;
    }
    try {
      const enabling = !isDisabled;
      await activateUser(userId, enabling);
      showToast(`User is ${enabling ? "Enabled" : "Disabled"}`, TOAST_TYPES.SUCCESS);
      if (staffId) {
        setStaffActiveMap((prev) => ({ ...prev, [staffId]: enabling }));
      }
    } catch {
      showToast("Failed to perform this operation", TOAST_TYPES.ERROR);
    } finally {
      setConfirmationModalOpen(false);
      resetModalContent();
    }
  }, [modalContent, resetModalContent]);

  const handleEdit = () => {
    if (org) setFormData(toForm(org));
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (org) setFormData(toForm(org));
    setFormErrors({});
    setIsEditing(false);
  };

  const handleBlur = (field: keyof FormData) => {
    const err = validateOrganizationField(field, formData[field]);
    setFormErrors((prev) => {
      if (err) return { ...prev, [field]: err };
      if (prev[field]) {
        const rest = { ...prev };
        delete rest[field];
        return rest;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!orgId || !orgDto) return;
    const { isValid, firstErrorField, errors } = validateOrganizationForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      showToast(errors[firstErrorField] || "Please fix validation errors.", TOAST_TYPES.ERROR);
      return;
    }
    setSaving(true);
    try {
      const dto = formToDto(formData, orgDto, credentialStatuses);
      await editOrganization(dto);
      const refreshed = await getOrganizationById(Number(orgId));
      setOrgDto(refreshed);
      const mapped = dtoToOrg(refreshed);
      setOrg(mapped);
      setFormData(toForm(mapped));
      setIsEditing(false);
      showToast("Organization has been edited and saved successfully.", TOAST_TYPES.SUCCESS);
    } catch {
      showToast("Failed to save organization.", TOAST_TYPES.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const err = validateOrganizationField(field, value);
      if (err) return { ...prev, [field]: err };
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });
  };

  // The selected tab is matched by org name (TabsHeader uses userName for matching)
  const selectedTabs = useMemo(() => org?.name ?? "", [org]);

  // TabsHeader calls handleTabClick(t.userName) — look up id via userName
  const handleTabClick = useCallback(
    (tabLabel: string | number) => {
      const tab = openTabsRef.current.find((t) => t.userName === String(tabLabel));
      if (tab) navigate(`/provider-management/provider-organization/${tab.id}`);
    },
    [navigate]
  );

  const handleTabTitleClick = useCallback(() => {
    navigate(BASE_PATH);
  }, [navigate]);

  // onCloseTab(id, username) — id here is the tab id from openTabs
  const handleOnCloseTab = useCallback(
    (id: string | number) => {
      const closedId = String(id);
      dispatch(deleteOrgTab(closedId));
      const remaining = openTabsRef.current.filter((t) => t.id !== closedId);
      if (closedId === orgId) {
        if (remaining.length > 0) {
          navigate(`/provider-management/provider-organization/${remaining[remaining.length - 1].id}`);
        } else {
          navigate(BASE_PATH);
        }
      }
    },
    [dispatch, navigate, orgId]
  );

  const handleRefreshClick = useCallback(() => {
    void load();
  }, [load]);

  const inputSx = useMemo(
    () => ({
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
        paddingRight: "4px",
        height: "100%",
        boxSizing: "border-box",
      },
      "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button": {
        height: "24px",
        opacity: 1,
        display: "block",
        cursor: "pointer",
        margin: "auto 4px auto 0",
      },
      "& input[type=number]": {
        MozAppearance: "number-input",
      },
      "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? P.strokeDark : P.stroke },
    }),
    [isDarkMode]
  );

  const labelSx = { fontSize: 13, color: isDarkMode ? P.lightMutedText : P.uploadButtonBg, mb: 0.25 };
  const valueSx = { fontSize: 14, color: isDarkMode ? P.white : P.black, lineHeight: 1.4 };
  const fieldWrapSx = { display: "flex", flexDirection: "column" as const, gap: 0.25, mb: 1.5 };

  const renderViewField = (label: string, value: string, required = false) => (
    <Box sx={fieldWrapSx}>
      <Typography sx={{ ...labelSx, display: "flex", alignItems: "center", gap: "3px" }}>
        {label}
        {required && <Box component="span" sx={{ color: P.dangerText }}>*</Box>}
      </Typography>
      <Typography sx={valueSx}>{value || "—"}</Typography>
    </Box>
  );

  const renderEditField = (
    label: string,
    field: keyof FormData,
    placeholder?: string,
    required = false,
    type?: string,
    numericOnly = false,
    allowHyphen = false
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
          numericOnly={numericOnly}
          allowHyphen={allowHyphen}
          value={(formData[field] as string) ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          placeholder={placeholder ?? `Type ${label}`}
          maxLength={maxLength}
          inputProps={{
            "data-field": field,
            "data-dotphrase": "false",
          }}
          error={Boolean(error)}
          sx={{
            ...inputSx,
            ...(error ? { "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.error.main } } : {}),
          }}
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

  const statusPillSx = (status: string) => ({
    height: 24,
    borderRadius: "20px",
    fontSize: 12,
    fontWeight: 500,
    border: `1px solid ${status === "Active" ? P.statusActiveBorder : P.statusInactiveBorder}`,
    backgroundColor: status === "Active" ? P.statusActiveBg : P.statusInactiveBg,
    color: status === "Active" ? P.statusActiveText : P.statusInactiveText,
    "& .MuiChip-label": { px: 1.5 },
  });

  /* ── Facility List columns ── */
  const facilityColumns: GridColDef[] = useMemo(
    () => [
      { field: "practiceName", headerName: "Practice Name", flex: 1.4, minWidth: 130 },
      { field: "address", headerName: "Address", flex: 1.4, minWidth: 130 },
      { field: "city", headerName: "City", flex: 0.8, minWidth: 80 },
      { field: "state", headerName: "State", flex: 0.55, minWidth: 55 },
      { field: "zip", headerName: "Zip", flex: 0.6, minWidth: 60 },
      {
        field: "facilityStatus",
        headerName: "Facility Status",
        flex: 0.9,
        minWidth: 110,
        renderCell: (params) => (
          <Chip label={params.value as string} sx={statusPillSx(params.value as string)} />
        ),
      },
      {
        field: "smartEnabled",
        headerName: "Smart Enabled",
        flex: 0.8,
        minWidth: 100,
        renderCell: (params) => <Typography sx={{ fontSize: 14 }}>{params.value ? "Yes" : "No"}</Typography>,
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 0.45,
        minWidth: 60,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <RowActionMenu
            ariaLabel="Facility actions"
            items={[
              {
                label: "View",
                onClick: () => {
                  const fid = params.row.id as string;
                  dispatch(addProviderFacilityTab({ id: fid, email: "", userName: fid }));
                  dispatch(setSelectedTab({ username: fid }));
                  navigate(`/provider-management/facilities/${fid}`);
                },
              },
            ]}
          />
        ),
      },
    ],
    [navigate, dispatch]
  );


  if (loading) {
    const skBg = isDarkMode ? "grey.800" : "grey.200";
    const fieldRows = 7;
    return (
      <Box>
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
        />
        <ContentBox showBorder={false} sx={{ p: 0 }}>
          <Box
            sx={{
              backgroundColor: isDarkMode ? P.secondaryElevatedDark : P.gridHeaderLight,
              borderRadius: "10px",
              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
              p: "16px 24px 20px",
            }}
          >
            {/* Header bar */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
              <Skeleton variant="text" animation="wave" width={200} height={28} sx={{ bgcolor: skBg }} />
              <Skeleton variant="rounded" animation="wave" width={80} height={34} sx={{ borderRadius: "8px", bgcolor: skBg }} />
            </Stack>

            {/* 3-column fields */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: "0 32px" }}>
              {[0, 1, 2].map((col) => (
                <Box key={col}>
                  {[...Array(fieldRows)].map((_, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Skeleton variant="text" animation="wave" width="45%" height={16} sx={{ mb: 0.5, bgcolor: skBg }} />
                      <Skeleton variant="rounded" animation="wave" height={36} sx={{ borderRadius: "8px", bgcolor: skBg }} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>

            {/* Accordion placeholders */}
            {[0, 1].map((i) => (
              <Skeleton key={i} variant="rounded" animation="wave" height={48} sx={{ borderRadius: "8px", bgcolor: skBg, mt: 2 }} />
            ))}
          </Box>
        </ContentBox>
      </Box>
    );
  }

  if (!org) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Organization not found.</Typography>
      </Box>
    );
  }

  const gridSx = {
    "& .MuiDataGrid-root": { border: "none" },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
      borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
    },
    "& .MuiDataGrid-cell": {
      borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
      fontSize: 14,
      display: "flex",
      alignItems: "center",
    },
    "& .MuiDataGrid-row": {
      backgroundColor: isDarkMode ? P.black : P.white,
      "&:hover": { backgroundColor: isDarkMode ? P.darkHoverOverlay : P.gridHeaderLight },
    },
    "& .MuiDataGrid-footerContainer": { borderTop: "none" },
  };

  return (
    <Box sx={{ backgroundColor: isDarkMode ? P.black : "transparent", minHeight: "100%" }}>
      {/* ── Tabs ── */}
      <TabsHeader
        baseTitle="Organization"
        basePath={BASE_PATH}
        openTabs={openTabs}
        onCloseTab={handleOnCloseTab}
        styles={styles}
        selectedTabs={selectedTabs}
        handleTabClick={handleTabClick}
        handleTabTitleClick={handleTabTitleClick}
        handleRefreshClick={handleRefreshClick}
        baseTitleTooltip="Return to Organization list"
        refreshTooltipTitle="Reload organization data"
        closeTabTooltipTitle="Close tab"
      />

      <ContentBox showBorder={false} sx={{ p: 0 }}>
        <Box p={0}>

          {/* ── Org Card ── */}
          <Box
            data-dotphrase="false"
            sx={{
              backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
              borderRadius: "10px",
              border: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke}`,
              p: "16px 24px 20px",
              mb: 2,
            }}
          >
            {/* Card header */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: isDarkMode ? P.white : P.black }}>
                {org.name}
              </Typography>
              {!isEditing ? (
                <Button
                  variant="contained"
                  onClick={handleEdit}
                  sx={{
                    height: 34, borderRadius: "8px", textTransform: "none", fontWeight: 400,
                    fontSize: 14, px: 2.5, backgroundColor: P.primary,
                    "&:hover": { backgroundColor: P.primaryHover },
                  }}
                >
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={handleCancel}
                    sx={{
                      height: 34, borderRadius: "8px", textTransform: "none", fontWeight: 400,
                      fontSize: 14, px: 2.5, backgroundColor: isDarkMode ? P.inputBgDark : P.cancelFilledButtonBg,
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
              )}
            </Box>

            {/* 3-column form */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: "0 32px", alignItems: "start" }}>
              {/* Col 1 */}
              <Box>
                {isEditing ? renderEditField("Name", "name", "Organization Name", true) : renderViewField("Name", org.name, true)}
                {isEditing ? renderEditField("Email Address", "emailAddress", "Email Address", true, "email") : renderViewField("Email Address", org.emailAddress, true)}
                {isEditing ? renderEditField("Phone Number", "phoneNumber", "Phone Number", true, "number", true) : renderViewField("Phone Number", org.phoneNumber, true)}
                {isEditing ? renderEditField("Alternate Phone Number", "altPhoneNumber", "Alternate Number", false, "number", true) : renderViewField("Alternate Phone Number", org.altPhoneNumber)}
                {isEditing ? renderEditField("Fax Number", "faxNumber", "Fax Number", true, "number", true) : renderViewField("Fax Number", org.faxNumber, true)}
                {isEditing ? renderEditField("Tax ID Number", "taxIdNumber", "Tax ID Number", false, "number", true) : renderViewField("Tax ID Number", org.taxIdNumber)}
                {isEditing ? renderEditField("NPI Number", "npiNumber", "NPI Number", false, "number", true) : renderViewField("NPI Number", org.npiNumber)}
              </Box>

              {/* Col 2 */}
              <Box>
                {isEditing ? renderEditField("Address 1", "address1", "Address 1", true) : renderViewField("Address 1", org.address1, true)}
                {isEditing ? renderEditField("Address 2", "address2", "Address 2") : renderViewField("Address 2", org.address2)}
                {isEditing ? renderEditField("City", "city", "City", true) : renderViewField("City", org.city, true)}
                {isEditing ? renderEditField("County", "county", "County", true) : renderViewField("County", org.county, true)}
                {isEditing ? renderEditField("State", "state", "State", true) : renderViewField("State", org.state, true)}
                {isEditing ? renderEditField("Zip", "zip", "Zip Code", true, "number", true) : renderViewField("Zip", org.zip, true)}
              </Box>

              {/* Col 3 */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isEditing ? formData.isInfinite : org.isInfinite}
                      onChange={isEditing ? (e) => handleChange("isInfinite", e.target.checked) : undefined}
                      disabled={!isEditing}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: isDarkMode ? P.lightMutedText : P.uploadButtonBg }}>Is Infinite</Typography>}
                  sx={{ mb: 1.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isEditing ? formData.isPayable : org.isPayable}
                      onChange={isEditing ? (e) => handleChange("isPayable", e.target.checked) : undefined}
                      disabled={!isEditing}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: isDarkMode ? P.lightMutedText : P.uploadButtonBg }}>Is Payable</Typography>}
                  sx={{ mb: 1.5 }}
                />
                {isEditing ? (
                  renderEditField("CMS Rate Percent", "cmsRatePercent", "CMS Rate", true, "number", true)
                ) : (
                  renderViewField("CMS Rate Percent", org.cmsRatePercent, true)
                )}
                {isEditing ? (
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
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: formErrors.contractStatus
                            ? theme.palette.error.main
                            : isDarkMode ? P.strokeDark : P.stroke,
                        },
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
                ) : (
                  renderViewField("Contract Status", org.contractStatus, true)
                )}
              </Box>
            </Box>
          </Box>

          {/* ── Facility List accordion (view mode only) ── */}
          {!isEditing && (
            <AccordionComponent
              title="Facility List"
              defaultExpanded
              sx={{ mb: 2, borderRadius: "10px", border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}` }}
            >
              <Box sx={gridSx}>
                <Box sx={{ maxWidth: "100%", border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`, borderRadius: "8px", overflowX: "auto", overflowY: "hidden" }}>
                <Box sx={{ minWidth: 900 }}>
                <DataGridTable
                  rows={org.facilities}
                  columns={facilityColumns}
                  isDarkMode={isDarkMode}
                  autoHeight
                  pageSize={10}
                  checkboxSelection={false}
                  compactOnMobile
                  columnDisplayWidth={900}
                  noRowsMessage="No facilities."
                />
                </Box>
                </Box>
              </Box>
            </AccordionComponent>
          )}

          {/* ── Organization Staff accordion (view mode only) ── */}
          {!isEditing && (
            <AccordionComponent
              title="Organization Staff"
              defaultExpanded
              sx={{ borderRadius: "10px", border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}` }}
            >
              <Box sx={gridSx}>
                <Box sx={{ maxWidth: "100%", border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`, borderRadius: "8px", overflowX: "auto", overflowY: "hidden" }}>
                <Box sx={{ minWidth: 980 }}>
                <DataGridTable
                  rows={orgStaff.map((u) => ({ ...u, id: u.UserId ?? u.Id }))}
                  columns={[
                    { field: "FullName", headerName: "Name", flex: 1, minWidth: 120 },
                    { field: "Email", headerName: "Email Address", flex: 1.4, minWidth: 150 },
                    {
                      field: "UserRolls",
                      headerName: "Roles",
                      flex: 2,
                      minWidth: 200,
                      renderCell: (params) => (
                        <Typography sx={{ fontSize: 13, whiteSpace: "normal", lineHeight: 1.5, py: 1 }}>
                          {String(params.value ?? "")}
                        </Typography>
                      ),
                    },
                    {
                      field: "IsEnabled",
                      headerName: "Status",
                      flex: 0.7,
                      minWidth: 90,
                      renderCell: (params) => {
                        const active = params.value as boolean;
                        return (
                          <Chip
                            label={active ? "Active" : "Inactive"}
                            sx={{
                              height: 28,
                              borderRadius: "15px",
                              fontSize: 12,
                              fontWeight: 500,
                              backgroundColor: active ? P.statusActiveBg : P.statusInactiveBg,
                              border: `1px solid ${active ? P.statusActiveBorder : P.statusInactiveBorder}`,
                              color: active ? P.statusActiveText : P.statusInactiveText,
                            }}
                          />
                        );
                      },
                    },
                    { field: "UserNPINumber", headerName: "NPI", flex: 0.9, minWidth: 110 },
                    {
                      field: "staffAction",
                      headerName: "Action",
                      flex: 0.9,
                      minWidth: 110,
                      sortable: false,
                      filterable: false,
                      disableColumnMenu: true,
                      renderCell: (params) => {
                        const u = params.row as ProviderUser;
                        const isActive = staffActiveMap[u.Id] ?? u.IsEnabled;
                        return (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Switch
                              checked={isActive}
                              size="medium"
                              color="primary"
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => {
                                setModalContent({
                                  type: "activate",
                                  staffId: u.Id,
                                  userId: u.Id,
                                  userName: u.UserName,
                                  isDisabled: isActive,
                                  title: "Before you Continue",
                                  highlightMessage: `You are about to ${isActive ? "disable" : "enable"} MDE login for this user. Are you sure you want to continue?`,
                                });
                                setConfirmationModalOpen(true);
                              }}
                            />
                            <RowActionMenu
                              ariaLabel="Staff actions"
                              items={[
                                {
                                  label: "View",
                                  onClick: () => {
                                    dispatch(addProviderUserTab({ id: u.Id, email: u.Email ?? "", userName: u.UserName }));
                                    dispatch(setUserSelectedTab({ username: u.UserName }));
                                    navigate(`/provider-management/users/${u.UserName}`);
                                  },
                                },
                                {
                                  label: "Reset Password",
                                  onClick: () => handleResetPasswordClick(u.UserName),
                                },
                              ]}
                            />
                          </Box>
                        );
                      },
                    },
                  ] as GridColDef[]}
                  loading={orgStaffLoading}
                  isDarkMode={isDarkMode}
                  autoHeight
                  pageSize={10}
                  checkboxSelection={false}
                  compactOnMobile
                  columnDisplayWidth={980}
                  rowHeight={80}
                  noRowsMessage="No staff members."
                />
                </Box>
                </Box>
              </Box>
            </AccordionComponent>
          )}
        </Box>
      </ContentBox>

      <ConfirmationModal
        open={confirmationModalOpen}
        title={modalContent?.title || "Reset Password"}
        highlightMessage={
          modalContent?.type === "activate" ||
          modalContent?.type === "resetPassword" ||
          modalContent?.type === "resetPasswordSuccess"
            ? modalContent?.highlightMessage
            : undefined
        }
        highlightTone={
          modalContent?.type === "resetPassword" || modalContent?.type === "resetPasswordSuccess"
            ? "info"
            : "warning"
        }
        infoAlert={
          modalContent?.type === "resetPassword" || modalContent?.type === "resetPasswordSuccess"
        }
        confirmLabel={
          modalContent?.type === "activate"
            ? "Continue"
            : modalContent?.type === "resetPasswordSuccess"
              ? "Done"
              : "Yes"
        }
        cancelLabel={modalContent?.type === "resetPasswordSuccess" ? undefined : "Cancel"}
        actionStyle={modalContent?.type === "activate" ? "filledWarning" : "default"}
        onConfirm={handleConfirmModal}
        onCancel={modalContent?.type === "resetPasswordSuccess" ? undefined : handleConfirmationCancel}
        onClose={handleConfirmationCancel}
        isRecurrence={false}
        isDarkMode={isDarkMode}
      />
    </Box>
  );
};

export default OrganizationDetails;
