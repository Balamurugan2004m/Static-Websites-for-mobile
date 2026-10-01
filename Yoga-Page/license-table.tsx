/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Paper,
  Button,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { State } from "../../../services/provider-users";
import { showToast } from "../../../utils/toast";
import { TOAST_TYPES } from "../../../types/toast-types";
import { THEME_PRIMITIVES } from "../../../theme";

type License = {
  id: string;
  StateId: number | string;
  UserLicenceNumber: number | string;
  UserLicenceExpiryDate: string;
  UserLicenceStatus: string;
  state: string;
  UserLicenceType: string;
  IsLicencePortable: boolean;
};

export interface LicenseTableRef {
  addRow: () => void;
  getLicenses: () => License[];
}

interface LicenseTableProps {
  isEdit?: boolean;
  isDarkMode?: boolean;
  styles: any;
  allStates: State[];
}

const LicenseTable = forwardRef<LicenseTableRef, LicenseTableProps>(
  ({ isEdit = false, isDarkMode = false, styles: _styles = {}, allStates = [] }, ref) => {
    const theme = useTheme();
    const P = THEME_PRIMITIVES;
    const [rows, setRows] = useState<License[]>([]);

    const palette = useMemo(() => {
      const border = theme.palette.divider;
      const headerBg = isDarkMode
        ? theme.palette.grey[900]
        : theme.palette.grey[50];
      const rowHover = isDarkMode
        ? theme.palette.action.hover
        : theme.palette.action.hover;
      const inputBg = isDarkMode
        ? theme.palette.grey[800]
        : theme.palette.common.white;
      const inputBorder = isDarkMode
        ? theme.palette.grey[700]
        : theme.palette.grey[300];

      return {
        border,
        headerBg,
        rowHover,
        inputBg,
        inputBorder,
        muted: theme.palette.text.secondary,
        headText: isDarkMode ? theme.palette.grey[100] : theme.palette.grey[800],
      };
    }, [theme, isDarkMode]);

    const containerSx = useMemo(
      () => ({
        borderRadius: "10px 10px 0 0",
        border: `1px solid ${palette.border}`,
        borderBottom: "none",
        boxShadow: "none",
        overflow: "auto",
        maxHeight: { xs: 360, sm: 440 },
        backgroundColor: theme.palette.background.paper,
        "& .MuiTableCell-root": {
          borderColor: palette.border,
          fontSize: "0.8125rem",
          verticalAlign: "middle",
          color: isDarkMode ? P.white : P.black,
          backgroundColor: isDarkMode ? P.black : P.white,
        },
        "& .MuiTableHead-root .MuiTableCell-root": {
          backgroundColor: isDarkMode ? P.gridHeaderDark : palette.headerBg,
          color: isDarkMode ? P.white : palette.headText,
          fontWeight: 600,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        },
        "& .MuiTableBody-root .MuiTableRow-root:hover": {
          backgroundColor: palette.rowHover,
        },
      }),
      [palette, theme.palette.background.paper, isDarkMode, P.black, P.gridHeaderDark, P.white]
    );

    const textFieldSx = useMemo(
      () => ({
        width: "100%",
        minWidth: 120,
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: isDarkMode ? P.inputBgDark : palette.inputBg,
          fontSize: "0.8125rem",
          "& fieldset": {
            borderColor: palette.inputBorder,
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderWidth: 1,
          },
        },
        "& .MuiInputBase-input": {
          py: 0.875,
          px: 1,
        },
      }),
      [palette.inputBg, palette.inputBorder, theme.palette.primary.main, isDarkMode, P.inputBgDark]
    );

    const selectSx = useMemo(
      () => ({
        width: "100%",
        minWidth: 100,
        backgroundColor: isDarkMode ? P.inputBgDark : P.white,
        borderRadius: "10px",
        "&.MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-sizeSmall.MuiSelect-root":
          {
            borderRadius: "10px",
            height: "32px",
          },
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          height: "32px",
          overflow: "hidden",
          backgroundColor: palette.inputBg,
          fontSize: "0.8125rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.inputBorder,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1,
          },
        },
        "& .MuiSelect-select": {
          py: 0,
          px: 1,
          height: "32px",
          display: "flex",
          alignItems: "center",
          
        },
      }),
      [palette.inputBg, palette.inputBorder, theme.palette.primary.main, isDarkMode, P.inputBgDark, P.white]
    );

    const readOnlyCellSx = useMemo(
      () => ({
        color: theme.palette.text.primary,
        lineHeight: 1.5,
      }),
      [theme.palette.text.primary]
    );

    /** Prevents body scroll-lock padding (whole UI "blink") and stabilizes menu inside scrollable table. */
    const selectMenuProps = useMemo(
      () => ({
        disableScrollLock: true,
        anchorOrigin: { vertical: "bottom" as const, horizontal: "left" as const },
        transformOrigin: { vertical: "top" as const, horizontal: "left" as const },
        PaperProps: {
          sx: {
            maxHeight: 320,
            mt: 0.5,
            borderRadius: "10px",
            border: `1px solid ${palette.border}`,
            boxShadow: theme.shadows[8],
          },
        },
      }),
      [palette.border, theme.shadows]
    );

    const handleChange = (
      UserLicenceNumber: any,
      field: keyof License,
      value: any
    ) => {
      setRows((prev) =>
        prev.map((row) =>
          row.UserLicenceNumber === UserLicenceNumber
            ? { ...row, [field]: value }
            : row
        )
      );
    };

    const handleRemove = (UserLicenceNumber: any) => {
      setRows((prev) =>
        prev.filter((row) => row.UserLicenceNumber !== UserLicenceNumber)
      );
    };

    const handleAddRow = () => {
      if (rows.length === 0) {
        setRows([
          {
            id: "1",
            StateId: 1,
            UserLicenceNumber: "",
            UserLicenceExpiryDate: "",
            UserLicenceStatus: "Active",
            state: "",
            UserLicenceType: "",
            IsLicencePortable: false,
          } as License,
        ]);
        return;
      }

      const lastRow = rows[rows.length - 1];

      if (
        lastRow &&
        (typeof lastRow.UserLicenceNumber !== "string" ||
          !lastRow.UserLicenceNumber.trim())
      ) {
        showToast("Please enter a License Number before adding a new row.", TOAST_TYPES.ERROR);
        return;
      }

      setRows((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          StateId:
            prev.length > 0
              ? Math.max(
                  ...prev.map((r) =>
                    typeof r.StateId === "number"
                      ? r.StateId
                      : Number(r.StateId) || 0
                  )
                ) + 1
              : 1,
          UserLicenceNumber: "",
          UserLicenceExpiryDate: "",
          UserLicenceStatus: "Active",
          state: "",
          UserLicenceType: "",
          IsLicencePortable: false,
        } as License,
      ]);
    };

    useImperativeHandle(ref, () => ({
      addRow: handleAddRow,
      getLicenses: () => rows,
    }));

    const formatExpiryDisplay = (raw: string) => {
      if (!raw?.trim()) return "—";
      const trimmed = String(raw).split("T")[0].trim();
      const dashParts = trimmed.split("-");
      if (dashParts.length === 3) {
        if (dashParts[0].length === 4) {
          return `${dashParts[1].padStart(2, "0")}/${dashParts[2].padStart(2, "0")}/${dashParts[0]}`;
        }
        if (dashParts[2].length === 4) {
          return `${dashParts[0].padStart(2, "0")}/${dashParts[1].padStart(2, "0")}/${dashParts[2]}`;
        }
      }
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return "—";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    return (
      <TableContainer component={Paper} elevation={0} sx={containerSx}>
        <Table size="small" stickyHeader sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>License number</TableCell>
              <TableCell>Expiry date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Transferable</TableCell>
              <TableCell align="right" sx={{ width: 108 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{
                    py: 4,
                    color: palette.muted,
                    fontSize: "0.875rem",
                    borderBottom: "none",
                  }}
                >
                  No licenses yet. Use &quot;Add new license&quot; to add a row.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {isEdit ? (
                      <TextField
                        variant="outlined"
                        value={row.UserLicenceNumber}
                        size="small"
                        placeholder="Required"
                        onChange={(e) =>
                          handleChange(
                            String(row.UserLicenceNumber),
                            "UserLicenceNumber",
                            e.target.value
                          )
                        }
                        sx={textFieldSx}
                      />
                    ) : (
                      <Box component="span" sx={readOnlyCellSx}>
                        {row.UserLicenceNumber || "—"}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEdit ? (
                      <TextField
                        variant="outlined"
                        type="text"
                        size="small"
                        placeholder="MM/DD/YYYY"
                        value={formatExpiryDisplay(row.UserLicenceExpiryDate) === "—" ? "" : formatExpiryDisplay(row.UserLicenceExpiryDate)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const digits = raw.replace(/\D/g, "").slice(0, 8);
                          let formatted = "";
                          if (digits.length <= 2) formatted = digits;
                          else if (digits.length <= 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                          else formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                          handleChange(
                            row.UserLicenceNumber,
                            "UserLicenceExpiryDate",
                            formatted
                          );
                        }}
                        sx={textFieldSx}
                      />
                    ) : (
                      <Box component="span" sx={readOnlyCellSx}>
                        {formatExpiryDisplay(row.UserLicenceExpiryDate)}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEdit ? (
                      <Select
                        variant="outlined"
                        size="small"
                        value={row.UserLicenceStatus}
                        onChange={(e) =>
                          handleChange(
                            row.UserLicenceNumber,
                            "UserLicenceStatus",
                            e.target.value
                          )
                        }
                        sx={selectSx}
                        MenuProps={selectMenuProps}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    ) : (
                      <Box component="span" sx={readOnlyCellSx}>
                        {row.UserLicenceStatus}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEdit ? (
                      <Select
                        variant="outlined"
                        size="small"
                        displayEmpty
                        value={row.state}
                        onChange={(e) =>
                          handleChange(
                            row.UserLicenceNumber,
                            "state",
                            e.target.value
                          )
                        }
                        sx={selectSx}
                        MenuProps={selectMenuProps}
                        renderValue={(selected) =>
                          selected ? (
                            selected
                          ) : (
                            <span style={{ color: palette.muted }}>Select state</span>
                          )
                        }
                      >
                        {(allStates?.length ? allStates : []).map((el: State) => (
                          <MenuItem key={el.Id} value={el.StateName}>
                            {el.StateName}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Box component="span" sx={readOnlyCellSx}>
                        {row.state || "—"}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEdit ? (
                      <TextField
                        variant="outlined"
                        value={row.UserLicenceType}
                        size="small"
                        placeholder="e.g. MD"
                        onChange={(e) =>
                          handleChange(
                            row.UserLicenceNumber,
                            "UserLicenceType",
                            e.target.value
                          )
                        }
                        sx={textFieldSx}
                      />
                    ) : (
                      <Box component="span" sx={readOnlyCellSx}>
                        {row.UserLicenceType || "—"}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {isEdit ? (
                      <Checkbox
                        size="small"
                        checked={row.IsLicencePortable}
                        onChange={(e) =>
                          handleChange(
                            row.UserLicenceNumber,
                            "IsLicencePortable",
                            e.target.checked
                          )
                        }
                        sx={{
                          p: 0.5,
                          color: isDarkMode ? theme.palette.grey[500] : undefined,
                          "&.Mui-checked": {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    ) : (
                      <Box component="span" sx={readOnlyCellSx}>
                        {row.IsLicencePortable ? "Yes" : "No"}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      size="small"
                      disabled={!isEdit}
                      onClick={() => handleRemove(row.UserLicenceNumber)}
                      startIcon={
                        <HighlightOffIcon sx={{ fontSize: 18 }} />
                      }
                      sx={{
                        textTransform: "none",
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: 1,
                        height: 30,
                        minHeight: 30,
                        minWidth: "auto",
                        px: "12px",
                        py: 0,
                        gap: "6px",
                        borderRadius: "15px",
                        boxShadow: "none",
                        color: isDarkMode ? P.dangerBgLight : P.dangerText,
                        backgroundColor: isDarkMode
                          ? P.dangerBgDarkAlpha
                          : P.dangerBgLight,
                        "& .MuiButton-startIcon": {
                          m: 0,
                          color: "inherit",
                          "& > *:nth-of-type(1)": {
                            fontSize: 18,
                          },
                        },
                        "&:hover": {
                          boxShadow: "none",
                          backgroundColor: isDarkMode
                            ? P.requiredFieldColor
                            : P.softDangerBorder,
                          color: isDarkMode ? P.dangerBgLight : P.dangerText,
                        },
                        "&.Mui-disabled": {
                          opacity: 0.45,
                          color: isDarkMode ? P.dangerBgLight : P.dangerText,
                          backgroundColor: isDarkMode
                            ? P.dangerBgDarkAlpha
                            : P.dangerBgLight,
                        },
                      }}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

export default LicenseTable;
