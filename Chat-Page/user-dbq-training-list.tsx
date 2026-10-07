import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add, InfoOutlined, Search } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { RootState } from "../../store";
import ContentBox from "../../layouts/content-box";
import {
  addUserDbqTrainingTab,
  deleteUserDbqTrainingTab,
} from "../../store/slice/ui-slice";
import TabsHeader from "../../components/users/components/tabs-header";
import { getStyles } from "../../components/users/utils/styles";
import DataGridTable from "../../ui/data-grid-table";
import AppTooltip from "../../components/app-tooltip";
import RowActionMenu from "../../components/row-action-menu";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import {
  formatDisplayName,
  searchUserDbqTraining,
  UserDbqTrainingListItem,
} from "../../services/user-dbq-training";

const P = THEME_PRIMITIVES;
const BASE_PATH = paths.PROVIDER_MANAGEMENT_USER_DBQ_TRAINING.pathName;

type ListRow = UserDbqTrainingListItem & { id: string; displayName: string };

const UserDbqTrainingList = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ListRow[]>([]);

  const isSideMenuOpen = useSelector((state: RootState) => state.ui.openStates["sideMenu"]);
  const openTabs = useSelector((state: RootState) => state.ui.userDbqTrainingTabs);
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCompactToolbar = useMediaQuery(theme.breakpoints.down("lg")) || isSideMenuOpen;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openDetails = useCallback(
    (row: ListRow) => {
      const tabLabel = formatDisplayName(row) || row.UserName;
      dispatch(
        addUserDbqTrainingTab({
          id: row.Id,
          email: row.Id,
          userName: tabLabel,
        })
      );
      navigate(`${BASE_PATH}/${row.Id}`);
    },
    [dispatch, navigate]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "displayName",
        headerName: "Name",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "Email",
        headerName: "Email Address",
        flex: 1.4,
        minWidth: 200,
      },
      {
        field: "Roles",
        headerName: "Roles",
        flex: 1.2,
        minWidth: 160,
      },
      {
        field: "NPI",
        headerName: "NPI",
        flex: 0.8,
        minWidth: 120,
      },
      {
        field: "Status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 110,
        sortable: false,
        renderCell: (params) => {
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
                    : P.statusActiveBg
                  : isDarkMode
                    ? P.inputBgDark
                    : P.lightNeutralSurface,
                color: isEnabled
                  ? isDarkMode
                    ? P.accordionCptOnDark
                    : P.statusActiveText
                  : isDarkMode
                    ? P.mutedTextOnDark
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
        flex: 0.5,
        minWidth: 80,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <RowActionMenu
            ariaLabel={`Actions for ${params.row.displayName}`}
            items={[
              {
                label: "Edit",
                onClick: () => openDetails(params.row as ListRow),
              },
            ]}
          />
        ),
      },
    ],
    [isDarkMode, openDetails]
  );

  const handleSearch = useCallback(async () => {
    const value = searchQuery.trim();
    setHasSearched(true);
    if (!value) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchUserDbqTraining(value);
      setRows(
        results.map((user) => ({
          ...user,
          id: user.Id,
          displayName: formatDisplayName(user),
        }))
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void handleSearch();
      }
    },
    [handleSearch]
  );

  const handleAddUser = () => {
    navigate(paths.PROVIDER_MANAGEMENT_USER_CREATE.pathName);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = useMemo(() => getStyles(theme, windowWidth), [theme, windowWidth]);

  const handleTabClick = useCallback(
    (tabLabel: string) => {
      const tab = openTabs.find((t) => t.userName === tabLabel);
      navigate(`${BASE_PATH}/${tab?.email || tabLabel}`);
    },
    [navigate, openTabs]
  );

  const handleTabTitleClick = useCallback(() => {
    navigate(BASE_PATH);
  }, [navigate]);

  const handleOnCloseTab = useCallback(
    (id: string) => {
      dispatch(deleteUserDbqTrainingTab(id));
    },
    [dispatch]
  );

  const renderTabsHeader = useMemo(
    () => (
      <TabsHeader
        baseTitle="User DBQ Training"
        basePath={BASE_PATH}
        openTabs={openTabs}
        onCloseTab={(id: string | number) => handleOnCloseTab(String(id))}
        styles={styles}
        selectedTabs=""
        handleTabClick={(id: string | number) => handleTabClick(String(id))}
        handleTabTitleClick={handleTabTitleClick}
        baseTitleTooltip="Return to User DBQ Training list"
        refreshTooltipTitle="Reload User DBQ Training data"
        closeTabTooltipTitle="Close tab and return to User DBQ Training"
      />
    ),
    [handleOnCloseTab, handleTabClick, handleTabTitleClick, openTabs, styles]
  );

  const columnMinWidth = isSideMenuOpen ? 1000 : 870;

  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      {renderTabsHeader}
      <ContentBox showBorder={false} sx={{ p: 0, mb: 0, flexGrow: 0, minWidth: 0, width: "100%" }}>
        <Box p={0} width="100%" sx={{ minWidth: 0 }}>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={1.5}
            alignItems={isMobile ? "stretch" : "center"}
            sx={{ mb: 2, px: 2, width: "100%", minWidth: 0 }}
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
              sx={{ width: isMobile ? "100%" : "auto", flex: "0 0 auto" }}
            >
              <AppTooltip title="Search training records" placement="bottom" arrow>
                <Button
                  variant="contained"
                  onClick={() => void handleSearch()}
                  size="medium"
                  sx={{
                    height: 45,
                    borderRadius: "10px",
                    minWidth: isMobile ? "100%" : isCompactToolbar ? 45 : 93,
                    width: isMobile ? "100%" : isCompactToolbar ? 45 : 93,
                    textTransform: "none",
                    fontWeight: 400,
                    backgroundColor: P.primary,
                    "&:hover": { backgroundColor: P.primaryHover },
                  }}
                >
                  {isCompactToolbar && !isMobile ? <Search fontSize="small" /> : "Search"}
                </Button>
              </AppTooltip>
              <AppTooltip title="Add user DBQ training" placement="bottom" arrow>
                <Button
                  variant="contained"
                  onClick={handleAddUser}
                  startIcon={isCompactToolbar && !isMobile ? undefined : <Add />}
                  size="medium"
                  sx={{
                    height: 45,
                    borderRadius: "10px",
                    minWidth: isMobile ? "100%" : "auto",
                    px: 1.5,
                    textTransform: "none",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                    backgroundColor: P.primary,
                    "&:hover": { backgroundColor: P.primaryHover },
                  }}
                >
                  {isCompactToolbar && !isMobile ? <Add fontSize="small" /> : "Add User"}
                </Button>
              </AppTooltip>
            </Stack>
          </Stack>

          {!hasSearched && (
            <Alert
              severity="info"
              icon={<InfoOutlined fontSize="inherit" />}
              sx={{
                mb: 2,
                mx: 2,
                borderRadius: "4px",
                backgroundColor: isDarkMode ? P.tintedPrimaryOnDarkSubtle : P.alertInfoBg,
                color: isDarkMode ? P.primaryOnDark : P.alertInfoText,
                "& .MuiAlert-icon": {
                  color: isDarkMode ? P.primaryOnDark : P.alertInfoText,
                },
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: 16 }}>
                Enter search criteria above to view provider training records.
              </Typography>
            </Alert>
          )}

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
              sx={{
                minWidth: columnMinWidth,
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
              rows={hasSearched ? rows : []}
              columns={columns}
              columnDisplayWidth={columnMinWidth}
              compactOnMobile
              loading={loading}
              autoHeight
              checkboxSelection={false}
              showToolbar={false}
              isDarkMode={isDarkMode}
              pageSize={25}
              hideFooter
              noRowsMessage={
                hasSearched
                  ? "No users found matching the applied search criteria."
                  : " "
              }
              rowHeight={89}
              sx={{
                border: "none !important",
                borderRight: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
                p: 0,
                "& .MuiDataGrid-virtualScroller": { overflow: "hidden !important" },
                "& .MuiDataGrid-scrollbar": { display: "none !important" },
                "& .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-scrollbarFiller--header, & .MuiDataGrid-filler": {
                  display: "none !important",
                },
              }}
            />
            </Box>
          </Box>
        </Box>
      </ContentBox>
    </Box>
  );
};

export default UserDbqTrainingList;
