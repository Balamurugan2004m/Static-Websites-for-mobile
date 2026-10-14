/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import {
  Typography,
  FormControl,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  FormHelperText,
  FormGroup,
  MenuItem,
  Box,
  Popper,
  Paper,
  ClickAwayListener,
  InputAdornment,
  IconButton,
  List,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CustomSelect from "./custom-select";
import ReusableDrawer from "../../../ui/reusable-drawer";
import { THEME_PRIMITIVES } from "../../../theme";
import { formatLocalDateToYMD, ModalType } from "./calendar";

const repeatOptions = ["Never", "Daily", "Weekly"];
const daysOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const P = THEME_PRIMITIVES;

const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const hStr = displayHour.toString().padStart(2, "0");
      const mStr = min.toString().padStart(2, "0");
      options.push(`${hStr}:${mStr} ${period}`);
    }
  }
  return options;
};

const TIME_SLOT_OPTIONS = generateTimeOptions();

/**
 * Auto-corrects time string as user types:
 * - 'am' -> 'AM', 'pm' -> 'PM'
 * - 'a.m.' -> 'AM', 'p.m.' -> 'PM'
 * - '9:00 a' -> '9:00 AM', '9:00 p' -> '9:00 PM'
 */
export function autoCorrectTimeText(input: string): string {
  if (!input) return "";
  let val = input
    .replace(/a\.?m\.?/gi, "AM")
    .replace(/p\.?m\.?/gi, "PM");

  val = val.replace(/(\d)\s*a$/i, "$1 AM");
  val = val.replace(/(\d)\s*p$/i, "$1 PM");
  return val;
}

/**
 * Safe 12-hour normalization:
 * - Converts 24-hr like "13:00" -> "01:00 PM", "00:00" -> "12:00 AM"
 * - Normalizes "9:00 AM" or "9:30pm" -> "09:00 AM", "09:30 PM"
 * - Normalizes hour-only like "9 AM" -> "09:00 AM", "14" -> "02:00 PM"
 */
export function normalizeTimeTo12Hour(input: string): string {
  if (!input) return "";
  const cleaned = autoCorrectTimeText(input).trim();

  // 1. "HH:mm AM/PM" or "H:mm AM/PM"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = match12[2];
    const period = match12[3].toUpperCase();
    if (hour === 0) hour = 12;
    if (hour > 12) hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
  }

  // 2. "HH:mm" 24-hour format
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let hour = parseInt(match24[1], 10);
    const minute = match24[2];
    if (hour >= 0 && hour <= 23 && parseInt(minute, 10) >= 0 && parseInt(minute, 10) <= 59) {
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
    }
  }

  // 3. Hour with AM/PM: "9 AM", "11PM"
  const matchHourAmpm = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (matchHourAmpm) {
    let hour = parseInt(matchHourAmpm[1], 10);
    const period = matchHourAmpm[2].toUpperCase();
    if (hour === 0) hour = 12;
    if (hour > 12) hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:00 ${period}`;
  }

  // 4. Standalone number: "9", "14"
  const matchSingleNum = cleaned.match(/^(\d{1,2})$/);
  if (matchSingleNum) {
    let hour = parseInt(matchSingleNum[1], 10);
    if (hour >= 0 && hour <= 23) {
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour.toString().padStart(2, "0")}:00 ${period}`;
    }
  }

  return cleaned;
}

const defaultFormData = {
  type: "",
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  repeat: "",
  repeatEvery: 1,
  repeatEndType: "",
  repeatEndAfter: 1,
  repeatEndDate: "",
  repeatOn: "",
};

interface FormData {
  type: string;
  title: string;
  titleDesc?: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  repeat: string;
  repeatEvery: number;
  repeatEndType: string;
  repeatEndAfter: number | string;
  repeatEndDate: string | null;
  repeatOn: string;
}

