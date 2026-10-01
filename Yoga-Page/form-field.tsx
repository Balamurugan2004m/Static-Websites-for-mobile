import React, { useCallback, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import "./styles.css"
import { THEME_PRIMITIVES } from "../../../theme";
import { fieldErrorTextStyle } from "../utils/style-tokens";

interface FormFieldProps {
  label: string;
  disabled?: boolean;
  field: string;
  type?: string;
  required?: boolean;
  value: string;
  hideMarginBottom?: boolean;
  isEditing?: boolean;
  isAdding?: boolean;
  isDarkMode?: boolean;
  onChange: (field: string, value: string) => void;
  error?: string;
  styles?: {
    inputReadOnly?: React.CSSProperties;
    formGroup?: React.CSSProperties;
    label?: React.CSSProperties;
    input?: React.CSSProperties;
    inputError?: React.CSSProperties;
    errorText?: React.CSSProperties;
    inputDrawer?: React.CSSProperties;
    inputWithBorderReadOnly?: React.CSSProperties;
    renderEmptyInput?: React.CSSProperties;
  };
  themeErrorColor?: string;
  isDrawer?: boolean;
  showTypePlaceholder?: boolean;
  facilityAutoQueue?: boolean;
  maxLength?: number;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = React.memo(
  ({
    label,
    field,
    type = "text",
    disabled = false,
    required = false,
    value,
    onChange,
    error,
    isEditing = false,
    isAdding = false,
    hideMarginBottom = false,
    styles = {},
    themeErrorColor,
    isDrawer = false,
    showTypePlaceholder = false,
    facilityAutoQueue = false,
    maxLength,
    placeholder,
  }) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const theme = useTheme();
    const P = THEME_PRIMITIVES;
    // Fallback error color (if not provided)
    const errorColor = themeErrorColor || theme.palette.error.main;
    const isThresholdHoursField = field === "ThresholdPerDay";

    const effectiveMaxLength = useMemo(() => {
      if (typeof maxLength === "number" && maxLength > 0) return maxLength;
      if (type === "date") return 10;
      if (field === "PhoneNumber") return 10;
      if (field === "UserNPINumber") return 10;
      if (field === "HoursPerWeek") return 3;
      if (field === "VendorId") return 100;
      if (["FirstName", "LastName", "PrintName", "Email", "UserName"].includes(field)) return 100;
      if (field === "VBATrainId") return 10;
      if (field === "UserSpecialConsiderations") return 1000;
      return undefined;
    }, [maxLength, field, type]);

    const formatPhoneNumber = (val: string): string => {
      if (!val) return "";
      const digits = String(val).replace(/\D/g, "").slice(0, 10);
      if (!digits) return "";
      if (digits.length < 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`;
      return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const formatDisplayDate = (val: string): string => {
      if (!val) return "";
      const trimmed = String(val).trim();
      if (trimmed.includes("/")) {
        const slashParts = trimmed.split("/");
        if (slashParts.length === 3 && slashParts[0].length === 4) {
          // YYYY/MM/DD -> DD/MM/YYYY
          return `${slashParts[2].padStart(2, "0")}/${slashParts[1].padStart(2, "0")}/${slashParts[0]}`;
        }
        return trimmed;
      }
      const dashParts = trimmed.split("T")[0].split("-");
      if (dashParts.length === 3) {
        if (dashParts[0].length === 4) {
          // YYYY-MM-DD -> DD/MM/YYYY
          return `${dashParts[2].padStart(2, "0")}/${dashParts[1].padStart(2, "0")}/${dashParts[0]}`;
        }
        if (dashParts[2].length === 4) {
          // DD-MM-YYYY -> DD/MM/YYYY
          return `${dashParts[0].padStart(2, "0")}/${dashParts[1].padStart(2, "0")}/${dashParts[2]}`;
        }
      }
      return trimmed;
    };

    const toIsoDate = (val: string): string => {
      if (!val) return "";
      const trimmed = String(val).trim();
      const slashParts = trimmed.split("/");
      if (slashParts.length === 3 && slashParts[2].length === 4) {
        return `${slashParts[2]}-${slashParts[1].padStart(2, "0")}-${slashParts[0].padStart(2, "0")}`;
      }
      const dashParts = trimmed.split("-");
      if (dashParts.length === 3 && dashParts[0].length === 4) {
        return trimmed;
      }
      return "";
    };
    const borderIncludedField = useMemo(() => {
      return ["VBATrainID", "VBATrainId", "UserSpecialConsiderations"];
    }, []);
    const hasDateValue = type === "date" && Boolean(value && String(value).trim().length > 0);

    const inputStyle = useMemo(() => {
      let baseStyle: React.CSSProperties = {
        borderRadius: "10px",
        border: !(isEditing || isAdding)
          ? "none"
          : `1px solid ${
              error
                ? errorColor
                : facilityAutoQueue
                  ? P.stroke
                  : theme.palette.divider
            }`,
        background: !(isEditing || isAdding)
          ? "transparent"
          : facilityAutoQueue
            ? theme.palette.mode === "dark"
              ? P.inputBgDark
              : P.labelMutedOverlay
            : theme.palette.mode === "dark"
              ? P.inputBgDark
              : P.white,
        color:
          type === "date" && !hasDateValue
            ? theme.palette.mode === "dark"
              ? "#ccc"
              : "#757575"
            : theme.palette.mode === "dark"
            ? P.white
            : "#000",
        fontSize: "14px",
        height: facilityAutoQueue ? "32px" : undefined,
        ...styles.input,
        ...(facilityAutoQueue && (isEditing || isAdding)
          ? {
              border: `1px solid ${error ? errorColor : P.stroke}`,
              background:
                theme.palette.mode === "dark"
                  ? P.inputBgDark
                  : P.labelMutedOverlay,
              height: "32px",
              padding: "8px 10px",
              width: "100%",
              boxSizing: "border-box" as const,
            }
          : {}),
        ...(theme.palette.mode !== "dark" && (isEditing || isAdding)
          ? {
              color:
                type === "date" && !hasDateValue
                  ? "#757575"
                  : "#000",
            }
          : {}),
        padding: facilityAutoQueue
          ? "8px 10px"
          : (styles.input?.padding as string) || "8px 14px",
        boxSizing: "border-box",
        width: "100%",
      };

      if (isThresholdHoursField && (isEditing || isAdding)) {
        baseStyle = {
          ...baseStyle,
          borderRadius: "10px",
          border: `1px solid ${error ? errorColor : P.stroke}`,
          background:
            theme.palette.mode === "dark" ? P.inputBgDark : P.labelMutedOverlay,
          backgroundColor:
            theme.palette.mode === "dark" ? P.inputBgDark : P.labelMutedOverlay,
          height: "32px",
          minHeight: "32px",
          padding: "8px 10px",
          fontSize: "14px",
          fontWeight: 400,
          color: theme.palette.mode === "dark" ? P.white : P.black,
          width: "100%",
          boxSizing: "border-box",
          outline: "none",
          MozAppearance: "textfield",
        };
      }

      // Apply read-only or editing/adding styles
      if (!(isEditing || isAdding)) {
        if (borderIncludedField?.includes(field)) {
          baseStyle = {
            ...baseStyle,
        
            ...((isEditing || isAdding)
              ? styles.inputWithBorderReadOnly
              : {}),
        
              ...(!value && (isEditing || isAdding)
              ? styles.renderEmptyInput
              : {}),

           ...(!(isEditing || isAdding)
            ? {
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
                backgroundColor: "transparent",
              }
            : {}),
          };
        } else if (!isThresholdHoursField) {
          baseStyle = {
            ...baseStyle,
            ...styles.inputReadOnly,
            background: "transparent",
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          };
        } else {
          baseStyle = {
            ...baseStyle,
            borderRadius: "10px",
            border: `1px solid ${P.stroke}`,
            background: P.labelMutedOverlay,
            backgroundColor: P.labelMutedOverlay,
            height: "32px",
            minHeight: "32px",
            padding: "8px 10px",
            width: "100%",
            boxSizing: "border-box",
          };
        }
      }
      if (error) {
        baseStyle = { ...baseStyle, ...styles.inputError };
      }
      if (isDrawer) {
        baseStyle = { ...baseStyle, ...styles.inputDrawer };
      }
      if (type === "textarea") {
        baseStyle = {...baseStyle,  minHeight: "80px",
          resize: "vertical", }
      }

      return baseStyle;
    }, [isEditing, isAdding, error, errorColor, theme.palette.divider, theme.palette.mode, P.inputBgDark, P.white, P.stroke, P.labelMutedOverlay, P.black, styles.input, styles.inputWithBorderReadOnly, styles.renderEmptyInput, styles.inputReadOnly, styles.inputError, styles.inputDrawer, isDrawer, type, borderIncludedField, field, value, facilityAutoQueue, isThresholdHoursField]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === "date") {
          const raw = e.target.value;
          if (!raw) {
            onChange(field, "");
            return;
          }
          const prevDigits = String(value || "").replace(/\D/g, "");
          const newDigits = raw.replace(/\D/g, "");
          if (newDigits.length < prevDigits.length) {
            onChange(field, raw);
            return;
          }
          const digits = newDigits.slice(0, 8);
          let formatted = "";
          if (digits.length <= 2) {
            formatted = digits;
          } else if (digits.length <= 4) {
            formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
          } else {
            formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
          }
          onChange(field, formatted);
          return;
        }

        if (isThresholdHoursField) {
          const next = e.target.value;
          if (next === "") {
            onChange(field, next);
            return;
          }
          const num = Number(next);
          if (Number.isNaN(num)) return;
          onChange(field, String(Math.max(0, num)));
          return;
        }

        if (field === "PhoneNumber") {
          const raw = e.target.value;
          if (!raw) {
            onChange(field, "");
            return;
          }
          const prevStr = String(value || "");
          let newDigits = raw.replace(/\D/g, "").slice(0, 10);
          if (raw.length < prevStr.length && newDigits === prevStr.replace(/\D/g, "")) {
            newDigits = newDigits.slice(0, -1);
          }
          onChange(field, formatPhoneNumber(newDigits));
          return;
        }

        if (field === "UserNPINumber") {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(field, digits);
          return;
        }

        if (field === "HoursPerWeek") {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
          onChange(field, digits);
          return;
        }

        if (effectiveMaxLength && e.target.value.length > effectiveMaxLength) {
          onChange(field, e.target.value.slice(0, effectiveMaxLength));
          return;
        }

        onChange(field, e.target.value);
      },
      [field, onChange, type, isThresholdHoursField, effectiveMaxLength, value]
    );

    const resolvedPlaceholder = useMemo(() => {
      if (type === "date") return (isEditing || isAdding) ? (placeholder || "DD/MM/YYYY") : "";
      if (!(isEditing || isAdding)) return "";
      if (placeholder !== undefined && placeholder !== null && placeholder !== "") {
        return placeholder;
      }
      if (showTypePlaceholder || borderIncludedField.includes(field)) {
        return `Type ${label}`;
      }
      return label;
    }, [isEditing, isAdding, placeholder, label, type, showTypePlaceholder, borderIncludedField, field]);

    return (
      <div
        style={{
          marginBottom: facilityAutoQueue ? 0 : "12px",
          width: "100%",
          ...(styles.formGroup || {}),
          ...(hideMarginBottom || facilityAutoQueue ? { marginBottom: 0 } : {}),
        }}
      >
        <label
          htmlFor={field}
          style={{
            display: "block",
            marginBottom: facilityAutoQueue ? "9px" : "10px",
            fontSize: facilityAutoQueue ? "12px" : "14px",
            fontWeight: 400,
            color: facilityAutoQueue
              ? P.labelMuted
              : theme.palette.text.primary,
            lineHeight: "normal",
            ...(styles.label || {}),
          }}
        >
          {label}{" "}
          {required && (
            <span style={{ color: P.dangerText }}>*</span>
          )}
        </label>
        {type === "textarea" ? (
          <textarea
            id={field}
            name={field}
            data-field={field}
            maxLength={effectiveMaxLength}
            placeholder={resolvedPlaceholder}
            value={value}
            style={{
              ...inputStyle,
              minHeight: (styles.input?.minHeight as string | number) || "80px",
              resize: "vertical",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.custom?.colors.blackColorCode
                  : theme.palette.common.white,
              border:
                (styles.input?.border as string) ||
                `1px solid ${
                  theme.palette.mode === "dark"
                    ? theme.custom?.colors.inputBgDark
                    : theme.custom?.colors.accordion.border
                }`,
              borderRadius: (styles.input?.borderRadius as string | number) ?? 10,
              padding: (styles.input?.padding as string) || "8px 14px",
            }}
            readOnly={!(isAdding || isEditing)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              if (effectiveMaxLength && e.target.value.length > effectiveMaxLength) {
                onChange(field, e.target.value.slice(0, effectiveMaxLength));
                return;
              }
              onChange(field, e.target.value);
            }}
            className={`formFieldInput${theme.palette.mode === "dark" ? " formFieldInput--dark" : ""}`}
          />
        ) : type === "date" ? (
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id={field}
              name={field}
              data-field={field}
              type="text"
              inputMode="numeric"
              maxLength={effectiveMaxLength}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              value={formatDisplayDate(value)}
              style={{
                ...inputStyle,
                ...((isAdding || isEditing) ? { paddingRight: "40px" } : {}),
              }}
              readOnly={!(isAdding || isEditing)}
              onChange={handleInputChange}
              className={`dateInput ${Boolean(value && String(value).trim().length > 0) ? "has-value" : ""} ${disabled && (isAdding || isEditing) ? "disabledInput" : ""} formFieldInput${theme.palette.mode === "dark" ? " formFieldInput--dark" : ""}`}
            />
            {(isEditing || isAdding) && (
              <>
                <button
                  type="button"
                  aria-label={`Open calendar for ${label}`}
                  disabled={disabled}
                  onClick={(e) => {
                    const hiddenInput = e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement | null;
                    try {
                      hiddenInput?.showPicker();
                    } catch {
                      hiddenInput?.focus();
                    }
                  }}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: disabled ? "default" : "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.palette.mode === "dark" ? "#ffffff" : "#757575",
                    zIndex: 2,
                    borderRadius: "50%",
                  }}
                >
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
                <input
                  type="date"
                  tabIndex={-1}
                  aria-hidden="true"
                  disabled={disabled}
                  value={toIsoDate(value)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "24px",
                    height: "24px",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const parts = val.split("-");
                      if (parts.length === 3) {
                        onChange(field, `${parts[2]}/${parts[1]}/${parts[0]}`);
                      }
                    }
                  }}
                />
              </>
            )}
          </div>
        ) : (
          <input
            id={field}
            name={field}
            data-field={field}
            type={
              (field === "UserNPINumber" || field === "PhoneNumber" || field === "HoursPerWeek")
                ? "text"
                : type
            }
            inputMode={
              field === "UserNPINumber" || field === "PhoneNumber" || field === "HoursPerWeek"
                ? "numeric"
                : undefined
            }
            maxLength={field === "PhoneNumber" ? 13 : effectiveMaxLength}
            min={isThresholdHoursField ? 0 : undefined}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            value={
              field === "PhoneNumber"
                ? formatPhoneNumber(value)
                : isThresholdHoursField && value !== "" && Number(value) < 0
                ? "0"
                : value
            }
            style={inputStyle}
            readOnly={!(isAdding || isEditing)}
            onChange={handleInputChange}
            onFocus={(e) => {
              setIsFocused(true);
              if (isThresholdHoursField) {
                e.currentTarget.style.border = `1px solid ${P.primary}`;
              }
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (isThresholdHoursField) {
                e.currentTarget.style.border = `1px solid ${
                  error ? errorColor : P.stroke
                }`;
              }
            }}
            onKeyDown={
              isThresholdHoursField
                ? (e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }
                : undefined
            }
            className={`${disabled && (isAdding || isEditing) ? "disabledInput" : ""} formFieldInput${theme.palette.mode === "dark" ? " formFieldInput--dark" : ""}${isThresholdHoursField ? " thresholdHoursInput" : ""}`}
          />
        )}

        {(isEditing || isAdding) && isFocused && effectiveMaxLength && type !== "date" && (
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "3px" }}>
            <span
              style={{
                backgroundColor:
                  (field === "PhoneNumber"
                    ? String(value ?? "").replace(/\D/g, "").length >= 10
                    : String(value ?? "").length >= effectiveMaxLength)
                    ? "#d9534f"
                    : "#1f6498",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                display: "inline-block",
                lineHeight: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                userSelect: "none",
              }}
            >
              (Characters {field === "PhoneNumber" ? String(value ?? "").replace(/\D/g, "").length : String(value ?? "").length}/{effectiveMaxLength})
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              ...fieldErrorTextStyle(errorColor),
              ...(styles.errorText || {}),
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default FormField;
