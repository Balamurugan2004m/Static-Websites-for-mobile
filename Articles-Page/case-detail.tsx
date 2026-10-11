/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, useTheme, Skeleton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../store";
import {
    getVeteranDetails,
    updateVeteranInfo,
    getCasesForVeteran,
    getVeteranInformation,
    getVeteranAccommodationLookupList,
    addVeteranUser,
    sendWelcomeEmail,
} from "../../../services/veteran";
import { decodeId } from "../../../utils/base64url";
import {
    getDbqVaro,
    type DbqVaro,
    esrReviewed,
    checkAllMoProcessed,
    markAsSensitiveVeteran,
    acceptCase,
    loadContentionNarrativeDetails,
    loadCaseBasicDetails,
} from "../../../services/case-details";
import { addTab } from "../../../store/slice/tabs-slice";
import { triggerToast } from "../../../store/slice/toast-slice";
import CaseDetailsRead from "./case-details-read";
import CaseDetailsEdit from "./case-details-edit";
import CaseDetailsSkeleton from "./case-details-skeleton";
import { Button } from "../../../ui/button";
import ConfirmationModal from "../../../ui/confirmation-modal";
import { refreshCaseDetails } from "../../../store/slice/case-details-slice";
import { requestCaseReload } from "../../../store/slice/case-data-control-slice";
import { caseDetailsCache } from "./case-cache";
import { THEME_PRIMITIVES } from "../../../theme";


export type Address = {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    phoneNumber: string;
    email: string;
    alternatePhoneNumber?: string;
};

export type FormDataType = {
    fileNumber: string;
    dateOfBirth: string;
    pregnancyIndicator: string;
    phoneNumber: string;
    ersAddress: string;
    mailingAddress: string;
    communication: Address;
    residency: Address;
    eod: string;
    rad: string;
    branchOfService: string;
};

export type SidebarType = {
    caseStatus: string;
    calculatedDor: string;
    originalDor: string;
    contract: string;
    sensitivityLevel: string;
    caseComplexity: string;
    days: string;
    caseAgeStoppedDate?: string | null;
};

export type AlertsInfo = {
    waiver?: string | null;
    sms?: string | null;
    telehealth?: string | null;
    excessMileage?: string | null;
};

export type UIType = {
    panelBg: string;
    panelBorder: string;
    labelColor: string;
    divider: string;
};

type CaseDetailsProps = {
    caseId: string;
};

const mockPrioritizationSpecialIssues = [
    {
        contentionName: "GenMed",
        specialIssue: "PACT",
    },
];

// `caseDetailsCache` lives in `cache.ts` to keep this file export-only for Fast Refresh

const fmtDate = (iso?: string | null) =>
    iso
        ? new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        : "";

const fmtDateTime = (val?: string | null) => {
    if (!val) return "";

    const str = String(val).trim();

    // If already formatted (e.g. "11/17/2022 03:26 PM EST"), return directly
    if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s+(AM|PM)\s+[A-Z]{3,4}/i.test(str)) {
        return str;
    }

    let d: Date | null = null;

    // Pattern 1: SQL style "Nov 17 2022  8:26PM" or "Nov 17 2022 8:26 PM" (Calculated DOR / ReceivedDate)
    const m1 = str.match(
        /^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );
    if (m1) {
        const [, month, day, year, hour, minute, period] = m1;
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const monthIndex = months.indexOf(month.toLowerCase());
        let hours = parseInt(hour, 10);
        if (period) {
            if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        // Backend stores in UTC, so construct as UTC
        d = new Date(Date.UTC(parseInt(year, 10), monthIndex, parseInt(day, 10), hours, parseInt(minute, 10)));
    }

    // Pattern 2: "11/17/2022 20:26:18" or "11/17/2022 8:26:18 PM" (Original DOR)
    const m2 = str.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
    );
    if (!d && m2) {
        const [, month, day, year, hour, minute, second, period] = m2;
        let hours = parseInt(hour, 10);
        if (period) {
            if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        // Backend stores in UTC, so construct as UTC
        d = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hours, parseInt(minute, 10), parseInt(second || "0", 10)));
    }

    // Pattern 3: Standard ISO string (e.g. "2022-11-17T20:26:18Z" or "2022-11-17T20:26:18")
    if (!d) {
        const isoNormalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(str) ? str : `${str}Z`;
        const parsed = new Date(isoNormalized);
        d = isNaN(parsed.getTime()) ? null : parsed;
    }

    if (!d) return str;

    return d.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
        timeZoneName: "short",
    }).replace(",", "");
};

const ts = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

const fmtOnlyDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime())
        ? String(iso ?? "")
        : d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
};

const parseDateUtc = (val?: string | null): Date | null => {
    if (!val) return null;
    const str = String(val).trim();
    if (!str) return null;

    // Pattern 1: SQL style "Nov 17 2022  8:26PM" or "Nov 17 2022 8:26 PM"
    const m1 = str.match(
        /^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );
    if (m1) {
        const [, month, day, year, hour, minute, period] = m1;
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const monthIndex = months.indexOf(month.toLowerCase());
        let hours = parseInt(hour, 10);
        if (period) {
            if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        return new Date(Date.UTC(parseInt(year, 10), monthIndex, parseInt(day, 10), hours, parseInt(minute, 10)));
    }

    // Pattern 2: "11/17/2022 20:26:18" or "11/17/2022 8:26:18 PM"
    const m2 = str.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
    );
    if (m2) {
        const [, month, day, year, hour, minute, second, period] = m2;
        let hours = parseInt(hour, 10);
        if (period) {
            if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        return new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hours, parseInt(minute, 10), parseInt(second || "0", 10)));
    }

    // Pattern 3: Standard ISO string (e.g. "2022-11-17T20:26:18Z" or "2022-11-17T20:26:18")
    const isoNormalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(str) ? str : `${str}Z`;
    const parsed = new Date(isoNormalized);
    if (!isNaN(parsed.getTime())) return parsed;

    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback;
};

