import { Box, Drawer, List, ListItemButton, Tooltip, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    Fa4BuildingIcon,
    Fa4CalendarIcon,
    Fa4CertificateIcon,
    Fa4DashboardIcon,
    Fa4FileExcelOIcon,
    Fa4FlagIcon,
    Fa4HospitalOIcon,
    Fa4UploadIcon,
    Fa4UserIcon,
} from "../../components/fa4-icons";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { THEME_PRIMITIVES } from "../../theme";
import AdministrationSidebarIcon from "../../assets/icons/administration-sidebar.svg";
import BillingSidebarIcon from "../../assets/icons/billing-sidebar.svg";
import HomeSidebarIcon from "../../assets/icons/home-sidebar.svg";
import ReportsSidebarIcon from "../../assets/icons/reports-sidebar.svg";
import TravelSidebarIcon from "../../assets/icons/travel-sidebar.svg";
import WorkQueuesSidebarIcon from "../../assets/icons/work-queues-sidebar.svg";
import { paths } from "../../constants/paths";
import {
    canAccessNavItem,
    NavClaims,
    SIDEBAR_ADMIN_ITEM_CLAIMS,
    SIDEBAR_BILLING_ITEM_CLAIMS,
    SIDEBAR_REPORT_ITEM_CLAIMS,
    SIDEBAR_SECTION_CLAIMS,
    SIDEBAR_SYSTEM_NOTIFICATION_ITEM_CLAIMS,
    SIDEBAR_TRAVEL_ITEM_CLAIMS,
} from "../../constants/nav-claims";
import { ACCESS } from "../../constants/auth";
import { useAuth } from "../../contexts/AuthContext";
import {
    CONFIG_SIDEBAR_WIDTH,
    SIDEBAR_DRAWER_WIDTH,
    SIDEBAR_MINI_DRAWER_WIDTH,
    SIDEBAR_TOPBAR_OFFSET,
} from "./sidebar-layout.constants";

type SubmenuIconType = IconDefinition | React.ComponentType<{ size?: number; color?: string; sx?: any }>;

type MenuChildItem = {
    title: string;
    path: string;
    icon?: SubmenuIconType;
    claims?: readonly string[];
};

type MenuSubItem = {
    title: string;
    path?: string;
    icon?: SubmenuIconType;
    claims?: readonly string[];
    children?: MenuChildItem[];
};

type MenuItem = {
    key: string;
    title: string;
    path: string;
    icon?: IconDefinition;
    iconSrc?: string;
    claims?: readonly string[];
    match?: (pathname: string) => boolean;
    subItems?: MenuSubItem[];
};

interface SidebarProps {
    open: boolean;
    toggleDrawer: () => void;
}

const P = THEME_PRIMITIVES;
const SUBMENU_EXPOSED_WIDTH = 58;
const MENU_ROW_HEIGHT = 42;
const MENU_ROW_GAP = 6;
const MENU_TOP_PADDING = 15;

const getFirstSubItemPath = (item: MenuItem): string | undefined => {
    const first = item.subItems?.[0];
    if (!first) {
        return undefined;
    }
    return first.path ?? first.children?.[0]?.path;
};

const renderMenuIcon = (item: MenuItem) => {
    if (item.iconSrc) {
        return <Box component="img" src={item.iconSrc} alt={`${item.title} icon`} sx={{ width: 18, height: 17, display: "block" }} />;
    }

    if (item.icon) {
        return <FontAwesomeIcon icon={item.icon} />;
    }

    return null;
};

