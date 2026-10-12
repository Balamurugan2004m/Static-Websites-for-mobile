import React, { useState, forwardRef } from "react";
import { Box, OutlinedInput, OutlinedInputProps } from "@mui/material";

export interface CharacterCountInputProps extends OutlinedInputProps {
  maxLength?: number;
  numericOnly?: boolean;
  allowHyphen?: boolean;
  helperText?: React.ReactNode;
}

export const CharacterCountInput = forwardRef<HTMLDivElement, CharacterCountInputProps>(
  (
    {
      maxLength,
      numericOnly = false,
      allowHyphen = false,
      helperText,
      type,
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      inputProps,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(false);
      if (allowHyphen) {
        const currentVal = typeof value === "string" ? value : (e.target.value ?? "");
        if (currentVal.endsWith("-")) {
          const trimmedVal = currentVal.slice(0, -1);
          try {
            Object.defineProperty(e, "target", {
              writable: true,
              value: { ...e.target, value: trimmedVal },
            });
          } catch {
            e.target.value = trimmedVal;
          }
          onChange?.(e);
        }
      }
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const allowedControlKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
        "Enter",
        "Home",
        "End",
        "Escape",
      ];
      const isControlKey = allowedControlKeys.includes(e.key) || e.ctrlKey || e.metaKey;

      if (allowHyphen) {
        if (!isControlKey) {
          if (e.key === "-") {
            const currentVal = String((e.target as HTMLInputElement).value || "");
            const digitsOnly = currentVal.replace(/\D/g, "");
            if (currentVal.includes("-") || digitsOnly.length !== 5) {
              e.preventDefault();
            }
          } else if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
          }
        }
      } else if (type === "number" || numericOnly) {
        if (["e", "E", "+", "-", "."].includes(e.key)) {
          e.preventDefault();
        } else if (!isControlKey && !/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (allowHyphen) {
        const rawDigits = val.replace(/\D/g, "").slice(0, 9);
        if (rawDigits.length > 5) {
          val = `${rawDigits.slice(0, 5)}-${rawDigits.slice(5)}`;
        } else if (val.includes("-") && rawDigits.length === 5) {
          val = `${rawDigits}-`;
        } else {
          val = rawDigits;
        }
      } else if (type === "number" || numericOnly) {
        val = val.replace(/\D/g, "");
      }
      if (maxLength !== undefined && val.length > maxLength) {
        val = val.slice(0, maxLength);
      }
      try {
        Object.defineProperty(e, "target", {
          writable: true,
          value: { ...e.target, value: val },
        });
      } catch {
        e.target.value = val;
      }
      onChange?.(e);
    };

    const currentLength =
      typeof value === "string" || typeof value === "number" ? String(value).length : 0;
    const isLimitReached = maxLength !== undefined && currentLength >= maxLength;

    return (
      <Box sx={{ position: "relative", width: "100%" }}>
        <OutlinedInput
          ref={ref}
          type={allowHyphen ? "text" : type}
          value={value ?? ""}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          inputProps={{
            ...inputProps,
            maxLength,
          }}
          sx={{
            ...(type === "number" || numericOnly
              ? {
                  "& .MuiOutlinedInput-input[type=number]": {
                    paddingRight: "4px",
                    height: "100%",
                    boxSizing: "border-box",
                  },
                  "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button": {
                    height: "24px",
                    opacity: 1,
                    display: "block",
                    cursor: "pointer",
                    margin: "auto 4px auto 0",
                  },
                  "& input[type=number]": {
                    MozAppearance: "number-input",
                  },
                }
              : {}),
            ...props.sx,
          }}
          {...props}
        />
        {(helperText || (isFocused && maxLength !== undefined)) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: helperText ? "space-between" : "center",
              alignItems: "flex-start",
              width: "100%",
              mt: "3px",
              gap: 1,
            }}
          >
            {helperText && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {helperText}
              </Box>
            )}
            {isFocused && maxLength !== undefined && (
              <Box
                data-testid="char-counter-badge"
                sx={{
                  ml: helperText ? "auto" : undefined,
                  flexShrink: 0,
                  backgroundColor: isLimitReached ? "#d9534f" : "#337ab7",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: 1,
                  px: "6px",
                  py: "3px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  userSelect: "none",
                  transition: "background-color 0.15s ease",
                }}
              >
                (Characters {currentLength}/{maxLength})
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

CharacterCountInput.displayName = "CharacterCountInput";

export default CharacterCountInput;
