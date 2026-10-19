import { createTheme } from '@mui/material';
 
declare module '@mui/material/styles' {
    interface TypeBackground {
        gridHeader?: string;
    }
    interface Theme {
        custom?: {
            typeScale: {
                extraLarge: { heading: number; body: number };
                large: { heading: number; body: number };
                medium: { heading: number; body: number };
                fontFamily: string;
                openSans: string;
            };
            colors: {
                surface: string;
                gridHeaderBg: string;
                gridHeaderBgDark: string;
                stroke: string;
                strokeDark: string;
                cardBgDark: string;
                mutedText: string;
                mutedTextDark: string;
                mutedTextFooter: string;
                labelMuted: string;
                labelMutedOnDark: string;
                iconMutedOnDark: string;
                primaryOnDark: string;
                primaryHover: string;
                buttonHover?: string;
                buttonDisabled?: string;
                primaryOnDarkVariant: string;
                accentGradient: { start: string; end: string };
                tintedPrimary: {
                    subtle: string;
                    soft: string;
                    medium: string;
                    subtleDark: string;
                    softDark: string;
                    mediumDark: string;
                };
                searchInputBg: { light: string; dark: string };
                link: string;
                danger: string;
                dangerText: string;
                success: string;
                inputBgLight: string;
                inputBgDark: string;
                inputBorderLight: string;
                neutralBorderLight: string;
                surfaceDark: string;
                mutedTextLightOpacity: string;
                blackColorCode: string;
                accordion: {
                    border: string;
                    hoverLight: string;
                    hoverDark: string;
                    iconLight: string;
                    iconDark: string;
                    titleLight: string;
                    titleDark: string;
                };
                tabs: {
                    disabledColorDark: string,
                    disabledColorLight: string,
                    borderColorLight: string,
                    borderColorDark: string,
                    textColorLight: string,
                    textColorDark: string,
                    rootColorLight: string,
                    rootColorDark: string
                },
 
                providerLayout: {
                    tabBackgroundLight: string;
                    tabBackgroundDark: string;
                    activeAccent: string;
                    refreshBgLight: string;
                    refreshBgDark: string;
                    refreshHoverLight: string;
                    refreshHoverDark: string;
                    closeBorderLight: string;
                    closeBorderDark: string;
                    closeIconLight: string;
                    closeIconDark: string;
                    closeHoverLight: string;
                    closeHoverDark: string;
                    scrollDisabledLight: string;
                    scrollDisabledDark: string;
                    sectionBorderLight: string;
                    mutedIcon: string;
                };
                roles: {
                    pageChipBg: string;
                    pageChipText: string;
                    pageChipUnderline: string;
                    cardBorder: string;
                    cardBg: string;
                    formShellBg: string;
                    searchBg: string;
                    searchBorder: string;
                    searchText: string;
                    tableHeaderBg: string;
                    tableHeaderText: string;
                    tableRowText: string;
                    rowBorder: string;
                    primaryActionBg: string;
                    primaryActionHover: string;
                    primaryActionText: string;
                    cancelActionBg: string;
                    cancelActionText: string;
                    actionMenuBg: string;
                    actionMenuBorder: string;
                    actionMenuText: string;
                    actionMenuShadow: string;
                    switchTrack: string;
                    switchTrackOpacity: number;
                    switchThumbChecked: string;
                    switchThumbUnchecked: string;
                    switchThumbShadow: string;
                    labelText: string;
                    requiredMark: string;
                    inputBg: string;
                    inputBorder: string;
                    inputPlaceholder: string;
                    permissionRowBg: string;
                    permissionRowAltBg: string;
                    permissionHeaderBg: string;
                    permissionDivider: string;
                    warningAlertBg: string;
                    warningAlertText: string;
                    warningAlertIcon: string;
                    dialogFooterBg: string;
                    dialogBorder: string;
                    successAlertBg: string;
                    successAlertText: string;
                    successAlertAccent: string;
                    successAlertShadow: string;
                };
                dotPhrase: {
                    pageChipBg: string;
                    pageChipText: string;
                    scopeSelectedText: string;
                    pageChipCloseBorder: string;
                    pageChipCloseIcon: string;
                    pageChipUnderline: string;
                    cardBorder: string;
                    controlBg: string;
                    controlBgMuted: string;
                    controlBorder: string;
                    primaryActionBg: string;
                    primaryActionHover: string;
                    primaryActionText: string;
                    tableHeaderBg: string;
                    tableText: string;
                    phraseLinkText: string;
                    editChipBg: string;
                    editChipText: string;
                    deleteChipBg: string;
                    deleteChipText: string;
                    emptyText: string;
                    drawerBackdrop: string;
                    drawerPanelBg: string;
                    drawerSectionBg: string;
                    drawerBorder: string;
                    drawerTitleText: string;
                    drawerBodyText: string;
                    drawerLabelText: string;
                    drawerHintText: string;
                    drawerSelectBg: string;
                    drawerInputBg: string;
                    drawerEditPreviewBg: string;
                    insertTagBg: string;
                    insertTagText: string;
                    cancelAction: string;
                    searchPlaceholderText: string;
                    clear: string;
                    confirmDialogBg: string;
                    confirmDialogSectionBg: string;
                    confirmDialogText: string;
                    confirmDialogCancelText: string;
                    actionMenuBg: string;
                    actionMenuBorder: string;
                    actionMenuText: string;
                    deleteAlertBg: string;
                    deleteAlertIcon: string;
                    deleteConfirmBg: string;
                    deleteConfirmText: string;
                    dialogCancelBg: string;
                    dialogCancelText: string;
                    successToastBg: string;
                    successToastAccent: string;
                    successToastText: string;
                    successToastShadow: string;
                    
                    libChipShadow: string;
                    
                    libCardBg: string;

                    libCardHeaderBg: string;
                    
                    libCardHeaderText: string;
                    
                    libCardHeaderDiamond: string;
                    
                    libRadioColor: string;
                    libRadioText: string;
                    libRadioSubtitle: string;
                    libTableRowBg: string;
                    libPhraseLink: string;
                    libMenuHoverBg: string;
                    libMenuShadow: string;
                    libInputBg: string;
                    libDrawerRequiredMark: string;
                    libAddButtonDisabledBg: string;
                };
                /** Provider home stat cards (Figma AQ dark: Main Base selected, #5b5b5b borders). */
                statsGrid: {
                    cardBorderLight: string;
                    cardBorderDark: string;
                    cardBgLight: string;
                    cardBgDark: string;
                    selectedBgLight: string;
                    selectedBgDark: string;
                    selectedTextLight: string;
                    selectedTextDark: string;
                    labelLight: string;
                    labelDark: string;
                    valueLight: string;
                    valueDark: string;
                    hoverLight: string;
                    hoverDark: string;
                    skeletonBgDark: string;
                };
                /** Auto Queue Examination section chrome (Figma AQ dark — non-table UI). */
                autoQueue: {
                    buttonBgLight: string;
                    buttonBgDark: string;
                    buttonTextLight: string;
                    buttonTextDark: string;
                    titleBarBgLight: string;
                    titleBarBgDark: string;
                    tabActiveLight: string;
                    tabActiveDark: string;
                    tabInactiveDark: string;
                    searchSectionBgLight: string;
                    searchSectionBgDark: string;
                    searchControlBgLight: string;
                    searchControlBgDark: string;
                };
                workQueues: {
                    chipBg: string;
                    chipText: string;
                    tabActiveBg: string;
                    tabActiveText: string;
                    tabInactiveBg: string;
                    tabInactiveBorder: string;
                    tabInactiveText: string;
                    emptyText: string;
                };
                providerQueue: {
                    tileSelectedBg: string;
                    tileSelectedText: string;
                    tileSelectedLabel: string;
                    tileUnselectedBg: string;
                    tileUnselectedBorder: string;
                    tileLabelColor: string;
                    tileValueColor: string;
                    tableHeaderBg: string;
                    tableHeaderText: string;
                    tableRowBorder: string;
                    caseLinkColor: string;
                    childGridBg: string;
                    childHeaderBg: string;
                    statusInProgressBg: string;
                    statusInProgressText: string;
                    statusNotStartedBg: string;
                    statusNotStartedText: string;
                    statusNewBg: string;
                    statusNewText: string;
                    flagPriorityBg: string;
                    flagPriorityColor: string;
                    flagClcwBg: string;
                    flagClcwColor: string;
                    flagSuppBg: string;
                    flagSuppColor: string;
                    flagBellBg: string;
                    flagBellBorder: string;
                    actionMenuBg: string;
                    actionMenuBorder: string;
                    actionMenuShadow: string;
                    actionMenuItemText: string;
                    actionMenuItemActiveBg: string;
                    actionMenuItemActiveText: string;
                    actionMenuItemIconColor: string;
                    dropdownBorder: string;
                    lockIconBg: string;
                    lockIconBorder: string;
                    paginationText: string;
                    paginationActiveBg: string;
                    paginationActiveText: string;
                    paginationBorder: string;
                    modalOverlay: string;
                    modalHeaderBg: string;
                    modalBorder: string;
                    modalNoBg: string;
                    modalNoText: string;
                    modalYesBg: string;
                    modalYesText: string;
                    modalBodyText: string;
                    modalLabelText: string;
                    modalInputBg: string;
                    modalInputBorder: string;
                    childMutedText: string;
                    actionTriggerActiveBg: string;
                    alertBg: string;
                    alertAccent: string;
                    alertText: string;
                    alertShadow: string;
                    autoQueueTabActive: string;
                    autoQueueTabInactive: string;
                    exportBtnBg: string;
                    exportBtnText: string;
                };
                packageReview: {
                    backdrop: string;
                    panelBg: string;
                    panelBorder: string;
                    sectionBg: string;
                    titleText: string;
                    labelText: string;
                    valueText: string;
                    linkText: string;
                    selectBorder: string;
                    selectFocusBorder: string;
                    selectBg: string;
                    placeholderText: string;
                    progressTrack: string;
                    progressComplete: string;
                    progressActive: string;
                    successText: string;
                    dangerText: string;
                    successBg: string;
                    dangerBg: string;
                    primaryActionBg: string;
                    primaryActionText: string;
                };
                lightBorderPrimary: string;
                lightHoverOverlay: string;
                lightButtonHover: string;
                lightNeutralSurface: string;
                popoverDarkBg: string;
                popoverLightBg: string;
                darkButtonBgSoft: string;
                positiveActionGreen: string;
                softDangerSurface: string;
                successAccentDark: string;
                successSurfaceButtonLight: string;
                selectedMenuDark: string;
                selectedMenuLight: string;
                modalBackdrop: string;
            };
            text: {
                chip: { fontSize: number; fontWeight: number; color: string; bg: string };
            };
            buttons: {
                sizes: {
                    large: { height: number; radius: number; fontSize: number };
                    medium: { height: number; radius: number; fontSize: number };
                };
                variants: {
                    primary: { bg: string; color: string };
                    neutral: { bg: string; color: string };
                    esrReviewed: { bg: string; color: string; radius: number; hoverBg: string };
                    markVip: { bg: string; color: string; border: string; radius: number; hoverBg: string };
                    cancelFilled: { bg: string; color: string; radius: number; hoverBg: string };
                    warning: { bg: string; color: string };
                    success: { bg: string; color: string };
                    danger: { bg: string; color: string };
                    view: { bg: string; color: string };
                    edit: { bg: string; color: string };
                    disabled: { bg: string; color: string; bgDark: string; colorDark: string };
                    cancel: { bg: string; color: string };
                    result: { bg: string; color: string; onHoverBg: string }
                };
            };
            select: {
                bgColorLight: string,
                bgColorDark: string,
            },
            readonlyField: {
                bgColorLight: string,
                bgColorDark: string,
                textFillColorLight: string,
                textFillColorDark: string
            },
            qaReview: {
                headerTitleFontSize: number;
                subHeaderTitleFontSize: number;
                tabFontSize: number;
                trackerRowHeight: number;
                changeHistoryRowHeight: number;
                actionWidths: {
                    view: number;
                    revise: number;
                    hold: number;
                    rejection: number;
                    approve: number;
                    sendToCmo: number;
                    sendToVa: number;
                    modify: number;
                    remove: number;
                };
            };
            responsive: {
                layout: {
                    sectionPadding: {
                        xs: number;
                        sm: number;
                    };
                    fullWidthOnMobile: {
                        xs: string;
                        sm: string;
                    };
                    drawerWidth: {
                        xs: string;
                        sm: number;
                    };
                    footerClearance: {
                        xs: string;
                        sm: string;
                        md: string;
                    };
                };
                tables: {
                    minWidth: {
                        compact: number;
                        default: number;
                        wide: number;
                    };
                };
                buttons: {
                    primaryPaddingX: {
                        xs: number;
                        sm: number;
                    };
                    minWidth: {
                        sm: number;
                    };
                };
            };
            layout: {
                dialog: {
                    width: number;
                    borderRadius: number;
                    headerHeight: number;
                };
                drawer: {
                    controlMinHeight: number;
                    multilineMinHeight: number;
                    borderRadius: number;
                    labelFontSize: number;
                };
                searchFacility: {
                    controlHeight: number;
                    collapsedHeight: number;
                    sectionPaddingY: number;
                    hatChevronTop: number;
                    hatChevronRight: number;
                    contentPaddingTop: number;
                    contentPaddingBottom: number;
                };
                autoQueue: {
                    expandIconSize: number;
                    checkboxSize: number;
                    detailPanelGapTop: number;
                    detailPanelInsetX: number;
                    detailPanelInsetBottom: number;
                    caseDetailsSectionGap: number;
                };
            };
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        custom?: Theme['custom'];
    }
}
 
/** App-wide color and UI literals; shared by `getTheme` and feature style helpers. */
export const THEME_PRIMITIVES = {
    primary: '#244794',
    primaryHover: '#162D5C',
    buttonHover: '#1c3873',
    buttonDisabled: '#7D8DAE',
    primaryAccent: '#2953ae',
    autoQueueButtonBg: '#244794',
    /** Figma Main Base (20%) — selected stat card fill in AQ light mode. */
    mainBase20: '#24479433',
    mainBase: '#6B92F5',
    mainBaseText: '#061A47',
    mainBaseTint: '#6B92F580',
    mainBase20OnDark: '#6B92F533',
    autoQueueExpandIconSize: 16,
    autoQueueCheckboxSize: 16,
    autoQueueDetailPanelGapTop: 16,
    autoQueueDetailPanelInsetX: 16,
    autoQueueDetailPanelInsetBottom: 8,
    autoQueueCaseDetailsSectionGap: 16,
    primaryOnDark: '#90CAF9',
    primaryHoverDark: '#1E3F8F',
    primaryOnDarkVariant: '#3F73D9',
    placeholderDark: '#888',
    accentGradientEnd: '#50A0BB',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    gridHeaderLight: '#F5F5F5',
    gridHeaderDark: '#2A2A2A',
    sidebarSelectedBg: '#D3DAEA',
    secondaryElevatedDark: '#3A3A3A',
    alertErrorBgDark: '#5F2120',
    stroke: '#E5E3E3',
    strokeDark: '#424242',
    rolesInputBorder: '#BCBCBC',
    cardBgDark: '#1A1A1A',
    surfaceDark: '#141414',
    inputBgDark: '#5B5B5B',
    inputBorderLightSoft: '#D1D5DB',
    success: '#054809',
    successBgDark: '#177238',
    successHoverLight: '#A8D9AD ',
    danger: '#DC3545',
    dangerText: '#700000',
    deleteButtonBgLight: '#FFDDDD',
    deleteButtonBgDark: '#B91C1C',
    focusBorder: '#007AFF',
    requiredAsteriskDark: '#8E4949',
    fieldError: '#FF0000',
    dangerBgDark: '#6E2824',
    dangerBgLight: '#FFD8D8',
    dangerTextSoft: '#FFD8D8',
    darkSurfacePrimary: '#1F1F1F',
    dangerDark : "#59130f",
    drawerAutocompletePaperLight: '#f2f2f2',
    drawerOptionHoverDark: 'rgba(255,255,255,0.1)',
    drawerOptionHoverLight: 'rgba(0,0,0,0.08)',
    drawerPlaceholderDark: 'rgba(255,255,255,0.51)',
    drawerPlaceholderLight: 'rgba(97,91,91,0.6)',
    drawerSelectedTextLight: '#374151',
    drawerBorderLight: '#e0e0e0',
    uploadButtonBg: '#757575',
    neutralButtonTextMedium: '#454545',
    uploadSuccessGreen: '#00A80F',
    contentBoxBorderDark: "#433f3fff",
    drawerBorderHoverLight: '#bdbdbd',
    drawerFocusedBorderLight: '#2D5CC2',
    drawerPrimaryButton: '#4A90E2',
    drawerPrimaryButtonHover: '#357ABD',
    nestedBorderLight: '#dcdcdc',
    warningText: '#735904',
    warningBgLight: '#FFF1C2',
    errorSoftOnDark: '#FF847D',
    selectedPreferrencesOnDark: '#E30000',
    errorButtonText: '#470000',
    acceptButtonBg: '#0BE55B',
    acceptButtonText: '#02401A',
    statusActiveBg: '#BFE8C2',
    statusActiveText: '#054809',
    statusActiveBorder: '#1E4620',
    statusInactiveBg: '#FFD6D6',
    statusInactiveText: '#C62828',
    statusInactiveBorder: '#C62828',
    burdenStandardBg: '#D6E8FF',
    burdenStandardText: '#1565C0',
    burdenCustomBg: '#FFF3CC',
    burdenCustomText: '#8A6000',
    burdenHighComplexityBg: '#EDE7F6',
    burdenHighComplexityText: '#5C1F8A',
    burdenDefaultBg: '#F0F0F0',
    burdenDefaultText: '#616161',
    /** Dark-mode burden chips from Provider DBQ Burden Time Figma. */
    burdenBadgeStandardBg: '#BED7FD',
    burdenBadgeDefaultBg: '#EEF1F4',
    burdenBadgeDefaultText: '#5B6671',
    /** Info alert fill on dark burden-time screens: rgba(25, 118, 210, 0.3). */
    alertInfoSurfaceDark: 'rgba(25, 118, 210, 0.3)',
    alertInfoBg: '#E5F6FD',
    alertInfoText: '#014361',
    holdButtonBg: '#F3CC4F',
    holdButtonText: '#2E2000',
    containerUserDark: '#000000',
    chipSurfaceDark: 'rgba(42, 42, 42, 1)',
    labelMuted: '#787878',
    lightNeutralSurface: '#D9D9D9',
    lightBorder: '#d3d3d3',
    mutedTextOnDark: 'rgba(255, 255, 255, 0.6)',
    menuBgDark: 'rgba(91, 91, 91, 1)',
    menuHoverDark: 'rgba(42, 42, 42, 0.5)',
    menuHoverLight: 'rgba(0, 0, 0, 0.04)',
    iconMutedOnDark: 'rgba(255, 255, 255, 0.5)',
    tintedPrimarySubtle: 'rgba(45, 92, 194, 0.05)',
    tintedPrimarySoft: 'rgba(45, 92, 194, 0.2)',
    tintedPrimaryMedium: 'rgba(45, 92, 194, 0.3)',
    tintedPrimaryOnDarkSubtle: '#6B92F533',
    tintedPrimaryOnDarkSoft: '#6B92F533',
    tintedPrimaryOnDarkMedium: '#6B92F580',
    searchInputBgLight: 'rgba(120, 120, 120, 0.2)',
    searchInputBgDark: 'rgba(255, 255, 255, 0.08)',
    emptyInputBorderLight: '#BBBABA',
    emptyInputBorderDark: '#464646',
    editSurfaceLightAlpha: '#04BB4733',
    editSurfaceDarkAlpha: 'rgba(4, 187, 71, 0.50)',
    accordionCptDarkAlpha: '#04BB4780',
    accordionCptOnDark: '#BFE8C2',
    dangerBgDarkAlpha: 'rgba(179, 38, 30, 0.50)',
    scrollbarTrackLight: '#f1f1f1',
    scrollbarTrackDark: '#2a2a2a',
    scrollbarThumb: '#c1c1c1',
    scrollbarThumbHover: '#a8a8a8',
    successTextDark: '#025d23',
    successTextSoft: "#c2e0b5",
    successButtonHoverDark : "#03702A",
    successButtonHoverLight: "#A7D9AC",
    successButtonTextHoverDark: "#E2F6E8",
    successButtonTextHoverLight: "#043A07",
    successButtonHoverDarkStrong: "#04752C",
    successButtonTextHoverDarkSoft: "#E0F5E7",
    link: '#007BFF',
    iconSoftLight: "#f1e8e8ff",
    mutedTextFooter: '#6A6A6A',
    mutedBorder: '#C5C5C5',
    modalBackdropSoft: "rgba(0,0,0,0.4)",
    modalBackdrop: "rgba(0,0,0,0.5)",
    neutralGray: '#9E9E9E',
    requiredFieldColor: '#B3261E',
    errorMedium:"#EF5350",
    errorDefault:"#f44336",
    chipTextDark:"#bbb",
    darkHoverOverlay:"rgba(255,255,255,0.05)",
    lightHoverOverlay:"rgba(0,0,0,0.02)",
    lightBorderPrimary:"#E5E7EB",
    lightButtonHover:"#575757",
    primaryBlueLight:"#93C5FD",
    lightBorderSecondary:"#F3F4F6",
    lightRowHover:"#F9FAFB",
    darkBgSecondary:"#1E1E1E",
    darkBorder:"#444",
    primaryBlueDark:"#3A6FE2",
    errorLight:"#EF4444",
    lightDisabledBg:"#f9f9f9",
    modalOverlaySoft:"rgba(0,0,0,0.3)",
    lightBorderSoft:"#ddd",
    dangerTextSoftLight:"#ff6b6b",
    inputBgDarkMedium:"rgba(91,91,91,0.3)",
    inputBgDarkLight:"rgba(91,91,91,0.1)",
    infoBgLight:"#e3f2fd",
    infoText:"#1976d2",
    warningBgSoft:"#fff3cd",
    warningBorder:"#ffeaa7",
    warningTextDark:"#856404",
    lightDrawerShadow:"rgba(0,0,0,0.1)",
    calendarUnavailableDark:"rgba(60,60,60,0.4)",
    calendarUnavailableLight:"rgba(249,250,251,0.8)",
    lightInsetShadow:"rgba(0,0,0,0.06)",
    iconButtonHoverLight:"rgba(0,0,0,0.06)",
    iconButtonHoverDark:"rgba(255,255,255,0.10)",
    lightIconCircleBg:"rgba(0,0,0,0.05)",
    darkStripeOverlay:"rgba(255,255,255,0.03)",
    inputBgDarkSoft:"rgba(91,91,91,0.4)",
    shadowDarkSoft:"rgba(0,0,0,0.2)",
    lightHoverShadow:"rgba(0,0,0,0.15)",
    textPrimaryDark:"#111827",
    primaryBlue:"#3b82f6",
    primaryBlueHover:"#2563eb",
    primaryBlueShadow:"rgba(59,130,246,0.3)",
    primaryBlueShadowHover:"rgba(59,130,246,0.4)",
    popoverDarkBg:"rgba(31,41,55,0.95)",
    popoverLightBg:"rgba(255,255,255,0.95)",
    darkButtonBgSoft:"rgba(75,85,99,0.5)",
    darkButtonBgHover:"rgba(75,85,99,0.8)",
    lightButtonBgSoft:"rgba(243,244,246,0.8)",
    lightButtonBgHover:"rgba(229,231,235,1)",
    darkMutedText:"#4b5563",
    darkButtonBgMedium:"rgba(75,85,99,0.3)",
    lightButtonBgMedium:"rgba(243,244,246,1)",
    inputBgLightSoft:"#E8E8E8",
    primaryButtonHover:"#2448A3",
    inputBgLightMuted:"rgba(120,120,120,0.15)",
    inputSurfaceDark: '#111010ff',
    lightMutedText: '#ccc',
    editSurfaceLight: '#E8F5E8',
    editTextLight: '#2E7D2E',
    editBorderLight: '#C8E6C8',
    editHoverLight: '#D4F1D4',
    editHoverTextLight: '#1B5E1B',
    positiveActionGreen: '#054809',
    softDangerSurface: '#FFD8D8',
    mutedNeutralBorder: '#BFBFBF',
    softLightSurface: '#fafafa',
    softDangerBorder: '#F2BFC0',
    neutralSurfaceDark: '#666',
    mutedActionSurface: '#555',
    dangerSurfaceDark: 'rgb(89, 27, 15)',
    scrollTrackLight: '#F0F0F0',
    softWhiteOverlay: 'rgba(255, 255, 255, 0.05)',
    softErrorOverlay: '#B3261E80',
    secondaryAccentBlue: '#456EC8',
    primaryOverlayStrong: 'rgba(45, 92, 194, 0.5)',
    successSurfaceLight: 'rgba(197, 233, 210, 1)',
    successAccentStrong: 'rgba(4, 187, 71, 1)',
    searchInputSurfaceLight: 'rgba(120,120,120,0.2)',
    selectedChipSurfaceDark: 'rgba(91,91,91,0.5)',
    disabledTextLight: '#aaa',
    dangerSurfaceStrong: 'rgb(89, 19, 15)',
    dangerTextOnDark: 'rgba(255, 216, 216, 1)',
    successAccentPrimary: '#04BB47',
    successSurfaceMuted: '#AEDCBF',
    errorAccentStrong: '#D32F2F',
    dangerOverlayMedium: 'rgba(179, 53, 30, 0.5)',
    softErrorBackground: 'rgba(255, 107, 107, 0.1)',
    softErrorHover: 'rgba(255, 107, 107, 0.2)',
    selectedMenuDark: '#22324A',
    selectedMenuLight: '#E6EEFC',
    selectedMenuHoverDark: '#2A3A55',
    selectedMenuHoverLight: '#DAE8FD',
    menuItemHoverDark: '#111111',
    primaryButtonHoverLight: '#90A8DB',
    inputBgDarkOverlay: 'rgba(91, 91, 91, 0.5)',
    softErrorOverlayMedium: 'rgba(255, 61, 61, 0.3)',
    successSurfaceSoft: '#8FD19E',
    successTextStrong: '#043706',
    hoverSurfaceDark: '#5A5A5A',
    successIconStrong: '#4CAF50',
    focusedBorderPrimary: '#4472C4',
    textPrimaryOverlay: 'rgba(0, 0, 0, 0.87)',
    labelMutedOverlay: '#78787833',
    textSuccessStrong: '#1E4620',
    successAccentDark: '#2E7D32',
    inputTextPrimary: '#111827',
    iconMuted: '#6B7280',
    selectedOptionBgLight: '#EFF6FF',
    outlinedInputBorder: 'rgba(0, 0, 0, 0.23)',
    alertInfoBgDark: 'rgba(0, 139, 232, 0.18)',
    alertInfoTextDark: '#B8E4FF',
    alertInfoBorderDark: '#0288D1',
    disabledTextLightOverlay: 'rgba(0,0,0,0.26)',
    dangerTextSoftHover: '#FF7B7B',
    neutralBorderMedium: 'rgb(120, 120, 120)',
    errorSurfaceLight: '#FCE4E4',
    neutralButtonBg: '#6D6D6D',
    neutralButtonHover: '#616161',
    esrReviewedButtonBg: '#454545',
    esrReviewedButtonHover: '#3D3D3D',
    markVipButtonBg: '#F5F5F5',
    markVipButtonBorder: '#244794',
    markVipButtonHover: '#EEEEEE',
    vipBadgeBg: '#D9A600',
    vipBadgeText: '#FFFFFF',
    modalInfoBg: '#D8EFFB',
    modalInfoText: '#005D90',
    modalInfoIcon: '#008BE8',
    modalMessageBgDark: '#917044',
    cancelFilledButtonBg: '#E5E3E3',
    cancelFilledButtonHover: '#DCDADA',
    neutralBorderSoft: '#D0D0D0',
    surfaceMutedLight: '#EEF1F5',
    successTextMedium: '#2E7D32',
    successAlertTextDeep: '#1E4620',
    errorAlertSurface: '#FDEDED',
    successToastShadow: '0px 4px 2px rgba(0, 0, 0, 0.25)',
    modalBackdropMedium: 'rgba(50, 50, 50, 0.6)',
    primaryButtonBlue: 'rgba(45, 92, 194, 1)',
    searchInputBgHoverLight: "rgba(45, 92, 194, 0.25)",
    modalBackdropStrong: "rgba(0, 0, 0, 0.7)",
    disabledTextMuted: "#b0b0b0",
    widgetBorderDark: "#433f3f",
    notesSurfaceLight: "#e9ecef",
    secondarySurfaceDark: "#171717",
    appointmentAccent: "#47BACE",
    schedulerAvailableBg: "#DFF6DD",
    schedulerAvailableText: "#1B5E20",
    schedulerEventBg: "#FCE4EC",
    schedulerEventText: "#880E4F",
    schedulerBusyBg: "#FFF9C4",
    schedulerBusyText: "#F57F17",
    schedulerDefaultBg: "#E0F7FA",
    schedulerDefaultText: "#006064",
    dropdownSelectedDark: "#333333",
    disabledSurfaceDark: "#2e2e2e",
    lightBorderMuted: "#e5e5e5",
    dangerOverlaySoft: "rgba(255, 135, 128, 0.50)",
    appointmentOverlaySoft: "rgba(71, 186, 206, 0.50)",
    successSurfaceButtonLight: "rgba(4, 187, 71, 0.2)",
    dangerSurfaceButtonLight: "rgb(255, 216, 216)",
    neutralBorderDisabled: '#CFCFCF',
    disabledOverlayLight: 'rgba(0,0,0,0.12)',
    softWhiteTextOverlay: 'rgba(255,255,255,0.55)',
    softPrimarySurface: '#C0CDE7',
    neutralTextStrong: 'rgba(106, 106, 106, 1)',
    dangerHoverDark: '#7A1F1F',
    surfaceNeutralLight: '#EBEBEB',
    primaryOverlaySubtle: 'rgba(45, 92, 194, 0.04)',
    selectPrimaryBlue: '#3182ce',
    selectBorderLight: '#e2e8f0',
    examinerDropdownLight: '#927474',
    selectBackgroundDark: '#2d3748',
    selectBorderDark: '#4a5568',
    scrollbarThumbDarkSoft: 'rgba(255,255,255,0.15)',
    scrollbarThumbLightSoft: 'rgba(0,0,0,0.22)',
    scrollbarThumbHoverDark: 'rgba(255,255,255,0.25)',
    scrollbarThumbHoverLight: 'rgba(0,0,0,0.32)',
    dotPhraseFigmaDeleteBg: '#E65B5B',
    dotPhraseFigmaDeleteText: '#470000',
    dotPhraseFigmaCancelText: '#FF847D',
    dotPhraseFigmaInsertTagBg: '#6A6A6A',
    dotPhraseFigmaEditText: '#02401A',
    dotPhraseFigmaEditBg: '#0BE55B',
    dotPhraseFigmaSearchBg: '#5B5B5B',
    dotPhraseFigmaModalSection: '#3A3A3A',
    dotPhraseFigmaBodyText: '#FFFFFF',
    dotPhraseFigmaBorder: '#5B5B5B',
    dotPhraseFigmaPanel: '#2A2A2A',
    /** Figma 257-1844 library card header bg (light mode) */
    dotPhraseFigmaCardHeaderBgLight: '#F7F8F9',
    /** Figma 257-1844 diamond icon color (light mode) */
    dotPhraseFigmaCardHeaderDiamondLight: '#59616B',
    /** Figma 257-1844 radio subtitle color (light mode) */
    dotPhraseFigmaRadioSubtitleLight: '#6B737D',
    /** Figma 257-1844 radio subtitle color (dark mode) */
    dotPhraseFigmaRadioSubtitleDark: '#757575',
    /** Figma 257-1855 page chip drop shadow */
    dotPhraseFigmaChipShadow: '0px 4px 5px rgba(0, 0, 0, 0.1)',
    /** Figma 177-376/378 action menu shadow (dark mode) */
    dotPhraseFigmaMenuShadowDark: '0px 4px 16px rgba(0, 0, 0, 0.35)',
    dotPhraseNeutral: '#787878',
    dotPhraseBorder: '#E5E3E3',
    dotPhraseTableText: '#212121',
    dotPhraseEditText: '#054809',
    dotPhraseEditBg: '#BFE8C2',
    dotPhraseDeleteBg: '#FFD8D8',
    dotPhraseDeleteText: '#700000',
    dotPhraseBackdrop: 'rgba(50, 50, 50, 0.6)',
    dotPhraseSelectBg: 'rgba(120,120,120,0.2)',
    dotPhraseHintText: 'rgba(124,124,124,0.67)',
    dotPhraseFigmaMain: '#6B92F5',
    dotPhraseFigmaMainText: '#061A47',
    dotPhrasePrimary: '#2953AE',
    dotPhrasePrimaryHover: '#1F4799',
    rolesSwitchTrack: 'rgba(36, 71, 148, 0.8)',
    rolesSwitchTrackDark: '#C5D7FF',
    rolesSwitchTrackOpacity: 0.38,
    rolesSwitchThumbShadow:
        '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
    rolesActionMenuText: '#454545',
    rolesWarningAlertBg: '#FFF4E5',
    rolesWarningAlertBgDark: '#917044',
    rolesWarningAlertText: '#663C00',
    rolesWarningAlertIcon: '#ED6C02',
    warningHighlightIcon: '#EF6C00',
    warningHighlightText: '#8A4B08',
    warningHighlightIconAmber: '#F57C00',
    rolesSuccessAlertText: '#1E4620',
    rolesSuccessAlertAccent: '#2E7D32',
    rolesSuccessAlertShadow: '0px 4px 2px rgba(0, 0, 0, 0.25)',
    packageReviewProgressTrack: '#D9D9D9',
    documentViewButtonBg: '#D9D9D9',
    documentActionBorder: '#E5E3E3',
    documentDeleteText: '#700000',
    wqTabInactiveText: '#757575',
    tabInactiveBgLight: '#ECECEC',
    menuActiveBgLight: '#E8EEF8',
    /* Provider Work Queue refreshed design */
    pqFlagPriorityBg: '#fff7ed',
    pqFlagPriorityColor: '#ff9e1b',
    pqFlagClcwBg: '#f3e8ff',
    pqFlagClcwColor: '#7e22ce',
    pqFlagSuppBg: '#d1fae5',
    pqFlagSuppColor: '#065f46',
    pqFlagBellBg: '#ccfbf1',
    pqFlagBellBorder: '#14b8a6',
    pqStatusInProgressBg: '#dbeafe',
    pqStatusInProgressText: '#1e40af',
    pqStatusNotStartedBg: '#f3f4f6',
    pqStatusNotStartedText: '#4b5563',
    pqTileSelectedLabel: 'rgba(255,255,255,0.8)',
    pqActionMenuItemActiveBg: '#eff6ff',
    pqActionMenuShadow: '0px 8px 24px -4px rgba(0,0,0,0.08)',
    pqActionMenuIconColor: '#6b7280',
    pqCaseLinkColor: '#1a59b2',
    pqModalOverlay: 'rgba(40,40,40,0.6)',
    /* Figma provider "Today's appointment" refinements */
    pqModalInputBorderLight: '#E4E4E4',
    pqChildRowMutedText: '#9CA3AF',
    pqActionTriggerActiveBgLight: '#F3F4F6',
    borderLight: "#D8DDE5",
    caseLinkColor: "#1A66E5",
    tableBorder: "#D8DDE5",
    dividerMedium: "#808080",
    cardBorderLight: "#DDDDDD",
    cardTextDark: "#222222",
    dangerBadgeBg: "#FFD8DA",
    menuShadow: "0px 4px 16px 0px rgba(0, 0, 0, 0.12)",
    menuShadowDark: "0px 4px 16px 0px rgba(0, 0, 0, 0.45)",
    dialogSpecialShadow: "0px 4px 2px rgba(0, 0, 0, 0.25)",
    cardShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)",