// Reusable theme styles
const createThemeStyles = (isDarkMode: boolean) => ({
  colors: {
    primary: P.primary,
    error: P.requiredFieldColor,
    errorDark: P.errorSoftOnDark,
    text: {
      primary: isDarkMode ? P.white : P.black,
      secondary: isDarkMode ? P.white : P.labelMuted,
    },
    background: {
      primary: isDarkMode ? P.gridHeaderDark : P.white,
      secondary: isDarkMode ? P.secondaryElevatedDark : P.gridHeaderLight,
      input: isDarkMode ? P.gridHeaderDark : P.white,
    },
    border: isDarkMode ? P.inputBgDark : P.stroke,
    scrollbar: {
      track: isDarkMode ? P.scrollbarTrackDark : P.scrollbarTrackLight,
      thumb: P.scrollbarThumb,
      thumbHover: P.scrollbarThumbHover,
    }
  },
  typography: {
    fontSize: {
      small: "12px",
      medium: "14px",
      large: "16px",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    }
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "21px",
  },
  borderRadius: "10px",
  inputPadding: "6px 8px",
});

// Reusable component styles
const createComponentStyles = (theme: ReturnType<typeof createThemeStyles>) => ({
  inputField: {
    "& .MuiInputBase-root": {
      padding: theme.inputPadding,
      borderRadius: theme.borderRadius,
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text.primary,
    },
  },
  textField: {
    "& input": {
      padding: theme.inputPadding,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text.primary,
    },
    "& input::placeholder": {
      fontSize: theme.typography.fontSize.medium,
      opacity: 1,
    },
    "& input::-webkit-calendar-picker-indicator": {
      filter: theme.colors.text.primary === P.white ? "invert(1)" : "none",
    },
    "& input::-webkit-calendar-picker-indicator:hover": {
      cursor: "pointer",
    },
  },
  textarea: {
    "& textarea": {
      padding: theme.inputPadding,
      fontSize: theme.typography.fontSize.medium,
    },
    "& textarea::placeholder": {
      fontSize: theme.typography.fontSize.medium,
      opacity: 1,
    },
  },
  scrollbar: {
    scrollbarWidth: "thin",
    scrollbarColor: `${theme.colors.scrollbar.thumb} ${theme.colors.scrollbar.track}`,
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: theme.colors.scrollbar.track,
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: theme.colors.scrollbar.thumb,
      borderRadius: "3px",
      "&:hover": {
        background: theme.colors.scrollbar.thumbHover,
      },
    },
    "&::-webkit-scrollbar-corner": {
      background: theme.colors.scrollbar.track,
    },
  },
  button: {
    primary: {
      background: theme.colors.primary,
      textTransform: "capitalize" as const,
      fontSize: theme.typography.fontSize.medium,
      borderRadius: theme.borderRadius,
      color: P.white,
      boxShadow: "none",
      '&:hover': {
        boxShadow: "none"
      }
    },
    cancel: {
      color: theme.colors.text.primary === P.white ? theme.colors.errorDark : theme.colors.error,
      textTransform: "capitalize" as const,
      fontSize: theme.typography.fontSize.medium,
    }
  },
  checkbox: {
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
      color: theme.colors.text.secondary
    },
  }
});

interface EditableTimeDropdownProps {
  testId: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  isDarkMode?: boolean;
  styles: any;
  inputSx: any;
}