const calculateCaseAge = (
    recievedDateStr?: string | null,
    caseAgeStopDateStr?: string | null,
    fallbackDays?: string | number | null
): string => {
    // When CaseAgeStoppedDate is stamped (clarification request raised), clock pauses:
    if (caseAgeStopDateStr && recievedDateStr) {
        const stop = parseDateUtc(caseAgeStopDateStr);
        const start = parseDateUtc(recievedDateStr);
        if (stop && start) {
            const diffMinutes = Math.max(0, (stop.getTime() - start.getTime()) / (1000 * 60));
            const days = Math.round((diffMinutes / 1440) * 10) / 10;
            return days.toFixed(1);
        }
    }

    // When clock is running / resumed (CaseAgeStoppedDate is null):
    if (fallbackDays !== undefined && fallbackDays !== null && fallbackDays !== "") {
        return fallbackDays.toString();
    }

    if (recievedDateStr) {
        const start = parseDateUtc(recievedDateStr);
        if (start) {
            const diffMinutes = Math.max(0, (Date.now() - start.getTime()) / (1000 * 60));
            const days = Math.round((diffMinutes / 1440) * 10) / 10;
            return days.toFixed(1);
        }
    }

    return "";
};

const getVal = (res: any, key: string, defKey: string) => {
    const v = res?.[key];
    if (v === null || v === undefined || String(v).trim() === "") {
        const dv = res?.[defKey];
        return dv == null ? "" : String(dv);
    }
    return String(v);
};

