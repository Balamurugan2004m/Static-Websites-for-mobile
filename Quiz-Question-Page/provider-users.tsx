/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add, EmailOutlined, KeyOutlined, Search, VisibilityOutlined, VpnKeyOutlined } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import { useAuth } from "../../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { showToast } from "../../../utils/toast";
import { TOAST_TYPES } from "../../../types/toast-types";

import { RootState } from "../../../store";
import ContentBox from "../../../layouts/content-box";
import { deleteProviderUserTab, addProviderUserTab } from "../../../store/slice/ui-slice";
import { activateUser, resendAccountUserInvite, resetAccountUserMfa, resetPassword } from "../../../services/account-users";
import {
  ProviderUser,
  searchProviderUsers,
  mapSearchProviderUserToProviderUser,
  type ProviderUserFilterField,
  type ProviderUserFilterOperator,
  type ProviderUserSearchFilter,
} from "../../../services/provider-users";
import TabsHeader from "../../../components/users/components/tabs-header";
import { getStyles } from "../../../components/users/utils/styles";
import { deleteAccountUserByUsername, setSelectedTab } from "../../../store/slice/provider-users-slice";
import DataGridTable from "../../../ui/data-grid-table";
import ConfirmationModal from "../../../ui/confirmation-modal";
import AppTooltip from "../../../components/app-tooltip";
import RowActionMenu from "../../../components/row-action-menu";
import { CLAIMS, ACCESS } from "../../../constants/auth";
import { THEME_PRIMITIVES } from "../../../theme";

// ------------------- CONSTANTS -------------------
const SEARCH_FILTER_FIELDS: ProviderUserFilterField[] = [
  "UserName",
  "Email",
  "FirstName",
  "LastName",
  "PrintName",
];

const DEFAULT_FILTER_OPERATOR: ProviderUserFilterOperator = "Contains";

const DEFAULT_TENANT_ID = 1;
const MAX_RESULTS = 10;
const P = THEME_PRIMITIVES;

