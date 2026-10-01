/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  FormControl,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FileUpload, { FileStatus } from "../../../ui/file-upload";
import { THEME_PRIMITIVES } from "../../../theme";

// 🔹 Field Config Interface
export type FieldConfig =
  | {
    field: string;
    label: string;
    type: "text" | "date";
    required?: boolean;
    disabled?: boolean;
  }
  | {
    field: string;
    label: string;
    type: "file";
    required?: boolean;
  }
  | {
    field: string;
    type: "checkboxGroup";
    items: { field: string; label: string, type?: string }[];
  };

export interface DynamicFormProps<T> {
  fields: FieldConfig[];
  initialValues: T;
  onChange?: (values: T) => void;
  onSubmit?: (values: T) => void;
  styles?: any;
  theme?: any;
  isDark?: boolean;
  inputBackground?: string;
  inputBorderColor?: string;
}

function DynamicForm<T extends Record<string, any>>({
  fields,
  initialValues,
  onChange,
  styles,
  isDark,
  inputBackground,
  inputBorderColor,
}: DynamicFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fileStates, setFileStates] = useState<Record<string, FileStatus[]>>({});
  const P = THEME_PRIMITIVES;

  useEffect(() => {
    onChange?.({ ...values, ...fileStates });
  }, [fileStates, onChange, values]);

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as string]) {
      setFormErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    setFileStates((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ...newFiles],
    }));

    newFiles.forEach((_, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setFileStates((prev) => ({
          ...prev,
          [field]: prev[field].map((f, i) =>
            i === (prev[field].length - newFiles.length + index)
              ? { ...f, progress, status: progress >= 100 ? "completed" : "uploading" }
              : f
          ),
        }));
        if (progress >= 100) clearInterval(interval);
      }, 400);
    });
  };

  const handleRemoveFile = (field: string, index: number) => {
    setFileStates((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const renderField = (fieldConfig: FieldConfig) => {
    const { field, label, type } = fieldConfig as any;

    const labelSx = {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "normal",
      mb: "4px",
      color: isDark ? P.labelMuted : P.uploadButtonBg,
    };

    if (type === "date") {
      const parseDateValue = (val: any): Date | null => {
        if (!val) return null;
        if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
        const s = String(val).trim();
        const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slash) {
          const d = new Date(Number(slash[3]), Number(slash[1]) - 1, Number(slash[2]));
          return isNaN(d.getTime()) ? null : d;
        }
        const dash = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (dash) {
          const d = new Date(Number(dash[1]), Number(dash[2]) - 1, Number(dash[3]));
          return isNaN(d.getTime()) ? null : d;
        }
        return null;
      };

      return (
        <FormControl key={field} fullWidth sx={{ ...styles?.inputField, mt: 0, mb: "15px" }}>
          <Typography variant="body2" sx={labelSx}>
            {label}{" "}
            {"required" in fieldConfig && fieldConfig.required && (
              <span style={{ color: "red" }}>*</span>
            )}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              enableAccessibleFieldDOMStructure={false}
              desktopModeMediaQuery="@media (min-width: 0px)"
              value={parseDateValue(values[field])}
              format="MM/dd/yyyy"
              disabled={"disabled" in fieldConfig && fieldConfig.disabled}
              onChange={(newDate: Date | null) => {
                if (!newDate || isNaN(newDate.getTime())) {
                  handleChange(field as keyof T, "");
                  return;
                }
                const dd = String(newDate.getDate()).padStart(2, "0");
                const mm = String(newDate.getMonth() + 1).padStart(2, "0");
                const yyyy = newDate.getFullYear();
                handleChange(field as keyof T, `${mm}/${dd}/${yyyy}`);
              }}
              slots={{
                openPickerIcon: () => (
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: isDark ? P.white : P.labelMuted }} />
                ),
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "MM/DD/YYYY",
                  error: !!formErrors[field],
                  helperText: formErrors[field],
                  sx: {
                    ...styles?.textField,
                    "& .MuiOutlinedInput-root": {
                      ...(styles?.textField?.["& .MuiOutlinedInput-root"] ?? {}),
                      borderRadius: "10px",
                      minHeight: 40,
                      backgroundColor: inputBackground ?? (isDark ? P.inputBgDark : P.white),
                      "&.Mui-disabled": {
                        backgroundColor: inputBackground ?? (isDark ? P.inputBgDark : P.white),
                      },
                      color: isDark ? P.white : P.black,
                      "& fieldset": {
                        borderColor: inputBorderColor ?? (isDark ? P.darkBorder : P.stroke),
                      },
                      "&:hover fieldset": {
                        borderColor: inputBorderColor ?? (isDark ? P.stroke : P.labelMuted),
                      },
                      "&.Mui-focused fieldset, &.Mui-disabled fieldset": {
                        borderColor: inputBorderColor ?? (isDark ? P.white : P.primary),
                        borderWidth: 1,
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: "10px",
                      px: "10px",
                      fontSize: 14,
                      fontWeight: 400,
                      color: isDark ? P.white : P.black,
                      backgroundColor: inputBackground,
                      boxSizing: "border-box",
                    },
                    "& .MuiOutlinedInput-input::placeholder": {
                      color: isDark ? P.stroke : P.labelMuted,
                      opacity: 1,
                    },
                  },
                },
                openPickerButton: {
                  sx: {
                    color: isDark ? P.white : P.labelMuted,
                    p: 0.5,
                    "&:hover": { backgroundColor: "transparent" },
                  },
                },
                popper: {
                  placement: "bottom-start",
                  sx: { zIndex: 9999 },
                },
              }}
            />
          </LocalizationProvider>
        </FormControl>
      );
    }

    if (type === "text") {
      return (
        <FormControl key={field} fullWidth sx={{ ...styles?.inputField, mt: 0, mb: "15px" }}>
          <Typography variant="body2" sx={labelSx}>
            {label}{" "}
            {"required" in fieldConfig && fieldConfig.required && (
              <span style={{ color: "red" }}>*</span>
            )}
          </Typography>
          <TextField
            fullWidth
            type="text"
            value={values[field] || ""}
            placeholder={`Type ${label}`}
            error={!!formErrors[field]}
            helperText={formErrors[field]}
            disabled={"disabled" in fieldConfig && fieldConfig.disabled}
            onChange={(e) => handleChange(field as keyof T, e.target.value)}
            sx={{
              ...styles?.textField,
              "& .MuiOutlinedInput-root": {
                ...(styles?.textField?.["& .MuiOutlinedInput-root"] ?? {}),
                borderRadius: "10px",
                minHeight: 40,
                backgroundColor: inputBackground ?? (isDark ? P.inputBgDark : P.white),
                "&.Mui-disabled": {
                  backgroundColor: inputBackground ?? (isDark ? P.inputBgDark : P.white),
                },
                color: isDark ? P.white : P.black,
                "& fieldset": {
                  borderColor: inputBorderColor ?? (isDark ? P.darkBorder : P.stroke),
                },
                "&:hover fieldset": {
                  borderColor: inputBorderColor ?? (isDark ? P.stroke : P.labelMuted),
                },
                "&.Mui-focused fieldset, &.Mui-disabled fieldset": {
                  borderColor: inputBorderColor ?? (isDark ? P.white : P.primary),
                  borderWidth: 1,
                },
              },
              "& .MuiOutlinedInput-input": {
                py: "10px",
                px: "15px",
                fontSize: 14,
                fontWeight: 400,
                color: isDark ? P.white : P.black,
                backgroundColor: inputBackground,
                boxSizing: "border-box",
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: isDark ? P.stroke : P.labelMuted,
                opacity: 1,
              },
            }}
          />
        </FormControl>
      );
    }

    if (type === "file") {
      return (
        <FormControl key={field} fullWidth sx={{ mb: "15px", width: "auto", maxWidth: "100%" }}>
          <Typography variant="body2" sx={labelSx}>
            {label}{" "}
          </Typography>
          <FileUpload
            isDark={isDark}
            multiple={false}
            selectedFiles={fileStates[field] || []}
            onFileChange={(e) => handleFileChange(field, e)}
            onRemoveFile={(index) => handleRemoveFile(field, index)}
          />
        </FormControl>
      );
    }

    if (type === "checkboxGroup") {
      return (
        <Box
          key={field}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, max-content)" },
            columnGap: "33px",
            rowGap: "14px",
            mt: "5px",
            mb: 1,
          }}
        >
          {Array.isArray((fieldConfig as any).items)
            ? (fieldConfig as any).items.map((item: any) => (
            <FormControlLabel
              key={item.field}
              control={
                <Checkbox
                  checked={!!values[item.field]}
                  onChange={(e) =>
                    handleChange(item.field as keyof T, e.target.checked)
                  }
                  sx={{
                    p: 0,
                    mr: "5px",
                    color: isDark ? P.white : P.uploadButtonBg,
                    "&.Mui-checked": { color: P.primary },
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                    ...(styles?.checkbox ?? {}),
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{ fontSize: 14, fontWeight: 400, lineHeight: "normal", color: isDark ? P.white : P.black }}
                >
                  {item.label}
                </Typography>
              }
              sx={{ m: 0, alignItems: "center", gap: 0 }}
            />
          ))
          : null}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {fields.map((f) => renderField(f))}
    </Box>
  );
}

export default DynamicForm;