export default function CaseDetails({ caseId }: CaseDetailsProps) {
    const dispatch = useAppDispatch();
    const { activeId, label } = useSelector(
        (state: { tabs: { activeId: string; label: string } }) => state.tabs
    );

    const theme = useTheme();
    const P = THEME_PRIMITIVES;
    const isDark = theme.palette.mode === "dark";
    const [moNotProcessedOpen, setMoNotProcessedOpen] = useState(false);
    const esrId = useMemo(() => decodeId(caseId), [caseId]);

    const caseReloadToken: number = useSelector(
        (s: any) =>
            (esrId && s.caseDataControl?.reloadTokenByCaseId?.[esrId]) ?? 0
    );

    const authUserId = useSelector(
        (s: any) => s.authUser?.authUser?.User?.Id ?? null
    );

    const currentUserId = useMemo(() => {
        const fromStore = authUserId != null ? Number(authUserId) : NaN;
        const fromLs = Number(
            localStorage.getItem("UserId") ??
            localStorage.getItem("userId") ??
            NaN
        );
        return Number.isFinite(fromStore) && fromStore > 0
            ? fromStore
            : Number.isFinite(fromLs) && fromLs > 0
                ? fromLs
                : 0;
    }, [authUserId]);

    const primaryButton = theme.palette.primary.main;
    const panelStroke = (theme as any).custom?.colors?.stroke ?? theme.palette.divider;
    const UI: UIType = {
        panelBg: isDark ? theme.palette.background.default : "",
        panelBorder: panelStroke,
        labelColor: theme.palette.text.secondary,
        divider: theme.palette.divider,
    };

    const [isEditMode, setIsEditMode] = useState(false);
    const [headerTitle, setHeaderTitle] = useState("");
    const [profileUrl, setProfileUrl] = useState<string | null>(null);

    const [isVip, setIsVip] = useState(false);
    const [vipOpen, setVipOpen] = useState(false);
    const [vipMode, setVipMode] = useState<"mark" | "unmark">("mark");

    const [veteranId, setVeteranId] = useState<number>(0);
    const [, setVeteranCases] = useState<any[]>([]);

    const [accepting, setAccepting] = useState(false);
    const [acceptErrorOpen, setAcceptErrorOpen] = useState(false);
    const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [esrOpen, setEsrOpen] = useState(false);
    const [canAcceptCase, setCanAcceptCase] = useState(false);
    const [acceptVisibilityLoaded, setAcceptVisibilityLoaded] = useState(false);

    const [loadingCount, setLoadingCount] = useState(0);
    const beginLoading = () => setLoadingCount((c) => c + 1);
    const endLoading = () => setLoadingCount((c) => Math.max(0, c - 1));
    const isDataLoading = loadingCount > 0;

    const triggerCaseReload = () => {
        if (!esrId) return;
        dispatch(requestCaseReload(esrId));
    };

    useEffect(() => {
        setIsEditMode(false);
        setVipOpen(false);
        setAcceptErrorOpen(false);
        setAcceptConfirmOpen(false);
        setMoNotProcessedOpen(false);
        setSaving(false);
        setEsrOpen(false);
        setAccepting(false);
        setVeteranAccommodationsTouched(false);
        setAcceptVisibilityLoaded(false);

        return () => {
            setLoadingCount(0);
        };
    }, [esrId]);

    const emptyAddress: Address = {
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        state: "",
        country: "",
        zip: "",
        phoneNumber: "",
        email: "",
        alternatePhoneNumber: "",
    };

    const emptyForm: FormDataType = {
        fileNumber: "",
        dateOfBirth: "",
        pregnancyIndicator: "",
        phoneNumber: "",
        ersAddress: "",
        mailingAddress: "",
        communication: { ...emptyAddress },
        residency: { ...emptyAddress },
        eod: "",
        rad: "",
        branchOfService: "",
    };

    const [formDataRead, setFormDataRead] = useState<FormDataType>({
        ...emptyForm,
    });
    const [formDataEdit, setFormDataEdit] = useState<FormDataType>({
        ...emptyForm,
    });

    const [eodDate, setEodDate] = useState("");
    const [radDate, setRadDate] = useState("");
    const [branchOfService, setBranchOfService] = useState("");

    const [sidebar, setSidebar] = useState<SidebarType>({
        caseStatus: "",
        calculatedDor: "",
        originalDor: "",
        contract: "",
        sensitivityLevel: "",
        caseComplexity: "",
        days: "",
        caseAgeStoppedDate: null,
    });

    const [varo, setVaro] = useState<DbqVaro>({
        requestingVaro: "",
        claimDate: "",
        productCode: "",
        programType: "",
        poaVsoName: "",
        claimType: "",
        payeeCode: "",
        claimInformation: "",
    });

    const [veteranAccommodations, setVeteranAccommodations] = useState<
        string[]
    >([]);
    const [veteranAccommodationsTouched, setVeteranAccommodationsTouched] =
        useState(false);
    const [waiver, setWaiver] = useState<string>("");
    const [smsOptIn, setSmsOptIn] = useState<string>("");
    const [telehealth, setTelehealth] = useState<string>("");
    const [excessMileage, setExcessMileage] = useState<string>("");
    const [alerts, setAlerts] = useState<AlertsInfo>({});

    // Ensure shared fields like pregnancyIndicator are populated in edit when available in read
    useEffect(() => {
        if (!formDataRead.pregnancyIndicator) return;
        setFormDataEdit((prev) => {
            if (prev.pregnancyIndicator) return prev;
            return { ...prev, pregnancyIndicator: formDataRead.pregnancyIndicator };
        });
    }, [formDataRead.pregnancyIndicator]);

    useEffect(() => {
        if (!esrId) return;
        const cached = caseDetailsCache[esrId] as any;
        if (!cached) return;
        if (cached.headerTitle !== undefined) setHeaderTitle(cached.headerTitle);
        if (cached.profileUrl !== undefined) setProfileUrl(cached.profileUrl);
        if (cached.formDataRead !== undefined)
            setFormDataRead(cached.formDataRead);
        if (cached.formDataEdit !== undefined)
            setFormDataEdit(cached.formDataEdit);
        if (cached.eodDate !== undefined) setEodDate(cached.eodDate);
        if (cached.radDate !== undefined) setRadDate(cached.radDate);
        if (cached.branchOfService !== undefined)
            setBranchOfService(cached.branchOfService);
        if (cached.sidebar !== undefined) {
        setSidebar({
            ...cached.sidebar,
            calculatedDor: fmtDateTime(cached.sidebar.calculatedDor),
            originalDor: fmtDateTime(cached.sidebar.originalDor),
        });}
        if (cached.varo !== undefined) setVaro(cached.varo);
        if (cached.veteranAccommodations !== undefined)
            setVeteranAccommodations(cached.veteranAccommodations);
        if (cached.waiver !== undefined) setWaiver(cached.waiver);
        if (cached.smsOptIn !== undefined) setSmsOptIn(cached.smsOptIn);
        if (cached.telehealth !== undefined) setTelehealth(cached.telehealth);
        if (cached.excessMileage !== undefined)
            setExcessMileage(cached.excessMileage);
        if (cached.alerts !== undefined) setAlerts(cached.alerts);
        if (cached.isVip !== undefined) setIsVip(cached.isVip);
        if (cached.canAcceptCase !== undefined) {
            setCanAcceptCase(cached.canAcceptCase);
            setAcceptVisibilityLoaded(true);
        }
    }, [esrId]);

    useEffect(() => {
        if (!esrId) return;
        const cached = caseDetailsCache[esrId] as any;
        const cachedToken = cached?._token ?? 0;
        const isCacheFresh = cachedToken === caseReloadToken;
        if (cached?.formDataRead && isCacheFresh) return;

        const abortController = new AbortController();
        beginLoading();

        getVeteranDetails(esrId)
            .then((data: any) => {
                if (abortController.signal.aborted) return;

                const header = `${data?.LastName ?? ""} - ${data?.Gender ?? ""
                    }${data?.Age ? ` / ${data.Age} Yrs` : ""}`;
                const veteranName = [data?.FirstName, data?.LastName]
                    .filter((part) => Boolean(String(part ?? "").trim()))
                    .join(" ")
                    .trim();
                setHeaderTitle(header);
                setProfileUrl(data?.VeteranProfilePicture || null);

                const form: FormDataType = {
                    fileNumber: data?.FileNumber ?? "",
                    dateOfBirth: data?.DateOfBirth ?? "",
                    pregnancyIndicator: String(!!data?.Pregnant),
                    phoneNumber: data?.PrimaryPhoneNumber ?? "",
                    ersAddress: data?.ESR_Address ?? "",
                    mailingAddress: data?.Address ?? "",
                    communication: {
                        addressLine1: data?.Address ?? "",
                        addressLine2: "",
                        addressLine3: "",
                        city: "",
                        state: "",
                        country: "",
                        zip: "",
                        phoneNumber: data?.PrimaryPhoneNumber ?? "",
                        email: data?.EmailAddress ?? "",
                        alternatePhoneNumber: "",
                    },
                    residency: {
                        addressLine1: data?.ESR_Address ?? "",
                        addressLine2: "",
                        addressLine3: "",
                        city: "",
                        state: "",
                        country: "",
                        zip: "",
                        phoneNumber: data?.ESR_PrimaryPhone ?? "",
                        email: data?.ESR_EmailAddress ?? "",
                        alternatePhoneNumber: data?.AlternatePhoneNumber ?? "",
                    },
                    eod: "",
                    rad: "",
                    branchOfService: "",
                };

                setFormDataRead(form);

                const detailsVid = Number(
                    data?.VeteranId ?? data?.VeteranID ?? 0
                );
                if (detailsVid > 0) {
                    setVeteranId(detailsVid);
                }

                const pos =
                    Array.isArray(data?.PeriodsOfService) &&
                        data.PeriodsOfService.length > 0
                        ? data.PeriodsOfService[0]
                        : null;
                const eod = fmtDate(pos?.EntryOnDuty ?? null);
                const rad = fmtDate(pos?.RADDate ?? null);
                const bos = pos?.BranchOfService ?? "";
                const cachedCaseStatus = cached?.sidebar?.caseStatus ?? "";

                setEodDate(eod);
                setRadDate(rad);
                setBranchOfService(bos);

                const newSidebar: SidebarType = {
                    caseStatus: cachedCaseStatus || data?.CaseStatus || "In-Work",
                    calculatedDor: fmtDateTime(data?.CalculatedDateOfRequest ?? data?.ReceivedDate),
                    originalDor: fmtDateTime(data?.OriginalDOR),
                    contract: data?.ContractType ?? "",
                    sensitivityLevel:
                        (data?.SensitivityLevel ?? "N/A")?.toString(),
                    caseComplexity:
                        (data?.CaseComplexity ?? data?.Complexity ?? "")?.toString() ??
                        "",
                    days: calculateCaseAge(
                        data?.CalculatedDateOfRequest ?? data?.ReceivedDate,
                        data?.CaseAgeStoppedDate,
                        data?.AgeOfClaim ?? data?.TotalDays
                    ),
                    caseAgeStoppedDate: data?.CaseAgeStoppedDate ?? null,
                };

                setSidebar(newSidebar);

                caseDetailsCache[esrId] = {
                    ...(caseDetailsCache[esrId] || {}),
                    headerTitle: header,
                    profileUrl: data?.VeteranProfilePicture || null,
                    veteranSummary: {
                        name: veteranName || (data?.LastName ?? ""),
                        gender: data?.Gender ?? "",
                        address: data?.Address ?? "",
                        primaryPhone: data?.PrimaryPhoneNumber ?? "",
                        profileUrl: data?.VeteranProfilePicture || null,
                        branchOfService: bos,
                    },
                    formDataRead: form,
                    eodDate: eod,
                    radDate: rad,
                    branchOfService: bos,
                    sidebar: newSidebar,
                    _token: caseReloadToken,
                };

                if (activeId && label) {
                    dispatch(addTab({ id: activeId, label }));
                }
            })
            .catch(() => {
                if (abortController.signal.aborted) return;
            })
            .finally(() => {
                if (!abortController.signal.aborted) {
                    endLoading();
                } else {
                    setLoadingCount(0);
                }
            });

        return () => {
            abortController.abort();
            setLoadingCount(0);
        };
    }, [dispatch, esrId, activeId, label, caseReloadToken]);

    useEffect(() => {
        if (!esrId) return;
        const cached = caseDetailsCache[esrId] as any;
        const cachedToken = cached?._token ?? 0;
        const isCacheFresh = cachedToken === caseReloadToken;
        if (cached?.formDataEdit && isCacheFresh) return;

        const abortController = new AbortController();
        beginLoading();

        getVeteranInformation(esrId)
            .then(async (res: any) => {
                if (abortController.signal.aborted) return;

                const waiverYes =
                    String(res?.WaiverReceived ?? "").toLowerCase() === "yes";
                const smsYes =
                    String(res?.SMSOptIn ?? "").toLowerCase() === "yes";
                const teleYes =
                    String(res?.ConsentToTelehealth ?? "").toLowerCase() ===
                    "yes";
                const emYes =
                    String(
                        res?.ConsentedToExcessMileage ?? ""
                    ).toLowerCase() === "yes";

                const newAlerts: AlertsInfo = {
                    waiver: waiverYes
                        ? `Veteran opted preference for 3 day appointment waiver ${ts(
                            res?.WaiverReceivedDate
                        )}.`
                        : null,
                    sms: smsYes
                        ? `Veteran opted for SMS Opt In ${ts(
                            res?.SMSOptInDate
                        )}.`
                        : null,
                    telehealth: teleYes
                        ? `Veteran opted Consent to Telehealth.`
                        : null,
                    excessMileage: emYes
                        ? `Veteran has Consent to excess mileage.`
                        : null,
                };

                setAlerts(newAlerts);

                const waiverVal = waiverYes ? "Yes" : "No";
                const smsVal = smsYes ? "Yes" : "No";
                const teleVal = teleYes ? "Yes" : "No";
                const emVal = emYes ? "Yes" : "";

                setWaiver(waiverVal);
                setSmsOptIn(smsVal);
                setTelehealth(teleVal);
                setExcessMileage(emVal);

                const vid = Number(res?.VeteranID ?? res?.VeteranId ?? 0);
                if (vid > 0) {
                    setVeteranId(vid);
                }

                const isSensitive = Boolean(res?.IsSensitive);
                setIsVip(isSensitive);

                let accArray: string[] = [];
                if (vid > 0) {
                    const cases = await getCasesForVeteran(vid);
                    const list = Array.isArray(cases) ? cases : [];
                    setVeteranCases(list);
                    const match =
                        list.find(
                            (c: any) =>
                                String(
                                    c?.ExamSchedulingRequestId ?? c?.Id ?? ""
                                ) === String(esrId)
                        ) ?? null;
                    const claimStatus = String(
                        match?.ClaimStatusDescription ?? ""
                    ).trim();
                    if (claimStatus) {
                        setSidebar((prev) => ({
                            ...prev,
                            caseStatus: claimStatus,
                        }));
                        caseDetailsCache[esrId] = {
                            ...(caseDetailsCache[esrId] || {}),
                            sidebar: {
                                ...((caseDetailsCache[esrId] as any)?.sidebar ?? {}),
                                caseStatus: claimStatus,
                            },
                            _token: caseReloadToken,
                        };
                    }

                    try {
                        const accLookup = await getVeteranAccommodationLookupList(vid, false);
                        accArray = [];
                        if (Array.isArray(accLookup)) {
                            accArray = accLookup.flatMap((item: any) => {
                                if (typeof item === "string") return item.trim();
                                if (item && typeof item === "object") {
                                    const val = item.Name || item.name || item.LookupValue || item.lookupValue || item.Value || item.value || "";
                                    return String(val).trim();
                                }
                                return [];
                            }).filter(Boolean);
                        } else if (typeof accLookup === "string" && accLookup.trim()) {
                            accArray = accLookup
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                        }
                        accArray = Array.from(new Set(accArray));
                        setVeteranAccommodations(accArray);
                        setVeteranAccommodationsTouched(false);
                    } catch { void 0; }
                }

                const communication = {
                    addressLine1: getVal(res, "Address1", "Default_Address1"),
                    addressLine2: getVal(res, "Address2", "Default_Address2"),
                    addressLine3: getVal(res, "Address3", "Default_Address3"),
                    city: getVal(res, "City", "Default_City"),
                    state: getVal(res, "State", "Default_State"),
                    country: getVal(res, "Country", "Default_Country"),
                    zip: getVal(res, "Zip", "Default_Zip"),
                    email: getVal(res, "EmailAddress", "Default_Email"),
                    phoneNumber: getVal(res, "Phone", "DefaultPhone"),
                    alternatePhoneNumber: "",
                };

                const residency = {
                    addressLine1: getVal(
                        res,
                        "ESR_Address1",
                        "Default_Address1"
                    ),
                    addressLine2: getVal(
                        res,
                        "ESR_Address2",
                        "Default_Address2"
                    ),
                    addressLine3: getVal(
                        res,
                        "ESR_Address3",
                        "Default_Address3"
                    ),
                    city: getVal(res, "ESR_City", "Default_City"),
                    state: getVal(res, "ESR_State", "Default_State"),
                    country: getVal(
                        res,
                        "ESR_Country",
                        "Default_Country"
                    ),
                    zip: getVal(
                        res,
                        "ESR_ZipOrPostalCode",
                        "Default_Zip"
                    ),
                    email: getVal(res, "ESR_EmailAddress", "Default_Email"),
                    phoneNumber: getVal(
                        res,
                        "ESR_PrimaryPhone",
                        "DefaultPhone"
                    ),
                    alternatePhoneNumber: String(res?.AlternatePhone ?? ""),
                };

                const form: FormDataType = {
                    fileNumber: String(res?.FileNumber ?? ""),
                    dateOfBirth: fmtOnlyDate(res?.DateOfBirth),
                    pregnancyIndicator: (() => {
                        const raw =
                            res?.pregnancyIndicator ??
                            res?.PregnancyIndicator ??
                            res?.Pregnant ??
                            "";
                        const asString = raw === null || raw === undefined ? "" : String(raw);
                        const fallback = formDataRead.pregnancyIndicator ?? "";
                        return asString.trim() ? asString : fallback;
                    })(),
                    phoneNumber: String(res?.Phone ?? ""),
                    ersAddress: "",
                    mailingAddress: "",
                    communication,
                    residency,
                    eod: "",
                    rad: "",
                    branchOfService: "",
                };

                setFormDataEdit(form);

                setFormDataRead((prev) => {
                    const hasData =
                        prev.fileNumber ||
                        prev.dateOfBirth ||
                        prev.communication?.addressLine1;
                    if (!hasData) return form;
                    return prev;
                });

                caseDetailsCache[esrId] = {
                    ...(caseDetailsCache[esrId] || {}),
                    formDataEdit: form,
                    waiver: waiverVal,
                    smsOptIn: smsVal,
                    telehealth: teleVal,
                    excessMileage: emVal,
                    alerts: newAlerts,
                    veteranAccommodations: accArray,
                    isVip: isSensitive,
                    _token: caseReloadToken,
                };
            })
            .catch(() => {
                if (abortController.signal.aborted) return;
            })
            .finally(() => {
                if (!abortController.signal.aborted) {
                    endLoading();
                } else {
                    setLoadingCount(0);
                }
            });

        return () => {
            abortController.abort();
            setLoadingCount(0);
        };
    }, [esrId, caseReloadToken]);

    useEffect(() => {
        if (!esrId) return;
        const cached = caseDetailsCache[esrId] as any;
        const cachedToken = (cached as any)?._token ?? 0;
        const isCacheFresh = cachedToken === caseReloadToken;
        if (cached?.varo && isCacheFresh) return;

        const abortController = new AbortController();
        beginLoading();

        getDbqVaro(esrId)
            .then((data) => {
                if (abortController.signal.aborted) return;
                setVaro(data);
                caseDetailsCache[esrId] = {
                    ...(caseDetailsCache[esrId] || {}),
                    varo: data,
                    _token: caseReloadToken,
                };
            })
            .catch(() => {
                if (abortController.signal.aborted) return;
                const emptyVaro: DbqVaro = {
                    requestingVaro: "",
                    claimDate: "",
                    productCode: "",
                    programType: "",
                    poaVsoName: "",
                    claimType: "",
                    payeeCode: "",
                    claimInformation: "",
                };
                setVaro(emptyVaro);
                caseDetailsCache[esrId] = {
                    ...(caseDetailsCache[esrId] || {}),
                    varo: emptyVaro,
                    _token: caseReloadToken,
                };
            })
            .finally(() => {
                if (!abortController.signal.aborted) {
                    endLoading();
                } else {
                    setLoadingCount(0);
                }
            });

        return () => {
            abortController.abort();
            setLoadingCount(0);
        };
    }, [esrId, caseReloadToken]);

    useEffect(() => {
        if (!esrId) return;

        const cached = caseDetailsCache[esrId];
        const cachedToken = cached?._token ?? 0;
        const isCacheFresh = cachedToken === caseReloadToken;

        setAcceptVisibilityLoaded(false);
        setCanAcceptCase(false);

        if (cached?.canAcceptCase !== undefined && isCacheFresh) {
            setCanAcceptCase(cached.canAcceptCase);
            setAcceptVisibilityLoaded(true);
            return;
        }

        let isMounted = true;
        beginLoading();

        const fetchCaseAcceptVisibility = async () => {
            try {
                const contentions =
                    await loadContentionNarrativeDetails(esrId);
                if (!Array.isArray(contentions) || contentions.length === 0) {
                    return;
                }

                const examRelatedContentionId =
                    contentions[0]?.ExamRelatedContentionId;
                if (!examRelatedContentionId) return;

                const basicDetails = await loadCaseBasicDetails(
                    esrId,
                    examRelatedContentionId
                );
                if (!isMounted || !basicDetails) return;

                const value = (basicDetails as any).IsCaseAccepted;
                if (typeof value === "boolean") {
                    const nextCanAccept = !value;
                    setCanAcceptCase(nextCanAccept);
                    caseDetailsCache[esrId] = {
                        ...(caseDetailsCache[esrId] || {}),
                        canAcceptCase: nextCanAccept,
                        _token: caseReloadToken,
                    };
                }
            } catch { void 0; }
            finally {
                if (isMounted) {
                    setAcceptVisibilityLoaded(true);
                    endLoading();
                } else {
                    setLoadingCount(0);
                }
            }
        };

        fetchCaseAcceptVisibility();

        return () => {
            isMounted = false;
            setLoadingCount(0);
        };
    }, [esrId, caseReloadToken]);

    const handleFieldChangeEdit = (field: string, value: string) => {
        if (field.includes(".")) {
            const [section, subField] = field.split(".");
            setFormDataEdit((prev) => ({
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [subField]: value,
                },
            }) as any);
        } else {
            setFormDataEdit((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };
    const handleAcceptClick = async () => {
    if (!esrId) {
        dispatch(
            triggerToast({
                message: "Invalid case id",
                type: "error",
                position: "top-right",
                autoClose: 5000,
            })
        );
        return;
    }

    try {
        setAccepting(true);

        const moResult: any = await checkAllMoProcessed(esrId);

        const allProcessed =
            typeof moResult === "boolean"
                ? moResult
                : typeof moResult?.data === "boolean"
                    ? moResult.data
                    : typeof moResult?.Item1 === "boolean"
                        ? moResult.Item1
                        : true;

        if (allProcessed) {
            setAcceptConfirmOpen(true);     
        } else {
            setMoNotProcessedOpen(true);  
        }
    } catch (e: any) {
        dispatch(
            triggerToast({
                message:
                    e?.response?.data?.message ??
                    "Unable to verify MO processing. Please try again.",
                type: "error",
                position: "top-right",
                autoClose: 5000,
            })
        );
    } finally {
        setAccepting(false);
    }
};


    const handleAcceptConfirmYes = async () => {
        setAcceptConfirmOpen(false);
        if (!esrId) {
            dispatch(
                triggerToast({
                    message: "Invalid case id",
                    type: "error",
                    position: "top-right",
                    autoClose: 5000,
                })
            );
            return;
        }
        const contract = (sidebar.contract ?? "").trim();
        const hasKnownContract =
            contract.length > 0 && contract.toLowerCase() !== "unknown";
        if (!hasKnownContract) {
            setAcceptErrorOpen(true);
            return;
        }
        try {
            setAccepting(true);
            await checkAllMoProcessed(esrId);
            await acceptCase({
                ExamSchedulingRequestId: esrId,
                UserId: 9,
            });
            dispatch(
                triggerToast({
                    message: "Case accepted successfully.",
                    type: "success",
                    position: "top-right",
                    autoClose: 3000,
                })
            );
            setCanAcceptCase(false);
            caseDetailsCache[esrId] = {
                ...(caseDetailsCache[esrId] || {}),
                canAcceptCase: false,
                _token: caseReloadToken,
            };
            triggerCaseReload();
        } catch (e: any) {
            dispatch(
                triggerToast({
                    message:
                        e?.response?.data?.message ??
                        "Accept failed. Please try again.",
                    type: "error",
                    position: "top-right",
                    autoClose: 5000,
                })
            );
        } finally {
            setAccepting(false);
        }
    };

    const handleSave = async () => {
        if (saving) return;
        if (!esrId) {
            dispatch(
                triggerToast({
                    message: "Invalid case id",
                    type: "error",
                    position: "top-right",
                    autoClose: 9000,
                })
            );
            return;
        }
        setSaving(true);
        const toNull = (v?: string | null) =>
            v && String(v).trim() ? v : null;
        const accommodationsArray = Array.isArray(veteranAccommodations)
            ? veteranAccommodations
            : [];

        const p = formDataEdit;

        const payload: any = {
            UserId: 9,
            VeteranID: veteranId || 0,
            Electronic_Communication: null,
            WaiverReceived: toNull(waiver),
            SMSOptIn: toNull(smsOptIn),
            Address1: toNull(p.communication.addressLine1),
            Address2: toNull(p.communication.addressLine2),
            Address3: toNull(p.communication.addressLine3),
            City: toNull((p.communication as any).city),
            State: toNull((p.communication as any).state),
            Country: toNull((p.communication as any).country),
            Zip: toNull((p.communication as any).zip),
            EmailAddress: toNull(p.communication.email),
            Phone: toNull(p.communication.phoneNumber),
            GenderPreferences: null,
            ExamSchedulingRequestId: esrId,
            ConsentToTelehealth: toNull(telehealth),
            ESR_Address1: toNull(p.residency.addressLine1),
            ESR_Address2: toNull(p.residency.addressLine2),
            ESR_Address3: toNull(p.residency.addressLine3),
            ESR_City: toNull((p.residency as any).city),
            ESR_State: toNull((p.residency as any).state),
            ESR_Country: toNull((p.residency as any).country),
            ESR_ZipOrPostalCode: toNull((p.residency as any).zip),
            ESR_PrimaryPhone: toNull(p.residency.phoneNumber),
            ESR_EmailAddress: toNull(p.residency.email),
        };

        payload.VeteranAccommodationLookupValueMappings = accommodationsArray;

        try {
            await updateVeteranInfo(payload as any);

            setVeteranAccommodations(accommodationsArray);
            setFormDataRead(formDataEdit);
            if (caseDetailsCache[esrId]) {
                caseDetailsCache[esrId] = {
                    ...caseDetailsCache[esrId],
                    formDataRead: formDataEdit,
                    formDataEdit: formDataEdit,
                    veteranAccommodations: accommodationsArray,
                };
            }

            dispatch(
                refreshCaseDetails({
                    esrId: String(esrId),
                    veteranId,
                })
            );

            setIsEditMode(false);

            dispatch(
                triggerToast({
                    message: "The veteran information was updated successfully.",
                    type: "success",
                    position: "top-right",
                    autoClose: 3000,
                })
            );

            triggerCaseReload();
        } catch {
            dispatch(
                triggerToast({
                    message: "Submission failed. Please try again.",
                    type: "error",
                    position: "top-right",
                    autoClose: 5000,
                })
            );
        } finally {
            setSaving(false);
      }
    };

    const handleRegister = async () => {
      try {
        const veteran = await getVeteranInformation(esrId);
        console.log("Veteran Response", veteran);

        if (!veteran) {
          dispatch(
            triggerToast({
              message: "Unable to load veteran information.",
              type: "error",
              position: "top-right",
              autoClose: 3000,
            })
          );
          return;
        }

        const addVeteranPayload = {
          UserName: veteran.EmailAddress,
          FirstName: veteran.VeteranFirstName,
          LastName: veteran.VeteranLastName,
          Email: veteran.EmailAddress,
          PhoneNumber: veteran.Phone,
          AddressLine1: veteran.Address1,
          AddressLine2: veteran.Address2,
          Zip: veteran.Zip,
          City: veteran.City,
          State: veteran.State,

          Role: ["Veteran"],

          SkillLevel: 1450,
          UserTypeId: 4,
          TenantId: 1,
          PrintName: veteran.VeteranFullName,
          IsEnabled: true,
        };

        const addUserResponse = await addVeteranUser(addVeteranPayload);

        if (addUserResponse.StatusCode !== 201) {
          dispatch(
            triggerToast({
              message: "Unable to register veteran.",
              type: "error",
              position: "top-right",
              autoClose: 3000,
            })
          );
          return;
        }

        if (
          !addUserResponse.SecurityUserId ||
          !addUserResponse.EmailConfirmationToken
        ) {
          dispatch(
            triggerToast({
              message: "Invalid registration response.",
              type: "error",
              position: "top-right",
              autoClose: 3000,
            })
          );
          return;
        }

        const confirmAccountLink = import.meta.env.VITE_CONFIRM_ACCOUNT_LINK;

      const portalLink =
      `${confirmAccountLink}?userId=${addUserResponse.SecurityUserId}` +
      `&code=${addUserResponse.EmailConfirmationToken}`;

        const emailPayload = {
          ExamSchedulingRequestId: esrId,
          ToName: `${veteran.VeteranFirstName?.trim()} ${veteran.VeteranLastName?.trim()}`.trim(),
          ToEmail: veteran.EmailAddress,
          ToPhone: veteran.Phone ?? "",
          ToUserName: addUserResponse.UserName,
          PortalLink: portalLink,
        };

        const emailSent = await sendWelcomeEmail(emailPayload);
        if (!emailSent) {
          return;
        }

        dispatch(
          triggerToast({
            message: "Welcome email sent successfully.",
            type: "success",
            position: "top-right",
            autoClose: 3000,
          })
        );
      } catch (error) {
        console.error(error);

        dispatch(
          triggerToast({
            message: "Failed to send welcome email.",
            type: "error",
            position: "top-right",
            autoClose: 3000,
          })
        );
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
    };

    const handleExcessMileageSave = (
        consent: string,
        reason: string,
        method: string
    ) => {
        if (!veteranId) return;
        const payload = {
            UserId: 9,
            VeteranID: veteranId,
            ConsentedToExcessMileage: consent,
            SchedulerReason: reason,
            ExpressConsent: method,
            ConsentJustification: null,
        };
        updateVeteranInfo(payload as any).catch(() => { });
    };

    const handleEsrReviewedClick = () => setEsrOpen(true);
    const handleEsrCancel = () => setEsrOpen(false);

    const handleEsrYes = async () => {
        const uid = String(currentUserId ?? "").trim();
        const eid = String(esrId ?? "").trim();
        if (!eid || !uid) {
            dispatch(
                triggerToast({
                    message: "Missing required data",
                    type: "error",
                    position: "top-right",
                    autoClose: 5000,
                })
            );
            setEsrOpen(false);
            return;
        }
        try {
            await esrReviewed({
                ExamSchedulingRequestId: eid,
                UserId: uid,
            });
            dispatch(
                triggerToast({
                    title: "Successful",
                    message: "The veteran has been marked as ESR Reviewed.",
                    type: "success",
                    position: "top-right",
                    autoClose: 3000,
                })
            );
            triggerCaseReload();
        } catch {
            dispatch(
                triggerToast({
                    message: "Failed to mark ESR reviewed",
                    type: "error",
                    position: "top-right",
                    autoClose: 5000,
                })
            );
        } finally {
            setEsrOpen(false);
        }
    };

    const noHover = (bg?: string, color?: string, borderColor?: string) => ({
        "&:hover": {
            backgroundColor: bg ?? "inherit",
            color: color ?? "inherit",
            borderColor: borderColor ?? "inherit",
            boxShadow: "none",
            opacity: 1,
        },
    });

    const editHeaderActions = isDataLoading ? (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
            <Skeleton variant="rectangular" width={145} height={32} sx={{ maxWidth: "100%" }} />
            <Skeleton variant="rectangular" width={106} height={32} sx={{ maxWidth: "100%" }} />
            <Skeleton variant="rectangular" width={87} height={32} sx={{ maxWidth: "100%" }} />
        </Box>
    ) : (
        <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1 }, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" }, width: { xs: "100%", sm: "auto" } }}>
            {(() => {
                const vipVariant = theme.custom?.buttons.variants.markVip;
                const cancelVariant = theme.custom?.buttons.variants.cancelFilled;
                const isUnmarkVip = isVip;
                return (
                    <>
            <Button
                variant="secondary"
                sx={{
                    width: { xs: "auto", sm: 114 },
                    minWidth: 0,
                    height: { xs: 30, sm: 34 },
                    borderRadius: `${vipVariant?.radius ?? 10}px`,
                    backgroundColor: isUnmarkVip
                        ? P.primary
                        : vipVariant?.bg ?? P.markVipButtonBg,
                    color: isUnmarkVip
                        ? theme.palette.common.white
                        : vipVariant?.color ?? P.primary,
                    border: isUnmarkVip
                        ? `1px solid ${P.primary}`
                        : `1px solid ${vipVariant?.border ?? P.primary}`,
                    textTransform: "none",
                    fontSize: { xs: 12, sm: 14 },
                    fontWeight: 400,
                    px: { xs: 1.25, sm: 1.25 },
                    whiteSpace: "nowrap",
                    ...noHover(
                        isUnmarkVip ? P.primaryHover : vipVariant?.hoverBg ?? P.markVipButtonHover,
                        isUnmarkVip ? theme.palette.common.white : vipVariant?.color ?? P.primary,
                        isUnmarkVip ? P.primary : vipVariant?.border ?? P.primary
                    ),
                }}
                onClick={() => {
                    setVipMode(isVip ? "unmark" : "mark");
                    setVipOpen(true);
                }}
            >
                {isVip ? "Unmark as VIP" : "Mark as VIP"}
            </Button>

            <Button
                variant="secondary"
                sx={{
                    width: { xs: "auto", sm: 90 },
                    minWidth: 0,
                    height: { xs: 30, sm: 34 },
                    borderRadius: `${cancelVariant?.radius ?? 10}px`,
                    backgroundColor: cancelVariant?.bg ?? P.cancelFilledButtonBg,
                    color: cancelVariant?.color ?? P.neutralTextStrong,
                    textTransform: "none",
                    fontSize: { xs: 12, sm: 14 },
                    fontStyle: "normal",
                    fontWeight: 400,
                    px: { xs: 1.25, sm: 1.25 },
                    whiteSpace: "nowrap",
                    ...noHover(
                        cancelVariant?.hoverBg ?? P.cancelFilledButtonHover,
                        cancelVariant?.color ?? P.neutralTextStrong
                    ),
                }}
                onClick={handleCancel}
            >
                Cancel
            </Button>

            <Button
                variant="primary"
                sx={{
                    width: { xs: "auto", sm: 90 },
                    minWidth: 0,
                    height: { xs: 30, sm: 34 },
                    borderRadius: "10px",
                    backgroundColor: P.primary,
                    color: theme.palette.common.white,
                    textTransform: "none",
                    fontSize: { xs: 12, sm: 14 },
                    fontWeight: 400,
                    px: { xs: 1.25, sm: 1.25 },
                    whiteSpace: "nowrap",
                    ...noHover(primaryButton, theme.palette.common.white),
                }}
                onClick={handleSave}
                disabled={saving}
            >
                Save
            </Button>
                    </>
                );
            })()}
        </Box>
    );

    const vipBadge = isVip ? (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 48,
                height: 24,
                px: 1.5,
                borderRadius: "3px",
                backgroundColor: P.vipBadgeBg,
                color: P.vipBadgeText,
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}
        >
            VIP
        </Box>
    ) : null;

    return (
        <>
            <Box
                sx={{
                    backgroundColor: UI.panelBg,
                    px: 0,
                    pt: { xs: 1, sm: 1.5, md: 2 },
                    pb: { md: 3 },
                    mt: -1,
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                }}
                data-display-case-id={caseId}
            >
                {isDataLoading ? (
                    <CaseDetailsSkeleton isDark={isDark} />
                ) : isEditMode ? (
                    <CaseDetailsEdit
                        theme={theme}
                        isDark={isDark}
                        UI={UI}
                        headerTitle={headerTitle}
                        headerTitleAddon={vipBadge}
                        headerActions={editHeaderActions}
                        profileUrl={profileUrl}
                        status={sidebar.caseStatus}
                        sidebar={sidebar}
                        formData={formDataEdit}
                        varo={varo}
                        handleFieldChange={handleFieldChangeEdit}
                        eodDate={eodDate}
                        radDate={radDate}
                        branchOfService={branchOfService}
                        prioritySpecialIssues={mockPrioritizationSpecialIssues}
                        veteranAccommodations={veteranAccommodations}
                        setVeteranAccommodations={setVeteranAccommodations}
                        setVeteranAccommodationsTouched={
                            setVeteranAccommodationsTouched
                        }
                        waiver={waiver}
                        setWaiver={setWaiver}
                        smsOptIn={smsOptIn}
                        setSmsOptIn={setSmsOptIn}
                        telehealth={telehealth}
                        setTelehealth={setTelehealth}
                        excessMileage={excessMileage}
                        setExcessMileage={setExcessMileage}
                        alerts={alerts}
                        onExcessMileageSave={handleExcessMileageSave}
                    />
                ) : (
                    <CaseDetailsRead
                        theme={theme}
                        isDark={isDark}
                        UI={UI}
                        profileUrl={profileUrl}
                        formData={formDataRead}
                        eodDate={eodDate}
                        radDate={radDate}
                        branchOfService={branchOfService}
                        prioritySpecialIssues={mockPrioritizationSpecialIssues}
                        sidebar={sidebar}
                        varo={varo}
                        veteranAccommodations={veteranAccommodations}
                        alerts={alerts}
                        headerTitle={headerTitle}
                        caseId={caseId}
                        examSchedulingRequestId={esrId}
                        isVip={isVip}
                        onEsrReviewedClick={handleEsrReviewedClick}
                        onRegisterWelcomeEmail={handleRegister}
                      onAcceptClick={handleAcceptClick}
                        onEditClick={() => setIsEditMode(true)}
                        acceptVisibilityLoaded={acceptVisibilityLoaded}
                        canAcceptCase={canAcceptCase}
                        accepting={accepting}
                    />
                )}
            </Box>

            <ConfirmationModal
                open={acceptErrorOpen}
                title="Alert!"
                description="The case is not able to be accepted for the following: Contract type is unknown."
                confirmLabel="OK"
                onConfirm={() => setAcceptErrorOpen(false)}
                onClose={() => setAcceptErrorOpen(false)}
                isDarkMode={isDark}
            />

            <ConfirmationModal
                open={esrOpen}
                title="Before you Continue"
                highlightMessage="Are you sure this Veteran is ESR Reviewed?"
                confirmLabel="Continue"
                cancelLabel="Cancel"
                onConfirm={handleEsrYes}
                onCancel={handleEsrCancel}
                onClose={() => setEsrOpen(false)}
                isDarkMode={isDark}
                actionStyle="filledWarning"
                modalVariant="esrReviewed"
            />

            <ConfirmationModal
                open={vipOpen}
                title="Before you Continue"
                highlightMessage={
                    vipMode === "mark"
                        ? "Are you sure you would like to mark this veteran as VIP?"
                        : "Are you sure you would like to unmark this veteran as VIP?"
                }
                confirmLabel="Continue"
                cancelLabel="Cancel"
                onConfirm={async () => {
                    const isMarked = vipMode === "mark";
                    setVipOpen(false);
                    setIsVip(isMarked);
                    if (esrId) {
                        caseDetailsCache[esrId] = {
                            ...(caseDetailsCache[esrId] || {}),
                            isVip: isMarked,
                        };
                    }
                    dispatch(
                        triggerToast({
                            title: "Successful",
                            message: isMarked
                                ? "This veteran is now marked as VIP."
                                : "This veteran is no longer marked as VIP.",
                            type: "success",
                            position: "top-right",
                            autoClose: 3000,
                        })
                    );
                    if (veteranId) {
                        try {
                            await markAsSensitiveVeteran({
                                IsMarked: isMarked,
                                UserId: 9,
                                VeteranId: veteranId,
                            });
                        } catch { void 0; }
                    }
                }}
                onCancel={() => setVipOpen(false)}
                onClose={() => setVipOpen(false)}
                isDarkMode={isDark}
                actionStyle="filledWarning"
                highlightTone="info"
                modalVariant="esrReviewed"
            />

            <ConfirmationModal
                open={acceptConfirmOpen}
                title="Alert!"
                description="Are you sure you would like to accept the case?"
                confirmLabel="Yes"
                cancelLabel="No"
                onConfirm={handleAcceptConfirmYes}
                onCancel={() => setAcceptConfirmOpen(false)}
                onClose={() => setAcceptConfirmOpen(false)}
                isDarkMode={isDark}
            />
            <ConfirmationModal
                open={moNotProcessedOpen}
                title="Alert!"
                highlightMessage="All MO questions not processed, please process MO questions before accepting the case."
                highlightTone="warning"
                onClose={() => setMoNotProcessedOpen(false)}
                onConfirm={() => setMoNotProcessedOpen(false)}
                confirmLabel="OK"
                isDarkMode={isDark}
                confirmButtonSx={{
                    width: 102,
                    height: 36,
                    minWidth: 102,
                    backgroundColor: "#244794",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "#1d3a7a", boxShadow: "none" },
                }}
/>
        </>
    );
}