const EditableTimeDropdown = ({
  testId,
  value,
  onChange,
  disabled,
  error,
  helperText,
  isDarkMode,
  styles,
  inputSx,
}: EditableTimeDropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) {
      onChange("");
      return;
    }
    // Auto-correct am -> AM, pm -> PM
    const corrected = autoCorrectTimeText(raw);
    // If complete time like 24-hr "13:00" or 12-hr "09:00 AM", format immediately
    if (
      /^(\d{1,2}):(\d{2})$/.test(corrected) ||
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(corrected)
    ) {
      onChange(normalizeTimeTo12Hour(corrected));
    } else {
      onChange(corrected);
    }
  };

  const handleBlur = () => {
    if (value) {
      onChange(normalizeTimeTo12Hour(value));
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
        <TextField
          data-testid={testId}
          fullWidth
          disabled={disabled}
          error={error}
          helperText={helperText}
          value={value || ""}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onBlur={handleBlur}
          placeholder="hh:mm AM/PM"
          inputProps={{
            autoComplete: "off",
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                  }}
                  tabIndex={-1}
                  sx={{
                    color: isDarkMode ? P.white : P.labelMuted,
                    p: "4px",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            ...styles.textField,
            "& .MuiInputBase-root": {
              padding: "2px 8px 2px 2px",
              borderRadius: "10px",
              fontSize: "14px",
              color: isDarkMode ? P.white : P.black,
            },
            "& input": {
              padding: "6px 8px",
              fontSize: "14px",
              color: isDarkMode ? P.white : P.black,
            },
            ...inputSx,
          }}
        />
        <Popper
          open={open && !disabled}
          anchorEl={containerRef.current}
          placement="bottom-start"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
          sx={{
            zIndex: (theme) => theme.zIndex.modal + 200,
            mt: "4px",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              maxHeight: 280,
              overflowY: "auto",
              backgroundColor: isDarkMode ? P.darkBgSecondary : P.white,
              color: isDarkMode ? P.white : P.black,
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              ...styles.scrollbar,
            }}
          >
            <List dense sx={{ py: 0.5 }}>
              {TIME_SLOT_OPTIONS.map((time) => (
                <MenuItem
                  key={time}
                  selected={time === value}
                  onClick={() => {
                    onChange(time);
                    setOpen(false);
                  }}
                  sx={{
                    fontSize: "14px",
                    py: 1,
                    px: 2,
                    "&.Mui-selected": {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.16)"
                        : "rgba(25, 118, 210, 0.12)",
                      fontWeight: 600,
                    },
                  }}
                >
                  {time}
                </MenuItem>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export const CalendarTimeSlotModal = ({
  open = true,
  onClose,
  onSave,
  defaultValues = {},
  itemId,
  isCurrentAndFuture,
  isDarkMode,
  modalType,
}: any) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState({
    startTime: "",
    endTime: "",
    titleDesc: "",
    repeatEvery: "",
    repeatEnd: "",
    repeatOn: "",
  });

  const theme = createThemeStyles(isDarkMode);
  const styles = createComponentStyles(theme);

  function convertToFormData(event: any): FormData {
    try {
      const start = new Date(event.start);
      const end = new Date(event.end);

      let repeat = "Never";
      let repeatEvery = 1;
      let repeatEndType = "";
      let repeatEndAfter = 1;
      let repeatEndDate = null;
      let repeatOn = "";

      if (event.recurrenceRule) {
        const ruleParts = event.recurrenceRule
          .split(";")
          .reduce((acc: any, part: string) => {
            const [key, value] = part.split("=");
            acc[key] = value;
            return acc;
          }, {});

        if (ruleParts.FREQ === "DAILY") {
          repeat = "Daily";
        } else if (ruleParts.FREQ === "WEEKLY") {
          repeat = "Weekly";
          if (ruleParts.BYDAY) {
            // Map BYDAY strings (e.g. SU, MO) to index strings ("0" to "6")
            const dayToIndexMap: Record<string, string> = {
              SU: "0",
              MO: "1",
              TU: "2",
              WE: "3",
              TH: "4",
              FR: "5",
              SA: "6",
            };
            repeatOn = ruleParts.BYDAY.split(",")
              .map((day: string) => dayToIndexMap[day].trim())
              .filter(Boolean)
              .join(",");
          }
        }

        if (ruleParts.INTERVAL) {
          repeatEvery = +ruleParts.INTERVAL;
        }

        if (ruleParts.COUNT) {
          repeatEndType = "after";
          repeatEndAfter = event?.RepeatEndAfterInterval
            ? event?.RepeatEndAfterInterval
            : +ruleParts.COUNT;
        } else if (ruleParts.UNTIL) {
          repeatEndType = "on";
          const until = ruleParts.UNTIL.slice(0, 8);
          repeatEndDate = `${until.slice(0, 4)}-${until.slice(
            4,
            6
          )}-${until.slice(6, 8)}`;
        }
      }
      return {
        type: event?.TaskType || "Event",
        title: event.title || "",
        titleDesc: event?.titleDesc || "",
        description: event.description || "",
        date: formatLocalDateToYMD(start),
        startTime: normalizeTimeTo12Hour(start.toTimeString().substring(0, 5)),
        endTime: normalizeTimeTo12Hour(end.toTimeString().substring(0, 5)),
        repeat,
        repeatEvery,
        repeatEndType,
        repeatEndAfter,
        repeatEndDate,
        repeatOn,
      };
    } catch (error) {
      console.error("Failed to convert event to form data", error);
      return { ...defaultFormData };
    }
  }

  useEffect(() => {
    if (
      defaultValues &&
      defaultValues?.title?.length > 0 &&
      Object.keys(defaultValues).length > 0
    ) {
      setFormData(convertToFormData(defaultValues));
    } else {
      const merged = {
        ...defaultFormData,
        ...(defaultValues || {}),
      };
      if (!merged.repeatEvery || merged.repeatEvery === "") {
        merged.repeatEvery = 1;
      }
      if (merged.startTime) merged.startTime = normalizeTimeTo12Hour(merged.startTime);
      if (merged.endTime) merged.endTime = normalizeTimeTo12Hour(merged.endTime);
      setFormData(merged);
    }
  }, [defaultValues]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const next = {
        ...prev,
        [field]: value,
      };
      if (
        field === "repeat" &&
        value !== "Never" &&
        (!prev.repeatEvery || prev.repeatEvery === "" || prev.repeatEvery === 0)
      ) {
        next.repeatEvery = 1;
      }
      return next;
    });
  };
  // === Validation Function ===
  const validateFormData = (formData: any) => {
    const errors: any = {};
    const {
      type,
      titleDesc,
      startTime,
      endTime,
      repeat,
      repeatEvery,
      repeatEndAfter,
      repeatEndDate,
      repeatOn,
    } = formData;

    // TIME VALIDATIONS
    function isValidTimeFormat(str: string): boolean {
      if (!str) return false;
      const t = str.trim().toUpperCase();
      const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
      if (m12) {
        const h = parseInt(m12[1], 10);
        const m = parseInt(m12[2], 10);
        return h >= 1 && h <= 12 && m >= 0 && m <= 59;
      }
      const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
      if (m24) {
        const h = parseInt(m24[1], 10);
        const m = parseInt(m24[2], 10);
        return h >= 0 && h <= 23 && m >= 0 && m <= 59;
      }
      return false;
    }

    if (!startTime) {
      errors.startTime = "Start time is required";
    } else if (!isValidTimeFormat(startTime)) {
      errors.startTime = "Please enter a valid time (e.g. 09:00 AM)";
    }

    if (!endTime) {
      errors.endTime = "End time is required";
    } else if (!isValidTimeFormat(endTime)) {
      errors.endTime = "Please enter a valid time (e.g. 10:00 AM)";
    }

    function parseTime(timeStr: string): Date {
      let hours = 0,
        minutes = 0;

      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        // 12-hour format
        const [time, modifier] = timeStr.split(" ");
        [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
      } else {
        // 24-hour format
        [hours, minutes] = timeStr.split(":").map(Number);
      }

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    if (startTime && endTime && !errors.startTime && !errors.endTime) {
      const start = parseTime(startTime);
      const end = parseTime(endTime);

      if (end <= start) {
        errors.endTime = "End time must be after start time";
      }
    }

    // EVENT TITLE
    if (type === "Event" && !titleDesc?.trim()) {
      errors.titleDesc = "Title is required for Event";
    }

    // REPEAT: DAILY or WEEKLY
    const needsRepeatValidation = repeat === "Daily" || repeat === "Weekly";
    if (needsRepeatValidation) {
      // Repeat every
      if (
        repeatEvery === null ||
        repeatEvery === "" ||
        isNaN(Number(repeatEvery)) ||
        Number(repeatEvery) <= 0
      ) {
        errors.repeatEvery = "Repeat every must be a positive number";
      }

      // Ends validation
      const hasEndAfter = repeatEndAfter && Number(repeatEndAfter) > 0;
      const hasEndDate = !!repeatEndDate;

      if (!hasEndAfter && !hasEndDate) {
        errors.repeatEnd = 'Please fill either "end after" or "end date"';
        errors.repeatEndAfter = "Required if no end date";
        errors.repeatEndDate = "Required if no end after";
      }
    }

    // WEEKLY: Repeat On validation
    // WEEKLY: Repeat On validation (string format)
    if (repeat === "Weekly") {
      if (!repeatOn || repeatOn.trim() === "") {
        errors.repeatOn = "Select at least one day for Weekly repeat";
      }
    }

    // Inside your validateFormData
    if (repeat !== "Never") {
      if (!formData.repeatEndType) {
        errors.repeatEnd = "Please select how the recurrence ends.";
      } else if (
        formData.repeatEndType === "after" &&
        !formData.repeatEndAfter
      ) {
        errors.repeatEnd = "Please enter how many occurrences.";
      } else if (formData.repeatEndType === "on" && !formData.repeatEndDate) {
        errors.repeatEnd = "Please select an end date.";
      }
    }
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        startTime: normalizeTimeTo12Hour(formData.startTime),
        endTime: normalizeTimeTo12Hour(formData.endTime),
        id: itemId,
        recurrenceId:
          formData?.repeat !== "Never"
            ? Math.floor(Math.random() * 1000000)
            : null,
        ...(defaultValues?.title !== "" && { editOption: "C" }),
      };
      onSave(updatedFormData);
    } catch (error) {
      console.error("Failed to submit form", error);
    }
  };

  const inputSx = {
    "& .MuiInputBase-root": {
      position: "relative",
      padding: "5px",
      borderRadius: "10px",
      fontSize: "12px",
      color: isDarkMode ? P.white : P.black,
    },
  };

  const isEditSlot = defaultValues?.title ? true : false;
  const isRepeatEvent = ["Daily", "Weekly"].includes(formData?.repeat);

  const renderLabel = (text: string, required = false) => (
    <span style={{
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.medium
    }}>
      {text} {required && <span style={{ color: "red" }}>*</span>}
    </span>
  );

  return (
    <ReusableDrawer
      open={open}
      onClose={onClose}
      title={!defaultValues?.title ? "Create Time Slot" : "Edit Time Slot"}
      onSave={handleSubmit}
      onCancel={onClose}
      isDark={isDarkMode}
      btnText={modalType === ModalType.EDIT ? "Update" : "Save"}
      cancelBtnText="Cancel"
      cancelBtnVariant="contained"
      footerAlign="end"
      drawerWidth={600}
      saveBtnRadius={10}
    >
      <Box fontSize={theme.typography.fontSize.small}>
        <CustomSelect
          label="Type"
          value={formData.type}
          onChange={(e) => handleChange("type", e)}
          options={["Available", "Event"]}
          required={true}
          disabled={formData.type === "APPT" || isEditSlot}
          isDarkMode={isDarkMode}
        />

        {/* Date */}
        <FormControl fullWidth margin="normal" sx={styles.inputField}>
          <label
            htmlFor="date-input"
            style={{
              fontWeight: theme.typography.fontWeight.medium,
              marginBottom: theme.spacing.xs,
              display: "block"
            }}
          >
            {renderLabel("Date", true)}
          </label>
          <TextField
            fullWidth
            id="date-input"
            type="date"
            inputProps={{ lang: "en-US" }}
            value={formData.date || ""}
            onChange={(e) => handleChange("date", e.target.value)}
            disabled={isEditSlot}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarMonthOutlinedIcon
                    sx={{
                      fontSize: "20px",
                      color: isDarkMode ? P.white : P.labelMuted,
                      pointerEvents: "none",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              ...styles.textField,
              position: "relative",
              "& .MuiInputBase-root": {
                position: "relative",
              },
              "& input::-webkit-calendar-picker-indicator": {
                position: "absolute",
                right: "12px",
                top: 0,
                bottom: 0,
                width: "28px",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                zIndex: 2,
              },
            }}
          />
        </FormControl>

        {/* Start & End Time */}
        <Grid container spacing={2} sx={{ mt: 1, mb: 2, fontSize: theme.typography.fontSize.small }}>
          <Grid size={6}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: theme.typography.fontWeight.medium }}>
              {renderLabel("Start Time", true)}
            </Typography>
            <EditableTimeDropdown
              testId="start-time-input"
              value={formData.startTime || ""}
              disabled={formData?.type === "APPT"}
              error={!!formErrors.startTime}
              helperText={formErrors.startTime}
              onChange={(val) => handleChange("startTime", val)}
              isDarkMode={isDarkMode}
              styles={styles}
              inputSx={inputSx}
            />
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: theme.typography.fontWeight.medium }}>
              {renderLabel("End Time", true)}
            </Typography>
            <EditableTimeDropdown
              testId="end-time-input"
              value={formData.endTime || ""}
              disabled={formData?.type === "APPT"}
              error={!!formErrors.endTime}
              helperText={formErrors.endTime}
              onChange={(val) => handleChange("endTime", val)}
              isDarkMode={isDarkMode}
              styles={styles}
              inputSx={inputSx}
            />
          </Grid>
        </Grid>
        {/* Title & Description if Event */}
        {formData.type === "Event" && (
          <>
            <FormControl fullWidth margin="normal" sx={styles.inputField} style={{ marginTop: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeight.medium, mb: 0.5, mt: 0 }}>
                {renderLabel("Title", true)}
              </Typography>
              <TextField
                fullWidth
                value={formData?.titleDesc}
                error={!!formErrors.titleDesc}
                helperText={formErrors.titleDesc}
                onChange={(e) => handleChange("titleDesc", e.target.value)}
                sx={styles.textField}
              />
            </FormControl>

            <FormControl fullWidth margin="normal" sx={styles.inputField} style={{ marginTop: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeight.medium, mb: 0.5 }}>
                {renderLabel("Description")}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                sx={styles.textarea}
              />
            </FormControl>
          </>
        )}

        {/* Repeat */}
        {(!isEditSlot || (isRepeatEvent && isCurrentAndFuture)) && (
          <Box>
            <CustomSelect
              label="Repeat"
              value={formData.repeat}
              onChange={(e) => handleChange("repeat", e)}
              options={repeatOptions}
              required={true}
              isDarkMode={isDarkMode}
            />
          </Box>
        )}

        {/* Repeat Details */}
        {(!isEditSlot || (isRepeatEvent && isCurrentAndFuture)) &&
          formData.repeat &&
          formData.repeat !== "Never" && (
            <>
              {/* Repeat Every */}
              <FormControl fullWidth margin="normal" sx={styles.inputField}>
                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeight.medium, mb: 0.5 }}>
                  {renderLabel("Repeat Every", true)}
                  <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.small }}>
                    {formData.repeat === "Weekly" ? "(week(s))" : "(day(s))"}
                  </span>
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.repeatEvery ?? 1}
                  error={!!formErrors.repeatEvery}
                  helperText={formErrors.repeatEvery}
                  onChange={(e) =>
                    handleChange("repeatEvery", e.target.value === "" ? "" : +e.target.value)
                  }
                  sx={styles.textField}
                />
              </FormControl>

              {/* Ends */}
              <Typography
                variant="body2"
                sx={{ fontWeight: theme.typography.fontWeight.medium, mt: 2, mb: 1 }}
              >
                {renderLabel("Ends", true)}
              </Typography>
              <RadioGroup
                value={formData.repeatEndType || ""}
                onChange={(e) =>
                  handleChange("repeatEndType", e.target.value.toLowerCase())
                }
              >
                <FormControlLabel
                  value="after"
                  sx={{ marginBottom: '10px' }}
                  control={<Radio />}
                  label={
                    <Box display="flex" fontSize={theme.typography.fontSize.small} alignItems="center" gap={1}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.small }}>
                        After
                      </span>
                      <TextField
                        type="number"
                        size="small"
                        sx={{
                          "& input": {
                            padding: "6px 8px",
                            fontSize: "14px"
                          },
                          "& input::placeholder": {
                            fontSize: "14px",
                            opacity: 1,
                          },
                          ...inputSx,
                          marginBottom: 0,
                        }}
                        value={formData.repeatEndAfter}
                        onChange={(e) =>
                          handleChange("repeatEndAfter", +e.target.value)
                        }
                        inputProps={{ min: 1 }}
                        disabled={formData.repeatEndType !== "after"}
                      />
                      <span style={{ color: theme.colors.text.secondary }}>
                        occurrences
                      </span>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="on"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.small }}>
                        On
                      </span>
                      <TextField
                        type="date"
                        size="small"
                        inputProps={{ lang: "en-US" }}
                        value={formData.repeatEndDate || ""}
                        onChange={(e) =>
                          handleChange("repeatEndDate", e.target.value)
                        }
                        disabled={formData.repeatEndType !== "on"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarMonthOutlinedIcon
                                sx={{
                                  fontSize: "18px",
                                  color: isDarkMode ? P.white : P.labelMuted,
                                  pointerEvents: "none",
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          marginLeft: "10px",
                          position: "relative",
                          "& input": {
                            padding: "6px 8px",
                            fontSize: "14px",
                            color: (theme) => theme.palette.mode === "dark" ? P.white : undefined
                          },
                          "& input::placeholder": {
                            fontSize: "14px",
                            opacity: 1,
                          },
                          "& input::-webkit-calendar-picker-indicator": {
                            position: "absolute",
                            right: "8px",
                            top: 0,
                            bottom: 0,
                            width: "24px",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 2,
                          },
                          ...inputSx,
                          marginBottom: 0,
                        }}
                      />
                    </Box>
                  }
                />
              </RadioGroup>

              {formErrors.repeatEnd && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {formErrors.repeatEnd}
                </FormHelperText>
              )}
            </>
          )}
        {((isRepeatEvent && isCurrentAndFuture) || !isEditSlot) &&
          formData.repeat === "Weekly" && (
            <FormGroup>
              <Box sx={{ mt: 2, minHeight: "10rem", maxHeight: "12rem" }}>
                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeight.medium, mb: 1 }}>
                  {renderLabel("Repeat On", true)}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
                    fontSize: theme.typography.fontSize.medium,
                  }}
                >
                  {daysOfWeek.map((day, index) => (
                    <FormControlLabel
                      key={day}
                      sx={{ fontSize: theme.typography.fontSize.small }}
                      control={
                        <Checkbox
                          sx={styles.checkbox}
                          checked={formData.repeatOn?.split(",").includes(index.toString())}
                          onChange={(e) => {
                            const selected = formData.repeatOn?.split(",") || [];
                            const dayValue = index.toString();
                            const newRepeatOn = e.target.checked
                              ? [...selected, dayValue]
                              : selected.filter((d) => d !== dayValue);
                            handleChange("repeatOn", newRepeatOn.sort().join(","));
                          }}
                        />
                      }
                      label={
                        <span style={{
                          fontSize: theme.typography.fontSize.medium,
                          color: theme.colors.text.primary
                        }}>
                          {day}
                        </span>
                      }
                    />
                  ))}
                </Box>
                {formErrors.repeatOn && (
                  <FormHelperText error>{formErrors.repeatOn}</FormHelperText>
                )}
              </Box>
            </FormGroup>
          )}
      </Box>
    </ReusableDrawer>
  );
};
