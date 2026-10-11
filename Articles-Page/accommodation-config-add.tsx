import { useEffect, useMemo, useState } from "react";
import { Box, Button, OutlinedInput, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";

import { RootState } from "../../store";
import ContentBox from "../../layouts/content-box";
import PageTitleChip from "../../components/page-title-chip";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import {
  addAccommodation,
  getAccommodations,
  type AccommodationItem,
} from "../../services/accommodation-config";
import { fetchAccommodationsDropdown } from "../../store/slice/provider-facility-slice";

const P = THEME_PRIMITIVES;

const AccommodationConfigAdd = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [saving, setSaving] = useState(false);
  const [existingNames, setExistingNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getAccommodations()
      .then((items: AccommodationItem[]) => {
        if (!cancelled) {
          setExistingNames(items.map((item) => item.name.trim().toLowerCase()));
        }
      })
      .catch(() => {
        // If load fails, save still attempts; server may reject duplicates.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = () => {
    navigate(paths.ACCOMMODATION_CONFIG.pathName);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const next: typeof errors = {};
    if (!trimmedName) {
      next.name = "Name Required";
    } else if (existingNames.includes(trimmedName.toLowerCase())) {
      next.name = "Name already exists. Please enter another name.";
    }
    if (!description.trim()) next.description = "Description Required";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setSaving(true);
    try {
      await addAccommodation(trimmedName, description.trim());
      dispatch(fetchAccommodationsDropdown() as any);
      showToast(
        "The new record has been created and saved.",
        TOAST_TYPES.SUCCESS,
        "TOP_RIGHT",
        3000,
        undefined,
        "Success!",
      );
      navigate(paths.ACCOMMODATION_CONFIG.pathName);
    } catch {
      showToast("Failed to save the accommodation.", TOAST_TYPES.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const inputSx = useMemo(
    () => ({
      width: "100%",
      borderRadius: "10px",
      backgroundColor: isDarkMode ? P.transparent : P.gridHeaderLight,
      "&.Mui-focused": { backgroundColor: isDarkMode ? P.transparent : P.white },
      fontSize: 14,
      color: isDarkMode ? P.white : P.black,
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? P.inputBgDark : P.rolesInputBorder,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? P.inputBgDark : P.rolesInputBorder,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? P.focusBorder : P.primary,
        borderWidth: "1px",
      },
      "&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: `${isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText} !important`,
      },
      "& .MuiOutlinedInput-input::placeholder": {
        color: isDarkMode ? P.white : undefined,
        opacity: isDarkMode ? 1 : undefined,
      },
    }),
    [isDarkMode]
  );

  const labelSx = {
    fontSize: 14,
    fontWeight: 400,
    color: isDarkMode ? P.white : P.uploadButtonBg,
    mb: "9px",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  };

  const asteriskColor = isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText;
  const errorTextColor = isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText;

  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          pl: 0,
          pr: 2,
          pt: 1,
          pb: 2,
          minHeight: 52,
          minWidth: 0,
        }}
      >
        <PageTitleChip title="Veteran Accommodations" isActive={true} />
      </Box>

      <ContentBox showBorder={false} sx={{ p: 0, minWidth: 0, width: "100%" }}>
        <Box
          sx={{
            backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
            borderRadius: "10px",
            border: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke}`,
            p: 0,
            overflow: "hidden",
            minWidth: 0,
            width: "100%",
          }}
        >
          {/* Form header */}
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              gap: 1.5,
              px: { xs: 2, sm: "24px" },
              py: "16px",
              minWidth: 0,
              borderBottom: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke}`,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: isDarkMode ? P.white : P.black,
              }}
            >
              Add New Record
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexDirection: { xs: "column", sm: "row" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant="contained"
                disabled={saving}
                onClick={() => void handleSave()}
                sx={{
                  height: 36,
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: "80px" },
                  borderRadius: "4px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  px: 2.5,
                  backgroundColor: P.primary,
                  color: P.white,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: isDarkMode ? P.primaryHoverDark : P.primaryHover,
                    boxShadow: "none",
                  },
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="contained"
                onClick={handleCancel}
                sx={{
                  height: 36,
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: "80px" },
                  borderRadius: "4px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  px: 2.5,
                  backgroundColor: isDarkMode ? P.inputBgDark : P.cancelFilledButtonBg,
                  color: isDarkMode ? P.white : P.drawerSelectedTextLight,
                  border: `1px solid ${isDarkMode ? P.strokeDark : P.cancelButtonBorderLight}`,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: isDarkMode ? P.inputBgDark : P.nestedBorderLight,
                    borderColor: isDarkMode ? P.strokeDark : P.cancelButtonHoverBorderLight,
                    boxShadow: "none",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: "24px" } }}>
            {/* Name field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={labelSx}>
                Name
                <Box component="span" sx={{ color: asteriskColor }}>*</Box>
              </Box>
              <OutlinedInput
                fullWidth
                placeholder="Type Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={!!errors.name}
                sx={{
                  ...inputSx,
                  height: 40,
                  "& .MuiOutlinedInput-input": {
                    fontSize: 14,
                    padding: "10px 14px",
                    color: isDarkMode ? P.white : P.black,
                  },
                }}
              />
              {errors.name && (
                <Typography sx={{ fontSize: 12, color: errorTextColor, mt: 0.5 }}>
                  {errors.name}
                </Typography>
              )}
            </Box>

            {/* Description field */}
            <Box>
              <Box sx={labelSx}>
                Description
                <Box component="span" sx={{ color: asteriskColor }}>*</Box>
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Type Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                error={!!errors.description}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    ...inputSx,
                    height: "auto",
                    minHeight: isDarkMode ? 100 : undefined,
                    alignItems: "flex-start",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: 14,
                    color: isDarkMode ? P.white : P.black,
                  },
                }}
              />
              {errors.description && (
                <Typography sx={{ fontSize: 12, color: errorTextColor, mt: 0.5 }}>
                  {errors.description}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </ContentBox>
    </Box>
  );
};

export default AccommodationConfigAdd;