const ALL_MENU_ITEMS: MenuItem[] = [
    {
        key: "home",
        title: "Home",
        path: paths.HOME.pathName,
        iconSrc: HomeSidebarIcon,
        claims: SIDEBAR_SECTION_CLAIMS.home,
        match: (pathname) => pathname === paths.HOME.pathName || pathname === `${paths.HOME.pathName}/`,
    },
    {
        key: "work-queues",
        title: "Work Queues",
        path: paths.WORK_QUEUES.pathName,
        iconSrc: WorkQueuesSidebarIcon,
        claims: SIDEBAR_SECTION_CLAIMS.workQueues,
    },
    {
        key: "reports",
        title: "Reports",
        path: paths.REPORTS.pathName,
        iconSrc: ReportsSidebarIcon,
        claims: SIDEBAR_SECTION_CLAIMS.reports,
        subItems: [
            { title: "VA Reports", path: paths.REPORTS.pathName, claims: SIDEBAR_REPORT_ITEM_CLAIMS.vaReports, icon: Fa4FileExcelOIcon },
            { title: "Monthly Reports", path: paths.MONTHLY_REPORTS.pathName, claims: SIDEBAR_REPORT_ITEM_CLAIMS.monthlyReports, icon: Fa4FileExcelOIcon },
            { title: "Exam Archive", path: paths.EXAM_ARCHIVE.pathName, claims: SIDEBAR_REPORT_ITEM_CLAIMS.examArchive, icon: Fa4FileExcelOIcon },
        ],
        match: (pathname) =>
            [paths.REPORTS.pathName, paths.MONTHLY_REPORTS.pathName, paths.EXAM_ARCHIVE.pathName, paths.REWORK_REPORTS.pathName].includes(pathname),
    },
    {
        key: "travel",
        title: "Travel",
        path: paths.TRAVEL_INSTANCE_CLAIM_REPORT.pathName,
        iconSrc: TravelSidebarIcon,
        claims: SIDEBAR_SECTION_CLAIMS.travel,
        subItems: [
            {
                title: "Travel Instance Claim Report",
                path: paths.TRAVEL_INSTANCE_CLAIM_REPORT.pathName,
                claims: SIDEBAR_TRAVEL_ITEM_CLAIMS.travelInstanceClaimReport,
                icon: Fa4FileExcelOIcon,
            },
            {
                title: "Travel Payment Upload",
                path: paths.TRAVEL_PAYMENT_UPLOAD.pathName,
                claims: SIDEBAR_TRAVEL_ITEM_CLAIMS.travelPaymentUpload,
                icon: Fa4FileExcelOIcon,
            },
        ],
        match: (pathname) =>
            [paths.TRAVEL_INSTANCE_CLAIM_REPORT.pathName, paths.TRAVEL_PAYMENT_UPLOAD.pathName].includes(pathname),
    },
    {
        key: "billing",
        title: "Billing",
        path: paths.VBMS_INVOICE_FILES.pathName,
        iconSrc: BillingSidebarIcon,
        claims: SIDEBAR_SECTION_CLAIMS.billing,
        subItems: [
            {
                title: "VBMS Invoice Files",
                path: paths.VBMS_INVOICE_FILES.pathName,
                claims: SIDEBAR_BILLING_ITEM_CLAIMS.vbmsInvoiceFiles,
                icon: Fa4UserIcon,
            },
            {
                title: "Lab & Non-Lab Price Upload",
                path: paths.LAB_NON_LAB_PRICE_UPLOAD.pathName,
                claims: SIDEBAR_BILLING_ITEM_CLAIMS.labNonLabPriceUpload,
                icon: Fa4UserIcon,
            },
            {
                title: "Billing Rate Master",
                path: paths.BILLING_RATE_MASTER.pathName,
                claims: SIDEBAR_BILLING_ITEM_CLAIMS.billingRateMaster,
                icon: Fa4UserIcon,
            },
        ],
        match: (pathname) =>
            [paths.VBMS_INVOICE_FILES.pathName, paths.LAB_NON_LAB_PRICE_UPLOAD.pathName, paths.BILLING_RATE_MASTER.pathName].includes(pathname),
    },
    {
        key: "system-notifications",
        title: "System Notifications",
        path: paths.SYSTEM_ANNOUNCEMENTS.pathName,
        icon: faBell,
        claims: SIDEBAR_SECTION_CLAIMS.systemNotifications,
        subItems: [
            {
                title: "Announcements Config",
                path: paths.SYSTEM_ANNOUNCEMENTS.pathName,
                claims: SIDEBAR_SYSTEM_NOTIFICATION_ITEM_CLAIMS.announcementsConfig,
            },
        ],
        match: (pathname) => pathname === paths.SYSTEM_ANNOUNCEMENTS.pathName,
    },
    {
        key: "administration",
        title: "Administration",
        path: paths.USERS.pathName,
        iconSrc: AdministrationSidebarIcon,
        match: (pathname) => pathname.startsWith("/configuration") || pathname.startsWith("/provider-management"),
        subItems: [
            { title: "Users", path: paths.USERS.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.users, icon: Fa4UserIcon },
            { title: "Roles", path: paths.ROLES.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.roles, icon: Fa4FlagIcon },
            { title: "ESR Tags", path: paths.ESR_TAGS.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.esrTags, icon: Fa4DashboardIcon },
            { title: "Accommodation", path: paths.ACCOMMODATION_CONFIG.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.accommodation, icon: Fa4DashboardIcon },
            { title: "DBQ Builder", path: paths.DBQ_BUILDER.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.dbqBuilder, icon: Fa4DashboardIcon },
            { title: "DOTPhrase Admin", path: paths.DOT_PHRASE_ADMIN.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.dotPhraseAdmin, icon: Fa4DashboardIcon },
            { title: "CPT Config", path: paths.CPT_CONFIG.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.cpt, icon: Fa4DashboardIcon },
            { title: "DBQ Apt Times", path: paths.DBQ_APT_TIMES.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.dbqAptTimes, icon: Fa4HospitalOIcon },
            { title: "Clusters Config", path: paths.CLUSTERS_CONFIG.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.clustersConfig, icon: Fa4HospitalOIcon },
            { title: "Autoqueue Admin", path: paths.AUTO_QUEUE_ADMIN.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.autoqueueAdmin, icon: Fa4DashboardIcon },
            { title: "Holiday Calendar", path: paths.HOLIDAY_CALENDAR.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.holidayCalendarAdmin, icon: Fa4DashboardIcon },
            {
                title: "Provider Management",
                icon: Fa4DashboardIcon,
                children: [
                    { title: "Organizations", path: paths.PROVIDER_MANAGEMENT_ORG.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.organization, icon: Fa4BuildingIcon },
                    { title: "Facilities", path: paths.PROVIDER_MANAGEMENT_FACILITIES.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.facilities, icon: Fa4HospitalOIcon },
                    { title: "Users", path: paths.PROVIDER_MANAGEMENT_USERS.pathName, claims: SIDEBAR_ADMIN_ITEM_CLAIMS.user, icon: Fa4UserIcon },
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
                    {
                        title: "Training Upload",
                        path: paths.PROVIDER_TRAINING_UPLOAD.pathName,
                        claims: SIDEBAR_ADMIN_ITEM_CLAIMS.trainingUpload,
                        icon: Fa4UploadIcon,
                    },
                    {
                        title: "Provider DBQ Burden Time",
                        path: paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME.pathName,
                        claims: SIDEBAR_ADMIN_ITEM_CLAIMS.providerDbqBurdenTime,
                        icon: Fa4HospitalOIcon,
                    },
                    {
                        title: "Availability Calendar",
                        path: paths.PROVIDER_CALENDAR.pathName,
                        claims: SIDEBAR_ADMIN_ITEM_CLAIMS.availabilityCalendar,
                        icon: Fa4DashboardIcon,
                    },
                ],
            },
        ],
    },
];

