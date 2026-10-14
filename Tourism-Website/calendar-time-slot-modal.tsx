/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
} from "@mui/material";

import Box from "@mui/material/Box";
import CustomSelect from "./custom-select";
import ReusableDrawer from "../../../ui/reusable-drawer";
import { THEME_PRIMITIVES } from "../../../theme";
import { formatLocalDateToYMD, ModalType } from "./calendar";

const repeatOptions = ["Never", "Daily", "Weekly"];
const daysOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const P = THEME_PRIMITIVES

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
        startTime: start.toTimeString().substring(0, 5),
        endTime: end.toTimeString().substring(0, 5),
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
      setFormData(defaultValues || defaultFormData);
    }
  }, [defaultValues]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
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
    if (!startTime) {
      errors.startTime = "Start time is required";
    }
    if (!endTime) {
      errors.endTime = "End time is required";
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

    if (startTime && endTime) {
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
      padding: "5px",
      borderRadius: "10px",
      fontSize: "12px",
      color: isDarkMode ? P.white : P.black,
    },
  };

  const isEditSlot = defaultValues?.title ? true : false;
  const isRepeatEvent = ["Daily", "Weekly"].includes(formData?.repeat);

  function formatTimeTo12Hour(time24: string) {
    const [hourStr, minuteStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const hourFormatted = hour.toString().padStart(2, "0");
    const minuteFormatted = minuteStr?.padStart(2, "0");
    return `${hourFormatted}:${minuteFormatted} ${ampm}`;
  }

  function formatTo24HourTime(input: string): string {
    input = input?.trim().toUpperCase();
    // Assume AM if no AM/PM is present
    if (!input?.endsWith("AM") && !input?.endsWith("PM")) {
      if(input?.startsWith("12")) {
         input += " PM";
      } else {
        input += " AM";
      }
    }

    // Check for AM/PM
    const is12HourFormat = input?.endsWith("AM") || input?.endsWith("PM");

    if (is12HourFormat) {
      // Remove AM/PM and split
      const cleaned = input.replace(/\s?(AM|PM)$/i, "");
      const [hourStr = "0", minuteStr = "00"] = cleaned.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = minuteStr.padStart(2, "0");
      const isPM = input.endsWith("PM");

      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      const hourFormatted = hour.toString().padStart(2, "0");
      const res = `${hourFormatted}:${minute}`;
      return res;
    }

    // If already in 24-hour, return cleaned and padded
    const [hourStr = "0", minuteStr = "00"] = input.split(":");
    const hourFormatted = hourStr.padStart(2, "0");
    const minuteFormatted = minuteStr.padStart(2, "0");
    return `${hourFormatted}:${minuteFormatted}`;
  }

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
        title={defaultValues?.title === "" ? "Create Time Slot" : "Edit Time Slot"}
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
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              disabled={isEditSlot}
              sx={styles.textField}
            />
          </FormControl>

          {/* Start & End Time */}
          <Grid container spacing={2} sx={{ mt: 1, mb: 2, fontSize: theme.typography.fontSize.small }}>
            <Grid size={6}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: theme.typography.fontWeight.medium }}>
                {renderLabel("Start Time", true)}
              </Typography>
              <TextField
                data-testid="start-time-input"
                fullWidth
                disabled={formData?.type === "APPT"}
                type="time"
                error={!!formErrors.startTime}
                helperText={formErrors.startTime}
                value={formatTo24HourTime(formData.startTime)}
                onChange={(e) =>
                  handleChange("startTime", formatTimeTo12Hour(e.target.value))
                }
                sx={{
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
                    filter: (theme) =>
                      theme.palette.mode === "dark" ? "invert(1)" : "none",
                  },
                  "& input::-webkit-calendar-picker-indicator:hover": {
                    cursor: "pointer",
                  },
                  ...inputSx,
                }}
              />
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: theme.typography.fontWeight.medium }}>
                {renderLabel("End Time", true)}
              </Typography>
              <TextField
                data-testid="end-time-input"
                fullWidth
                disabled={formData?.type === "APPT"}
                type="time"
                value={formatTo24HourTime(formData.endTime)}
                error={!!formErrors.endTime}
                helperText={formErrors.endTime}
                onChange={(e) =>
                  handleChange("endTime", formatTimeTo12Hour(e.target.value))
                }
                sx={{
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
                    filter: (theme) =>
                      theme.palette.mode === "dark" ? "invert(1)" : "none",
                  },
                  "& input::-webkit-calendar-picker-indicator:hover": {
                    cursor: "pointer",
                  },
                  ...inputSx,
                }}
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
                    value={formData.repeatEvery}
                    error={!!formErrors.repeatEvery}
                    helperText={formErrors.repeatEvery}
                    onChange={(e) => handleChange("repeatEvery", +e.target.value)}
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
                  value={formData.repeatEndType}
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
                          sx={{
                            marginLeft: "10px",
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
                              filter: (theme) =>
                                theme.palette.mode === "dark" ? "invert(1)" : "none",
                            },
                            "& input::-webkit-calendar-picker-indicator:hover": {
                              cursor: "pointer",
                            },
                            ...inputSx,
                            marginBottom: 0,
                          }}
                          value={formData.repeatEndDate}
                          onChange={(e) =>
                            handleChange("repeatEndDate", e.target.value)
                          }
                          disabled={formData.repeatEndType !== "on"}
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
