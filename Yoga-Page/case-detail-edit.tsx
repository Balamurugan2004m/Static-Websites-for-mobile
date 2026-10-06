import * as React from "react";
import { Box, FormControl, MenuItem, Select, TextField, Popper, Typography, useTheme, PopperProps, Skeleton, Checkbox, IconButton } from "@mui/material";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import { alpha, styled } from "@mui/material/styles";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { Theme } from "@mui/material";
import type { FormDataType, UIType, AlertsInfo, SidebarType } from "./case-details";
import { Input } from "../../../ui/input";
import AppRadioGroup from "../../../ui/radio-group";
import { getAllStates } from "../../../services/provider";
import { getAllSpecialAccomdationRequest, type DbqVaro } from "../../../services/case-details";
import type { SelectChangeEvent } from "@mui/material/Select";
import ReusableDrawer from "../../../ui/reusable-drawer";
import ConfirmationModal from "../../../ui/confirmation-modal";
import ArmyImg from "../../../assets/Army.svg";
import AirForceImg from "../../../assets/AirForce.svg";
import CoastGuardImg from "../../../assets/coastguard.svg";
import MarineImg from "../../../assets/marinecorps.svg";
import NavyImg from "../../../assets/Navy.svg";
import { THEME_PRIMITIVES } from "../../../theme";
const P = THEME_PRIMITIVES;

type Props = {
    theme: Theme;
    isDark: boolean;
    UI: UIType;
    headerTitle?: string;
    headerTitleAddon?: React.ReactNode;
    headerActions?: React.ReactNode;
    profileUrl: string | null;
    formData: FormDataType;
    status?: string;
    varo?: DbqVaro;
    sidebar: SidebarType;
    handleFieldChange: (field: string, value: string) => void;
    eodDate: string;
    radDate: string;
    branchOfService: string;
    veteranAccommodations: string[];
    setVeteranAccommodations: (v: string[]) => void;
    setVeteranAccommodationsTouched: (v: boolean) => void;
    waiver: string;
    setWaiver: (v: string) => void;
    smsOptIn: string;
    setSmsOptIn: (v: string) => void;
    telehealth: string;
    setTelehealth: (v: string) => void;
    excessMileage: string;
    setExcessMileage: (v: string) => void;
    alerts?: AlertsInfo;
    onExcessMileageSave: (consent: string, reason: string, method: string) => void;
    prioritySpecialIssues: { contentionName: string; specialIssue: string;}[];
};

const normalizeYesNo = (v: string) => {
    const t = (v ?? "").trim();
    return t === "Yes" || t === "No" ? t : "";
};

const fmtAddress = (o?: { addressLine1?: string; addressLine2?: string; addressLine3?: string }) => {
    if (!o) return "";
    const full = [o.addressLine1, o.addressLine2, o.addressLine3].filter(Boolean).join(", ");
    if (!full) return "";
    const parts = full.split(",");
    if (parts.length <= 1) return full;
    const last = parts.pop()!.trim();
    const first = parts.join(",");
    return `${first}, ${last}`;
};

const StyledAutocompletePopper = styled(Popper)(({ theme }) => ({
    [`& .${autocompleteClasses.paper}`]: {
        marginTop: 4,
        backgroundColor: theme.palette.background.paper,
        maxHeight: 320,
        borderRadius: 10,
        boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
        [`& .${autocompleteClasses.listbox}`]: { paddingTop: 0, paddingBottom: 0 },
        [`& .${autocompleteClasses.option}`]: {
            fontSize: 14,
            borderBottom: `1px solid ${theme.palette.divider}`,
            lineHeight: 1.4,
            minHeight: "32px",
            alignItems: "center",
            "&:last-of-type": { borderBottom: "none" },
            "&[aria-selected='true']": { backgroundColor: `${theme.palette.grey[300]} !important` },
            "&.Mui-focused": { backgroundColor: theme.palette.grey[300] },
        },
    },
}));

type StateSelectProps = {
    value: string;
    onChange: (newVal: string) => void;
    options: string[];
    label: string;
    theme: Theme;
    FS: { xs: number; md: number; xl: number };
};

function StateSelect({ value, onChange, options, label, theme, FS }: StateSelectProps) {
    const isDark = theme.palette.mode === "dark";
    const lightFieldBg = theme.custom?.colors?.gridHeaderBg ?? theme.palette.background.paper;
    const darkFieldBg = theme.palette.grey[700];
    const dividerColor = theme.palette.divider;
    return (
        <Autocomplete
            value={value || ""}
            onChange={(_, newVal) => onChange(newVal || "")}
            options={options}
            disablePortal
            autoHighlight
            includeInputInList
            clearOnBlur={false}
            handleHomeEndKeys
            isOptionEqualToValue={(opt, val) => opt === val}
            filterOptions={(opts, state) => {
                const input = state.inputValue?.toLowerCase() || "";
                if (!input) return opts;
                return opts.filter((o) => o.toLowerCase().includes(input));
            }}
            PopperComponent={StyledAutocompletePopper as React.ComponentType<PopperProps>}
            size="small"
            sx={{
                "& .MuiOutlinedInput-root": {
                    height: 32,
                    borderRadius: "10px",
                    backgroundColor: isDark ? P.black: lightFieldBg,
                    paddingRight: "32px !important",
                    [`& .MuiAutocomplete-input`]: {
                        padding: "0 8px !important",
                        fontSize: FS,
                        lineHeight: 1.4,
                        color: theme.palette.text.primary,
                    },
                    [`& .MuiOutlinedInput-notchedOutline`]: {
                        border: isDark
                            ?`1px solid ${P.labelMuted}`
                            : `1px solid ${dividerColor}`,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: dividerColor,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: dividerColor,
                        borderWidth: "1px",
                    },
                },
                "& .MuiInputBase-root": { fontSize: FS, lineHeight: 1.4 },
                "& .MuiSvgIcon-root": { color: theme.palette.text.primary },
                width: "100%",
                maxWidth: { xs: "100%", sm: 320 },
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={label}
                    inputProps={{
                        ...params.inputProps,
                        style: { fontSize: "inherit", lineHeight: 1.4, padding: 0, color: theme.palette.text.primary },
                    }}
                    InputProps={{
                        ...params.InputProps,
                        sx: {
                            height: 32,
                            borderRadius: "10px",
                            backgroundColor: isDark ? darkFieldBg : lightFieldBg,
                            paddingRight: "32px !important",
                            [`& .MuiOutlinedInput-notchedOutline`]: {
                                borderColor: theme.palette.divider,
                            },
                            [`& .${autocompleteClasses.input}`]: {
                                padding: "0 8px !important",
                                fontSize: FS,
                                lineHeight: 1.4,
                                color: theme.palette.text.primary,
                            },
                        },
                    }}
                />
            )}
        />
    );
}