const Sidebar = ({ open, toggleDrawer }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasClaim } = useAuth();
    const mode = useSelector((state: RootState) => state.theme.mode);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [providerManagementOpen, setProviderManagementOpen] = useState(true);

    // Non-admin roles (any user without the DotPhrase admin claim) see the DOT
    // phrase entry as "DOTPhrases Library" — matches the provider page chip.
    const isDotPhraseAdmin = hasClaim(NavClaims.dotPhrase, ACCESS.ALLOWED);

    const menuItems = useMemo(() => {
        return ALL_MENU_ITEMS.map((item) => {
            if (item.subItems?.length) {
                const subItems = item.subItems
                    .map((subItem) => {
                        if (subItem.children?.length) {
                            const children = subItem.children.filter((child) =>
                                canAccessNavItem(hasClaim, child.claims)
                            );
                            if (!children.length) {
                                return null;
                            }
                            return { ...subItem, children };
                        }
                        if (!canAccessNavItem(hasClaim, subItem.claims)) {
                            return null;
                        }
                        // Rename the DOT phrase sub-item title for non-admin roles.
                        if (
                            subItem.path === paths.DOT_PHRASE_ADMIN.pathName &&
                            !isDotPhraseAdmin
                        ) {
                            return { ...subItem, title: "DOTPhrases Library" };
                        }
                        return subItem;
                    })
                    .filter((subItem): subItem is MenuSubItem => Boolean(subItem));

                if (!subItems.length) {
                    return null;
                }

                return canAccessNavItem(hasClaim, item.claims) ? { ...item, subItems } : null;
            }

            return canAccessNavItem(hasClaim, item.claims) ? item : null;
        }).filter((item): item is MenuItem => Boolean(item));
    }, [hasClaim, isDotPhraseAdmin]);

    const colors =
        mode === "dark"
            ? {
                  background: P.black,
                  text: P.white,
                  border: P.inputBgDark,
                  hoverBackground: P.searchInputBgDark,
                  hoverText: P.white,
                  selectedBackground: P.drawerFocusedBorderLight,
                  selectedText: P.white,
                  // Icon colors — dark mode: all icons stay white (inverted from black SVG)
                  iconColor: P.white,
                  activeIconColor: P.white,
                  iconFilter: "brightness(0) invert(1)" as const,
                  activeIconFilter: "brightness(0) invert(1)" as const,
              }
            : {
                  background: P.white,
                  text: P.neutralTextStrong,
                  border: P.disabledOverlayLight,
                  hoverBackground: P.sidebarSelectedBg,
                  hoverText: P.primary,
                  selectedBackground: P.sidebarSelectedBg,
                  selectedText: P.primary,
                  // Icon colors — light mode: inactive = black, active = P.primary (#244794)
                  // activeIconFilter converts the black SVG fill to P.primary via CSS filter
                  iconColor: P.black,
                  activeIconColor: P.primary,
                  iconFilter: "none" as const,
                  activeIconFilter:
                      "brightness(0) saturate(100%) invert(22%) sepia(100%) saturate(600%) hue-rotate(207deg) brightness(93%)" as const,
              };

    const isSelected = (item: MenuItem) => {
        if (activeSubmenu) {
            return item.key === activeSubmenu;
        }

        return item.match ? item.match(location.pathname) : location.pathname === item.path;
    };

    const currentSubmenu = menuItems.find((item) => item.key === activeSubmenu);
    const hasActiveSubmenu = Boolean(currentSubmenu?.subItems);
    const activeSubmenuIndex = (() => {
        const matchedIndex = currentSubmenu?.subItems?.findIndex((subItem) => subItem.path === location.pathname) ?? -1;
        if (matchedIndex >= 0) {
            return matchedIndex;
        }
        return currentSubmenu?.subItems?.length ? 0 : -1;
    })();
    const showCollapsedRail = !open;
    const showSubmenuPanel = !open && hasActiveSubmenu;
    const showMainMenuPanel = open;
    const sidebarWidth = showMainMenuPanel
        ? hasActiveSubmenu
            ? SIDEBAR_DRAWER_WIDTH + SUBMENU_EXPOSED_WIDTH
            : SIDEBAR_DRAWER_WIDTH
        : showSubmenuPanel
          ? SIDEBAR_MINI_DRAWER_WIDTH + CONFIG_SIDEBAR_WIDTH
          : SIDEBAR_MINI_DRAWER_WIDTH;

    useEffect(() => {
        const reportsSelected = [paths.REPORTS.pathName, paths.MONTHLY_REPORTS.pathName, paths.EXAM_ARCHIVE.pathName, paths.REWORK_REPORTS.pathName].includes(
            location.pathname
        );
        const travelSelected = [paths.TRAVEL_INSTANCE_CLAIM_REPORT.pathName, paths.TRAVEL_PAYMENT_UPLOAD.pathName].includes(
            location.pathname
        );
        const billingSelected = [
            paths.VBMS_INVOICE_FILES.pathName,
            paths.LAB_NON_LAB_PRICE_UPLOAD.pathName,
            paths.BILLING_RATE_MASTER.pathName,
        ].includes(location.pathname);
        const administrationSelected = [
            paths.USERS.pathName,
            paths.ROLES.pathName,
            paths.ESR_TAGS.pathName,
            paths.ACCOMMODATION_CONFIG.pathName,
            paths.DBQ_BUILDER.pathName,
            paths.DOT_PHRASE_ADMIN.pathName,
            paths.DBQ_APT_TIMES.pathName,
            paths.CLUSTERS_CONFIG.pathName,
            paths.AUTO_QUEUE_ADMIN.pathName,
            paths.HOLIDAY_CALENDAR.pathName,
            paths.PROVIDER_MANAGEMENT_ORG.pathName,
            paths.PROVIDER_MANAGEMENT_FACILITIES.pathName,
            paths.PROVIDER_MANAGEMENT_USERS.pathName,
            paths.PROVIDER_MANAGEMENT_USER_DBQ_TRAINING.pathName,
            paths.PROVIDER_MANAGEMENT_PROVIDER_TRAINING_LIST.pathName,
            paths.PROVIDER_TRAINING_UPLOAD.pathName,
            paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME.pathName,
            paths.PROVIDER_CALENDAR.pathName,
        ].includes(location.pathname);

        if (reportsSelected) {
            setActiveSubmenu("reports");
            return;
        }

        if (travelSelected) {
            setActiveSubmenu("travel");
            return;
        }

        if (billingSelected) {
            setActiveSubmenu("billing");
            return;
        }

        if (administrationSelected) {
            setActiveSubmenu("administration");
            return;
        }

        setActiveSubmenu(null);
    }, [location.pathname]);

    useEffect(() => {
        if (activeSubmenu === "administration") {
            setProviderManagementOpen(true);
        }
    }, [activeSubmenu]);

    useEffect(() => {
        if (activeSubmenu && !menuItems.some((item) => item.key === activeSubmenu)) {
            setActiveSubmenu(null);
        }
    }, [menuItems, activeSubmenu]);

    const submenuIconColor = mode === "dark" ? P.white : P.black;

    const renderSubmenuIcon = (icon?: SubmenuIconType, color?: string) => {
        if (!icon) return null;
        if ("iconName" in icon) {
            return <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />;
        }
        const CustomIcon = icon;
        return <CustomIcon size={16} color={color} />;
    };

    const renderSubmenuList = (items: NonNullable<MenuItem["subItems"]>) =>
        items.map((subItem) => {
            const hasChildren = Boolean(subItem.children?.length);
            const childSelected = subItem.children?.some((child) => child.path === location.pathname) ?? false;
            const selected = subItem.path ? subItem.path === location.pathname : childSelected;

            if (hasChildren) {
                return (
                    <Box key={subItem.title}>
                        <ListItemButton
                            selected={childSelected}
                            onClick={() => setProviderManagementOpen((current) => !current)}
                            sx={{
                                minHeight: 42,
                                mb: 0.75,
                                px: 2,
                                py: 0,
                                justifyContent: "flex-start",
                                alignItems: "center",
                                color: childSelected ? colors.selectedText : colors.text,
                                backgroundColor: childSelected ? colors.selectedBackground : "transparent",
                                "&.Mui-selected": {
                                    backgroundColor: colors.selectedBackground,
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: colors.selectedBackground,
                                },
                                "&:hover": {
                                    backgroundColor: colors.hoverBackground,
                                    color: colors.hoverText,
                                },
                            }}
                        >
                            {subItem.icon && (
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
                                        color: submenuIconColor,
                                        flexShrink: 0,
                                    }}
                                >
                                    {renderSubmenuIcon(subItem.icon, submenuIconColor)}
                                </Box>
                            )}
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: childSelected ? 600 : 400,
                                    lineHeight: 1.1,
                                    color: "inherit",
                                    flexGrow: 1,
                                }}
                            >
                                {subItem.title}
                            </Typography>
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                style={{
                                    fontSize: 12,
                                    transform: providerManagementOpen ? "rotate(-90deg)" : "rotate(90deg)",
                                    transition: "transform 0.2s ease",
                                }}
                            />
                        </ListItemButton>

                        {providerManagementOpen && (
                            <List sx={{ py: 0 }}>
                                {subItem.children?.map((child) => {
                                    const nestedSelected = child.path === location.pathname;

                                    return (
                                        <ListItemButton
                                            key={child.title}
                                            selected={nestedSelected}
                                            onClick={() => navigate(child.path)}
                                            sx={{
                                                minHeight: 38,
                                                mb: 0.5,
                                                pl: 3.5,
                                                pr: 2,
                                                py: 0,
                                                justifyContent: "flex-start",
                                                alignItems: "center",
                                                color: nestedSelected ? colors.selectedText : colors.text,
                                                backgroundColor: nestedSelected ? colors.selectedBackground : "transparent",
                                                "&.Mui-selected": {
                                                    backgroundColor: colors.selectedBackground,
                                                },
                                                "&.Mui-selected:hover": {
                                                    backgroundColor: colors.selectedBackground,
                                                },
                                                "&:hover": {
                                                    backgroundColor: colors.hoverBackground,
                                                    color: colors.hoverText,
                                                },
                                            }}
                                        >
                                            {child.icon && (
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
                                                        color: submenuIconColor,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {renderSubmenuIcon(child.icon, submenuIconColor)}
                                                </Box>
                                            )}
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: nestedSelected ? 600 : 400,
                                                    lineHeight: 1.1,
                                                    color: "inherit",
                                                }}
                                            >
                                                {child.title}
                                            </Typography>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                );
            }

            return (
                <ListItemButton
                    key={subItem.title}
                    selected={selected}
                    onClick={() => subItem.path && navigate(subItem.path)}
                    sx={{
                        minHeight: 42,
                        mb: 0.75,
                        px: 2,
                        py: 0,
                        justifyContent: "flex-start",
                        alignItems: "center",
                        color: selected ? colors.selectedText : colors.text,
                        backgroundColor: selected ? colors.selectedBackground : "transparent",
                        "&.Mui-selected": {
                            backgroundColor: colors.selectedBackground,
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: colors.selectedBackground,
                        },
                        "&:hover": {
                            backgroundColor: colors.hoverBackground,
                            color: colors.hoverText,
                        },
                    }}
                >
                    {subItem.icon && (
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
                                color: submenuIconColor,
                                flexShrink: 0,
                            }}
                        >
                            {renderSubmenuIcon(subItem.icon, submenuIconColor)}
                        </Box>
                    )}
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: selected ? 600 : 400,
                            lineHeight: 1.1,
                            color: "inherit",
                        }}
                    >
                        {subItem.title}
                    </Typography>
                </ListItemButton>
            );
        });

    return (
        <Box sx={{ position: "relative", width: sidebarWidth, flexShrink: 0 }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: sidebarWidth,
                        boxSizing: "border-box",
                        borderRight: `1px solid ${colors.border}`,
                        overflow: "hidden",
                        backgroundColor: colors.background,
                        color: colors.text,
                        top: SIDEBAR_TOPBAR_OFFSET,
                        height: `calc(100vh - ${SIDEBAR_TOPBAR_OFFSET}px)`,
                        transition: (theme) =>
                            theme.transitions.create("width", {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                    },
                }}
            >
                <Box sx={{ display: "flex", height: "100%", position: "relative" }}>
                    {showCollapsedRail && (
                        <Box
                            sx={{
                                pt: 1.5,
                                px: 1,
                                width: SIDEBAR_MINI_DRAWER_WIDTH,
                                minWidth: SIDEBAR_MINI_DRAWER_WIDTH,
                                borderRight: showSubmenuPanel ? `1px solid ${colors.border}` : "none",
                            }}
                        >
                            <List sx={{ py: 0 }}>
                                {menuItems.map((item) => {
                                    const selected = isSelected(item);

                                    const button = (
                                        <ListItemButton
                                            key={item.key}
                                            selected={selected}
                                            onClick={() => {
                                                if (item.subItems?.length) {
                                                    const isCurrentlyOpen = activeSubmenu === item.key;
                                                    setActiveSubmenu(isCurrentlyOpen ? null : item.key);
                                                    if (!isCurrentlyOpen) {
                                                        const firstPath = getFirstSubItemPath(item);
                                                        if (firstPath) {
                                                            navigate(firstPath);
                                                        }
                                                    }
                                                    return;
                                                }

                                                setActiveSubmenu(null);
                                                navigate(item.path);
                                            }}
                                            sx={{
                                                minHeight: 42,
                                                mb: 0.75,
                                                px: 0,
                                                py: 0,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: selected ? colors.selectedText : colors.text,
                                                backgroundColor: selected ? colors.selectedBackground : "transparent",
                                                "&.Mui-selected": {
                                                    backgroundColor: colors.selectedBackground,
                                                },
                                                "&.Mui-selected:hover": {
                                                    backgroundColor: colors.selectedBackground,
                                                },
                                                "&:hover": {
                                                    backgroundColor: colors.hoverBackground,
                                                    color: colors.hoverText,
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    minWidth: 42,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: item.key === "reports" ? 17 : 18,
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: selected ? colors.activeIconColor : colors.iconColor,
                                                    opacity: 1,
                                                    "& img": {
                                                        filter: selected ? colors.activeIconFilter : colors.iconFilter,
                                                    },
                                                }}
                                            >
                                                {renderMenuIcon(item)}
                                            </Box>
                                        </ListItemButton>
                                    );

                                    return (
                                        <Tooltip key={item.key} title={item.title} placement="right" arrow>
                                            {button}
                                        </Tooltip>
                                    );
                                })}
                            </List>
                        </Box>
                    )}

                    {showMainMenuPanel && hasActiveSubmenu && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: SIDEBAR_DRAWER_WIDTH,
                                width: SUBMENU_EXPOSED_WIDTH,
                                height: "100%",
                                zIndex: 1,
                                borderLeft: `1px solid ${colors.border}`,
                                backgroundColor: colors.background,
                                overflow: "hidden",
                            }}
                        >
                            {activeSubmenuIndex >= 0 && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: MENU_TOP_PADDING + activeSubmenuIndex * (MENU_ROW_HEIGHT + MENU_ROW_GAP),
                                        left: 0,
                                        width: "100%",
                                        height: MENU_ROW_HEIGHT,
                                        backgroundColor: colors.selectedBackground,
                                    }}
                                />
                            )}

                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 0,
                                    bottom: 52,
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    zIndex: 2,
                                }}
                            >
                                <ListItemButton
                                    aria-label="close submenu"
                                    onClick={() => setActiveSubmenu(null)}
                                    sx={{
                                        minHeight: 24,
                                        width: 24,
                                        px: 0,
                                        color: colors.text,
                                        justifyContent: "center",
                                        "&:hover": {
                                            backgroundColor: colors.hoverBackground,
                                        },
                                    }}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
                                </ListItemButton>
                            </Box>
                        </Box>
                    )}

                    {showMainMenuPanel && (
                        <Box
                            sx={{
                                pt: 1.5,
                                width: SIDEBAR_DRAWER_WIDTH,
                                position: "relative",
                                zIndex: 2,
                                backgroundColor: colors.background,
                                borderRight: hasActiveSubmenu ? `1px solid ${colors.border}` : "none",
                            }}
                        >
                            <List sx={{ py: 0 }}>
                                {menuItems.map((item) => {
                                    const selected = isSelected(item);

                                    return (
                                        <ListItemButton
                                            key={item.key}
                                            selected={selected}
                                            onClick={() => {
                                                if (item.subItems?.length) {
                                                    setActiveSubmenu(item.key);
                                                    toggleDrawer();
                                                    const firstPath = getFirstSubItemPath(item);
                                                    if (firstPath) {
                                                        navigate(firstPath);
                                                    }
                                                    return;
                                                }

                                                setActiveSubmenu(null);
                                                navigate(item.path);
                                                toggleDrawer();
                                            }}
                                            sx={{
                                                minHeight: 42,
                                                mb: 0.75,
                                                px: 2.5,
                                                py: 0,
                                                justifyContent: "flex-start",
                                                alignItems: "center",
                                                color: selected ? colors.selectedText : colors.text,
                                                backgroundColor: selected ? colors.selectedBackground : "transparent",
                                                "&.Mui-selected": {
                                                    backgroundColor: colors.selectedBackground,
                                                },
                                                "&.Mui-selected:hover": {
                                                    backgroundColor: colors.selectedBackground,
                                                },
                                                "&:hover": {
                                                    backgroundColor: colors.hoverBackground,
                                                    color: colors.hoverText,
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    minWidth: 24,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    mr: 1.5,
                                                    fontSize: item.key === "reports" ? 17 : 18,
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: selected ? colors.activeIconColor : colors.iconColor,
                                                    opacity: 1,
                                                    "& img": {
                                                        filter: selected ? colors.activeIconFilter : colors.iconFilter,
                                                    },
                                                }}
                                            >
                                                {renderMenuIcon(item)}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 16,
                                                    fontWeight: selected ? 700 : 400,
                                                    lineHeight: 1,
                                                    color: "inherit",
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Box>
                    )}

                    {showSubmenuPanel && currentSubmenu?.subItems && (
                        <Box
                            sx={{
                                width: CONFIG_SIDEBAR_WIDTH,
                                display: "flex",
                                position: "relative",
                            }}
                        >
                            <List
                                sx={{
                                    py: 1.5,
                                    overflowY: "auto",
                                    minHeight: 0,
                                    pb: 8,
                                    width: "100%",
                                }}
                            >
                                {renderSubmenuList(currentSubmenu.subItems)}
                            </List>

                            <Box
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    bottom: 52,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    zIndex: 2,
                                }}
                            >
                                <ListItemButton
                                    aria-label="close submenu"
                                    onClick={() => setActiveSubmenu(null)}
                                    sx={{
                                        minHeight: 24,
                                        width: 24,
                                        color: colors.text,
                                        justifyContent: "center",
                                        p: 0,
                                        "&:hover": {
                                            backgroundColor: colors.hoverBackground,
                                        },
                                    }}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
                                </ListItemButton>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default Sidebar;
