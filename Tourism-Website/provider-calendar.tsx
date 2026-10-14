/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView,
  SchedulerDateChangeEvent,
  SchedulerViewChangeEvent,
  SchedulerEditSlot,
  SchedulerSlotProps,
} from "@progress/kendo-react-scheduler";
import {
  Checkbox,
  Box,
  Typography,
  useTheme,
} from "@mui/material";

import {
  displayDate,
  ModalType,
  removeDuplicateExaminers,
  removeDuplicateFacilities,
  transformApiToSchedulerEvents,
  transformFormDataToPayload,
  getSlotLocalDateString,
} from  "./components/calendar";
import EventIcon from '@mui/icons-material/Event';

import { CalendarTimeSlotModal } from "./components/calendar-time-slot-modal";
import "./components/provider-calendar.css";
import { CustomEditItem, cleanEventTooltipTitle } from "./components/scheduler-edit";
import Loader from "../../components/loader";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import ConfirmationModal from "../../ui/confirmation-modal";
import { triggerToast } from "../../store/slice/toast-slice";
import ReusableSelect from "../../components/hooks/custom-select-hook";
import {
  getAllEvents,
  getAllExaminers,
  validateHoliday,
  createSlot,
  getAllFacilities,
  saveProviderCalendarInfo,
} from "../../services/kendo-react";
import ContentBox from "../../layouts/content-box";
import TabsHeader from "../../components/users/components/tabs-header";
import { getStyles } from "../../components/users/utils/styles";
import AppTooltip from "../../components/app-tooltip";
import { THEME_PRIMITIVES } from "../../theme";

const P = THEME_PRIMITIVES;

interface CustomSlotProps {
  onOpenModal: (slotData: any) => void;
}

export interface FormData {
  id: number;
  type: "Available" | "Event";
  title: string;
  titleDesc: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  repeat: "Never" | "Daily" | "Weekly";
  repeatEvery: number | null;
  repeatEndType: "after" | "on" | null;
  repeatEndAfter: number | null;
  repeatEndDate: string | null;
  recurrenceExceptions: any[];
  recurrenceId?: any;
  repeatOn: string[];
}

const getThemeColors = (isDarkMode: boolean) => ({
  primaryBg: isDarkMode ? P.darkBgSecondary : P.white,
  secondaryBg: isDarkMode ? P.secondarySurfaceDark : P.gridHeaderLight,
  tertiaryBg: isDarkMode ? P.chipSurfaceDark : P.gridHeaderLight,

  // Text colors
  primaryText: isDarkMode ? P.gridHeaderLight : P.black,
  secondaryText: isDarkMode ? P.inputBorderLightSoft : P.textPrimaryDark,
  tertiaryText: isDarkMode ? P.white : P.neutralSurfaceDark,

  // Status colors
  eventColor: P.requiredFieldColor,
  availableColor: P.successAccentPrimary,
  appointmentColor: P.appointmentAccent,

  // UI colors
  checkboxColor: isDarkMode ? P.lightMutedText : undefined,
  primaryBlue: isDarkMode ? P.primaryOnDark : P.primary,

  // Scrollbar colors
  scrollbarTrack: isDarkMode ? P.gridHeaderDark : P.scrollbarTrackLight,
  scrollbarThumb: isDarkMode ? P.neutralSurfaceDark : P.scrollbarThumb,
  scrollbarThumbHover: isDarkMode ? P.placeholderDark : P.scrollbarThumbHover,
  scrollbarCorner: isDarkMode ? P.gridHeaderDark : P.scrollbarTrackLight,
});