type AccommodationsSelectProps = {
    theme: Theme;
    FS: { xs: number; md: number; xl: number };
    value: string[];
    options: string[];
    onChange: (e: SelectChangeEvent<string[]>) => void;
    cardBg: string;
};

function AccommodationsSelect({ theme, FS, value, options, onChange, cardBg }: AccommodationsSelectProps) {
    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    const [menuWidth, setMenuWidth] = React.useState<number | null>(null);
    const isDark = theme.palette.mode === "dark";
    const dividerColor = theme.palette.divider;
    const paperBg = theme.palette.background.paper;
    const mutedTextColor =
        theme.palette.mode === "dark"
            ? theme.custom?.colors?.mutedTextDark ?? theme.palette.text.secondary
            : theme.custom?.colors?.mutedText ?? theme.palette.text.secondary;

    const handleOpen = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setMenuWidth(rect.width);
        }
    };

    return (
        <FormControl size="small" sx={{ width: "100%", maxWidth: { xs: "100%", sm: 260 } }} ref={triggerRef}>
            <Select
                multiple
                onOpen={handleOpen}
                value={value}
                onChange={onChange}
                displayEmpty
                renderValue={() => (
                    <Typography
                        variant="body2"
                        sx={{
                            color: mutedTextColor,
                            fontSize: FS,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                        }}
                    >
                        Select Accommodations
                    </Typography>
                )}
                sx={{
                    width: "100%",
                    minHeight: 32,
                    height: "auto",
                    "& .MuiSelect-select": {
                        color: theme.palette.text.primary,
                        py: "6px",
                        px: 1,
                        fontSize: FS,
                        lineHeight: 1.4,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: dividerColor,
                    },
                    background: isDark ? P.inputBgDark : cardBg,
                    borderRadius: "5px",
                    pointerEvents: "auto",
                }}
                MenuProps={{
                    keepMounted: true,
                    disablePortal: false,
                    disableScrollLock: true,
                    MenuListProps: {
                        sx: {
                            py: 0,
                        },
                    },
                    PaperProps: {
                        sx: {
                            mt: 0.5,
                            backgroundColor: paperBg,
                            maxHeight: 320,
                            boxSizing: "border-box",
                            width: menuWidth ? `${menuWidth}px` : "auto",
                            minWidth: menuWidth ? `${menuWidth}px` : "auto",
                            "& .MuiList-root": {
                                py: 0,
                            },
                            "& .MuiMenuItem-root": {
                                fontSize: 13,
                                borderBottom: `1px solid ${dividerColor}`,
                                "&:last-of-type": { borderBottom: "none" },
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                lineHeight: 1.4,
                            },
                        },
                    },
                }}
            >
                {options.map((name) => {
                    const isChecked = value.includes(name);
                    return (
                        <MenuItem
                            key={name}
                            value={name}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                py: 1,
                                px: 1.5,
                                color: theme.palette.text.primary,
                                backgroundColor: "transparent",
                                "&.Mui-selected": {
                                    backgroundColor: "transparent",
                                    color: theme.palette.text.primary,
                                },
                                "&:hover, &.Mui-selected:hover": {
                                    backgroundColor: isDark ? alpha(P.primary, 0.25) : "#EFF6FF",
                                    color: isDark ? P.white : "#244794",
                                    "& .MuiTypography-root": {
                                        color: isDark ? P.white : "#244794",
                                    },
                                },
                            }}
                        >
                            <Checkbox
                                checked={isChecked}
                                size="small"
                                sx={{
                                    p: 0,
                                    color: isDark ? P.lightMutedText : theme.palette.grey[400],
                                    "&.Mui-checked": {
                                        color: isDark ? P.primary : "#244794",
                                    },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 400,
                                    lineHeight: 1.4,
                                    color: "inherit",
                                }}
                            >
                                {name}
                            </Typography>
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
export default function CaseDetailsEdit({
    theme,
    isDark,
    UI,
    headerTitle,
    headerTitleAddon,
    headerActions,
    profileUrl,
    formData,
    status,
    sidebar,
    varo,
    handleFieldChange,
    eodDate,
    radDate,
    branchOfService,
    veteranAccommodations,
    setVeteranAccommodations,
    setVeteranAccommodationsTouched,
    waiver,
    setWaiver,
    smsOptIn,
    setSmsOptIn,
    telehealth,
    setTelehealth,
    excessMileage,
    setExcessMileage,
    onExcessMileageSave,
    prioritySpecialIssues,
}: Props) {
    const toScale = (v: number) => ({ xs: v, md: v, xl: v } as const);
    const bodySize = Number(theme.typography.body1.fontSize) || 14;
    const titleSize = Number(theme.typography.h6.fontSize) || 16;
    const labelSize = Number(theme.typography.subtitle2.fontSize) || 14;
    const FS = toScale(bodySize);
    const TITLE_FS = toScale(titleSize);
    const cardBg = isDark ? theme.palette.background.paper : theme.custom?.colors.gridHeaderBg ?? theme.palette.background.paper;
    const cardBorderColor = isDark ? P.inputBgDark : theme.custom?.colors.stroke ?? theme.palette.divider ?? theme.palette.grey[300];
    const sectionHeaderSx = { color: isDark ? P.white : theme.palette.text.primary, fontSize: TITLE_FS, fontWeight: 700 } as const;
    const labelSx = { color: isDark ? P.white : UI.labelColor ?? theme.palette.text.secondary, fontSize: toScale(labelSize), fontWeight: 400, mb: 0.6 } as const;
    const mutedTextColor =
        theme.palette.mode === "dark" ?  P.white
        : theme.custom?.colors?.mutedText ?? theme.palette.text.secondary;
    const valueSx = {
        color: theme.palette.text.primary,
        fontSize: FS,
        fontWeight: 400,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap" as const,
        wordBreak: "break-word" as const,
        overflowWrap: "anywhere" as const,
    };
    const cardRadius = 10;
    const primaryColor = theme.palette.primary.main;
    const errorColor = theme.palette.error.main;
    const dividerColor = theme.palette.divider;
    const paperBg = theme.palette.background.paper;
    const darkBg = theme.palette.background.default;
    const white = theme.palette.common.white;
    // const grey300 = theme.palette.grey[300];
    const grey700 = theme.palette.grey[700];
    const commonCardSx = {
        backgroundColor: isDark ? P.gridHeaderDark : cardBg,
        borderRadius: `${cardRadius}px`,
        border: `1px solid ${cardBorderColor}`,
        boxShadow: "none",
        p: { xs: 1.5, sm: 2, md: 2.5 },
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
    } as const;
    const figmaRadioOptionSx = {
        mr: 2.5,
        px: 0,
        py: 0,
        borderRadius: 0,
        "& .MuiFormControlLabel-label": {
            fontSize: 14,
            color: theme.palette.text.primary,
        },
        "&:hover": {
            backgroundColor: "transparent",
        },
    } as const;
    const figmaRadioSx = {
        p: 0.25,
        mr: 0.25,
        color: isDark ? theme.palette.text.secondary : P.labelMuted,
        "&.Mui-checked": {
            color: theme.palette.primary.main,
        },
    } as const;

    const fieldWrapSx = { width: "100%", maxWidth: { xs: "100%", sm: 320 } };

    const [stateOptions, setStateOptions] = React.useState<string[]>([]);
    const [accommodationOptions, setAccommodationOptions] = React.useState<string[]>([]);

    const deceasedLabel = "Claimant is deceased";
    const doNotContactLabel = "do not contact";
    const combinedDeceasedLabel = `${deceasedLabel}, ${doNotContactLabel}`;

    const mergeSpecialAccommodations = React.useCallback((list: string[]) => {
        const normalized = list.map((s) => String(s).trim());
        const hasDeceased = normalized.some((v) => v.toLowerCase().startsWith("claimant is dece"));
        const hasDoNotContact = normalized.some((v) => v.toLowerCase().startsWith("do not contact"));
        if (hasDeceased && hasDoNotContact) {
            const filtered = normalized.filter(
                (v) =>
                    !v.toLowerCase().startsWith("claimant is dece") &&
                    !v.toLowerCase().startsWith("do not contact")
            );
            return [...filtered, combinedDeceasedLabel];
        }
        return normalized;
    }, []);

    React.useEffect(() => {
        let mounted = true;
        getAllStates()
            .then((list) => {
                const names = list
                    .map((s) => s.StateName)
                    .filter((x): x is string => !!x)
                    .sort((a, b) => a.localeCompare(b));
                if (mounted) setStateOptions(names);
            })
            .catch(() => {
                if (mounted) setStateOptions([]);
            });
        return () => {
            mounted = false;
        };
    }, []);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getAllSpecialAccomdationRequest();
                const names = (Array.isArray(data) ? data : [])
                    .filter((x) => x && (x.IsActive === undefined || x.IsActive === true))
                    .map((x) => String(x.Name ?? "").trim())
                    .filter((n) => n.length > 0);
                const merged = mergeSpecialAccommodations(names);
                const uniq = Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b));
                if (mounted) setAccommodationOptions(uniq);
            } catch {
                if (mounted) setAccommodationOptions([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const getBranchImg = (branch?: string | null) => {
        const val = (branch || "").toLowerCase();
        if (val.includes("air")) return AirForceImg;
        if (val.includes("coast")) return CoastGuardImg;
        if (val.includes("marine")) return MarineImg;
        if (val.includes("navy")) return NavyImg;
        if (val.includes("army")) return ArmyImg;
        return null;
    };



    const digitsOnly = (v: string) => v.replace(/\D/g, "");

    const selectedVAKeys = React.useMemo<string[]>(() => (Array.isArray(veteranAccommodations) ? veteranAccommodations : []), [veteranAccommodations]);

    const filteredSelectedVA = React.useMemo<string[]>(
        () => mergeSpecialAccommodations(selectedVAKeys).filter((v) => accommodationOptions.includes(v)),
        [selectedVAKeys, accommodationOptions, mergeSpecialAccommodations]
    );

    const handleVAChange = (e: SelectChangeEvent<string[]>) => {
        const value = e.target.value;
        const arr = Array.isArray(value) ? value : [];
        const unique = Array.from(new Set(arr.map((s) => String(s).trim()).filter(Boolean)));
        const onlyApi = unique.filter((v) => accommodationOptions.includes(v));
        const merged = mergeSpecialAccommodations(onlyApi);
        setVeteranAccommodations(merged);
        setVeteranAccommodationsTouched(true);
    };

    const removeVAItem = (name: string) => {
        const next = filteredSelectedVA.filter((n) => n !== name);
        setVeteranAccommodations(next);
        setVeteranAccommodationsTouched(true);
    };

    const claimColumns = React.useMemo(
        () => [
            {
                key: "col-1",
                items: [
                    { label: "Requesting VARO", value: varo?.requestingVaro ?? "" },
                    { label: "PoaVso Name", value: varo?.poaVsoName ?? "" },
                ],
            },
            {
                key: "col-2",
                items: [
                    { label: "Claim Date", value: varo?.claimDate ?? "" },
                    { label: "Claim Type", value: varo?.claimType ?? "" },
                ],
            },
            {
                key: "col-3",
                items: [
                    { label: "Product Code", value: varo?.productCode ?? "" },
                    { label: "Payee Code", value: varo?.payeeCode ?? "" },
                ],
            },
            {
                key: "col-4",
                items: [
                    { label: "Claim Information", value: varo?.claimInformation ?? "" },
                    { label: "Program Type", value: varo?.programType ?? "" },
                ],
            },
        ],
        [varo]
    );

    const era = (formData as { era?: string }).era ?? "";
    const drawerWidth = theme.custom?.responsive?.layout?.drawerWidth ?? { xs: "100%", sm: 450 };

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [tmpConsent, setTmpConsent] = React.useState<string>(normalizeYesNo(excessMileage) || "");
    const [tmpNotes, setTmpNotes] = React.useState<string>("");
    const [tmpMethod, setTmpMethod] = React.useState<string>("");
    const [showErrors, setShowErrors] = React.useState(false);

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [confirmMsg, setConfirmMsg] = React.useState("");

    const openConsentDrawer = () => {
        setTmpConsent(normalizeYesNo(excessMileage) || "");
        setTmpNotes("");
        setTmpMethod("");
        setShowErrors(false);
        setDrawerOpen(true);
    };

    const isValid = () => (tmpConsent === "Yes" || tmpConsent === "No") && !!tmpMethod && !!tmpNotes.trim();

    const handleDrawerSave = () => {
        if (!isValid()) {
            setShowErrors(true);
            return;
        }
        setExcessMileage(tmpConsent);
        handleFieldChange("ConsentedToExcessMileage", tmpConsent);
        handleFieldChange("SchedulerReason", tmpNotes.trim());
        handleFieldChange("ExpressConsent", tmpMethod);
        onExcessMileageSave(tmpConsent, tmpNotes.trim(), tmpMethod);
        const message = `Veteran consent updated: The veteran has consented to excess mileage as ${tmpConsent}, Reason: ${tmpNotes.trim()}, express consent: ${tmpMethod}`;
        setConfirmMsg(message);
        setConfirmOpen(true);
        setDrawerOpen(false);
    };

    const handleDrawerCancel = () => setDrawerOpen(false);

    const handleConfirmOk = React.useCallback(() => setConfirmOpen(false), []);

    const topValue = (val?: string | null) => val || "";
    return (
        <Box sx={{ width: "100%", mx: 0, maxWidth: "100%", px: 0, py: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
            <Box sx={{ ...commonCardSx, p: { xs: 2, md: 2.6 }, mb: { xs: 1.2, md: 1.6 }, minHeight: { lg: 378 } }}>
                {(headerTitle || headerActions) && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                            mb: 1,
                            pb: 1,
                            gap: { xs: 1.5, sm: 2 },
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, mr: { sm: 2 } }}>
                            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontSize: { xs: 15, sm: 16 }, fontWeight: 700, wordBreak: "break-word" }} title={headerTitle}>
                                {headerTitle}
                            </Typography>
                            {headerTitleAddon}
                        </Box>
                        <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1 }, justifyContent: { xs: "flex-start", sm: "flex-end" }, alignItems: "center", flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>{headerActions}</Box>
                    </Box>
                )}
                <Box sx={{ borderBottom: `1px solid ${isDark ? P.inputBgDark : UI.divider}`, mx: { xs:-2, md: -2.5 }, mb: 1 }} />

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            lg: "minmax(0, 1.45fr) minmax(0, 1.05fr) minmax(0, 1.05fr) minmax(0, 1.6fr)",
                        },
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                        alignItems: "start",
                        mt: 0.6,
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "100px 1fr", md: "143px 1fr" },
                            columnGap: 2,
                            alignItems: "start",
                            mt: 0.4,
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: 100, md: 143 },
                                height: { xs: 130, md: 187 },
                                borderRadius: `${cardRadius}px`,
                                overflow: "hidden",
                            }}
                        >
                            {profileUrl || getBranchImg(branchOfService) ? (
                                <Box
                                    component="img"
                                    src={profileUrl || getBranchImg(branchOfService) || undefined}
                                    alt="Branch Logo"
                                    sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                />
                            ) : (
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height="100%"
                                    sx={{ borderRadius: `${cardRadius}px` }}
                                    animation="wave"
                                />
                            )}
                        </Box>

                        <Box sx={{ display: "grid", rowGap: 1.4 }}>
                            <Box>
                                <Typography variant="body2" sx={labelSx}>
                                    File Number
                                </Typography>
                                <Typography variant="body2" sx={valueSx}>
                                    {formData.fileNumber || ""}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={labelSx}>
                                    Date of Birth
                                </Typography>
                                <Typography variant="body2" sx={valueSx}>
                                    {formData.dateOfBirth || ""}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={labelSx}>
                                    Pregnancy Indicator
                                </Typography>
                                <Typography variant="body2" sx={valueSx}>
                                    {String(formData.pregnancyIndicator ?? "")}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={labelSx}>
                                    Status
                                </Typography>
                                <Typography variant="body2" sx={valueSx}>
                                    {status || ""}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: "grid", rowGap: 1.35 }}>
                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Calculated DOR:
                            </Typography>
                            <Typography variant="body2"  sx={{ ...valueSx, whiteSpace: "nowrap", }}>
                                {topValue(sidebar.calculatedDor)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Original DOR:
                            </Typography>
                            <Typography variant="body2"  sx={{...valueSx, whiteSpace: "nowrap",}}>
                                {topValue(sidebar.originalDor)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Contract:
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {topValue(sidebar.contract)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Sensitivity Level:
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {topValue(sidebar.sensitivityLevel)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ pl: { xs: 0, lg: 1.5 }, display: "grid", rowGap: 1.35 }}>
                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Case Complexity:
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {topValue(sidebar.caseComplexity)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Days:
                            </Typography>
                            <Typography variant="body2" sx={{ ...valueSx, color: (() => {
                                            const daysNum = parseFloat(sidebar.days);
                                            if (!sidebar.days || isNaN(daysNum)) return theme.palette.text.primary; 
                                            if (daysNum < 2) return isDark ? P.caseAgeLowDark : P.caseAgeLowLight;   
                                            if (daysNum < 12) return isDark ? P.caseAgeMediumDark : P.caseAgeMediumLight;  
                                            return isDark ? P.selectedPreferrencesOnDark : P.errorText; 
                            })(), }}>
                                {topValue(sidebar.days)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ backgroundColor: isDark ? P.gridHeaderDark : cardBg, p: { xs: 1.1, md: 1.35 }, alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 0.35, mt: { xs: -0.2, md: -0.5 }, maxWidth: 348 }}>
                        <Box sx={{ mb: 0.55 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 400, fontSize: FS, mb: 0.1 }}>
                                Does Veteran wish to opt-in for 3 day appointment waiver?
                            </Typography>
                            <AppRadioGroup
                                name="WaiverReceived"
                                options={[
                                    { label: "Yes", value: "Yes" },
                                    { label: "No", value: "No" },
                                ]}
                                value={normalizeYesNo(waiver)}
                                onChange={(val: string | { target?: { value?: string } }) =>
                                    setWaiver(typeof val === "string" ? val : val?.target?.value ?? "")
                                }
                                optionSx={figmaRadioOptionSx}
                                radioSx={figmaRadioSx}
                            />
                        </Box>

                        <Box sx={{ mb: 0.55 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 400, fontSize: FS, mb: 0.1 }}>
                                Does Veteran wish to opt-in for SMS Text?
                            </Typography>
                            <AppRadioGroup
                                name="SMSOptIn"
                                options={[
                                    { label: "Yes", value: "Yes" },
                                    { label: "No", value: "No" },
                                ]}
                                value={normalizeYesNo(smsOptIn)}
                                onChange={(val: string | { target?: { value?: string } }) =>
                                    setSmsOptIn(typeof val === "string" ? val : val?.target?.value ?? "")
                                }
                                optionSx={figmaRadioOptionSx}
                                radioSx={figmaRadioSx}
                            />
                        </Box>

                        <Box sx={{ mb: 0.55 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 400, fontSize: FS, mb: 0.1 }}>
                                Consent to Telehealth?
                            </Typography>
                            <AppRadioGroup
                                name="ConsentToTelehealth"
                                options={[
                                    { label: "Yes", value: "Yes" },
                                    { label: "No", value: "No" },
                                ]}
                                value={normalizeYesNo(telehealth)}
                                onChange={(val: string | { target?: { value?: string } }) =>
                                    setTelehealth(typeof val === "string" ? val : val?.target?.value ?? "")
                                }
                                optionSx={figmaRadioOptionSx}
                                radioSx={figmaRadioSx}
                            />
                        </Box>

                        <Box sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: FS, lineHeight: 1.3 }}>
                                Consent for Exceeding Contractual Mileage Thresholds
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 0.75 }}>
                            {normalizeYesNo(excessMileage) === "Yes" ? (
                                <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: FS }}>
                                    Veteran has{" "}
                                    <Box component="span" sx={{ fontWeight: 700 }}>
                                        Consent to excess mileage
                                    </Box>
                                    .{" "}
                                    <Box component="span" sx={{ color: primaryColor, cursor: "pointer" }} onClick={openConsentDrawer}>
                                        Click to update.
                                    </Box>
                                </Typography>
                            ) : (
                                <Box sx={{ display: "flex", alignItems: "center", columnGap: 0.75, maxWidth: "100%" }}>
                                    <BlockRoundedIcon fontSize="small" sx={{ color: errorColor, flex: "0 0 auto" }} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: FS, display: "inline" }}>
                                            Veteran{" "}
                                            <Box component="span" sx={{   color: isDark ? P.errorSoftOnDark : errorColor, fontWeight: 800 }}>
                                                DECLINED
                                            </Box>{" "}
                                            Consent to excess mileage.{" "}
                                            <Box component="span" sx={{ color: isDark ? P.drawerFocusedBorderLight : primaryColor, cursor: "pointer" }} onClick={openConsentDrawer}>
                                                Click to update.
                                            </Box>
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2.55fr) minmax(0, 0.85fr)" },
                    columnGap: { xs: 2, md: 3 },
                    rowGap: { xs: 1.1, md: 1.6 },
                    alignItems: "flex-start",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 2, md: 3 },
                        width: "100%",
                    }}
                >
                    <Box sx={{ ...commonCardSx, minHeight: { xs: "auto", md: 785 } }}>
                        <Typography variant="subtitle2" sx={sectionHeaderSx}>
                            Demographic and Contact Information
                        </Typography>
                        <Box sx={{ borderBottom: `1px solid ${cardBorderColor}`, mt: 0.75, mb: { xs: 1.5, md: 2 }, mx: { xs: -2, md: -2.5 }, }}  />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                columnGap: { xs: 2.5, md: 6 },
                                rowGap: 2.5,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, fontSize: FS }}>
                                    Communication
                                </Typography>

                                {[
                                    ["Street", "communication.addressLine1", formData.communication?.addressLine1],
                                    ["Apt/Unit", "communication.addressLine2", formData.communication?.addressLine2],
                                    ["Address 2", "communication.addressLine3", formData.communication?.addressLine3],
                                    ["City", "communication.city", formData.communication?.city],
                                ].map(([label, path, val]) => (
                                    <Box sx={{ mb: 1 }} key={String(path)}>
                                        <Typography variant="body2" sx={{ color: mutedTextColor, fontSize: FS, mb: 0.25 }}>
                                            {label as string}
                                        </Typography>
                                        <Box sx={fieldWrapSx}>
                                            <Input
                                                value={String(val ?? "")}
                                                onChange={(e) => handleFieldChange(path as string, (e.target as HTMLInputElement).value)}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 32,
                                                        borderRadius: "10px",
                                                        backgroundColor: isDark ? P.inputBgDark : paperBg,
                                                    },
                                                    "& .MuiInputBase-input": { fontSize: FS, px: "14px", py: "7px" },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: mutedTextColor, fontSize: FS, mb: 0.25 }}>
                                        State
                                    </Typography>
                                    <Box sx={fieldWrapSx}>
                                        <StateSelect
                                            value={String((formData.communication as { state?: string })?.state ?? "")}
                                            onChange={(newVal) => handleFieldChange("communication.state", newVal)}
                                            options={stateOptions}
                                            label="Select State"
                                            theme={theme}
                                            FS={FS}
                                        />
                                    </Box>
                                </Box>

                                {[
                                    ["Country", "communication.country", formData.communication?.country],
                                    ["ZIP Code", "communication.zip", formData.communication?.zip],
                                    ["Primary Phone", "communication.phoneNumber", formData.communication?.phoneNumber],
                                    ["Alternate Phone", "communication.alternatePhoneNumber", formData.communication?.alternatePhoneNumber ?? ""],
                                    ["Email", "communication.email", formData.communication?.email],
                                ].map(([label, path, val]) => {
                                    const isPhone = String(path).toLowerCase().includes("phone");
                                    return (
                                        <Box sx={{ mb: 1 }} key={String(path)}>
                                            <Typography variant="body2" sx={{ color: mutedTextColor, fontSize: FS, mb: 0.25 }}>
                                                {label as string}
                                            </Typography>
                                            <Box sx={fieldWrapSx}>
                                                <Input
                                                    value={String(val ?? "")}
                                                    onChange={(e) => {
                                                        const raw = (e.target as HTMLInputElement).value;
                                                        const v = isPhone ? digitsOnly(raw) : raw;
                                                        handleFieldChange(path as string, v);
                                                    }}
                                                    size="small"
                                                    variant="outlined"
                                                    inputProps={isPhone ? { inputMode: "numeric", pattern: "\\d*" } : undefined}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            height: 32,
                                                            borderRadius: "10px",
                                                            backgroundColor: isDark ? P.inputBgDark : paperBg,
                                                        },
                                                        "& .MuiInputBase-input": { fontSize: FS, px: "14px", py: "7px" },
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, fontSize: FS }}>
                                    Residency
                                </Typography>

                                {[
                                    ["Address", "residency.addressLine1", formData.residency?.addressLine1],
                                    ["Apt/Unit", "residency.addressLine2", formData.residency?.addressLine2],
                                    ["Address 2", "residency.addressLine3", formData.residency?.addressLine3],
                                    ["City", "residency.city", formData.residency?.city],
                                ].map(([label, path, val]) => (
                                    <Box sx={{ mb: 1 }} key={String(path)}>
                                        <Typography variant="body2" sx={{ color: mutedTextColor, fontSize: FS, mb: 0.25 }}>
                                            {label as string}
                                        </Typography>
                                        <Box sx={fieldWrapSx}>
                                            <Input
                                                value={String(val ?? "")}
                                                onChange={(e) => handleFieldChange(path as string, (e.target as HTMLInputElement).value)}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        height: 32,
                                                        borderRadius: "10px",
                                                        backgroundColor: isDark ? P.inputBgDark : paperBg,
                                                    },
                                                    "& .MuiInputBase-input": { fontSize: FS, px: "14px", py: "7px" },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: mutedTextColor, fontSize: FS, mb: 0.25 }}>
                                        State
                                    </Typography>
                                    <Box sx={fieldWrapSx}>
                                        <StateSelect
                                            value={String((formData.residency as { state?: string })?.state ?? "")}
                                            onChange={(newVal) => handleFieldChange("residency.state", newVal)}
                                            options={stateOptions}
                                            label="Select State"
                                            theme={theme}
                                            FS={FS}
                                        />
                                    </Box>
                                </Box>

                                {[
                                    ["Country", "residency.country", formData.residency?.country],
                                    ["ZIP Code", "residency.zip", formData.residency?.zip],
                                    ["Primary Phone", "residency.phoneNumber", formData.residency?.phoneNumber],
                                    ["Alternate Phone", "residency.alternatePhoneNumber", formData.residency?.alternatePhoneNumber ?? ""],
                                    ["Email", "residency.email", formData.residency?.email],
                                ].map(([label, path, val]) => {
                                    const isPhone = String(path).toLowerCase().includes("phone");
                                    return (
                                        <Box sx={{ mb: 1 }} key={String(path)}>
                                            <Typography variant="body2" sx={{ color: mutedTextColor, fontSize: FS, mb: 0.25 }}>
                                                {label as string}
                                            </Typography>
                                            <Box sx={fieldWrapSx}>
                                                <Input
                                                    value={String(val ?? "")}
                                                    onChange={(e) => {
                                                        const raw = (e.target as HTMLInputElement).value;
                                                        const v = isPhone ? digitsOnly(raw) : raw;
                                                        handleFieldChange(path as string, v);
                                                    }}
                                                    size="small"
                                                    variant="outlined"
                                                    inputProps={isPhone ? { inputMode: "numeric", pattern: "\\d*" } : undefined}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            height: 32,
                                                            borderRadius: "10px",
                                                            backgroundColor: isDark ? P.inputBgDark : paperBg,
                                                        },
                                                        "& .MuiInputBase-input": { fontSize: FS, px: "14px", py: "7px" },
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ ...commonCardSx }}>
                        <Typography variant="subtitle2" sx={sectionHeaderSx}>
                            Claim Information
                        </Typography>
                        <Box sx={{ borderBottom: `1px solid ${cardBorderColor}`, mt: 0.75, mb: { xs: 1.5, md: 2 }, mx: { xs: -2, md: -2.5 }, }} />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, minmax(0, 1fr))",
                                    md: "repeat(4, 1fr)",
                                },
                                columnGap: { xs: 0, md: 0 },
                                rowGap: { xs: 1.6, md: 0 },
                            }}
                        >
                            {claimColumns.map((col, colIndex) => (
                                <Box
                                    key={col.key}
                                    sx={{
                                        borderRight: {
                                            xs: "none",
                                            md: colIndex === claimColumns.length - 1 ? "none" : `1px solid ${cardBorderColor}`,
                                        },
                                        borderBottom: {
                                            xs: colIndex < claimColumns.length - 1 ? `1px solid ${cardBorderColor}` : "none",
                                            sm: colIndex < 2 ? `1px solid ${cardBorderColor}` : "none",
                                            md: "none",
                                        },
                                        px: { xs: 0, md: 2 },
                                        pb: { xs: 1.5, md: 0 },
                                    }}
                                >
                                    {col.items.map((item) => (
                                        <Box key={item.label} sx={{ mb: 1.5 }}>
                                            <Typography variant="body2" sx={labelSx}>
                                                {item.label}
                                            </Typography>
                                            <Typography variant="body2" sx={valueSx}>
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ ...commonCardSx, p: 0, overflow: "hidden" }}>
                        <Typography variant="subtitle2" sx={{ ...sectionHeaderSx, px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.25 } }}>
                            Periods Of Service
                        </Typography>
                        <Box sx={{ borderBottom: `1px solid ${cardBorderColor}`, mt: 0.75, mb: { xs: 1.5, md: 2 }, mx: { xs: -2, md: -2.5 }, }} />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "repeat(2, minmax(0, 1fr))",
                                    md: "minmax(0, 1.4fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.2fr)",
                                },
                                px: { xs: 2, md: 2.5 },
                                py: 1.2,
                                backgroundColor: isDark ? P.gridHeaderDark : cardBg,
                                borderBottom: `1px solid ${cardBorderColor}`,
                                
                            }}
                        >
                            <Box
                                sx={{
                                borderRight: { xs: "none", md: `1px solid ${cardBorderColor}` },
                                pr: { xs: 2, md: 2 },
                            }}
                        >
                                <Typography variant="body2" sx={{ ...labelSx, mb: 0, fontWeight: 600, color: isDark ? P.white : labelSx.color, }}>
                                    Branch of Service
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    borderRight: { xs: "none", md: `1px solid ${cardBorderColor}` },
                                    px: { xs: 2, md: 2 },
                                }}
                            >
                                <Typography variant="body2" sx={{ ...labelSx, mb: 0, fontWeight: 600,color: isDark ? P.white : labelSx.color, }}>
                                    Entry On Duty (EOD)
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    borderRight: { xs: "none", md: `1px solid ${cardBorderColor}` },
                                    px: { xs: 2, md: 2 },
                                }}
                            >
                                <Typography variant="body2" sx={{ ...labelSx, mb: 0, fontWeight: 600 ,color: isDark ? P.white : labelSx.color,}}>
                                    RAD Date
                                </Typography>
                            </Box>
                            <Box sx={{ pl: { xs: 2, md: 2 } }}>
                                <Typography variant="body2" sx={{ ...labelSx, mb: 0, fontWeight: 600,color: isDark ? P.white : labelSx.color, }}>
                                    Era
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "repeat(2, minmax(0, 1fr))",
                                    md: "minmax(0, 1.4fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.2fr)",
                                },
                                px: { xs: 2, md: 2.5 },
                                py: 1.5,
                                backgroundColor: isDark ? P.black:paperBg,
                            }}
                        >
                            <Box
                                sx={{
                                    borderRight: { xs: "none", md: `1px solid ${cardBorderColor}` },
                                    pr: { xs: 2, md: 2 },
                                }}
                            >
                                <Typography variant="body2" sx={valueSx}>
                                    {branchOfService || ""}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    borderRight: { xs: "none", md: `1px solid ${cardBorderColor}` },
                                    px: { xs: 2, md: 2 },
                                }}
                            >
                                <Typography variant="body2" sx={valueSx}>
                                    {eodDate || ""}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    borderRight: { xs: "none", md: `1px solid ${cardBorderColor}` },
                                    px: { xs: 2, md: 2 },
                                }}
                            >
                                <Typography variant="body2" sx={valueSx}>
                                    {radDate || ""}
                                </Typography>
                            </Box>
                            <Box sx={{ pl: { xs: 2, md: 2 } }}>
                                <Typography variant="body2" sx={valueSx}>
                                    {era || ""}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ ...commonCardSx, p: 0, overflow: "hidden" }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                ...sectionHeaderSx,
                                px: { xs: 2, md: 2.5 },
                                pt: { xs: 2, md: 2.25 },
                            }}
                        >
                            Prioritization Special Issues
                        </Typography>

                        <Box
                            sx={{
                                borderBottom: `1px solid ${cardBorderColor}`,
                                mt: 0.75,
                            }}
                        />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                px: { xs: 2, md: 2.5 },
                                py: 1.2,
                                backgroundColor: isDark ? P.gridHeaderDark : cardBg,
                                borderBottom: `1px solid ${cardBorderColor}`,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    ...labelSx,
                                    mb: 0,
                                    fontWeight: 600,
                                }}
                            >
                                Contention Name
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    ...labelSx,
                                    mb: 0,
                                    fontWeight: 600,
                                }}
                            >
                                Special Issue
                            </Typography>
                        </Box>

                        {prioritySpecialIssues.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    px: { xs: 2, md: 2.5 },
                                    py: 1.5,
                                    backgroundColor: isDark ? P.black : paperBg,
                                }}
                            >
                                <Typography variant="body2" sx={valueSx}>
                                    {item.contentionName}
                                </Typography>

                                <Typography variant="body2" sx={valueSx}>
                                    {item.specialIssue}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 }, width: "100%", maxWidth: { lg: 354 } }}>
                    <Box sx={{ ...commonCardSx, width: "100%", minHeight: { xs: "auto", md: 280 } }}>
                        <Typography variant="subtitle2" sx={sectionHeaderSx}>
                            Accommodations
                        </Typography>
                        <Box sx={{ borderBottom: `1px solid ${cardBorderColor}`, mt: 0.75, mb: { xs: 1.5, md: 2 }, mx: { xs: -2, md: -2.5 }, }} />

                        <Typography variant="body2" sx={labelSx}>
                            Veteran Accommodations
                        </Typography>
                        <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: 260 } }}>
                            <AccommodationsSelect
                                theme={theme}
                                FS={FS}
                                value={filteredSelectedVA}
                                options={accommodationOptions}
                                onChange={handleVAChange}
                                cardBg={cardBg}
                            />
                        </Box>
                        <Box sx={{ mt: 1, width: "100%", display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {filteredSelectedVA.map((name) => (
                                <Box
                                    key={name}
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: "10px",
                                        backgroundColor: alpha(theme.palette.text.primary, 0.2),
                                        color: theme.palette.text.primary,
                                        maxWidth: "100%",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            fontSize: FS,
                                            lineHeight: 1.4,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: { xs: 220, md: 240 },
                                        }}
                                        title={name}
                                    >
                                        {name}
                                    </Box>
                                    <IconButton
                                        aria-label="remove"
                                        onClick={() => removeVAItem(name)}
                                        size="small"
                                        sx={{
                                            ml: 0.5,
                                            width: 24,
                                            height: 24,
                                            borderRadius: "8px",
                                            bgcolor: "transparent",
                                        }}
                                    >
                                        <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Box
                                sx={{
                                    backgroundColor: isDark ? darkBg : cardBg,
                                    border: `1px solid ${cardBorderColor}`,
                                    borderRadius: 0,
                                    overflow: "hidden",
                                }}
                            >
                                <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${cardBorderColor}`, backgroundColor: isDark ? P.inputBgDark : cardBorderColor }}>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: { xs: 12, md: 13 }, fontWeight: 400 }}>
                                        Special Instructions & Internal Notes
                                    </Typography>
                                </Box>
                                <TextField
                                    multiline
                                    minRows={4}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 0,
                                            backgroundColor: isDark ? darkBg : white,
                                            border: "none",
                                        },
                                        "& fieldset": { border: "none" },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ ...commonCardSx, width: "100%", minHeight: { xs: "auto", md: 320 } }}>
                        <Typography variant="subtitle2" sx={sectionHeaderSx}>
                            Additional Information
                        </Typography>
                        <Box sx={{ borderBottom: `1px solid ${cardBorderColor}`, mt: 0.75, mb: { xs: 1.5, md: 2 },mx: { xs: -2, md: -2.5 }, }} />

                        <Box sx={{ mb: 1.2 }}>
                            <Typography variant="body2" sx={labelSx}>
                                ESR Address
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {fmtAddress(formData.residency)}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 1.2 }}>
                            <Typography variant="body2" sx={labelSx}>
                                Phone Number
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {formData.residency?.phoneNumber || ""}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 1.2 }}>
                            <Typography variant="body2" sx={labelSx}>
                                Alternate Phone Number
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {(formData.residency as { alternatePhoneNumber?: string })?.alternatePhoneNumber ?? ""}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={labelSx}>
                                Email Address
                            </Typography>
                            <Typography variant="body2" sx={valueSx}>
                                {formData.residency?.email || ""}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <ReusableDrawer
                open={drawerOpen}
                onClose={handleDrawerCancel}
                title="Alert"
                onSave={handleDrawerSave}
                onCancel={handleDrawerCancel}
                isDark={isDark}
                btnText="Save/Update"
                drawerWidth={drawerWidth}
                saveBtnRadius="4px"
            >
                <DrawerFormBody
                    isDark={isDark}
                    tmpConsent={tmpConsent}
                    setTmpConsent={setTmpConsent}
                    tmpNotes={tmpNotes}
                    setTmpNotes={setTmpNotes}
                    tmpMethod={tmpMethod}
                    setTmpMethod={setTmpMethod}
                    showErrors={showErrors}
                />
            </ReusableDrawer>

            <ConfirmationModal open={confirmOpen} title="Success" description={confirmMsg} confirmLabel="OK" onConfirm={handleConfirmOk} onClose={handleConfirmOk} isDarkMode={isDark} />
        </Box>
    );
}
function DrawerFormBody({
    isDark,
    tmpConsent,
    setTmpConsent,
    tmpNotes,
    setTmpNotes,
    tmpMethod,
    setTmpMethod,
    showErrors,
}: {
    isDark: boolean;
    tmpConsent: string;
    setTmpConsent: (v: string) => void;
    tmpNotes: string;
    setTmpNotes: (v: string) => void;
    tmpMethod: string;
    setTmpMethod: (v: string) => void;
    showErrors: boolean;
}) {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const errorColor = theme.palette.error.main;
    const dividerColor = theme.palette.divider;
    const paperBg = theme.palette.background.paper;
    const white = theme.palette.common.white;
    const grey700 = theme.palette.grey[700];

    const menuContainerRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <Box ref={menuContainerRef} sx={{ width: "100%", pointerEvents: "auto" }}>
            <Box sx={{ mb: 1.5, pointerEvents: "auto" }}>
                <Typography variant="body2" sx={{ fontSize: { xs: 12, md: 14, xl: 16 }, mb: 1, fontWeight: 400, color: isDark ? white : theme.palette.text.primary }}>
                    The veteran has consent to excess mileage:
                </Typography>
                <FormControl fullWidth size="small" sx={{ pointerEvents: "auto" }}>
                    <Select
                        value={tmpConsent}
                        onChange={(e) => setTmpConsent(normalizeYesNo(String(e.target.value)))}
                        displayEmpty
                        sx={{
                            backgroundColor: isDark ? P.inputBgDark : alpha(theme.palette.text.primary, 0.2),
                            fontSize: "14px",
                            borderRadius: "5px",
                            color: isDark ? white : theme.palette.text.primary,
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        }}
                        MenuProps={{
                            disablePortal: true,
                            container: menuContainerRef.current ?? undefined,
                            disableScrollLock: true,
                            PaperProps: {
                                sx: {
                                    backgroundColor: isDark ? P.inputBgDark : paperBg,
                                    "& .MuiMenuItem-root": {
                                        color: isDark ? white : theme.palette.text.primary,
                                        "&:hover": { backgroundColor: isDark ? alpha(white, 0.05) : alpha(theme.palette.text.primary, 0.04) },
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="" disabled>
                            Select
                        </MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                    </Select>
                </FormControl>
                {showErrors && !(tmpConsent === "Yes" || tmpConsent === "No") && (
                    <Typography variant="body2" sx={{ mt: 0.5, color: errorColor, fontSize: { xs: 12, md: 12, xl: 14 } }}>
                        Please select Yes or No.
                    </Typography>
                )}
            </Box>

            <Box sx={{ mb: 1.5, pointerEvents: "auto" }}>
                <Typography variant="body2" sx={{ fontSize: { xs: 12, md: 14, xl: 16 }, mb: 1, fontWeight: 400, color: isDark ? theme.palette.grey[300] : theme.palette.text.primary }}>
                    Reason <Box component="span" sx={{ color: errorColor }}>*</Box>
                </Typography>
                <TextField
                    multiline
                    minRows={6}
                    fullWidth
                    value={tmpNotes}
                    onChange={(e) => setTmpNotes(e.target.value)}
                    variant="outlined"
                    sx={{
                        pointerEvents: "auto",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "4px",
                            backgroundColor: isDark ? P.gridHeaderDark : paperBg,
                            color: isDark ? white : theme.palette.text.primary,
                            "& fieldset": { borderWidth: "1px",borderColor: isDark ? P.secondaryElevatedDark : dividerColor },
                            "&:hover fieldset": { borderColor: isDark ? P.secondaryElevatedDark : dividerColor },
                            "&.Mui-focused fieldset": { borderColor: primaryColor },
                        },
                    }}
                />
                {showErrors && !tmpNotes.trim() && (
                    <Typography variant="body2" sx={{ mt: 0.5, color: errorColor, fontSize: { xs: 12, md: 12, xl: 14 } }}>
                        Reason is required.
                    </Typography>
                )}
            </Box>

            <Box sx={{ mb: 0.5, pointerEvents: "auto" }}>
                <Typography variant="body2" sx={{ fontSize: { xs: 12, md: 14, xl: 16 }, mb: 1, fontWeight: 400, color: isDark ? white : theme.palette.text.primary }}>
                    Methods for express consent:
                </Typography>
                <FormControl fullWidth size="small" sx={{ pointerEvents: "auto" }}>
                    <Select
                        value={tmpMethod}
                        onChange={(e) => setTmpMethod(String(e.target.value))}
                        displayEmpty
                        sx={{
                            backgroundColor: isDark ? P.inputBgDark : alpha(theme.palette.text.primary, 0.2),
                            fontSize: "14px",
                            borderRadius: "5px",
                            color: isDark ? white : theme.palette.text.primary,
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        }}
                        MenuProps={{
                            disablePortal: true,
                            container: menuContainerRef.current ?? undefined,
                            disableScrollLock: true,
                            PaperProps: {
                                sx: {
                                    backgroundColor: isDark ? grey700 : paperBg,
                                    "& .MuiMenuItem-root": {
                                        color: isDark ? white : theme.palette.text.primary,
                                        "&:hover": { backgroundColor: isDark ? alpha(white, 0.05) : alpha(theme.palette.text.primary, 0.04) },
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="" disabled>
                            Select
                        </MenuItem>
                        <MenuItem value="Phone Call">Phone Call</MenuItem>
                        <MenuItem value="Email">Email</MenuItem>
                        <MenuItem value="SMS">SMS</MenuItem>
                    </Select>
                </FormControl>
                {showErrors && !tmpMethod && (
                    <Typography variant="body2" sx={{ mt: 0.5, color: errorColor, fontSize: { xs: 12, md: 12, xl: 14 } }}>
                        Please choose a method.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
