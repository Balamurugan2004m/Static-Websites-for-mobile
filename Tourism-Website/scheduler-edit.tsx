/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  SchedulerEditItem,
} from "@progress/kendo-react-scheduler";
import { Dialog } from '@progress/kendo-react-dialogs';
import { deleteEvent } from "../../../services/kendo-react";
import { ModalType, formatLocalDateToYMD, extractDateYMD } from "./calendar";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../../store/slice/toast-slice";
import "./provider-calendar.css";
import { Button, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { THEME_PRIMITIVES } from "../../../theme";



const P = THEME_PRIMITIVES;

// Color constants for reusability
const COLORS = {
  primary: P.primary,
  error: P.requiredFieldColor,
  errorDark: P.errorSoftOnDark,
  success: P.successAccentPrimary,
  warning: P.schedulerBusyText,
  gray: P.labelMuted,
  white: P.white,
  black: P.black,
  yellow: P.schedulerBusyBg,
  lightBlue: P.appointmentAccent,
} as const;

// Background color constants
const BACKGROUND_COLORS = {
  success: {
    light: P.successSurfaceButtonLight,
    dark: P.editSurfaceDarkAlpha,
  },
  error: {
    light: P.dangerSurfaceButtonLight,
    dark: P.dangerOverlaySoft,
  },
  warning: P.schedulerBusyBg,
  default: {
    light: P.appointmentOverlaySoft,
    dark: P.appointmentOverlaySoft,
  },
} as const;

// Common button styles
const BUTTON_STYLES = {
  primary: {
    background: COLORS.primary,
    color: COLORS.white,
    textTransform: "none" as const,
    fontSize: "14px",
    fontWeight: 400,
    borderRadius: "10px",
    minWidth: "90px",
    width: "90px",
    height: "34px",
    boxShadow: "none",
    '&:hover': {
      background: COLORS.primary,
      boxShadow: "none",
      opacity: 0.92,
    },
    '&.Mui-disabled': {
      background: COLORS.primary,
      color: COLORS.white,
      opacity: 0.5,
    },
  },
  cancel: (isDarkMode: boolean) => ({
    backgroundColor: isDarkMode ? P.inputBgDark : "#E5E3E3",
    color: isDarkMode ? COLORS.white : "#454545",
    textTransform: "none" as const,
    fontSize: "14px",
    fontWeight: 400,
    minWidth: "90px",
    width: "90px",
    height: "34px",
    borderRadius: "10px",
    boxShadow: "none",
    textDecoration: "none",
    marginRight: 0,
    '&.MuiButton-contained': {
      backgroundColor: isDarkMode ? P.inputBgDark : "#E5E3E3",
      color: isDarkMode ? COLORS.white : "#454545",
      boxShadow: "none",
    },
    '&:hover, &.MuiButton-contained:hover': {
      backgroundColor: isDarkMode ? P.darkBorder : "#D4D4D4",
      boxShadow: "none",
    },
  }),
  radio: {
    color: COLORS.gray,
    "&.Mui-checked": { color: COLORS.primary },
    backgroundColor: "transparent",
    width: 20,
    height: 20,
  },
  formControlLabel: {
    ml: 1,
    "& .MuiFormControlLabel-label": {
      fontSize: "14px",
      fontWeight: 400,
      paddingLeft: "10px"
    }
  }
} as const;

interface CustomEditItemProps {
  onOpenModal?: (data: boolean) => void;
  setSelectedEvent: (data: any) => void;
  getAllEventsSlotsList: (facilityId?: number) => Promise<void>;
  setModalType?: React.Dispatch<React.SetStateAction<ModalType>>;
  apiRawSlots: any[];
  handleRecurrenceOpenModal?: any;
}

function isRecurrence(event: any) {
  return (
    !!event?.recurrenceRule ||
    (event?.recurrenceId !== null && event?.recurrenceId !== undefined) ||
    (!!event?.Repeat && event.Repeat.toUpperCase() !== "NEVER")
  );
}

// Utility function to get task type styles
const getTaskTypeStyles = (taskType: string, isDarkMode: boolean) => {
  const baseStyle = {
    marginTop: '5px',
    fontWeight: 500,
    borderRadius: 4,
    paddingLeft: 8,
  };

  switch (taskType) {
    case 'Available':
      return {
        ...baseStyle,
        backgroundColor: isDarkMode ? BACKGROUND_COLORS.success.dark : BACKGROUND_COLORS.success.light,
        color: isDarkMode ? COLORS.white : COLORS.black,
        borderLeft: `4px solid ${COLORS.success}`,
      };
    case 'Event':
      return {
        ...baseStyle,
        backgroundColor: isDarkMode ? BACKGROUND_COLORS.error.dark : BACKGROUND_COLORS.error.light,
        color: isDarkMode ? COLORS.white : COLORS.black,
        borderLeft: `4px solid ${COLORS.error}`,
      };
    case 'Busy':
      return {
        ...baseStyle,
        backgroundColor: BACKGROUND_COLORS.warning,
        color: COLORS.warning,
        borderLeft: '4px solid yellow',
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: isDarkMode ? BACKGROUND_COLORS.default.dark : BACKGROUND_COLORS.default.light,
        color: isDarkMode ? COLORS.white : COLORS.black,
        borderLeft: `4px solid ${COLORS.lightBlue}`,
      };
  }
};


export const CustomEditItem = (props: any & CustomEditItemProps) => {
  const [isOccurrence, setIsOccurrence] = useState(false);
  const [isRegularDelete, setIsRegularDelete] = useState(false);
  const dispatch = useDispatch();
  const resetDeleteStates = () => {
    setIsOccurrence(false);
    setIsRegularDelete(false);
  };

  const handleClickAction = (event: any) => {
    const target = event.syntheticEvent?.target as HTMLElement;

    // Ignore clicks that originate from within one of our delete/occurrence dialogs —
    // otherwise clicking Cancel inside the dialog bubbles here, hits the "else" branch
    // below, and re-opens the Edit drawer while leaving the dialog visible.
    const isFromDeleteDialog =
      target?.closest('.occurrence-delete-event-modal') ||
      target?.closest('.occurrence-action-btn') ||
      target?.closest('.k-dialog') ||
      target?.closest('.k-window');
    if (isFromDeleteDialog) {
      return null;
    }

    const isDeleteClick =
      target?.closest('[title="Delete"]') ||
      target?.closest('.k-scheduler-delete') ||
      target?.closest('.k-icon.k-i-trash') ||
      target?.closest('button[aria-label="Delete"]');
    if (isDeleteClick) {
      const isRecurringInstance = isRecurrence(props?.dataItem);
      setIsOccurrence(isRecurringInstance);
      setIsRegularDelete(!isRecurringInstance);
      return null;
    }
    const re = getSlotAndTaskIdById(props.dataItem?.id)
    props.handleRecurrenceOpenModal({ type: ModalType.EDIT, modalData: { ...props.dataItem, TaskType: re?.TaskType } })
    return null;
  };

  function getSlotAndTaskIdById(id: number | string | undefined) {
    if (id === undefined || id === null) return null;
    const match = props.apiRawSlots?.find(
      (item: any) => {
        const itemSlotId = item?.SlotId ?? item?.slotId ?? item?.Id ?? item?.id;
        return Number(itemSlotId) === Number(id);
      }
    );
    if (match) {
      return {
        slotId: match.SlotId ?? match.slotId ?? match.Id ?? match.id,
        taskId: match.TaskId ?? match.taskId,
        TaskType: match?.TaskType ?? match?.taskType ?? match?.type
      };
    }
    return null;
  }

  const resolveSlotAndTaskId = (dataItem: any, calDateStr: string) => {
    let slotId = dataItem?.SlotId ?? dataItem?.slotId;
    let taskId = dataItem?.TaskId ?? dataItem?.taskId;
    let taskType = dataItem?.TaskType ?? dataItem?.type;

    if (props.apiRawSlots && props.apiRawSlots.length > 0) {
      // 1. If we have taskId, look for slot on that specific occurrence date
      if (taskId) {
        const matchByTaskAndDate = props.apiRawSlots.find((item: any) => {
          const itemTaskId = item?.TaskId ?? item?.taskId;
          if (Number(itemTaskId) !== Number(taskId)) return false;
          const rawStart = item?.Start ?? item?.start;
          const itemDate = extractDateYMD(rawStart);
          return itemDate === calDateStr;
        });
        if (matchByTaskAndDate) {
          slotId = matchByTaskAndDate.SlotId ?? matchByTaskAndDate.slotId ?? matchByTaskAndDate.Id ?? matchByTaskAndDate.id;
          taskId = matchByTaskAndDate.TaskId ?? matchByTaskAndDate.taskId ?? taskId;
          taskType = matchByTaskAndDate.TaskType ?? matchByTaskAndDate.taskType ?? matchByTaskAndDate.type ?? taskType;
        }
      }

      // 2. Look by ID if slotId or taskId is still missing
      if (!taskId || !slotId) {
        const targetId = dataItem?.id ?? dataItem?.SlotId ?? dataItem?.slotId;
        const matchById = props.apiRawSlots.find((item: any) => {
          const itemSlotId = item?.SlotId ?? item?.slotId ?? item?.Id ?? item?.id;
          return Number(itemSlotId) === Number(targetId);
        });
        if (matchById) {
          slotId = slotId ?? (matchById.SlotId ?? matchById.slotId ?? matchById.Id ?? matchById.id);
          taskId = taskId ?? (matchById.TaskId ?? matchById.taskId);
          taskType = taskType ?? (matchById.TaskType ?? matchById.taskType ?? matchById.type);
        }
      }

      // 3. Fallback: Search in apiRawSlots by date alone (vital when slotId defaulted to master event)
      if (!slotId || Number(slotId) === Number(dataItem?.id)) {
        const matchByDate = props.apiRawSlots.find((item: any) => {
          const rawStart = item?.Start ?? item?.start;
          const itemDate = extractDateYMD(rawStart);
          return itemDate === calDateStr;
        });
        if (matchByDate) {
          slotId = matchByDate.SlotId ?? matchByDate.slotId ?? matchByDate.Id ?? matchByDate.id;
          taskId = taskId ?? (matchByDate.TaskId ?? matchByDate.taskId);
          taskType = taskType ?? (matchByDate.TaskType ?? matchByDate.taskType ?? matchByDate.type);
        }
      }
    }

    return {
      slotId: Number(slotId) || 0,
      taskId: Number(taskId) || 0,
      taskType: taskType || "Available"
    };
  };

  const handleDeleteEvent = async (SlotId: any, TaskId: any, EditOption: string, CalDate: any) => {
    const payload = {
      SlotId: Number(SlotId) || 0,
      slotId: Number(SlotId) || 0,
      TaskId: Number(TaskId) || 0,
      taskId: Number(TaskId) || 0,
      EditOption,
      editOption: EditOption,
      CalDate,
      calDate: CalDate,
    };

    try {
      const deleteResponse: any = await deleteEvent(payload);
      resetDeleteStates();

      const isSuccess = Boolean(
        deleteResponse?.isSuccess ??
        deleteResponse?.IsSuccess ??
        deleteResponse?.success
      );

      if (isSuccess) {
        dispatch(
          triggerToast({
            message: "Appointment deleted successfully.",
            title: "Successful",
            type: "success",
            position: "top-center",
            autoClose: 3000,
          })
        );
        await props.getAllEventsSlotsList();
      } else {
        const errorMessage =
          deleteResponse?.response ||
          deleteResponse?.Response ||
          deleteResponse?.message ||
          "Failed to delete appointment.";
        dispatch(
          triggerToast({
            message: errorMessage,
            title: "Message",
            type: "error",
            position: "top-center",
            autoClose: 5000,
          })
        );
      }
    } catch (error) {
      console.error("❌ Delete failed:", error);
      resetDeleteStates();
      dispatch(
        triggerToast({
          message: "Failed to delete appointment.",
          title: "Error",
          type: "error",
          position: "top-center",
          autoClose: 4000,
        })
      );
    }
  };

  const OccurrenceDeleteEventModal = (modalProps: any) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    if (modalProps.dataItem?.type === "APPT") {
      return;
    }
    const handleConfirm = () => {
      const rawStart = modalProps.dataItem?.start ?? modalProps.dataItem?.date;
      const calDateStr = extractDateYMD(rawStart) || formatLocalDateToYMD(new Date());
      const editOption = selectedOption === "current" ? "C" : "CF";
      const { slotId, taskId } = resolveSlotAndTaskId(modalProps.dataItem, calDateStr);

      handleDeleteEvent(slotId, taskId, editOption, calDateStr);
    };

    const handleCancel = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      resetDeleteStates();
      if (typeof modalProps.onCancel === "function") modalProps.onCancel();
    };

    const handleClose = () => {
      resetDeleteStates();
      if (typeof modalProps.onClose === "function") modalProps.onClose();
    };

    const isDarkMode = modalProps?.isDarkMode || false;
    return (
      <Dialog
        id={`${isDarkMode ? 'OccurrenceDeleteEventModalDark' : 'OccurrenceDeleteEventModal'}`}
        title="Delete Occurrence"
        onClose={handleClose}
        themeColor={isDarkMode ? "dark" : "light"}
        contentStyle={{ textAlign: "left", padding: "0px", fontSize: "14px", fontWeight: 700 }}
      >
        <div className={`occurrence-delete-event-modal ${isDarkMode ? 'dark' : ''}`}>
          <p style={{ fontSize: "14px", marginBottom: "24px", fontWeight: 400, marginTop: 0 }}>Do you want to delete:{" "}<strong>{modalProps.dataItem?.title}</strong></p>

          <RadioGroup
            name="deleteOption"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            sx={{ m: 0 }}
          >
            <FormControlLabel
              style={{ marginBottom: "23px" }}
              value="current"
              control={
                <Radio sx={BUTTON_STYLES.radio} />
              }
              label="Current occurrence"
              sx={BUTTON_STYLES.formControlLabel}
            />
            <FormControlLabel
              value="future"
              control={
                <Radio sx={BUTTON_STYLES.radio} />
              }
              label="Current and future occurrences"
              sx={BUTTON_STYLES.formControlLabel}
            />
          </RadioGroup>

        </div>
        <div className={`occurrence-action-btn ${isDarkMode ? 'dark' : ''}`}>
          <Button variant="contained" disableElevation onClick={handleCancel} sx={BUTTON_STYLES.cancel(isDarkMode)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleConfirm}
            disabled={!selectedOption}
            sx={BUTTON_STYLES.primary}
          >
            Confirm
          </Button>
        </div>
      </Dialog>
    );
  };

  const RegularDeleteEventModal = (modalProps: any) => {
    if (modalProps.dataItem?.type === "APPT") {
      return;
    }
    const handleConfirm = () => {
      const rawStart = modalProps.dataItem?.start ?? modalProps.dataItem?.date;
      const calDateStr = extractDateYMD(rawStart) || formatLocalDateToYMD(new Date());
      const { slotId, taskId } = resolveSlotAndTaskId(modalProps.dataItem, calDateStr);
      handleDeleteEvent(
        slotId,
        taskId,
        "C",
        calDateStr
      );
    };

    const handleCancel = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      resetDeleteStates();
      if (typeof modalProps.onCancel === "function") modalProps.onCancel();
    };

    const handleClose = () => {
      resetDeleteStates();
      if (typeof modalProps.onClose === "function") modalProps.onClose();
    };

    const isDarkMode = modalProps?.isDarkMode || false;

    return (
      <Dialog
        id={`${isDarkMode ? "RegularDeleteEventModalDark" : "RegularDeleteEventModal"}`}
        title="Delete Event"
        onClose={handleClose}
        themeColor={isDarkMode ? "dark" : "light"}
        contentStyle={{ textAlign: "left", padding: "0px", fontSize: "14px" }}
      >
        <div className={`occurrence-delete-event-modal ${isDarkMode ? "dark" : ""}`}>
          <p style={{ fontSize: "14px", marginBottom: "20px" }}>
            Are you sure you want to delete{" "}
            <strong>{modalProps.dataItem?.title}</strong>?
          </p>
        </div>

        <div className={`occurrence-action-btn ${isDarkMode ? "dark" : ""}`}>
          <Button
            variant="contained"
            disableElevation
            onClick={handleCancel}
            sx={BUTTON_STYLES.cancel(isDarkMode)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleConfirm}
            sx={BUTTON_STYLES.primary}
          >
            Confirm
          </Button>
        </div>
      </Dialog>
    );
  };

  const taskType = props?.dataItem?.type || props?.dataItem?.TaskType;
  const styleOverrides = getTaskTypeStyles(taskType, props?.isDarkMode);
  const isDarkMode = props?.isDarkMode;
  const withDarkMode = (Component: any): any => (props: any): any => (
    <Component {...props} isDarkMode={isDarkMode} />
  );

  const DarkModeOccurrenceDialog = withDarkMode(OccurrenceDeleteEventModal);
  const DarkRegularDeleteEventModal = withDarkMode(RegularDeleteEventModal);

  const handleMouseEnter = (event: any) => {
    const target = (event?.syntheticEvent?.target || event?.target) as HTMLElement;
    const eventContainer = target?.closest('.k-event') as HTMLElement || target;
    cleanEventTooltipTitle(eventContainer);
  };

  return (
    <SchedulerEditItem
      {...props}
      onClickAction={handleClickAction}
      onDoubleClickAction={handleClickAction}
      onMouseEnter={handleMouseEnter}
      onMouseOver={handleMouseEnter}
      removeDialog={DarkRegularDeleteEventModal}
      occurrenceDialog={DarkModeOccurrenceDialog}
      showOccurrenceDialog={isOccurrence}
      showRemoveDialog={isRegularDelete}
      style={{
        ...props.style,
        ...styleOverrides,
      }}
    />
  );
};

/**
 * Strips the leading parenthesis time range and followed colon (e.g. "(6:00 AM - 7:30 AM): ")
 * from any title attributes within the element to match legacy application format.
 */
export const cleanEventTooltipTitle = (element: HTMLElement | null) => {
  if (!element) return;
  const elementsWithTitle: HTMLElement[] = [
    ...(element.hasAttribute("title") ? [element] : []),
    ...Array.from(element.querySelectorAll<HTMLElement>("[title]")),
  ];
  elementsWithTitle.forEach((item) => {
    const rawTitle = item.getAttribute("title");
    if (rawTitle && /^\s*\([^)]+\):/.test(rawTitle)) {
      item.setAttribute("title", rawTitle.replace(/^\s*\([^)]+\):\s*/, ""));
    }
  });
};