const StatusIndicators = ({ screenSize, screenWidth, isSideMenuOpen, isDarkMode }: { screenSize: string, screenWidth: number, isSideMenuOpen: boolean | undefined, isDarkMode: boolean }) => {
  const colors = getThemeColors(isDarkMode);

  const getStatusStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      display: 'flex',
      alignItems: 'center',
      zIndex: 2,
      right: '19vw',
      top: '2.56rem'
    };

    if (isSideMenuOpen && ['tablet'].includes(screenSize)) {
      return { ...baseStyles, right: '16vw', top: "2.3rem", gap: '4px', transform: 'scale(0.8)' }
    }

    if (isSideMenuOpen && ["tablet-small"].includes(screenSize)) {
      return { ...baseStyles, right: '3vw', top: "2.3rem", gap: '4px', transform: 'scale(0.8)' }
    }

    if (screenWidth < 426 && screenWidth > 375 && screenSize === "mobile") {
      return { ...baseStyles, right: '3vw', top: "2rem", gap: '4px', transform: 'scale(0.8)' }
    }

    if (screenWidth < 375 && screenSize === "mobile") {
      return { ...baseStyles, right: '3vw', top: "4.7rem", gap: '4px', transform: 'scale(0.8)' }
    }

    switch (screenSize) {
      case "mobile":
        return {
          ...baseStyles,
          right: '10vw',
          top: "2rem",
          gap: '4px',
          transform: 'scale(0.8)'
        };
      case "tablet-small":
        return {
          ...baseStyles,
          right: '20vw',
          top: "2rem",
          gap: '6px',
          transform: 'scale(0.9)'
        };
      case "tablet":
        return {
          ...baseStyles,
          right: '27vw',
          gap: '6px'
        };
      case "desktop-small":
        return {
          ...baseStyles,
          right: '28.5vw',
          gap: '8px'
        };
      default:
        return {
          ...baseStyles,
          gap: '8px',
          right: '28.5vw',
        };
    }
  };

  const getTextStyles = () => {
    const baseTextStyles = {
      color: colors.tertiaryText,
      fontFamily: 'inherit'
    };

    switch (screenSize) {
      case "mobile":
        return { ...baseTextStyles, fontSize: '10px' };
      case "tablet-small":
        return { ...baseTextStyles, fontSize: '11px' };
      case "tablet":
        return { ...baseTextStyles, fontSize: '12px' };
      case "desktop-small":
        return { ...baseTextStyles, fontSize: '12px' };
      default:
        return { ...baseTextStyles, fontSize: '12px' };
    }
  };

  const getDotSize = () => {
    switch (screenSize) {
      case "mobile":
        return { width: '8px', height: '8px' };
      case "tablet-small":
        return { width: '9px', height: '9px' };
      case "tablet":
        return { width: '9px', height: '9px' };
      case "desktop-small":
        return { width: '11px', height: '11px' };
      default:
        return { width: '11px', height: '11px' };
    }
  };

  const dotSize = getDotSize();
  const Dot = ({ color, title }: { color: string; title: string }) => (
    <AppTooltip title={title} placement="bottom" arrow>
      <div
        style={{
          ...dotSize,
          borderRadius: "50%",
          backgroundColor: color,
          cursor: "pointer",
          transition: "box-shadow 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 10px 2px ${color}`)}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      />
    </AppTooltip>
  );

  const StatusDots = () => (
    <>
      <Dot title="Event" color={colors.eventColor} />
      <Dot title="Available" color={colors.availableColor} />
      <Dot title="Appointment" color={colors.appointmentColor} />
    </>
  );

  return (
    <div style={getStatusStyles()}>
      <span style={getTextStyles()}>Status</span>
      <StatusDots />
    </div>
  );
};


export interface ExaminerInfo {
  ExaminerId?: number;
  ExaminerName?: string;
  FacilityId?: number;
  IsCalInfoAvailable?: boolean;
  UserId?: number;
}

const ProviderCalendar: React.FC = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedExaminer, setSelectedExaminer] = useState<string>("");
  const [selectedExaminerData, setSelectedExaminerData] =
    useState<ExaminerInfo>({});
  const [facilitiesList, setAllFacilitiesList] = useState<any[]>([]);
  const [examinersList, setExaminersList] = useState<any[]>([]);
  const [view, setView] = useState("day");
  const [date, setDate] = useState(displayDate);
  const [schedulerData, setSchedulerData] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formProps, setFormProps] = useState<any | null>(null);
  const [apiRawSlots, setApiRawSlots] = useState<any[]>([]);
  const { authUser } = useSelector((state: RootState) => state.authUser);
  const [modalType, setModalType] = useState<ModalType>(ModalType.CREATE);

  // Responsive state
  const [screenSize, setScreenSize] = useState("desktop");
  const [schedulerHeight, setSchedulerHeight] = useState(600);

  // Modal
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationRecurrenceModalOpen, setConfirmationRecurrenceModalOpen] =
    useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [isCalInfoAvailable, setIsCalInfoAvailable] = useState(false);
  const [isCurrentAndFuture, setIsCurrentAndFuture] = useState(false);
  const [eventData, setEventData] = useState({});
  const dispatch = useDispatch();
  const isSideMenuOpen = useSelector((state: RootState) => state.ui.openStates["sideMenu"]);
  const id = authUser?.id;
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = useTheme();
  const isDarkMode = mode === "dark";
  const colors = getThemeColors(isDarkMode);
  const mounted = useRef(false);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setScreenSize("mobile");
        setSchedulerHeight(600);
      } else if (width < 768) {
        setScreenSize("tablet-small");
        setSchedulerHeight(450);
      } else if (width < 992) {
        setScreenSize("tablet");
        setSchedulerHeight(500);
      } else if (width < 1200) {
        setScreenSize("desktop-small");
        setSchedulerHeight(550);
      } else {
        setScreenSize("desktop");
        setSchedulerHeight(600);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const getResponsiveStyles = (screenWidth: number) => {
    const baseStyles = {
      zIndex: 1,
      position: "relative" as const,
      width: "100%",
      overflow: "hidden" as const,
      borderRadius: "9px",
      // Custom scrollbar styles
      scrollbarWidth: "thin", // For Firefox
      scrollbarColor: `${colors.scrollbarThumb} ${colors.scrollbarTrack}`, // For Firefox
    };

    if (screenSize === "mobile" && screenWidth < 600) {
      return {
        ...baseStyles,
        padding: "4px",
        fontSize: "10px",
        maxWidth: `calc(${screenWidth} - 20)px`,
      };
    }

    switch (screenSize) {
      case "mobile":
        return {
          ...baseStyles,
          padding: "4px",
          fontSize: "10px",
          maxWidth: "300px",
        };
      case "tablet-small":
        return {
          ...baseStyles,
          padding: "12px",
          fontSize: "13px",
        };
      case "tablet":
        return {
          ...baseStyles,
          padding: "16px",
          fontSize: "14px",
        };
      case "desktop-small":
        return {
          ...baseStyles,
          padding: "18px",
          fontSize: "14px",
        };
      default:
        return {
          ...baseStyles,
          padding: "20px 5px",
          fontSize: "15px",
        };
    }
  };

  const getSchedulerConfig = () => {
    const baseConfig = {
      editable: {
        add: true,
        remove: true,
        edit: true,
        drag: true,
        resize: true,
        select: true,
      },
      "data-testid": "scheduler",
      defaultDate: displayDate,
      item: (props: any) => (
        <CustomEditItem
          isDarkMode={isDarkMode}
          apiRawSlots={apiRawSlots}
          {...props}
          handleRecurrenceOpenModal={handleRecurrenceOpenModal}
          getAllEventsSlotsList={getAllEventsSlotsList}
        />
      ),
      slot: (props: any) => (
        <CustomSlot {...props} onOpenModal={handleOpenModal} />
      ),
      data: schedulerData,
      view: view,
      onViewChange: handleViewChange,
      date: date,
      onDateChange: handleDateChange,
      height: schedulerHeight,
    };

    // Mobile-specific adjustments
    if (screenSize === "mobile") {
      return {
        ...baseConfig,
        editable: {
          ...baseConfig.editable,
          resize: false, // Disable resize on mobile for better UX
        },
      };
    }

    return baseConfig;
  };

  /**
   * Open drawer to edit and create an event
   * @param eventData - typically the form Data
   */
  const handleOpenModal = (eventData: any) => {
    setFormProps(eventData);
    setTimeout(() => setDrawerOpen(true), 1);
  };

  const handleRecurrenceOpenModal = (data: any) => {
    const { modalData } = data || {};
    if (modalData?.recurrenceRule) {
      setEventData(data);
      if (!confirmationRecurrenceModalOpen) {
        setConfirmationRecurrenceModalOpen(true);
      }
    } else {
      setModalType(ModalType.EDIT);
      handleOpenModal(modalData);
    }
  };

  const handleViewChange = (event: SchedulerViewChangeEvent) => {
    setView(event.value);
  };

  const handleDateChange = (event: SchedulerDateChangeEvent) => {
    setDate(event.value);
  };

  function formatTo12HourTime(time24: string): string {
    const [hourStr, minuteStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr.padStart(2, "0");

    const amPm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12; // Convert 0 to 12 for 12 AM / 12 PM

    const hourFormatted = hour.toString().padStart(2, "0");

    return `${hourFormatted}:${minute} ${amPm}`;
  }

  const createNewEvent = async (eventData: any) => {
    let startTime = eventData?.StartTime;
    let endTime = eventData?.EndTime;
    if (!startTime.endsWith("AM") && !startTime.endsWith("PM")) {
      startTime = formatTo12HourTime(startTime);
    }

    if (!endTime.endsWith("AM") && !endTime.endsWith("PM")) {
      endTime = formatTo12HourTime(endTime);
    }

    let RepeatOnWeekDays = eventData?.RepeatOnWeekDays;
    if (RepeatOnWeekDays.startsWith(",")) {
      RepeatOnWeekDays = RepeatOnWeekDays.slice(1);
    }
    const payload = {
      ...eventData,
      StartTime: startTime,
      EndTime: endTime,
      CalEndDate: eventData?.CalEndDate || eventData?.CalDate,
      RepeatOnWeekDays,
      Title:
        eventData?.TaskType === "Available"
          ? "Available"
          : eventData?.TitleDesc || "",
    };
    delete payload.TitleDesc;
    try {
      const event: any = await createSlot(payload);
      if (event?.IsSuccess) {
        return { success: true };
      } else {
        setDrawerOpen(true);
        // Show modal with response message
        setConfirmationMessage(
          event?.Response || "There is an issue. Do you want to continue?"
        );
        setPendingPayload({ ...eventData, ContinueOnException: true });
        setConfirmationModalOpen(true);
        return { success: false };
      }
    } catch (error: any) {
      console.error("create event error ", error);
      return { success: false };
    }
  };

  const getAllEventsSlotsList = async (
    facilityId: number = Number(selectedFacility)
  ) => {
    try {
      const slots = await getAllEvents(facilityId, Number(selectedExaminer));
      if (Array.isArray(slots)) {
        setApiRawSlots(slots);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleConfirmationYes = async () => {
    try {
      if (!pendingPayload) return;

      const result = await createNewEvent(pendingPayload);
      if (result.success) {
        setDrawerOpen(false);
        setConfirmationModalOpen(false);
        setPendingPayload(null);
        dispatch(
          triggerToast({
            message:
              modalType === ModalType.CREATE
                ? "Time Slot created successfully."
                : "Appointment has been edited and updated successfully.",
            title: "Successful",
            type: "success",
            position: "top-center",
            autoClose: 4000,
          })
        );
        setTimeout(async () => {
          await getAllEventsSlotsList(Number(selectedFacility));
        }, 500);
      }
    } catch (error) {
      console.error("Error during exception create:", error);
    }
  };

  const handleConfirmationCancel = () => {
    setConfirmationModalOpen(false);
    setPendingPayload(null);
  };

  const handleRecurrenceConfirmationCancel = () => {
    setConfirmationRecurrenceModalOpen(false);
    setPendingPayload(null);
  };

  /**
   * Save from modal - add or update events
   * @param formData - accepts formData
   */
  const handleSaveTimeSlot = async (formData: FormData) => {
    try {
      const examiner = examinersList.find(
        (e) => String(e.ExaminerId) === String(selectedExaminer)
      );

      if (!examiner) {
        console.error("Examiner not found for id:", selectedExaminer);
        return;
      }

      // Look for the original slot (by SlotId or fallback to id)
      const originalSlot = apiRawSlots.find(
        (slot) => slot.SlotId === formData.id || slot.Id === formData.id
      );

      let payload = transformFormDataToPayload(
        formData,
        Number(selectedFacility),
        Number(selectedExaminer),
        examiner.ExaminerName,
        id,
        originalSlot,
        isCurrentAndFuture
      );

      let RepeatOnWeekDays = payload?.RepeatOnWeekDays;
      if (RepeatOnWeekDays && RepeatOnWeekDays.startsWith(",")) {
        RepeatOnWeekDays = RepeatOnWeekDays.slice(1);
      }
      payload = { ...payload };

      let startTime = payload?.StartTime || "";
      let endTime = payload?.EndTime || "";
      if (startTime && !startTime.endsWith("AM") && !startTime.endsWith("PM")) {
        startTime = formatTo12HourTime(startTime);
      }
      if (endTime && !endTime.endsWith("AM") && !endTime.endsWith("PM")) {
        endTime = formatTo12HourTime(endTime);
      }

      payload.StartTime = startTime;
      payload.EndTime = endTime;
      payload.RepeatOnWeekDays = RepeatOnWeekDays;

      if (typeof payload.UserId !== "number" || isNaN(payload.UserId)) {
        delete payload.UserId;
      }

      // 🟨 Call validateHoliday BEFORE createNewEvent
      await validateHoliday({
        ...payload,
        IsCalInfoAvailable: isCalInfoAvailable,
        RepeatOnWeekDays,
      });
      const result = await createNewEvent(payload);
      if (result?.success) {
        dispatch(
          triggerToast({
            message:
              modalType === ModalType.CREATE
                ? "Appointment added successfully."
                : "Appointment has been edited and updated successfully.",
            title: "Successful",
            type: "success",
            position: "top-center",
            autoClose: 4000,
          })
        );
        setDrawerOpen(false);
        setTimeout(async () => {
          await getAllEventsSlotsList(Number(selectedFacility));
        }, 500);
      }
    } catch (error) {
      console.error("Error saving slot:", error);
    }
  };

  const CustomSlot = (props: SchedulerSlotProps & CustomSlotProps) => {
    const handleDoubleClick = () => {
      const start = new Date(props?.start);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const dateStr = getSlotLocalDateString(props?.start, props?.end);
      const startTimeStr = start.toTimeString().substring(0, 5);
      const endTimeStr = end.toTimeString().substring(0, 5);

      const createFormData = {
        id: Math.floor(Math.random() * 1000000),
        type: "Available",
        title: "",
        description: "",
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        repeat: "Never",
        repeatEvery: 1,
        repeatEndType: "",
        repeatEndAfter: "",
        repeatEndDate: "",
        repeatOn: "",
        recurrenceId: Math.floor(Math.random() * 1000) + 1,
        recurrenceExceptions: [],
      };
      setEventData(createFormData);
      setModalType(ModalType.CREATE);
      handleOpenModal(createFormData);
    };

    return <SchedulerEditSlot {...props} onDoubleClick={handleDoubleClick} />;
  };

  const getAllFacilitiesList = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllFacilities();
      if (Array.isArray(list)) {
        const uniqueFacilities = removeDuplicateFacilities(list);
        setAllFacilitiesList(uniqueFacilities);
      } else {
        setAllFacilitiesList([]);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllExaminersList = async (facilityId: number) => {
    try {
      setIsLoading(true);
      const examiners = await getAllExaminers(facilityId);
      if (Array.isArray(examiners)) {
        const uniqueExaminers = removeDuplicateExaminers(examiners);
        setExaminersList(uniqueExaminers);
      } else {
        setExaminersList([]);
      }
    } catch (error) {
      console.error("Error fetching examiners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalendarAvailableToastAndLoad = async (
    examiner = selectedExaminer,
    calendar = showCalendar
  ) => {
    if (selectedFacility && examiner && calendar) {
      setTimeout(() => {
        dispatch(
          triggerToast({
            message: "Calendar marked as available.",
            title: "Successful",
            type: "success",
            position: "top-center",
            autoClose: 4000,
          })
        );
      });
      await getAllEventsSlotsList(Number(selectedFacility));
    }
  };

  const loadCalendarSlot = async () => {
    if (selectedExaminer && selectedFacility) {
      // setShowCalendar(true);
      // handleCalendarAvailableToastAndLoad(selectedExaminer, true);
      await getAllEventsSlotsList();
    }
  };

  useEffect(() => {
    if (selectedExaminer && selectedFacility) {
      loadCalendarSlot();
    }
    /*
    if (!selectedExaminer || !selectedFacility) {
      setShowCalendar(false);
    }
    */
  }, [selectedExaminer, selectedFacility]);

  const availabilityHandler = async (e: { target: { checked: boolean } }) => {
    const checked = e.target.checked;
    try {
      const data = await saveProviderCalendarInfo({
        ...selectedExaminerData,
        IsCalInfoAvailable: checked,
        FacilityId: selectedFacility ? Number(selectedFacility) : undefined,
      }) as boolean;
      setSelectedExaminerData({
        ...selectedExaminerData,
        IsCalInfoAvailable: data,
      });
      setShowCalendar(checked);
      setIsCalInfoAvailable(checked);
      handleCalendarUnavailableToast(
        selectedFacility && selectedExaminer && showCalendar ? false : true
      );
      if (checked) {
        handleCalendarAvailableToastAndLoad(selectedExaminer, checked);
        await getAllEventsSlotsList();
      }
    } catch (error) {
      console.error({ error });
    }
  };

  useEffect(() => {
    const data = transformApiToSchedulerEvents(apiRawSlots);
    setSchedulerData(data);
  }, [apiRawSlots]);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    getAllFacilitiesList();
  }, []);

  const handleCalendarUnavailableToast = (calendar: boolean = showCalendar) => {
    if (!calendar && selectedFacility && selectedExaminer) {
      setTimeout(() => {
        dispatch(
          triggerToast({
            message: "Calendar marked as unavailable.",
            type: "info",
            position: "top-center",
            autoClose: 4000,
          })
        );
      }, 1000);
    }
  };

  const handleRecurrenceConfirmationYes = (val: any) => {
    if (val === "currentAndFuture") {
      setIsCurrentAndFuture(true);
    } else {
      setIsCurrentAndFuture(false);
    }
    setConfirmationRecurrenceModalOpen(false);

    const { modalData } = (eventData as any) || {};
    setModalType(ModalType.EDIT);
    handleOpenModal(modalData);
    setDrawerOpen(true);
  };
  const styles = useMemo(() => getStyles(theme), [theme]);
  return (
  <Box>
    <TabsHeader
      baseTitle="Availability Calendar"
      basePath="/provider-calendar"
      openTabs={[]}
      styles={styles}
      flushInset={false}
    />
  <ContentBox showBorder={false} sx={{ p: 0 }}>
      <Box sx={{ borderRadius: "10px" }}>
        <div
          className="provider-calendar"
          style={{
            backgroundColor: colors.primaryBg,
            color: colors.primaryText,
          }}
        >
          <div className={`search-calendar-card react-custom-select ${isDarkMode ? "search-calendar-card-dark" : ""}`}>
            <div className="search-calendar-card-header">
              <h2 className="search-calendar-card-title">Search Calendar</h2>
            </div>
            <div className="search-calendar-card-body">
              <div className="search-calendar-field">
                <label className="search-calendar-field-label" htmlFor="facility-select">
                  Facility
                </label>
                <ReusableSelect
                  inputId="facility-select"
                  dataTestid="facility-select"
                  options={facilitiesList}
                  value={
                    facilitiesList.find((f) => f.Id === selectedFacility) || null
                  }
                  onChange={() => { }} // gets overridden inside component
                  getOptionLabel={(option) => option.FacilityPracticeName}
                  getOptionValue={(option) => option.Id}
                  placeholder="Search Facility"
                  isDarkMode={isDarkMode}
                  selectedFacility={selectedFacility}
                  setSelectedFacility={setSelectedFacility}
                  selectedExaminer={selectedExaminer}
                  setSelectedExaminer={setSelectedExaminer}
                  showCalendar={showCalendar}
                  setShowCalendar={setShowCalendar}
                  getAllExaminersList={getAllExaminersList}
                  isLoading={isLoading}
                  controlMinHeight={theme.custom?.layout?.searchFacility?.controlHeight ?? 45}
                  customColors={{
                    border: "none",
                    backgroundSecondary: isDarkMode ? P.searchInputBgDark : P.searchInputBgLight,
                  }}
                />
              </div>

              <div className="search-calendar-field">
                <label className="search-calendar-field-label" htmlFor="examiner-select">
                  Examiner
                </label>
                <ReusableSelect
                  inputId="examiner-select"
                  dataTestid="examiner-select"
                  options={examinersList}
                  value={
                    examinersList.find((e) => e.ExaminerId === selectedExaminer) ||
                    null
                  }
                  onChange={(selectedOption) => {
                    const examinerId = selectedOption?.ExaminerId;
                    setSelectedExaminer(examinerId);
                    setSelectedExaminerData(selectedOption);
                    const calAvailable = selectedOption?.IsCalInfoAvailable ?? false;
                    setShowCalendar(calAvailable);
                    setIsCalInfoAvailable(calAvailable);
                  }}
                  getOptionLabel={(option) => option.ExaminerName}
                  getOptionValue={(option) => option.ExaminerId}
                  placeholder="Search Examiner"
                  isDarkMode={isDarkMode}
                  isDisabled={!selectedFacility}
                  isExaminer={true}
                  selectedFacility={selectedFacility}
                  isLoading={isLoading}
                  controlMinHeight={theme.custom?.layout?.searchFacility?.controlHeight ?? 45}
                  customColors={{
                    border: "none",
                    backgroundSecondary: isDarkMode ? P.searchInputBgDark : P.searchInputBgLight,
                  }}
                />
              </div>

              <div className="search-calendar-checkbox">
                <Checkbox
                  id="calendar-available"
                  checked={showCalendar}
                  slotProps={{
                    input: { "aria-label": "Show calendar" },
                  }}
                  onChange={availabilityHandler}
                  size="small"
                  sx={{
                    p: 0,
                    width: 20,
                    height: 20,
                    color: isDarkMode ? colors.checkboxColor : P.labelMuted,
                    "&.Mui-checked": {
                      color: colors.primaryBlue,
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: 20,
                    },
                  }}
                />
                <label
                  htmlFor="calendar-available"
                  className="search-calendar-checkbox-label"
                  style={{ color: colors.primaryText }}
                >
                  Calendar Available
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : selectedFacility && selectedExaminer && showCalendar ? (
            <div style={{ position: 'relative', marginTop: '0' }}>
              <StatusIndicators screenSize={screenSize} screenWidth={window.innerWidth} isSideMenuOpen={isSideMenuOpen} isDarkMode={isDarkMode} />
              <div
                className={`scheduler-container ${isDarkMode ? 'dark' : ''} low-z-index custom-scrollbar`}
                style={getResponsiveStyles(window.innerWidth) as React.CSSProperties}
                onMouseOver={(e) => {
                  const target = (e.target as HTMLElement)?.closest('[title]') as HTMLElement;
                  cleanEventTooltipTitle(target);
                }}
              >
                <Scheduler {...getSchedulerConfig()}>
                  <DayView />
                  <WeekView />
                  <MonthView />
                </Scheduler>
              </div>

            </div>
          ) : <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100%"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    border: `1px solid ${isDarkMode ? P.darkBorder : P.lightBorderPrimary}`,
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? P.calendarUnavailableDark : P.calendarUnavailableLight,
                    cursor: "not-allowed",
                    opacity: 0.7,
                    mb: 3,
                    position: "relative",
                    backdropFilter: "blur(2px)",
                    boxShadow: isDarkMode 
                      ? `inset 0 2px 4px ${P.modalOverlaySoft}` 
                      : `inset 0 2px 4px ${P.lightInsetShadow}`
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      backgroundColor: isDarkMode ? P.drawerOptionHoverDark : P.lightIconCircleBg,
                      mb: 2
                    }}
                  >
                    <EventIcon 
                      sx={{ 
                        fontSize: 32, 
                        color: isDarkMode ? P.placeholderDark : theme.custom?.colors?.mutedTextDark,
                        opacity: 0.8
                      }} 
                    />
                  </Box>
          
                  <Box sx={{ textAlign: "center" }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontSize: 18,
                        fontWeight: 700,
                        color: isDarkMode ? theme.custom?.colors?.mutedTextDark : theme.custom?.colors?.mutedText,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        mb: 0.5
                      }}
                    >
                      Calendar
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: 16,
                        fontWeight: 600,
                        color: isDarkMode ? P.placeholderDark : theme.custom?.colors?.mutedTextDark,
                        textTransform: "uppercase",
                        letterSpacing: 1.5
                      }}
                    >
                      Unavailable
                    </Typography>
                  </Box>
          
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 8px,
                        ${isDarkMode ? P.darkStripeOverlay : P.lightHoverOverlay} 8px,
                        ${isDarkMode ? P.darkStripeOverlay : P.lightHoverOverlay} 16px
                      )`,
                      borderRadius: "12px",
                      pointerEvents: "none"
                    }}
                  />
                </Box>
              </Box>}

          <CalendarTimeSlotModal
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setIsCurrentAndFuture(false);
            }}
            onSave={handleSaveTimeSlot}
            defaultValues={formProps ?? {}}
            modalType={modalType}
            itemId={formProps?.id}
            isCurrentAndFuture={isCurrentAndFuture}
            isDarkMode={isDarkMode}
          />

          <ConfirmationModal
            open={confirmationModalOpen}
            title="Alert"
            description={`${confirmationMessage}${". "}are you sure you would like to continue with this exception?`}
            confirmLabel="Yes"
            cancelLabel="Cancel"
            onConfirm={handleConfirmationYes}
            onCancel={handleConfirmationCancel}
            onClose={handleConfirmationCancel}
            isRecurrence={false}
            isDarkMode={isDarkMode}
            modalVariant="calendarEdit"
          />

          <ConfirmationModal
            open={confirmationRecurrenceModalOpen}
            title="Edit"
            confirmLabel="Update"
            cancelLabel="Cancel"
            onConfirm={handleRecurrenceConfirmationYes}
            onCancel={handleRecurrenceConfirmationCancel}
            onClose={handleRecurrenceConfirmationCancel}
            isRecurrence={true}
            isDarkMode={isDarkMode}
            modalVariant="calendarEdit"
          />
        </div>
      </Box>
    </ContentBox>
  </Box>
  );
};

export default ProviderCalendar;