    widgetSelectedBgLight: '#E4E4E4',
    secondaryButtonHover: "#DDDADA",
    secondaryButtonText: "#454545",
    modalBackdropWidgets:'rgba(0, 0, 0, 0.45)',
    cardBackgroundLight: "#F8F9FA",
    toastShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    commonToastShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
    successToastText: "#1E4620",
    billingSelectedBg: "#D3DAEA",
    textPrimary: "#333333",
    borderDefault: "#CCCCCC",
    placeholderText: "#999999",
    iconDefault: "#666666",
    filterBackground: "#F8F9FA",
    paperShadow: "#00000040",
    passwordRuleSuccess: "#00A63E",
    textSecondary: "#717182",
    statisticCardBorder: '#D8DDE5',
    statisticCardShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)',
    mistBlue: '#6B7A8D',
    announcementSearchBorder: "#E4E4E4",
    announcementMenuIcon: "#757575",
    announcementMenuEditBg: "#DBEAFE",
    announcementMenuEditHoverBg: "#BFDBFE",
    drawerSecondaryButtonText: "#454545",
    announcementScheduledText: "#664E00",
    announcementPublishedBg: "#BFE8C2",
    errorText: "#E30000",
    successToastBgLight: "#F5F5F5",
    errorAlertText: "#5F2120",
    errorTextHover: "#C10000",
    caseAgeLowDark: "#81c784",
    caseAgeLowLight: "#2e7d32",
    caseAgeMediumDark: "#ffb74d",
    caseAgeMediumLight: "#ed6c02",
} as const;
 