// ------------------- HOOKS -------------------
const useProviderUsers = () => {
  const [data, setData] = useState<ProviderUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedTab } = useSelector((state: RootState) => state.providerUser);

  const search = useCallback(async (filters: ProviderUserSearchFilter[]) => {
    if (!filters.length) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchProviderUsers({
        TenantId: DEFAULT_TENANT_ID,
        Filters: filters,
        ProviderRoles: "",
      });
      const items = Array.isArray(res) ? res : [];
      setData(items.map(mapSearchProviderUserToProviderUser));
    } catch (error) {
      console.error("Failed to search provider users:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const setIsEnabled = (id: string) => {
    if (!id) {
      return;
    }
    const updatedData = data?.map((e) => {
      if (e?.Id === id) {
        return { ...e, IsEnabled: !e?.IsEnabled };
      }
      return e;
    });
    setData(updatedData);
  };

  return { data, loading, setIsEnabled, selectedTab, search };
};

// ------------------- COMPONENT -------------------
const ProviderUsers = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: "activate" | "resetPassword" | "resetMfa";
    userId: string;
    userName: string;
    isDisabled: boolean;
    title: string;
    description?: string;
    highlightMessage?: string;
  }>({
    type: "activate",
    userId: "",
    userName: "",
    isDisabled: false,
    title: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<ProviderUserSearchFilter[]>([]);

  const isSideMenuOpen = useSelector((state: RootState) => state.ui.openStates["sideMenu"]);
  const { data: providerUsersData, loading, setIsEnabled, selectedTab, search } = useProviderUsers();

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";
  const openTabs = useSelector((state: RootState) => state.ui.providerUsersTabs);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCompactToolbar = useMediaQuery(theme.breakpoints.down("lg")) || isSideMenuOpen;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasClaim } = useAuth();

  // ==================== PERMISSIONS ====================
  const canViewUsers =
    hasClaim(CLAIMS.canViewProviderUserInformation, ACCESS.ALLOWED) ||
    hasClaim(CLAIMS.canEditProviderUserInformation, ACCESS.ALLOWED);
  const canCreateUsers = hasClaim(CLAIMS.canEditProviderUserInformation, ACCESS.ALLOWED);
  const canEnableDisableUsers = hasClaim(CLAIMS.canEditProviderUserInformation, ACCESS.ALLOWED);

  const openUserDetails = useCallback(
    (row: any) => {
      const userName = row?.UserName ?? row?.userName ?? "";
      if (!userName) {
        showToast("Username not found for selected user", TOAST_TYPES.WARNING);
        return;
      }
      const rawId = row?.UserId ?? row?.userId ?? row?.id ?? row?.Id;
      const numericId = Number(rawId);
      dispatch(deleteAccountUserByUsername({ username: userName }));
      dispatch(
        addProviderUserTab({
          id: Number.isFinite(numericId) && numericId > 0 ? numericId : rawId || userName,
          email: row?.Email ?? "",
          userName: userName,
        })
      );
      dispatch(setSelectedTab({ username: userName }));
      navigate(`/provider-management/users/${userName}`, {
        state: {
          providerUserId: Number.isFinite(numericId) && numericId > 0 ? numericId : undefined,
          forceFetch: true,
        },
      });
    },
    [dispatch, navigate]
  );

  const handleEnableDisableClick = useCallback((row: any) => {
    const { Id, IsEnabled } = row || {};
    setModalContent({
      type: "activate",
      userId: Id,
      userName: row?.UserName ?? "",
      isDisabled: IsEnabled,
      title: "Before you Continue",
      description: "",
      highlightMessage: `You are about to ${IsEnabled ? "disable" : "enable"} MDE login for this user. Are you sure you want to continue?`,
    });
    setConfirmationModalOpen(true);
  }, []);

  const handleResetPasswordClick = useCallback((row: any) => {
    setModalContent({
      type: "resetPassword",
      userId: row?.Id ?? "",
      userName: row?.UserName ?? "",
      isDisabled: false,
      title: "Reset Password",
      highlightMessage: "Are you sure you want to reset the user's password?",
    });
    setConfirmationModalOpen(true);
  }, []);

  const handleResetMfaClick = useCallback((row: any) => {
    setModalContent({
      type: "resetMfa",
      userId: row?.Id ?? "",
      userName: row?.UserName ?? "",
      isDisabled: false,
      title: "Reset MFA",
      highlightMessage: "Are you sure you would like to reset MFA?",
    });
    setConfirmationModalOpen(true);
  }, []);

  const handleResendInviteClick = useCallback(async (row: any) => {
    if (!row?.Id) {
      showToast("Username not found", TOAST_TYPES.WARNING);
      return;
    }
    try {
      await resendAccountUserInvite(row.Id);
      showToast("Email successfully sent", TOAST_TYPES.SUCCESS);
    } catch {
      showToast("Error in sending email", TOAST_TYPES.ERROR);
    }
  }, []);

  // ------------------- COLUMNS -------------------
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "FullName",
        headerName: "Name",
        flex: 1,
        minWidth: 120,
        renderCell: (params: any) => {
          const name = params?.row?.FullName || "";
          const parts = name.split(",").map((p: string) => p.trim());
          if (parts.length >= 2) {
            return (
              <Box sx={{ py: 1, lineHeight: 1.35, whiteSpace: "normal" }}>
                <Typography component="span" sx={{ fontSize: 16, color: "text.primary" }}>
                  {parts[0]},
                </Typography>
                <br />
                <Typography component="span" sx={{ fontSize: 16, color: "text.primary" }}>
                  {parts.slice(1).join(", ")}
                </Typography>
              </Box>
            );
          }
          return (
            <Typography sx={{ fontSize: 16, py: 1, whiteSpace: "normal" }}>{name}</Typography>
          );
        },
      },
      {
        field: "Email",
        headerName: "Email Address",
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "UserRolls",
        headerName: "Roles",
        flex: 2,
        minWidth: 200,
        renderCell: (params: any) => (
          <Typography
            sx={{
              fontSize: 16,
              py: 1,
              whiteSpace: "normal",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 8,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {params?.row?.UserRolls || ""}
          </Typography>
        ),
      },
      {
        field: "UserNPINumber",
        headerName: "NPI",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "Status",
        headerName: "Status",
        flex: 0.9,
        minWidth: 110,
        sortable: false,
        renderCell: (params: any) => {
          const isEnabled = !!params?.row?.IsEnabled;
          return (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                px: 1.25,
                py: 0.75,
                borderRadius: "15px",
                backgroundColor: isEnabled
                  ? isDarkMode
                    ? P.accordionCptDarkAlpha
                    : P.accordionCptOnDark
                  : isDarkMode
                    ? P.inputBgDark
                    : P.lightNeutralSurface,
                color: isEnabled
                  ? isDarkMode
                    ? P.accordionCptOnDark
                    : P.success
                  : isDarkMode
                    ? P.lightMutedText
                    : P.labelMuted,
                fontSize: 14,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {isEnabled ? "Active" : "Inactive"}
            </Box>
          );
        },
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 0.9,
        minWidth: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        hideable: false,
        renderCell: (data: any) => {
          const isEnabled = data?.row?.IsEnabled;
          return (
            <Box display="flex" flexDirection="row" gap={0.5} alignItems="center" height="100%">
              {canEnableDisableUsers && (
                <AppTooltip
                  title={
                    isEnabled
                      ? `Disable ${data?.row?.FullName || "user"}`
                      : `Enable ${data?.row?.FullName || "user"}`
                  }
                  placement="bottom"
                  arrow
                >
                  <Switch
                    checked={!!isEnabled}
                    size="medium"
                    color="primary"
                    inputProps={{
                      "aria-label": isEnabled
                        ? `Disable ${data?.row?.FullName || "user"}`
                        : `Enable ${data?.row?.FullName || "user"}`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleEnableDisableClick(data?.row)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: P.primary,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: isDarkMode ? P.rolesSwitchTrackDark : "#BCC7DE",
                        opacity: isDarkMode ? P.rolesSwitchTrackOpacity : 1,
                      },
                      ...(isDarkMode && {
                        "& .MuiSwitch-switchBase": {
                          color: P.white,
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: P.rolesSwitchTrackDark,
                          opacity: P.rolesSwitchTrackOpacity,
                        },
                      }),
                    }}
                  />
                </AppTooltip>
              )}
              {canViewUsers && (
                <RowActionMenu
                  ariaLabel={`Actions for ${data?.row?.FullName || "user"}`}
                  items={[
                    {
                      label: "View",
                      icon: <VisibilityOutlined sx={{ fontSize: 18, flexShrink: 0 }} />,
                      onClick: () => openUserDetails(data?.row),
                    },
                    ...(data?.row?.EnableResetMFA
                      ? [
                          {
                            label: "Reset Password",
                            icon: <VpnKeyOutlined sx={{ fontSize: 18, flexShrink: 0 }} />,
                            onClick: () => handleResetPasswordClick(data?.row),
                          },
                          {
                            label: "Reset MFA",
                            icon: <KeyOutlined sx={{ fontSize: 18, flexShrink: 0 }} />,
                            onClick: () => handleResetMfaClick(data?.row),
                          },
                        ]
                      : [
                          {
                            label: "Resend Invite",
                            icon: <EmailOutlined sx={{ fontSize: 18, flexShrink: 0 }} />,
                            onClick: () => void handleResendInviteClick(data?.row),
                          },
                        ]),
                  ]}
                />
              )}
            </Box>
          );
        },
      },
    ],
    [
      canViewUsers,
      canEnableDisableUsers,
      handleEnableDisableClick,
      handleResetPasswordClick,
      handleResetMfaClick,
      handleResendInviteClick,
      isDarkMode,
      openUserDetails,
    ]
  );

  const hasSearchFilter = appliedFilters.length > 0;

  // ------------------- ROWS -------------------
  const rows = useMemo(() => {
    if (!hasSearchFilter) return [];
    return providerUsersData
      ?.filter((user: any) => {
        const rawRoles = user?.UserRolls ?? user?.Roles ?? user?.Role;
        if (typeof rawRoles === "string") {
          return rawRoles.toLowerCase().includes("provider");
        }
        if (Array.isArray(rawRoles)) {
          return rawRoles.some((r: any) => {
            const roleName = String(typeof r === "string" ? r : r?.Name || r?.RoleName || "").toLowerCase();
            return roleName.includes("provider") || Boolean(r?.IsProvider);
          });
        }
        return false;
      })
      .map((user) => ({
        ...user,
        id: user.UserId ?? user.Id,
      }))
      .slice(0, MAX_RESULTS);
  }, [providerUsersData, hasSearchFilter]);

  // ------------------- HANDLERS -------------------
  const handleConfirmModal = async () => {
    if (modalContent.type === "resetPassword") {
      if (!modalContent.userName) {
        showToast("Username not found", TOAST_TYPES.WARNING);
        setConfirmationModalOpen(false);
        return;
      }
      try {
        await resetPassword(modalContent.userName);
        showToast("Password reset link sent to user's email.", TOAST_TYPES.SUCCESS);
      } catch {
        showToast("Failed to reset user's password.", TOAST_TYPES.ERROR);
      } finally {
        setModalContent({
          type: "activate",
          userId: "",
          userName: "",
          isDisabled: false,
          title: "",
          description: "",
        });
        setConfirmationModalOpen(false);
      }
      return;
    }

    if (modalContent.type === "resetMfa") {
      if (!modalContent.userId) {
        showToast("Username not found", TOAST_TYPES.WARNING);
        setConfirmationModalOpen(false);
        return;
      }
      try {
        const result = await resetAccountUserMfa(modalContent.userId, modalContent.userName);
        showToast(result.Message || "Reset MFA is done successfully", TOAST_TYPES.SUCCESS);
      } catch (error) {
        const message = error instanceof Error && error.message
          ? error.message
          : "Error in resetting user MFA";
        showToast(message, TOAST_TYPES.ERROR);
      } finally {
        setModalContent({
          type: "activate",
          userId: "",
          userName: "",
          isDisabled: false,
          title: "",
          description: "",
        });
        setConfirmationModalOpen(false);
      }
      return;
    }

    try {
      const { userId, isDisabled } = modalContent || {};
      if (!userId) {
        showToast("UserId not found", TOAST_TYPES.WARNING); return;
      }
      const res = await activateUser(userId, !isDisabled);
      if (res) {
        showToast(`User is ${res?.Enabled ? "Enabled" : "Disabled"}`, TOAST_TYPES.SUCCESS);
        setIsEnabled(res?.SecurityUserId);
      }
    } catch (error) {
      showToast(`Failed to perform this operation`, TOAST_TYPES.ERROR);
      console.error({ error });
    } finally {
      setModalContent({
        type: "activate",
        userId: "",
        userName: "",
        title: "",
        description: "",
        isDisabled: false,
      });
      setConfirmationModalOpen(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmationModalOpen(false);
  }, []);

  const handleAddUser = () => {
    navigate("/provider-management/users/create");
  };

  const handleSearch = useCallback(() => {
    const value = searchQuery.trim();
    if (!value) {
      setAppliedFilters([]);
      return;
    }
    const filters = SEARCH_FILTER_FIELDS.map<ProviderUserSearchFilter>((field, index) => ({
      Field: field,
      Operator: DEFAULT_FILTER_OPERATOR,
      Logic: index === 0 ? "And" : "Or",
      Value: value,
    }));
    setAppliedFilters(filters);
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const noRowsMessage = hasSearchFilter
    ? "No users found matching the applied search criteria."
    : "Please apply search filters to narrow down the results.";

  useEffect(() => {
    search(appliedFilters);
  }, [appliedFilters, search]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = useMemo(() => getStyles(theme, windowWidth), [theme, windowWidth]);

  const handleTabClick = (username: string) => {
    dispatch(setSelectedTab({ username }));
    const tab = openTabs?.find((t: any) => t.userName === username);
    const numericTabId = tab ? Number(tab.id) : 0;
    navigate(`/provider-management/users/${username}`, {
      state: {
        providerUserId: Number.isFinite(numericTabId) && numericTabId > 0 ? numericTabId : undefined,
        forceFetch: true,
      },
    });
  };

  const handleTabTitleClick = () => {
    dispatch(setSelectedTab({ username: "" }));
    navigate("/provider-management/users");
  };

  const handleOnCloseTab = (id: string, username: string) => {
    dispatch(setSelectedTab({ username: "" }));
    dispatch(deleteAccountUserByUsername({ username: username }));
    dispatch(deleteProviderUserTab(id));
  };

  if (!canViewUsers) {
    return (
      <Box>
        <TabsHeader
          baseTitle="Users"
          basePath="/provider-management/users"
          openTabs={openTabs}
          styles={styles}
        />
        <ContentBox sx={{ p: 2 }}>
          <Box p={{ xs: 1, sm: 2 }} width="100%" sx={{ overflowX: "hidden" }}>
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Access Denied
              </Typography>
              <Typography variant="body2">
                You don't have permission to view provider management.
              </Typography>
            </Box>
          </Box>
        </ContentBox>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <TabsHeader
        baseTitle="Users"
        basePath="/provider-management/users"
        openTabs={openTabs}
        onCloseTab={(id: string | number, username: string) => handleOnCloseTab(String(id), username)}
        styles={styles}
        selectedTabs={selectedTab}
        handleTabClick={(id: string | number) => handleTabClick(String(id))}
        handleTabTitleClick={handleTabTitleClick}
        baseTitleTooltip="Return to provider users list"
        refreshTooltipTitle="Reload provider user data"
        closeTabTooltipTitle="Close tab and return to provider users"
      />
      <ContentBox showBorder={false} sx={{ p: 0, mb: 0, flexGrow: 0, minWidth: 0, width: "100%" }}>
        <Box p={0} width="100%" sx={{ minWidth: 0 }}>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={1.5}
            alignItems={isMobile ? "stretch" : "center"}
            sx={{
              mb: 2,
              px: 2,
              width: "100%",
              minWidth: 0,
            }}
          >
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search sx={{ color: "text.secondary", fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: "1 1 auto",
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  height: 45,
                  borderRadius: "10px",
                  backgroundColor: isDarkMode ? P.black : P.white,
                  color: isDarkMode ? P.white : "text.primary",
                  "& fieldset": {
                    borderColor: isDarkMode ? P.inputBgDark : P.stroke,
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode ? P.inputBgDark : P.stroke,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDarkMode ? P.inputBgDark : P.primary,
                  },
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                  color: isDarkMode ? P.white : "text.primary",
                  "&::placeholder": {
                    color: isDarkMode ? P.lightMutedText : P.labelMuted,
                    opacity: 1,
                  },
                },
              }}
            />
            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={1}
              alignItems={isMobile ? "stretch" : "center"}
              sx={{
                width: isMobile ? "100%" : "auto",
                flex: "0 0 auto",
              }}
            >
              <AppTooltip title="Search provider users" placement="bottom" arrow>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  size="medium"
                  aria-label={isCompactToolbar ? "Search provider users" : undefined}
                  sx={{
                    height: 45,
                    borderRadius: "10px",
                    minWidth: isMobile ? "100%" : isCompactToolbar ? 45 : 93,
                    width: isMobile ? "100%" : isCompactToolbar ? 45 : 93,
                    px: isCompactToolbar && !isMobile ? 0 : 1,
                    textTransform: "none",
                    fontWeight: 400,
                    backgroundColor: P.primary,
                    "&:hover": {
                      backgroundColor: P.primaryHover,
                    },
                  }}
                >
                  {isCompactToolbar && !isMobile ? <Search fontSize="small" /> : "Search"}
                </Button>
              </AppTooltip>
              {canCreateUsers && (
                <AppTooltip title="Create a new provider user" placement="bottom" arrow>
                  <Button
                    variant="contained"
                    onClick={handleAddUser}
                    size="medium"
                    sx={{
                      height: 45,
                      borderRadius: "10px",
                      minWidth: isMobile ? "100%" : isCompactToolbar ? 45 : 100,
                      width: isMobile ? "100%" : isCompactToolbar ? 45 : "auto",
                      px: isCompactToolbar && !isMobile ? 0 : 1.5,
                      textTransform: "none",
                      fontWeight: 400,
                      whiteSpace: "nowrap",
                      backgroundColor: P.primary,
                      "&:hover": {
                        backgroundColor: P.primaryHover,
                      },
                    }}
                  >
                    {isCompactToolbar && !isMobile ? <Add fontSize="small" /> : "+ Add User"}
                  </Button>
                </AppTooltip>
              )}
            </Stack>
          </Stack>
          <Box
            sx={{
              width: "100%",
              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
              borderRadius: "8px",
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
          <Box
            id="data-grid-table"
            sx={{
              minWidth: isSideMenuOpen ? 1000 : 870,
              width: "100%",
              p: 0,
              m: 0,
              "& .MuiDataGrid-root": {
                border: "none",
                borderRight: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
              },
            }}
          >
            <DataGridTable
              columns={columns}
              columnDisplayWidth={isSideMenuOpen ? 1000 : 870}
              compactOnMobile
              rows={rows}
              loading={loading}
              checkboxSelection={false}
              showToolbar={false}
              isDarkMode={isDarkMode}
              autoHeight
              noRowsMessage={noRowsMessage}
              rowHeight={100}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sx={{
                border: "none !important",
                borderRight: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
                p: 0,
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
                },
                "& .MuiDataGrid-cell": {
                  alignItems: "flex-start",
                  py: 1.5,
                  fontSize: 16,
                },
                "& .MuiDataGrid-row": {
                  minHeight: "100px !important",
                },
                "& .MuiDataGrid-virtualScroller": { overflow: "hidden !important" },
                "& .MuiDataGrid-scrollbar": { display: "none !important" },
                "& .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-scrollbarFiller--header, & .MuiDataGrid-filler": {
                  display: "none !important",
                },
                "& .MuiDataGrid-footerContainer": { display: "flex !important", minHeight: 52, p: 0 },
              }}
            />
          </Box>
          </Box>
        </Box>
      </ContentBox>
      <ConfirmationModal
        open={confirmationModalOpen}
        title={modalContent?.title || "Reset Password"}
        highlightMessage={
          modalContent?.type === "activate" ||
          modalContent?.type === "resetPassword" ||
          modalContent?.type === "resetMfa"
            ? modalContent?.highlightMessage
            : undefined
        }
        highlightTone={modalContent?.type === "resetPassword" ? "info" : "warning"}
        description={
          modalContent?.type !== "activate" &&
          modalContent?.type !== "resetPassword" &&
          modalContent?.type !== "resetMfa"
            ? modalContent?.description || "Are you sure you want to reset the user's password?"
            : undefined
        }
        confirmLabel={modalContent?.type === "activate" ? "Continue" : "Yes"}
        cancelLabel="Cancel"
        actionStyle={modalContent?.type === "activate" ? "filledWarning" : "default"}
        onConfirm={handleConfirmModal}
        onCancel={handleConfirmationCancel}
        onClose={handleConfirmationCancel}
        isRecurrence={false}
        isDarkMode={isDarkMode}
      />
    </Box>
  );
};

export default ProviderUsers;
