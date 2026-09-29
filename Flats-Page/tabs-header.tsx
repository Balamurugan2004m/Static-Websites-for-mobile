import React from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { type SystemStyleObject } from "@mui/system";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNavigate, useLocation } from "react-router";
import RefreshIcon from "../../../assets/icons/refresh-blue.svg";
import AppTooltip from "../../app-tooltip";
import PageTitleChip from "../../page-title-chip";
import { THEME_PRIMITIVES as P } from "../../../theme";
interface Tab {
  id: string | number;
  userName: string;
}
interface TabsHeaderProps {
  baseTitle: string;
  basePath: string;
  openTabs: Tab[];
  onCloseTab?: (id: string | number, username: string) => boolean | void;
  handleTabClick?: (id: string | number) => void;
  handleTabTitleClick?: () => void;
  styles: {
    userTitle: SystemStyleObject<Theme>;
    detailsTab: SystemStyleObject<Theme>;
    detailsTabTitle: SystemStyleObject<Theme>;
    activeDetailTab: SystemStyleObject<Theme>;
  };
  selectedTabs?: string;
  handleRefreshClick?: () => void;
  /** Shown on hover for the base title tab (e.g. "Return to user list"). Omit to disable. */
  baseTitleTooltip?: string;
  /** Refresh icon on the active tab. */
  refreshTooltipTitle?: string;
  /** Close icon on each open tab. */
  closeTabTooltipTitle?: string;
  children?: React.ReactNode;
  flushInset?: boolean;
}

const TabsHeader: React.FC<TabsHeaderProps> = ({
  baseTitle,
  basePath,
  openTabs,
  onCloseTab,
  handleTabClick,
  handleTabTitleClick,
  handleRefreshClick,
  styles,
  selectedTabs,
  baseTitleTooltip,
  refreshTooltipTitle = "Reload tab data",
  closeTabTooltipTitle = "Close tab",
  children,
  flushInset,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const chipText = theme.custom?.text?.chip;
  const chipColor = chipText?.color ?? theme.palette.primary.main;
  const activeTabColor = isDarkMode ? P.white : chipColor;
  const isListPage = flushInset ?? location.pathname === basePath;
  return (
    <Box
      sx={{
        ...(isListPage
          ? {
              px: 2,
              pt: 2,
              mb: 2,
              minHeight: 52,
              boxSizing: "border-box",
            }
          : { mb: 2 }),
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Base tab */}
      <PageTitleChip
        title={baseTitle}
        onClick={handleTabTitleClick}
        tooltipTitle={baseTitleTooltip}
        isActive={location.pathname === basePath}
        sx={{
          ...styles.userTitle,
        }}
      />
      {/* Dynamic tabs */}

      {(openTabs || []).map((t) => {
        const isActiveTab =
          !isListPage && String(t.userName) === String(selectedTabs);
        return (
          <Box
            key={t?.id}
            onClick={() => handleTabClick?.(t?.userName)}
            sx={{
              ...styles.detailsTab,
              ...(isActiveTab
                ? {
                    ...styles.activeDetailTab,
                    justifyContent: "flex-start",
                    gap: "4px",
                  }
                : {}),
            }}
          >
            {isActiveTab ? (
              <AppTooltip title={refreshTooltipTitle} placement="bottom" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRefreshClick?.();
                  }}
                  sx={{
                    p: 0.25,
                    width: 18,
                    height: 18,
                    minWidth: 18,
                    minHeight: 18,
                    color: activeTabColor,
                    mr: 0,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={RefreshIcon}
                    alt="Refresh"
                    sx={{
                      width: 14,
                      height: 14,
                      ...(isDarkMode ? { filter: "brightness(0) invert(1)" } : {}),
                    }}
                  />
                </IconButton>
              </AppTooltip>
            ) : null}
            <AppTooltip title={t?.userName ?? ""} placement="bottom" arrow>
              <Typography component="span" sx={{
                ...styles.detailsTabTitle,
                color: isActiveTab ? activeTabColor : theme.palette.text.secondary,
              }}>
                {t?.userName}
              </Typography>
            </AppTooltip>
            <AppTooltip title={closeTabTooltipTitle} placement="bottom" arrow>
              <IconButton
                aria-label={`close ${t.id}`}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const closingUsername = String(t.userName ?? "");
                  const activeUsername = String(selectedTabs ?? "");
                  const closingActiveTab = closingUsername === activeUsername;
                  const tabIndex = (openTabs || []).findIndex(
                    (tab) => String(tab.userName) === closingUsername
                  );
                  const nextTab =
                    tabIndex >= 0
                      ? (openTabs?.[tabIndex + 1] ?? openTabs?.[tabIndex - 1])
                      : undefined;

                  const closeResult = onCloseTab?.(t.id, t.userName);
                  if (closeResult === false) {
                    return;
                  }

                  if (!closingActiveTab) {
                    if (activeUsername) {
                      handleTabClick?.(activeUsername);
                    }
                    return;
                  }

                  if (nextTab?.userName) {
                    handleTabClick?.(nextTab.userName);
                    return;
                  }

                  handleTabTitleClick?.();
                  navigate(basePath);
                }}
                sx={{
                  p: 0,
                  width: 12,
                  height: 12,
                  minWidth: 12,
                  minHeight: 12,
                  borderRadius: "50%",
                  border: `1px solid ${isActiveTab ? activeTabColor : theme.palette.text.secondary}`,
                  flexShrink: 0,
                  ml: isActiveTab ? "auto" : 0,
                }}
              >
                <CloseRoundedIcon
                  sx={{ fontSize: 9, color: isActiveTab ? activeTabColor : theme.palette.text.secondary }}
                />
              </IconButton>
            </AppTooltip>
          </Box>
        )
      }
      )}
      {children}
    </Box>
  );
};

export default TabsHeader;