export const getTheme = (mode: 'light' | 'dark') => {
    const baseFont = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const P = THEME_PRIMITIVES;
    const providerLayoutColors = {
        tabBackgroundLight: P.gridHeaderLight,
        tabBackgroundDark: P.gridHeaderDark,
        activeAccent: P.primary,
        refreshBgLight: '#E0E0E0',
        refreshBgDark: P.secondaryElevatedDark,
        refreshHoverLight: '#D5D5D5',
        refreshHoverDark: '#4A4A4A',
        closeBorderLight: '#A6A6A6',
        closeBorderDark: '#777',
        closeIconLight: '#555',
        closeIconDark: '#E2E2E2',
        closeHoverLight: '#F2F2F2',
        closeHoverDark: '#3F3F3F',
        scrollDisabledLight: '#787878',
        scrollDisabledDark: '#A0A0A0',
        sectionBorderLight: '#E6E6E6',
        mutedIcon: '#999',
    } as const;
    const dotPhraseColors = mode === 'light'
        ? {
            pageChipBg: P.gridHeaderLight,
            pageChipText: P.dotPhrasePrimary,
            scopeSelectedText: P.primary,
            pageChipCloseBorder: P.labelMuted,
            pageChipCloseIcon: P.labelMuted,
            pageChipUnderline: P.dotPhrasePrimary,
            cardBorder: P.dotPhraseBorder,
            controlBg: P.white,
            controlBgMuted: P.dotPhraseSelectBg,
            controlBorder: P.dotPhraseBorder,
            primaryActionBg: P.dotPhrasePrimary,
            primaryActionHover: P.dotPhrasePrimaryHover,
            primaryActionText: P.white,
            tableHeaderBg: P.gridHeaderLight,
            tableText: P.dotPhraseTableText,
            phraseLinkText: P.dotPhrasePrimary,
            editChipBg: P.dotPhraseEditBg,
            editChipText: P.dotPhraseEditText,
            deleteChipBg: P.dotPhraseDeleteBg,
            deleteChipText: P.dotPhraseDeleteText,
            emptyText: P.labelMuted,
            drawerBackdrop: P.dotPhraseBackdrop,
            drawerPanelBg: P.white,
            drawerSectionBg: P.gridHeaderLight,
            drawerBorder: P.dotPhraseBorder,
            drawerTitleText: P.black,
            drawerBodyText: P.dotPhraseTableText,
            drawerLabelText: P.labelMuted,
            drawerHintText: P.dotPhraseHintText,
            drawerSelectBg: P.dotPhraseSelectBg,
            drawerInputBg: P.white,
            drawerEditPreviewBg: P.gridHeaderLight,
            insertTagBg: P.dotPhraseSelectBg,
            insertTagText: P.dotPhraseTableText,
            cancelAction: P.dangerText,
            searchPlaceholderText: P.black,
            clear: 'transparent',
            confirmDialogBg: P.white,
            confirmDialogSectionBg: P.gridHeaderLight,
            confirmDialogText: P.dotPhraseTableText,
            confirmDialogCancelText: P.dangerText,
            actionMenuBg: P.white,
            actionMenuBorder: P.stroke,
            actionMenuText: P.neutralButtonTextMedium,
            deleteAlertBg: P.errorAlertSurface,
            deleteAlertIcon: P.errorAccentStrong,
            deleteConfirmBg: P.errorAccentStrong,
            deleteConfirmText: P.white,
            dialogCancelBg: P.stroke,
            dialogCancelText: P.neutralButtonTextMedium,
            successToastBg: P.gridHeaderLight,
            successToastAccent: P.successTextMedium,
            successToastText: P.successAlertTextDeep,
            successToastShadow: P.successToastShadow,
            libChipShadow: P.dotPhraseFigmaChipShadow,
            libCardBg: P.white,
            libCardHeaderBg: P.dotPhraseFigmaCardHeaderBgLight,
            libCardHeaderText: P.dotPhraseTableText,
            libCardHeaderDiamond: P.dotPhraseFigmaCardHeaderDiamondLight,
            libRadioColor: P.dotPhrasePrimary,
            libRadioText: P.dotPhraseTableText,
            libRadioSubtitle: P.dotPhraseFigmaRadioSubtitleLight,
            libTableRowBg: P.white,
            libPhraseLink: P.dotPhrasePrimary,
            libMenuHoverBg: P.menuActiveBgLight,
            libMenuShadow: P.menuShadow,
            libInputBg: P.white,
            libDrawerRequiredMark: P.dangerText,
            libAddButtonDisabledBg: P.uploadButtonBg,
        }
        : {
            pageChipBg: P.dotPhraseFigmaPanel,
            pageChipText: P.dotPhraseFigmaBodyText,
            scopeSelectedText: P.dotPhraseFigmaMain,
            pageChipCloseBorder: P.dotPhraseFigmaBorder,
            pageChipCloseIcon: P.dotPhraseNeutral,
            pageChipUnderline: P.white,
            cardBorder: P.dotPhraseFigmaBorder,
            controlBg: P.black,
            controlBgMuted: P.dotPhraseFigmaSearchBg,
            controlBorder: P.dotPhraseFigmaBorder,
            primaryActionBg: P.primary,
            primaryActionHover: P.dotPhrasePrimary,
            primaryActionText: P.white,
            tableHeaderBg: P.dotPhraseFigmaPanel,
            tableText: P.dotPhraseFigmaBodyText,
            phraseLinkText: '#2A6EFF',
            editChipBg: P.dotPhraseFigmaEditBg,
            editChipText: P.dotPhraseFigmaEditText,
            deleteChipBg: P.dotPhraseFigmaDeleteBg,
            deleteChipText: P.dotPhraseFigmaDeleteText,
            emptyText: P.dotPhraseNeutral,
            drawerBackdrop: 'rgba(0,0,0,0.7)',
            drawerPanelBg: P.dotPhraseFigmaPanel,
            drawerSectionBg: P.dotPhraseFigmaModalSection,
            drawerBorder: P.dotPhraseFigmaBorder,
            drawerTitleText: P.dotPhraseFigmaBodyText,
            drawerBodyText: P.dotPhraseFigmaBodyText,
            drawerLabelText: P.dotPhraseFigmaBodyText,
            drawerHintText: P.dotPhraseNeutral,
            drawerSelectBg: P.dotPhraseFigmaSearchBg,
            drawerInputBg: P.dotPhraseFigmaPanel,
            drawerEditPreviewBg: P.dotPhraseFigmaModalSection,
            insertTagBg: P.dotPhraseFigmaInsertTagBg,
            insertTagText: P.dotPhraseFigmaBodyText,
            cancelAction: P.errorAccentStrong,
            searchPlaceholderText: P.dotPhraseFigmaBodyText,
            clear: 'transparent',
            confirmDialogBg: P.dotPhraseFigmaPanel,
            confirmDialogSectionBg: P.dotPhraseFigmaModalSection,
            confirmDialogText: P.dotPhraseFigmaBodyText,
            confirmDialogCancelText: P.white,
            actionMenuBg: P.dotPhraseFigmaPanel,
            actionMenuBorder: P.dotPhraseFigmaBorder,
            actionMenuText: P.white,
            deleteAlertBg: '#5F2120',
            deleteAlertIcon: P.errorAccentStrong,
            deleteConfirmBg: P.errorAccentStrong,
            deleteConfirmText: P.white,
            dialogCancelBg: P.inputBgDark,
            dialogCancelText: P.white,
            successToastBg: P.gridHeaderDark,
            successToastAccent: '#4CAF50',
            successToastText: P.white,
            successToastShadow: P.successToastShadow,
            libChipShadow: P.dotPhraseFigmaChipShadow,
            libCardBg: P.dotPhraseFigmaPanel,
            libCardHeaderBg: P.dotPhraseFigmaModalSection,
            libCardHeaderText: P.dotPhraseFigmaBodyText,
            libCardHeaderDiamond: P.dotPhraseFigmaBodyText,
            libRadioColor: P.dotPhraseFigmaMain,
            libRadioText: P.dotPhraseFigmaBodyText,
            libRadioSubtitle: P.dotPhraseFigmaRadioSubtitleDark,
            libTableRowBg: P.black,
            libPhraseLink: P.dotPhraseFigmaMain,
            libMenuHoverBg: P.primaryButtonBlue,
            libMenuShadow: P.dotPhraseFigmaMenuShadowDark,
            libInputBg: P.dotPhraseFigmaPanel,
            libDrawerRequiredMark: P.errorSoftOnDark,
            libAddButtonDisabledBg: P.uploadButtonBg,
        };

    const rolesColors = mode === 'light'
        ? {
            pageChipBg: P.gridHeaderLight,
            pageChipText: P.primary,
            pageChipUnderline: P.primary,
            cardBorder: P.stroke,
            cardBg: P.white,
            formShellBg: P.gridHeaderLight,
            searchBg: P.white,
            searchBorder: P.stroke,
            searchText: P.black,
            tableHeaderBg: P.gridHeaderLight,
            tableHeaderText: P.black,
            tableRowText: P.black,
            rowBorder: P.stroke,
            primaryActionBg: P.primary,
            primaryActionHover: P.primaryHover,
            primaryActionText: P.white,
            cancelActionBg: P.stroke,
            cancelActionText: P.rolesActionMenuText,
            actionMenuBg: P.white,
            actionMenuBorder: P.stroke,
            actionMenuText: P.rolesActionMenuText,
            actionMenuShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
            switchTrack: P.rolesSwitchTrack,
            switchTrackOpacity: P.rolesSwitchTrackOpacity,
            switchThumbChecked: P.primary,
            switchThumbUnchecked: P.white,
            switchThumbShadow: P.rolesSwitchThumbShadow,
            labelText: P.labelMuted,
            requiredMark: P.danger,
            inputBg: P.white,
            inputBorder: P.rolesInputBorder,
            inputPlaceholder: P.labelMuted,
            permissionRowBg: P.gridHeaderLight,
            permissionRowAltBg: P.gridHeaderLight,
            permissionHeaderBg: P.white,
            permissionDivider: P.stroke,
            warningAlertBg: P.rolesWarningAlertBg,
            warningAlertText: P.rolesWarningAlertText,
            warningAlertIcon: P.rolesWarningAlertIcon,
            dialogFooterBg: P.gridHeaderLight,
            dialogBorder: P.stroke,
            successAlertBg: P.gridHeaderLight,
            successAlertText: P.rolesSuccessAlertText,
            successAlertAccent: P.rolesSuccessAlertAccent,
            successAlertShadow: P.rolesSuccessAlertShadow,
        }
        : {
            pageChipBg: P.gridHeaderDark,
            pageChipText: P.white,
            pageChipUnderline: P.white,
            cardBorder: P.inputBgDark,
            cardBg: P.black,
            formShellBg: P.gridHeaderDark,
            searchBg: P.black,
            searchBorder: P.inputBgDark,
            searchText: P.white,
            tableHeaderBg: P.gridHeaderDark,
            tableHeaderText: P.white,
            tableRowText: P.white,
            rowBorder: P.inputBgDark,
            primaryActionBg: P.primary,
            primaryActionHover: P.primaryHover,
            primaryActionText: P.white,
            cancelActionBg: P.inputBgDark,
            cancelActionText: P.white,
            actionMenuBg: P.menuBgDark,
            actionMenuBorder: P.inputBgDark,
            actionMenuText: P.white,
            actionMenuShadow: '0px 4px 16px rgba(0, 0, 0, 0.35)',
            switchTrack: P.rolesSwitchTrackDark,
            switchTrackOpacity: P.rolesSwitchTrackOpacity,
            switchThumbChecked: P.primary,
            switchThumbUnchecked: P.white,
            switchThumbShadow: P.rolesSwitchThumbShadow,
            labelText: P.mutedTextOnDark,
            requiredMark: P.errorSoftOnDark,
            inputBg: P.black,
            inputBorder: P.inputBgDark,
            inputPlaceholder: P.placeholderDark,
            permissionRowBg: P.gridHeaderDark,
            permissionRowAltBg: P.gridHeaderDark,
            permissionHeaderBg: P.black,
            permissionDivider: P.inputBgDark,
            warningAlertBg: P.rolesWarningAlertBg,
            warningAlertText: P.rolesWarningAlertText,
            warningAlertIcon: P.rolesWarningAlertIcon,
            dialogFooterBg: P.gridHeaderDark,
            dialogBorder: P.inputBgDark,
            successAlertBg: P.gridHeaderDark,
            successAlertText: P.white,
            successAlertAccent: P.successIconStrong,
            successAlertShadow: P.rolesSuccessAlertShadow,
        };

    const providerQueueColors = mode === 'light'
        ? {
            tileSelectedBg: P.primary,
            tileSelectedText: P.white,
            tileSelectedLabel: P.pqTileSelectedLabel,
            tileUnselectedBg: P.white,
            tileUnselectedBorder: P.stroke,
            tileLabelColor: P.mutedTextFooter,
            tileValueColor: P.black,
            tableHeaderBg: P.gridHeaderLight,
            tableHeaderText: P.mutedTextFooter,
            tableRowBorder: P.stroke,
            caseLinkColor: P.pqCaseLinkColor,
            childGridBg: P.lightRowHover,
            childHeaderBg: P.gridHeaderLight,
            statusInProgressBg: P.pqStatusInProgressBg,
            statusInProgressText: P.pqStatusInProgressText,
            statusNotStartedBg: P.pqStatusNotStartedBg,
            statusNotStartedText: P.pqStatusNotStartedText,
            statusNewBg: P.pqFlagSuppBg,
            statusNewText: P.pqFlagSuppColor,
            flagPriorityBg: P.pqFlagPriorityBg,
            flagPriorityColor: P.pqFlagPriorityColor,
            flagClcwBg: P.pqFlagClcwBg,
            flagClcwColor: P.pqFlagClcwColor,
            flagSuppBg: P.pqFlagSuppBg,
            flagSuppColor: P.pqFlagSuppColor,
            flagBellBg: P.pqFlagBellBg,
            flagBellBorder: P.pqFlagBellBorder,
            actionMenuBg: P.white,
            actionMenuBorder: P.lightBorderPrimary,
            actionMenuShadow: P.pqActionMenuShadow,
            actionMenuItemText: P.textPrimaryDark,
            actionMenuItemActiveBg: P.pqActionMenuItemActiveBg,
            actionMenuItemActiveText: P.primary,
            actionMenuItemIconColor: P.pqActionMenuIconColor,
            dropdownBorder: P.labelMuted,
            lockIconBg: P.gridHeaderLight,
            lockIconBorder: P.stroke,
            paginationText: P.mutedTextFooter,
            paginationActiveBg: P.primary,
            paginationActiveText: P.white,
            paginationBorder: P.primary,
            modalOverlay: P.pqModalOverlay,
            modalHeaderBg: P.gridHeaderLight,
            modalBorder: P.stroke,
            modalNoBg: P.stroke,
            modalNoText: P.neutralButtonTextMedium,
            modalYesBg: P.primary,
            modalYesText: P.white,
            modalBodyText: P.black,
            modalLabelText: P.labelMuted,
            modalInputBg: P.white,
            modalInputBorder: P.pqModalInputBorderLight,
            childMutedText: P.pqChildRowMutedText,
            actionTriggerActiveBg: P.pqActionTriggerActiveBgLight,
            alertBg: P.gridHeaderLight,
            alertAccent: P.successTextMedium,
            alertText: P.successAlertTextDeep,
            alertShadow: P.successToastShadow,
            autoQueueTabActive: P.primary,
            autoQueueTabInactive: P.wqTabInactiveText,
            exportBtnBg: P.primary,
            exportBtnText: P.white,
        }
        : {
            tileSelectedBg: P.mainBase,
            tileSelectedText: P.mainBaseText,
            tileSelectedLabel: P.pqTileSelectedLabel,
            tileUnselectedBg: P.black,
            tileUnselectedBorder: P.strokeDark,
            tileLabelColor: P.mutedTextOnDark,
            tileValueColor: P.white,
            tableHeaderBg: P.gridHeaderDark,
            tableHeaderText: P.mutedTextOnDark,
            tableRowBorder: P.strokeDark,
            caseLinkColor: P.mainBase,
            childGridBg: P.surfaceDark,
            childHeaderBg: P.gridHeaderDark,
            statusInProgressBg: P.pqStatusInProgressBg,
            statusInProgressText: P.pqStatusInProgressText,
            statusNotStartedBg: P.pqStatusNotStartedBg,
            statusNotStartedText: P.pqStatusNotStartedText,
            statusNewBg: P.pqFlagSuppBg,
            statusNewText: P.pqFlagSuppColor,
            flagPriorityBg: P.pqFlagPriorityBg,
            flagPriorityColor: P.pqFlagPriorityColor,
            flagClcwBg: P.pqFlagClcwBg,
            flagClcwColor: P.pqFlagClcwColor,
            flagSuppBg: P.pqFlagSuppBg,
            flagSuppColor: P.pqFlagSuppColor,
            flagBellBg: P.pqFlagBellBg,
            flagBellBorder: P.pqFlagBellBorder,
            actionMenuBg: P.menuBgDark,
            actionMenuBorder: P.strokeDark,
            actionMenuShadow: P.pqActionMenuShadow,
            actionMenuItemText: P.white,
            actionMenuItemActiveBg: P.selectedMenuDark,
            actionMenuItemActiveText: P.mainBase,
            actionMenuItemIconColor: P.pqActionMenuIconColor,
            dropdownBorder: P.strokeDark,
            lockIconBg: P.gridHeaderDark,
            lockIconBorder: P.strokeDark,
            paginationText: P.mutedTextOnDark,
            paginationActiveBg: P.mainBase,
            paginationActiveText: P.mainBaseText,
            paginationBorder: P.mainBase,
            modalOverlay: P.pqModalOverlay,
            modalHeaderBg: P.gridHeaderDark,
            modalBorder: P.strokeDark,
            modalNoBg: P.inputBgDark,
            modalNoText: P.white,
            modalYesBg: P.mainBase,
            modalYesText: P.mainBaseText,
            modalBodyText: P.white,
            modalLabelText: P.mutedTextOnDark,
            modalInputBg: P.surfaceDark,
            modalInputBorder: P.strokeDark,
            childMutedText: P.mutedTextOnDark,
            actionTriggerActiveBg: P.gridHeaderDark,
            alertBg: P.gridHeaderDark,
            alertAccent: P.successTextMedium,
            alertText: P.success,
            alertShadow: P.successToastShadow,
            autoQueueTabActive: P.mainBase,
            autoQueueTabInactive: P.mutedTextOnDark,
            exportBtnBg: P.mainBase,
            exportBtnText: P.mainBaseText,
        };

    const packageReviewColors = mode === 'light'
        ? {
            backdrop: P.dotPhraseBackdrop,
            panelBg: P.white,
            panelBorder: P.stroke,
            sectionBg: P.gridHeaderLight,
            titleText: P.black,
            labelText: P.labelMuted,
            valueText: P.black,
            linkText: P.dotPhrasePrimary,
            selectBorder: P.labelMuted,
            selectFocusBorder: P.primary,
            selectBg: P.white,
            placeholderText: P.labelMuted,
            progressTrack: P.packageReviewProgressTrack,
            progressComplete: P.success,
            progressActive: P.dotPhrasePrimary,
            successText: P.dotPhraseEditText,
            dangerText: P.dotPhraseDeleteText,
            successBg: P.dotPhraseEditBg,
            dangerBg: P.dotPhraseDeleteBg,
            primaryActionBg: P.primary,
            primaryActionText: P.white,
        }
        : {
            backdrop: 'rgba(0,0,0,0.7)',
            panelBg: '#1E1E1E',
            panelBorder: P.emptyInputBorderDark,
            sectionBg: P.gridHeaderDark,
            titleText: P.white,
            labelText: '#B0B0B0',
            valueText: '#E2E2E2',
            linkText: P.dotPhraseFigmaMain,
            selectBorder: '#A0A0A0',
            selectFocusBorder: P.dotPhraseFigmaMain,
            selectBg: P.surfaceDark,
            placeholderText: '#8A8A8A',
            progressTrack: '#4A4A4A',
            progressComplete: P.success,
            progressActive: P.dotPhraseFigmaMain,
            successText: P.accordionCptOnDark,
            dangerText: P.errorSoftOnDark,
            successBg: P.accordionCptDarkAlpha,
            dangerBg: P.dangerBgDarkAlpha,
            primaryActionBg: P.dotPhraseFigmaMain,
            primaryActionText: P.dotPhraseFigmaMainText,
        };

    const workQueuesColors = mode === 'light'
        ? {
            chipBg: P.gridHeaderLight,
            chipText: P.primary,
            tabActiveBg: P.primary,
            tabActiveText: P.white,
            tabInactiveBg: P.white,
            tabInactiveBorder: P.stroke,
            tabInactiveText: P.wqTabInactiveText,
            emptyText: P.mutedTextFooter,
        }
        : {
            chipBg: P.gridHeaderDark,
            chipText: P.mainBase,
            tabActiveBg: P.mainBase,
            tabActiveText: P.mainBaseText,
            tabInactiveBg: P.black,
            tabInactiveBorder: P.strokeDark,
            tabInactiveText: P.mutedTextOnDark,
            emptyText: P.mutedTextOnDark,
        };

    const base = createTheme({
        palette: {
            mode,
            primary: {
                main: P.primary,
                contrastText: P.white,
            },
            error: {
                main: P.danger,
            },
            success: {
                main: P.success,
            },
            info: {
                main: P.link,
            },
            ...(mode === 'light'
                ? {
                    background: {
                        default: '#f4f6f8',
                        paper: '#fff',
                        gridHeader: P.gridHeaderLight,
                    },
                }
                : {
                    background: {
                        default: '#121212',
                        paper: '#1e1e1e',
                        gridHeader: '#121212',
                    },
                }),
        },
        typography: {
            fontFamily: baseFont,
        },
        custom: {
            typeScale: {
                extraLarge: { heading: 36, body: 24 },
                large: { heading: 18, body: 16 },
                medium: { heading: 16, body: 14 },
                fontFamily: baseFont,
                openSans: "var(--font-open-sans)",
            },
            colors: {
                surface: P.white,
                gridHeaderBg: P.gridHeaderLight,
                gridHeaderBgDark: P.gridHeaderDark,
                stroke: P.stroke,
                strokeDark: P.strokeDark,
                cardBgDark: P.cardBgDark,
                mutedText: '#6B7280',
                mutedTextDark: '#9CA3AF',
                mutedTextFooter: P.mutedTextFooter,
                labelMuted: P.labelMuted,
                labelMutedOnDark: P.mutedTextOnDark,
                iconMutedOnDark: P.iconMutedOnDark,
                primaryOnDark: P.primaryOnDark,
                primaryHover: P.primaryHover,
                buttonHover: P.buttonHover,
                buttonDisabled: P.buttonDisabled,
                primaryOnDarkVariant: P.primaryOnDarkVariant,
                accentGradient: { start: P.primary, end: P.accentGradientEnd },
                tintedPrimary: {
                    subtle: P.tintedPrimarySubtle,
                    soft: P.tintedPrimarySoft,
                    medium: P.tintedPrimaryMedium,
                    subtleDark: P.tintedPrimaryOnDarkSubtle,
                    softDark: P.tintedPrimaryOnDarkSoft,
                    mediumDark: P.tintedPrimaryOnDarkMedium,
                },
                searchInputBg: { light: P.searchInputBgLight, dark: P.searchInputBgDark },
                link: P.link,
                danger: P.danger,
                dangerText: P.dangerText,
                success: P.success,
                inputBgLight: '#ECECEC',
                inputBgDark: P.inputBgDark,
                surfaceDark: P.surfaceDark,
                inputBorderLight: '#BDBDBD',
                neutralBorderLight: '#C4C4C4',
                mutedTextLightOpacity: P.stroke,
                blackColorCode: P.black,
                accordion: {
                    border: '#E0E0E0',
                    hoverLight: 'rgba(0,0,0,0.04)',
                    hoverDark: 'rgba(255,255,255,0.04)',
                    iconLight: '#666',
                    iconDark: '#fff',
                    titleLight: '#333',
                    titleDark: '#fff',
                },
                tabs: {
                    disabledColorDark: "#ccc",
                    disabledColorLight: "#666",
                    borderColorDark: "divider",
                    borderColorLight: "#787878",
                    textColorDark: P.primary,
                    textColorLight: "#4D8AF0",
                    rootColorLight: "#fff",
                    rootColorDark: "inherit"
                },
                providerLayout: providerLayoutColors,
                roles: rolesColors,
                dotPhrase: dotPhraseColors,
                statsGrid: {
                    cardBorderLight: P.stroke,
                    cardBorderDark: P.inputBgDark,
                    cardBgLight: P.white,
                    cardBgDark: P.black,
                    selectedBgLight: P.mainBase20,
                    selectedBgDark: P.mainBase,
                    selectedTextLight: P.black,
                    selectedTextDark: P.white,
                    labelLight: P.labelMuted,
                    labelDark: P.white,
                    valueLight: P.black,
                    valueDark: P.white,
                    hoverLight: '#eaeaea',
                    hoverDark: P.surfaceDark,
                    skeletonBgDark: P.black,
                },
                autoQueue: {
                    buttonBgLight: P.autoQueueButtonBg,
                    buttonBgDark: P.mainBase,
                    buttonTextLight: P.white,
                    buttonTextDark: P.mainBaseText,
                    titleBarBgLight: P.white,
                    titleBarBgDark: P.black,
                    tabActiveLight: P.autoQueueButtonBg,
                    tabActiveDark: P.mainBase,
                    tabInactiveDark: P.white,
                    searchSectionBgLight: P.gridHeaderLight,
                    searchSectionBgDark: P.gridHeaderDark,
                    searchControlBgLight: P.searchInputBgLight,
                    searchControlBgDark: P.searchInputBgDark,
                },
                providerQueue: providerQueueColors,
                packageReview: packageReviewColors,
                workQueues: workQueuesColors,
                lightBorderPrimary: P.lightBorderPrimary,
                lightHoverOverlay: P.lightHoverOverlay,
                lightButtonHover: P.lightButtonHover,
                lightNeutralSurface: P.lightNeutralSurface,
                popoverDarkBg: P.popoverDarkBg,
                popoverLightBg: P.popoverLightBg,
                darkButtonBgSoft: P.darkButtonBgSoft,
                positiveActionGreen: P.positiveActionGreen,
                softDangerSurface: P.softDangerSurface,
                successAccentDark: P.successAccentDark,
                successSurfaceButtonLight: P.successSurfaceButtonLight,
                selectedMenuDark: P.selectedMenuDark,
                selectedMenuLight: P.selectedMenuLight,
                modalBackdrop: P.modalBackdrop,
            },
            text: {
                chip: { fontSize: 12, fontWeight: 700, color: P.primary, bg: P.gridHeaderLight },
            },
            buttons: {
                sizes: {
                    large: { height: 40, radius: 20, fontSize: 16 },
                    medium: { height: 32, radius: 15, fontSize: 14 },
                },
                variants: {
                    primary: { bg: P.primary, color: P.white },
                    neutral: { bg: '#6A6A6A', color: P.white },
                    esrReviewed: { bg: P.esrReviewedButtonBg, color: P.white, radius: 10, hoverBg: P.esrReviewedButtonHover },
                    markVip: { bg: P.markVipButtonBg, color: P.primary, border: P.markVipButtonBorder, radius: 10, hoverBg: P.markVipButtonHover },
                    cancelFilled: { bg: P.cancelFilledButtonBg, color: P.neutralTextStrong, radius: 10, hoverBg: P.cancelFilledButtonHover },
                    warning: { bg: '#FFF1B8', color: P.warningText },
                    success: { bg: '#C5E9D2', color: P.success },
                    danger: { bg: P.dangerBgLight, color: P.dangerText },
                    view: { bg: mode === 'light' ? '#D9D9D9' : P.inputBgDark, color: mode === 'light' ? P.black : P.white },
                    edit: { bg: mode === 'light' ? '#D1FADF' : P.accordionCptDarkAlpha, color: mode === 'light' ? P.success : P.accordionCptOnDark },
                    disabled: { bg: "#C0C0C0", color: "#666", bgDark: "rgba(255,255,255,0.12)", colorDark: "rgba(255,255,255,0.3)" },
                    cancel: { bg: "transparent", color: P.dangerText },
                    result: { bg: "#b1e5b1ff", color: "#1ecb1eff", onHoverBg: "#7DD87D" }
                },
            },
            select: {
                bgColorLight: "#fff",
                bgColorDark: "#2a2a2a",
            },
            readonlyField: {
                bgColorLight: "#f5f5f5",
                bgColorDark: "#2a2a2a",
                textFillColorLight: "#333",
                textFillColorDark: "#ccc"
            },
            qaReview: {
                headerTitleFontSize: 28,
                subHeaderTitleFontSize: 21,
                tabFontSize: 16,
                trackerRowHeight: 52,
                changeHistoryRowHeight: 72,
                actionWidths: {
                    view: 96,
                    revise: 148,
                    hold: 126,
                    rejection: 136,
                    approve: 78,
                    sendToCmo: 122,
                    sendToVa: 110,
                    modify: 78,
                    remove: 78,
                },
            },
            responsive: {
                layout: {
                    sectionPadding: { xs: 1.5, sm: 2 },
                    fullWidthOnMobile: { xs: '100%', sm: 'auto' },
                    drawerWidth: { xs: '100%', sm: 450 },
                    footerClearance: { xs: '120px', sm: '96px', md: '80px' },
                },
                tables: {
                    minWidth: {
                        compact: 650,
                        default: 880,
                        wide: 1024,
                    },
                },
                buttons: {
                    primaryPaddingX: { xs: 2, sm: 1.25 },
                    minWidth: {
                        sm: 140,
                    },
                },
            },
            layout: {
                dialog: {
                    width: 588,
                    borderRadius: 10,
                    headerHeight: 60,
                },
                drawer: {
                    controlMinHeight: 48,
                    multilineMinHeight: 150,
                    borderRadius: 10,
                    labelFontSize: 12,
                },
                searchFacility: {
                    controlHeight: 45,
                    collapsedHeight: 48,
                    sectionPaddingY: 14,
                    hatChevronTop: 7,
                    hatChevronRight: 10,
                    contentPaddingTop: 24,
                    contentPaddingBottom: 16,
                },
                autoQueue: {
                    expandIconSize: P.autoQueueExpandIconSize,
                    checkboxSize: P.autoQueueCheckboxSize,
                    detailPanelGapTop: P.autoQueueDetailPanelGapTop,
                    detailPanelInsetX: P.autoQueueDetailPanelInsetX,
                    detailPanelInsetBottom: P.autoQueueDetailPanelInsetBottom,
                    caseDetailsSectionGap: P.autoQueueCaseDetailsSectionGap,
                },
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'all 0.3s ease',
                    },
                },
            },
        },
    });
 
    return createTheme(base, {
        typography: {
            fontFamily: baseFont,
            h6: {
                fontSize: 16,
                fontWeight: 700,
                [base.breakpoints.up('md')]: { fontSize: 14 },
                [base.breakpoints.up('lg')]: { fontSize: 16 },
                [base.breakpoints.up('xl')]: { fontSize: 18 },
            },
            subtitle2: {
                fontSize: 14,
                fontWeight: 700,
                color: base.palette.text.primary,
                [base.breakpoints.up('md')]: { fontSize: 14 },
                [base.breakpoints.up('lg')]: { fontSize: 14 },
                [base.breakpoints.up('xl')]: { fontSize: 16 },
            },
            body1: {
                fontSize: 14,
                fontWeight: 400,
                color: base.palette.text.primary,
                [base.breakpoints.up('md')]: { fontSize: 14 },
                [base.breakpoints.up('lg')]: { fontSize: 14 },
                [base.breakpoints.up('xl')]: { fontSize: 16 },
            },
            body2: {
                fontSize: 14,
                fontWeight: 400,
                color: THEME_PRIMITIVES.labelMuted,
                [base.breakpoints.up('md')]: { fontSize: 14 },
                [base.breakpoints.up('lg')]: { fontSize: 14 },
                [base.breakpoints.up('xl')]: { fontSize: 16 },
            },
            caption: {
                fontSize: 12,
                fontWeight: 700,
                color: base.palette.text.primary,
                [base.breakpoints.up('md')]: { fontSize: 12 },
                [base.breakpoints.up('lg')]: { fontSize: 12 },
                [base.breakpoints.up('xl')]: { fontSize: 12 },
            },
        },
    });
};
