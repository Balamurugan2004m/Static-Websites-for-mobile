import React, { useState, forwardRef } from "react";
import { Box, OutlinedInput, OutlinedInputProps } from "@mui/material";

export interface CharacterCountInputProps extends OutlinedInputProps {
  maxLength?: number;
  numericOnly?: boolean;
  helperText?: React.ReactNode;
}

export const CharacterCountInput = forwardRef<HTMLDivElement, CharacterCountInputProps>(
  (
    {
      maxLength,
      numericOnly = false,
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
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (type === "number" || numericOnly) {
        if (["e", "E", "+", "-", "."].includes(e.key)) {
          e.preventDefault();
        }
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (type === "number" || numericOnly) {
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
          type={type}
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
                    paddingRight: "2px",
                    height: "100%",
                    boxSizing: "border-box",
                  },
                  "& input[type=number]::-webkit-inner-spin-button": {
                    height: "20px",
                    margin: "auto 4px auto 0",
                    opacity: 1,
                    cursor: "pointer",
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
