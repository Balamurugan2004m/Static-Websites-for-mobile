import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Fa4BuildingIcon,
  Fa4CalendarIcon,
  Fa4CertificateIcon,
  Fa4DashboardIcon,
  Fa4HospitalOIcon,
  Fa4UploadIcon,
  Fa4UserIcon,
} from "../../components/fa4-icons";
import { useLocation, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import {
  canAccessNavItem,
  NavClaims,
  SIDEBAR_ADMIN_ITEM_CLAIMS,
} from "../../constants/nav-claims";
import { ACCESS } from "../../constants/auth";
import { useAuth } from "../../contexts/AuthContext";
import {
  CONFIG_SIDEBAR_WIDTH,
  SIDEBAR_TOPBAR_OFFSET,
} from "./sidebar-layout.constants";

const topbarHeight = SIDEBAR_TOPBAR_OFFSET;

type ConfigNavItem = {
  title: string;
  path?: string;
  matchPrefix?: string;
  claims?: readonly string[];
  icon?: React.ComponentType<{ size?: number; color?: string; sx?: any }>;
};

const configurationNavItems: ConfigNavItem[] = [
  { title: "Users", path: paths.USERS.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.users },
  {
    title: "Roles",
    path: paths.ROLES.pathName,
    matchPrefix: paths.ROLES.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.roles,
  },
  { title: "Cluster", claims: SIDEBAR_ADMIN_ITEM_CLAIMS.clustersConfig },
  { title: "ESR Tag", claims: SIDEBAR_ADMIN_ITEM_CLAIMS.esrTags },
  {
    title: "Accommodation",
    path: paths.ACCOMMODATION_CONFIG.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.accommodation,
  },
  {
    title: "DBQ Builder",
    path: paths.DBQ_BUILDER.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.dbqBuilder,
  },
  {
    title: "DOTPhrase Admin",
    path: paths.DOT_PHRASE_ADMIN.pathName,
    matchPrefix: paths.DOT_PHRASE_ADMIN.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.dotPhraseAdmin,
  },
  {
    title: "Holiday Calendar",
    path: paths.HOLIDAY_CALENDAR.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.holidayCalendarAdmin,
  },
  {
    title: "CPT",
    path: paths.CPT_CONFIG.pathName,
    matchPrefix: paths.CPT_CONFIG.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.cpt,
  },
  { title: "DBQ Apt Times", claims: SIDEBAR_ADMIN_ITEM_CLAIMS.dbqAptTimes },
];

const providerManagementSubItems: ConfigNavItem[] = [
  {
    title: "Organizations",
    path: paths.PROVIDER_MANAGEMENT_ORG.pathName,
    matchPrefix: paths.PROVIDER_MANAGEMENT_ORG.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.organization,
    icon: Fa4BuildingIcon,
  },
  {
    title: "Facilities",
    path: paths.PROVIDER_MANAGEMENT_FACILITIES.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.facilities,
    icon: Fa4HospitalOIcon,
  },
  {
    title: "Users",
    path: paths.PROVIDER_MANAGEMENT_USERS.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.user,
    icon: Fa4UserIcon,
  },
  {
    title: "User DBQ Training",
    path: paths.PROVIDER_MANAGEMENT_USER_DBQ_TRAINING.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.userDbqTraining,
    icon: Fa4HospitalOIcon,
  },
  {
    title: "Provider Training List",
    path: paths.PROVIDER_MANAGEMENT_PROVIDER_TRAINING_LIST.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.providerTrainingList,
    icon: Fa4CertificateIcon,
  },
  { title: "Training Upload", claims: SIDEBAR_ADMIN_ITEM_CLAIMS.trainingUpload, icon: Fa4UploadIcon },
  {
    title: "Provider DBQ Burden Time",
    path: paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME.pathName,
    matchPrefix: paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.providerDbqBurdenTime,
    icon: Fa4HospitalOIcon,
  },
  {
    title: "Availability Calendar",
    path: paths.PROVIDER_CALENDAR.pathName,
    claims: SIDEBAR_ADMIN_ITEM_CLAIMS.availabilityCalendar,
    icon: Fa4DashboardIcon,
  },
];

interface ConfigurationSidebarProps {
  mainSidebarWidth: number;
}

const ConfigurationSidebar = ({ mainSidebarWidth }: ConfigurationSidebarProps) => {
  const P = THEME_PRIMITIVES;
  const navigate = useNavigate();
  const location = useLocation();
  const { hasClaim } = useAuth();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const [providerManagementOpen, setProviderManagementOpen] = useState(true);

  // Non-admin roles (any user without the DotPhrase admin claim) see the item as
  // "DOTPhrases Library" — matches the provider-facing page title in dot-phrase.tsx.
  const isDotPhraseAdmin = hasClaim(NavClaims.dotPhrase, ACCESS.ALLOWED);

  const visibleConfigItems = useMemo(
    () =>
      configurationNavItems
        .filter((item) => canAccessNavItem(hasClaim, item.claims))
        .map((item) =>
          item.path === paths.DOT_PHRASE_ADMIN.pathName && !isDotPhraseAdmin
            ? { ...item, title: "DOTPhrases Library" }
            : item
        ),
    [hasClaim, isDotPhraseAdmin]
  );

  const visibleProviderItems = useMemo(
    () => providerManagementSubItems.filter((item) => canAccessNavItem(hasClaim, item.claims)),
    [hasClaim]
  );

  const colors =
    mode === "dark"
      ? {
          backgroundColor: P.black,
          borderColor: P.inputBgDark,
          defaultText: P.white,
          disabledText: P.mutedTextOnDark,
          selectedBackground: P.drawerFocusedBorderLight,
          selectedText: P.white,
          hoverBackground: P.searchInputBgDark,
        }
      : {
          backgroundColor: P.white,
          borderColor: P.stroke,
          defaultText: P.black,
          disabledText: P.labelMuted,
          selectedBackground: P.sidebarSelectedBg,
          selectedText: P.primary,
          hoverBackground: P.drawerOptionHoverLight,
        };

  const isSelected = (item: ConfigNavItem) => {
    if (!item.path && !item.matchPrefix) {
      return false;
    }

    const prefix = item.matchPrefix ?? item.path ?? "";
    return (
      location.pathname === prefix ||
      location.pathname.startsWith(`${prefix}/`)
    );
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const renderNavButton = (item: ConfigNavItem, indent = false) => {
    const selected = isSelected(item);
    const disabled = !item.path;

    return (
      <ListItemButton
        key={item.title}
        selected={selected}
        disabled={disabled}
        onClick={() => handleNavigate(item.path)}
        sx={{
          minHeight: 42,
          pl: indent ? 3.5 : 2,
          pr: 2,
          py: 0,
          color: disabled
            ? colors.disabledText
            : selected
              ? colors.selectedText
              : colors.defaultText,
          "&.Mui-selected": {
            backgroundColor: colors.selectedBackground,
            color: colors.selectedText,
            "&:hover": {
              backgroundColor: colors.selectedBackground,
            },
          },
          "&:hover": {
            backgroundColor: colors.hoverBackground,
          },
          "&.Mui-disabled": {
            opacity: 1,
            color: colors.disabledText,
          },
        }}
      >
        {item.icon && (
          <Box
            component="span"
            sx={{
              width: 18,
              minWidth: 18,
              height: 18,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
              color: mode === "dark" ? P.white : P.black,
            }}
          >
            <item.icon size={16} color={mode === "dark" ? P.white : P.black} />
          </Box>
        )}
        <ListItemText
          primary={
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "30px",
                color: disabled
                  ? colors.disabledText
                  : selected
                    ? colors.selectedText
                    : colors.defaultText,
              }}
            >
              {item.title}
            </Typography>
          }
        />
      </ListItemButton>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${topbarHeight}px`,
        left: `${mainSidebarWidth}px`,
        width: CONFIG_SIDEBAR_WIDTH,
        height: `calc(100vh - ${topbarHeight}px)`,
        backgroundColor: colors.backgroundColor,
        borderRight: `1px solid ${colors.borderColor}`,
        zIndex: (theme) => theme.zIndex.drawer,
        overflowY: "auto",
        overflowX: "hidden",
      }}
      data-testid="configuration-sidebar"
    >
      <List disablePadding sx={{ pt: 0.5, pb: 2 }}>
        {visibleConfigItems.map((item) => renderNavButton(item))}

        {visibleProviderItems.length > 0 && (
          <>
            <ListItemButton
              onClick={() => setProviderManagementOpen((prev) => !prev)}
              sx={{
                minHeight: 42,
                pl: 2,
                pr: 1.5,
                color: colors.defaultText,
                "&:hover": {
                  backgroundColor: colors.hoverBackground,
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 18,
                  minWidth: 18,
                  height: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                  color: mode === "dark" ? P.white : P.black,
                }}
              >
                <Fa4DashboardIcon size={16} color={mode === "dark" ? P.white : P.black} />
              </Box>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "30px",
                      color: colors.defaultText,
                    }}
                  >
                    Provider Management
                  </Typography>
                }
              />
              <ExpandMoreIcon
                sx={{
                  color: colors.defaultText,
                  transform: providerManagementOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </ListItemButton>

            <Collapse in={providerManagementOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {visibleProviderItems.map((item) => renderNavButton(item, true))}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Box>
  );
};

export default ConfigurationSidebar;
// eslint-disable-next-line react-refresh/only-export-components
export { CONFIG_SIDEBAR_WIDTH };
