import { useEffect, useMemo, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isValid, parse } from "date-fns";
import ReusableDrawer from "../../../ui/reusable-drawer";
import { ConfirmationModal } from "../../../ui";
import FormFieldLabel from "../../../ui/form-field-label";
import { getDrawerFieldPalette, getDrawerFieldSx } from "../../../ui/drawer-field-styles";
import { THEME_PRIMITIVES } from "../../../theme";

const P = THEME_PRIMITIVES;

type AddTrainedDateDrawerProps = {
  open: boolean;
  isDarkMode: boolean;
  initialDate?: string | null;
  onClose: () => void;
  onSave: (date: string) => void;
};

const parseDisplayDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = parse(value, "MM/dd/yyyy", new Date());
  return isValid(parsed) ? parsed : null;
};

const AddTrainedDateDrawer = ({
  open,
  isDarkMode,
  initialDate,
  onClose,
  onSave,
}: AddTrainedDateDrawerProps) => {
  const theme = useTheme();
  const palette = useMemo(() => getDrawerFieldPalette(theme), [theme]);
  const dateFieldSx = useMemo(
    () =>
      getDrawerFieldSx(theme, {
        accent: palette.accent,
        selectInnerBg: palette.selectInnerBg,
        dateFieldBg: palette.dateFieldBg,
        border: palette.border,
        labelMuted: palette.labelMuted,
        primaryText: palette.primaryText,
        labelText: palette.labelText,
        requiredMark: palette.requiredMark,
      }).dateTimeTextFieldSx,
    [palette, theme]
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const pickerZIndex = theme.zIndex.modal + 200;

  useEffect(() => {
    if (open) {
      setSelectedDate(parseDisplayDate(initialDate));
      setConfirmCloseOpen(false);
    }
  }, [open, initialDate]);

  const dayKey = (value: Date | null) =>
    value && isValid(value) ? format(value, "MM/dd/yyyy") : "";

  const isDirty = dayKey(selectedDate) !== dayKey(parseDisplayDate(initialDate));

  const handleAttemptClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    onClose();
  };

  const handleSave = () => {
    if (!selectedDate) return;
    onSave(format(selectedDate, "MM/dd/yyyy"));
  };

  return (
    <>
    <ReusableDrawer
      open={open}
      onClose={handleAttemptClose}
      title="Add Trained Date"
      onSave={handleSave}
      onCancel={handleAttemptClose}
      isDark={isDarkMode}
      btnText="Save"
      cancelBtnText="Cancel"
      cancelBtnVariant="contained"
      disableSave={!selectedDate}
      drawerWidth={600}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <FormFieldLabel>Trained Date</FormFieldLabel>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            enableAccessibleFieldDOMStructure={false}
            desktopModeMediaQuery="@media (min-width: 0px)"
            value={selectedDate}
            onChange={setSelectedDate}
            format="MM/dd/yyyy"
            slots={{
              openPickerIcon: () => (
                <Box
                  component="svg"
                  viewBox="0 0 20 20"
                  aria-hidden
                  sx={{ width: 20, height: 20, display: "block" }}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.8889 6.1H13.3333V5H12.2222V6.1H7.77778V5H6.66667V6.1H6.11111C5.49444 6.1 5.00556 6.595 5.00556 7.2L5 14.9C5 15.505 5.49444 16 6.11111 16H13.8889C14.5 16 15 15.505 15 14.9V7.2C15 6.595 14.5 6.1 13.8889 6.1ZM13.8889 14.9H6.11111V9.4H13.8889V14.9ZM13.8889 8.3H6.11111V7.2H13.8889V8.3ZM8.33333 11.6H7.22222V10.5H8.33333V11.6ZM10.5556 11.6H9.44444V10.5H10.5556V11.6ZM12.7778 11.6H11.6667V10.5H12.7778V11.6ZM8.33333 13.8H7.22222V12.7H8.33333V13.8ZM10.5556 13.8H9.44444V12.7H10.5556V13.8ZM12.7778 13.8H11.6667V12.7H12.7778V13.8Z"
                    fill={isDarkMode ? P.white : P.labelMuted}
                  />
                </Box>
              ),
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                placeholder: "mm/dd/yyyy",
                sx: dateFieldSx,
              },
              actionBar: {
                actions: ["clear", "today"],
                sx: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 3.5,
                  pt: 0,
                  pb: 2,
                  mt: 0,
                  "& .MuiButton-root": {
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    color: isDarkMode ? P.primaryOnDark : P.primary,
                    minWidth: "auto",
                    p: 0,
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  },
                },
              },
              openPickerButton: {
                sx: {
                  backgroundColor: "transparent",
                  "&:hover": { backgroundColor: "transparent" },
                },
              },
              popper: {
                placement: "bottom-start",
                sx: { zIndex: pickerZIndex },
              },
              mobilePaper: {
                sx: { zIndex: pickerZIndex },
              },
              dialog: {
                sx: { zIndex: pickerZIndex },
              },
            }}
          />
        </LocalizationProvider>
      </Box>
    </ReusableDrawer>
    <ConfirmationModal
      open={confirmCloseOpen}
      title="Warning"
      highlightMessage="You have unsaved changes. If you leave now, they'll be lost. Do you want to continue?"
      confirmLabel="Yes"
      cancelLabel="No"
      showHighlight
      showCloseIcon
      isDarkMode={isDarkMode}
      onConfirm={handleConfirmClose}
      onCancel={() => setConfirmCloseOpen(false)}
      onClose={() => setConfirmCloseOpen(false)}
    />
    </>
  );
};

export default AddTrainedDateDrawer;
