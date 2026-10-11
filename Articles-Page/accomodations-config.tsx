import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, GlobalStyles, IconButton, Menu, MenuItem, TextField, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { GridColDef } from "@mui/x-data-grid";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";

import { RootState } from "../../store";
import ContentBox from "../../layouts/content-box";
import DataGridTable from "../../ui/data-grid-table";
import PageTitleChip from "../../components/page-title-chip";
import ConfirmationModal from "../../ui/confirmation-modal";
import ReusableDrawer from "../../ui/reusable-drawer";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import {
  AccommodationItem,
  deleteAccommodation,
  editAccommodation,
  getAccommodations,
} from "../../services/accommodation-config";
import { fetchAccommodationsDropdown } from "../../store/slice/provider-facility-slice";

const P = THEME_PRIMITIVES;

const PlusSquareIcon = (props: { sx?: object }) => (
  <Box
    component="svg"
    viewBox="0 0 16 16"
    sx={{
      width: 16,
      height: 16,
      display: "inline-block",
      fill: "currentColor",
      flexShrink: 0,
      ...props.sx,
    }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 0C1.34315 0 0 1.34315 0 3V13C0 14.6569 1.34315 16 3 16H13C14.6569 16 16 14.6569 16 13V3C16 1.34315 14.6569 0 13 0H3ZM6.75 3.25H9.25V6.75H12.75V9.25H9.25V12.75H6.75V9.25H3.25V6.75H6.75V3.25Z"
    />
  </Box>
);

const AccommodationConfig = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [rows, setRows] = useState<AccommodationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AccommodationItem | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // Menu action state
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedRow, setSelectedRow] = useState<AccommodationItem | null>(null);

  // Edit drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AccommodationItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editErrors, setEditErrors] = useState<{ name?: string; description?: string }>({});
  const [saving, setSaving] = useState(false);

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";

  const hasFetchedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccommodations();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void load();
  }, [load]);

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleOpenEdit = (item: AccommodationItem) => {
    setEditTarget(item);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditErrors({});
    setEditDrawerOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDrawerOpen(false);
    setEditTarget(null);
    setEditName("");
    setEditDescription("");
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const trimmedName = editName.trim();
    const trimmedDesc = editDescription.trim();
    const errors: { name?: string; description?: string } = {};

    if (!trimmedName) {
      errors.name = "Name is required";
    }
    if (!trimmedDesc) {
      errors.description = "Description is required";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const updated = await editAccommodation(editTarget.id, trimmedName, trimmedDesc);
      setRows((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? { ...r, ...updated, name: trimmedName, description: trimmedDesc }
            : r
        )
      );
      showToast(
        "The record has been successfully edited.",
        TOAST_TYPES.SUCCESS,
        "TOP_RIGHT",
        3000,
        undefined,
        "Success!"
      );
      dispatch(fetchAccommodationsDropdown() as any);
      handleCloseEdit();
    } catch {
      showToast("Failed to edit the record.", TOAST_TYPES.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccommodation(deleteTarget.id);
      dispatch(fetchAccommodationsDropdown() as any);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast(
        "The record has been successfully deleted.",
        TOAST_TYPES.SUCCESS,
        "TOP_RIGHT",
        3000,
        undefined,
        "Success!"
      );
    } catch {
      showToast("Failed to delete the record.", TOAST_TYPES.ERROR);
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1.5,
        minWidth: 160,
        renderCell: (params) => (
          <Typography sx={{ fontSize: 14, color: isDarkMode ? P.white : P.black }}>
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2.5,
        minWidth: 220,
        renderCell: (params) => (
          <Typography sx={{ fontSize: 14, color: isDarkMode ? P.white : P.black }}>
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "visibility",
        headerName: "Visibility",
        flex: 1.2,
        minWidth: 120,
        renderCell: (params) => (
          <Typography sx={{ fontSize: 14, color: isDarkMode ? P.white : P.black }}>
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 0.6,
        minWidth: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const isMenuOpen = Boolean(menuAnchor) && selectedRow?.id === params.row?.id;
          return (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAnchor(e.currentTarget);
                  setSelectedRow(params.row as AccommodationItem);
                }}
                sx={{
                  width: 36,
                  height: 36,
                  color: isDarkMode ? P.white : P.labelMuted,
                  borderRadius: "50%",
                  backgroundColor: isMenuOpen
                    ? (isDarkMode ? P.scrollbarThumbDarkSoft : P.lightBorderPrimary)
                    : P.transparent,
                  "&:hover": {
                    backgroundColor: isDarkMode ? P.whiteAlpha12 : P.lightBorderPrimary,
                  },
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    [isDarkMode, menuAnchor, selectedRow?.id]
  );

  const gridContainerSx = useMemo(
    () => ({
      width: "100%",
      p: 0,
      m: 0,
      "& .MuiDataGrid-root": {
        border: "none !important",
      },
      "& .MuiDataGrid-main": {
        border: "none !important",
      },
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
        borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
      },
      "& .MuiDataGrid-columnHeader": {
        borderBottom: "none !important",
      },
      "& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-columnHeader--first, & .MuiDataGrid-columnHeader[data-field='name']": {
        pl: "24px !important",
      },
      "& .MuiDataGrid-columnHeaderTitle": {
        fontSize: 14,
        fontWeight: 400,
        color: isDarkMode ? P.white : P.black,
      },
      "& .MuiDataGrid-cell": {
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        border: "none !important",
        borderBottom: "none !important",
        backgroundColor: isDarkMode ? P.black : P.white,
        "&:focus, &:focus-within": {
          outline: "none !important",
        },
      },
      "& .MuiDataGrid-cell:first-of-type, & .MuiDataGrid-cell--firstColumn, & .MuiDataGrid-cell[data-field='name']": {
        pl: "24px !important",
      },
      "& .MuiDataGrid-row": {
        backgroundColor: isDarkMode ? P.black : P.white,
        minHeight: "70px !important",
        maxHeight: "70px !important",
        borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
        "&:hover": {
          backgroundColor: isDarkMode ? P.whiteAlpha4 : P.gridHeaderLight,
        },
      },
      "& .MuiDataGrid-footerContainer": {
        minHeight: 52,
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
      },
    }),
    [isDarkMode]
  );

  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          pt: 2,
          mb: 2,
          minHeight: 52,
          minWidth: 0,
        }}
      >
        <PageTitleChip title="Veteran Accommodations" isActive={true} />
        <Button
          variant="contained"
          onClick={() => navigate(paths.ACCOMMODATION_CONFIG_ADD.pathName)}
          startIcon={
            <PlusSquareIcon
              sx={{
                color: P.white
              }}
            />
          }
          sx={{
            ml: "auto",
            height: 40,
            width: { xs: "100%", sm: "auto" },
            minWidth: { sm: "158px" },
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: 16,
            px: 2,
            whiteSpace: "nowrap",
            fontFamily: theme.custom?.typeScale.openSans,
            backgroundColor: P.primary,
            color: P.white,
            boxShadow: "none",
            "& .MuiButton-startIcon": {
              mr: 1,
              ml: 0,
            },
            "&:hover": {
              backgroundColor: isDarkMode ? P.primaryHoverDark : P.primaryHover,
              boxShadow: "none",
            },
          }}
        >
          Add new record
        </Button>
      </Box>

      <ContentBox showBorder={false} sx={{ p: 0, mb: 0, flexGrow: 0, minWidth: 0, width: "100%" }}>
        <Box p={0} width="100%" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: "100%",
              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
              borderRadius: 0,
              overflowX: "auto",
              overflowY: "hidden",
              mt: 1,
            }}
          >
            <Box sx={{ ...gridContainerSx, minWidth: 720, width: "100%" }}>
              <DataGridTable
                rows={rows}
                columns={columns}
                columnDisplayWidth={720}
                compactOnMobile
                loading={loading}
                autoHeight
                checkboxSelection={false}
                showToolbar={false}
                isDarkMode={isDarkMode}
                hideFooter={false}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowHeight={70}
                borderless
                noRowsMessage="No accommodation records found."
                sx={{
                  border: "none !important",
                  p: 0,
                  "& .MuiDataGrid-columnHeaders": {
                    borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
                  },
                  "& .MuiDataGrid-columnHeader": {
                    borderBottom: "none !important",
                  },
                  "& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-columnHeader--first, & .MuiDataGrid-columnHeader[data-field='name']": {
                    paddingLeft: "24px !important",
                  },
                  "& .MuiDataGrid-cell": {
                    border: "none !important",
                    borderBottom: "none !important",
                  },
                  "& .MuiDataGrid-cell:first-of-type, & .MuiDataGrid-cell--firstColumn, & .MuiDataGrid-cell[data-field='name']": {
                    paddingLeft: "24px !important",
                  },
                  "& .MuiDataGrid-row": {
                    borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
                  },
                  "& .MuiDataGrid-virtualScroller": { overflow: "hidden !important" },
                  "& .MuiDataGrid-scrollbar": { display: "none !important" },
                  "& .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-scrollbarFiller--header, & .MuiDataGrid-filler": {
                    display: "none !important",
                  },
                  "& .MuiDataGrid-footerContainer": { display: "flex !important", minHeight: 52, p: 0 },
                }}
              />
            </Box>
          </Box>
        </Box>
      </ContentBox>

      {/* Row Action Menu */}
      <Menu
        disableScrollLock
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        elevation={0}
        MenuListProps={{
          sx: {
            p: 0,
            py: 0,
          },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 200,
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${isDarkMode ? P.strokeDark : P.lightBorderPrimary}`,
            backgroundColor: isDarkMode ? P.gridHeaderDark : P.white,
            overflow: "hidden",
            p: 0,
            mt: -1.5,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedRow) {
              handleOpenEdit(selectedRow);
            }
            handleMenuClose();
          }}
          sx={{
            fontSize: 16,
            fontWeight: 400,
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            px: 2.5,
            color: isDarkMode ? P.white : P.selectBackgroundDark,
            borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.lightBorderPrimary}`,
            "&:hover": {
              backgroundColor: isDarkMode ? alpha(P.primary, 0.2) : P.selectedOptionBgLight,
              color: isDarkMode ? P.white : P.primary,
              "& .MuiSvgIcon-root": {
                color: isDarkMode ? P.white : P.primary,
              },
            },
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 20, color: isDarkMode ? P.white : P.selectBorderDark }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedRow) {
              setDeleteTarget(selectedRow);
            }
            handleMenuClose();
          }}
          sx={{
            fontSize: 16,
            fontWeight: 400,
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            px: 2.5,
            color: isDarkMode ? P.white : P.selectBackgroundDark,
            "&:hover": {
              backgroundColor: isDarkMode ? alpha(P.primary, 0.2) : P.selectedOptionBgLight,
              color: isDarkMode ? P.white : P.primary,
              "& .MuiSvgIcon-root": {
                color: isDarkMode ? P.white : P.primary,
              },
            },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 20, color: isDarkMode ? P.white : P.selectBorderDark }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Drawer */}
      {editDrawerOpen && (
        <GlobalStyles
          styles={{
            ".MuiDrawer-root .MuiDrawer-paper": {
              "& > div:nth-of-type(1), & > .MuiBox-root:nth-of-type(1)": {
                paddingLeft: "24px !important",
                paddingRight: "21px !important",
                minHeight: "56px !important",
                height: "56px !important",
                boxSizing: "border-box !important",
                "& h2, & .MuiTypography-root": {
                  fontSize: "16px !important",
                  fontWeight: "700 !important",
                  color: `${isDarkMode ? P.white : P.black} !important`,
                  lineHeight: "normal !important",
                  height: "auto !important",
                },
              },
              "& > div:nth-of-type(2), & > .MuiBox-root:nth-of-type(2)": {
                paddingLeft: "24px !important",
                paddingRight: "24px !important",
                paddingTop: "24px !important",
                paddingBottom: "24px !important",
              },
              "& > div:nth-of-type(3), & > .MuiBox-root:nth-of-type(3)": {
                paddingLeft: "24px !important",
                paddingRight: "20px !important",
                paddingTop: "14px !important",
                paddingBottom: "14px !important",
                minHeight: "64px !important",
                gap: "10px !important",
                "& > :not(:first-of-type)": {
                  marginLeft: "0 !important",
                },
              },
            },
          }}
        />
      )}
      <ReusableDrawer
        open={editDrawerOpen}
        onClose={handleCloseEdit}
        onCancel={handleCloseEdit}
        onSave={() => void handleSaveEdit()}
        title="Edit"
        btnText={saving ? "Saving..." : "Save"}
        cancelBtnText="Cancel"
        cancelBtnVariant="contained"
        drawerWidth={520}
        isDark={isDarkMode}
        disableSave={saving}
        saveBtnRadius="4px"
        closeIconSx={{
          fontSize: 18,
          color: isDarkMode ? P.white : P.black,
          stroke: isDarkMode ? P.white : P.black,
          strokeWidth: 1.2,
        }}
        saveButtonSx={{
          backgroundColor: `${P.primary} !important`,
          color: `${P.white} !important`,
          height: "36px !important",
          width: "91px !important",
          minWidth: "91px !important",
          borderRadius: "4px !important",
          fontSize: "14px !important",
          fontWeight: "700 !important",
          textTransform: "none !important",
          boxShadow: "none !important",
          "&:hover": {
            backgroundColor: `${isDarkMode ? P.primaryHoverDark : P.primaryHover} !important`,
            boxShadow: "none !important",
          },
        }}
        cancelButtonSx={{
          backgroundColor: `${isDarkMode ? P.inputBgDark : P.cancelFilledButtonBg} !important`,
          color: `${isDarkMode ? P.white : P.drawerSelectedTextLight} !important`,
          border: `1px solid ${isDarkMode ? P.strokeDark : P.cancelButtonBorderLight} !important`,
          height: "36px !important",
          width: "91px !important",
          minWidth: "91px !important",
          borderRadius: "4px !important",
          fontSize: "14px !important",
          fontWeight: "700 !important",
          textTransform: "none !important",
          boxShadow: "none !important",
          "&:hover": {
            backgroundColor: `${isDarkMode ? P.inputBgDark : P.nestedBorderLight} !important`,
            borderColor: `${isDarkMode ? P.strokeDark : P.cancelButtonHoverBorderLight} !important`,
            boxShadow: "none !important",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            width: "100%",
            pt: 0,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.75,
                fontSize: 12,
                fontWeight:400,
                mt: -1,
                color: isDarkMode ? P.white : P.labelMuted,
              }}
            >
              Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                if (editErrors.name) {
                  setEditErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              error={Boolean(editErrors.name)}
              helperText={editErrors.name}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: isDarkMode ? P.inputBgDark : P.white,
                  color: isDarkMode ? P.white : P.black,
                  "& fieldset": {
                    borderColor: isDarkMode ? P.inputBgDark : P.stroke,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.75,
                fontSize: 12,
                fontWeight: 400,
                color: isDarkMode ? P.white : P.labelMuted,
              }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={editDescription}
              onChange={(e) => {
                setEditDescription(e.target.value);
                if (editErrors.description) {
                  setEditErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              error={Boolean(editErrors.description)}
              helperText={editErrors.description}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: isDarkMode ? P.inputBgDark : P.white,
                  color: isDarkMode ? P.white : P.black,
                  "& fieldset": {
                    borderColor: isDarkMode ? P.inputBgDark : P.stroke,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.75,
                fontSize: 12,
                fontWeight: 400,
                color: isDarkMode ? P.white : P.labelMuted,
              }}
            >
              Visibility
            </Typography>
            <Box
              sx={{
                width: "100%",
                py: 1.25,
                px: 2,
                borderRadius: "10px",
                backgroundColor: isDarkMode ? P.inputBgDark : P.lightBorderMuted,
                color: isDarkMode ? P.white : P.black,
                fontSize: 14,
                userSelect: "none",
              }}
            >
              Internal
            </Box>
          </Box>
        </Box>
      </ReusableDrawer>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
        isDarkMode={isDarkMode}
        actionStyle="filledWarning"
        titleSx={{
          fontSize: 18,
          fontWeight: 700,
          color: isDarkMode ? P.white : P.black,
          pl: 0,
        }}
        closeIconSx={{
          fontSize: 18,
          color: isDarkMode ? P.white : P.black,
          stroke: isDarkMode ? P.white : P.black,
          strokeWidth: 1.2,
        }}
        dialogSx={{
          width: "520px !important",
          maxWidth: "calc(100vw - 32px) !important",
          borderRadius: "10px !important",
          backgroundColor: `${isDarkMode ? P.cardBgDark : P.white} !important`,
          overflow: "hidden",
          boxShadow: isDarkMode
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
          "& .MuiDialogTitle-root": {
            p: 0,
            backgroundColor: `${isDarkMode ? P.secondaryElevatedDark : P.gridHeaderLight} !important`,
          },
          "& .MuiDialogTitle-root > .MuiBox-root": {
            borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.drawerBorderLight} !important`,
            px: "24px !important",
            height: "56px !important",
            display: "flex !important",
            alignItems: "center !important",
            backgroundColor: `${isDarkMode ? P.secondaryElevatedDark : P.gridHeaderLight} !important`,
          },
          "& .MuiDialogContent-root": {
            borderTop: "none !important",
            borderBottom: "none !important",
            px: "24px !important",
            py: "24px !important",
            backgroundColor: `${isDarkMode ? P.cardBgDark : P.white} !important`,
          },
          "& .MuiDialogActions-root": {
            borderTop: `1px solid ${isDarkMode ? P.strokeDark : P.drawerBorderLight} !important`,
            px: "24px !important",
            py: "14px !important",
            gap: "8px !important",
            backgroundColor: `${isDarkMode ? P.secondaryElevatedDark : P.gridHeaderLight} !important`,
            "& > :not(:first-of-type)": {
              ml: "0 !important",
            },
          },
        }}
        cancelButtonSx={{
          backgroundColor: `${isDarkMode ? P.inputBgDark : P.cancelFilledButtonBg} !important`,
          color: `${isDarkMode ? P.white : P.drawerSelectedTextLight} !important`,
          border: `1px solid ${isDarkMode ? P.strokeDark : P.cancelButtonBorderLight} !important`,
          height: "36px !important",
          width: "91px !important",
          minWidth: "91px !important",
          px: "20px !important",
          borderRadius: "4px !important",
          textTransform: "none !important",
          fontSize: "14px !important",
          fontWeight: "700 !important",
          boxShadow: "none !important",
          "&:hover": {
            backgroundColor: `${isDarkMode ? P.inputBgDark : P.nestedBorderLight} !important`,
            borderColor: `${isDarkMode ? P.strokeDark : P.cancelButtonHoverBorderLight} !important`,
            boxShadow: "none !important",
          },
        }}
        confirmButtonSx={{
          backgroundColor: `${isDarkMode ? P.deleteButtonBgDarkAlpha : P.dangerBgLight} !important`,
          background: `${isDarkMode ? P.deleteButtonBgDarkAlpha : P.dangerBgLight} !important`,
          color: `${isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText} !important`,
          border: "none !important",
          height: "36px !important",
          width: "101px !important",
          minWidth: "101px !important",
          px: "20px !important",
          borderRadius: "4px !important",
          textTransform: "none !important",
          fontSize: "14px !important",
          fontWeight: "700 !important",
          boxShadow: "none !important",
          "&:hover": {
            backgroundColor: `${isDarkMode ? P.deleteButtonHoverBgDarkAlpha : P.deleteButtonHoverBgLight} !important`,
            background: `${isDarkMode ? P.deleteButtonHoverBgDarkAlpha : P.deleteButtonHoverBgLight} !important`,
            color: `${isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText} !important`,
            boxShadow: "none !important",
            opacity: 1,
          },
          "&.MuiButton-contained": {
            width: "90px !important",
            minWidth: "90px !important",
            backgroundColor: `${isDarkMode ? P.deleteButtonBgDarkAlpha : P.dangerBgLight} !important`,
            background: `${isDarkMode ? P.deleteButtonBgDarkAlpha : P.dangerBgLight} !important`,
            color: `${isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText} !important`,
            boxShadow: "none !important",
          },
          "&.MuiButton-contained:hover": {
            width: "90px !important",
            minWidth: "90px !important",
            backgroundColor: `${isDarkMode ? P.deleteButtonHoverBgDarkAlpha : P.deleteButtonHoverBgLight} !important`,
            background: `${isDarkMode ? P.deleteButtonHoverBgDarkAlpha : P.deleteButtonHoverBgLight} !important`,
            color: `${isDarkMode ? P.dangerTextOnDarkSoft : P.dangerText} !important`,
            boxShadow: "none !important",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            backgroundColor: isDarkMode ? P.dangerAlertBgDarkAlpha : P.errorAlertSurface,
            border: `1px solid ${isDarkMode ? P.dangerAlertBorderDarkAlpha : P.dangerAlertBorderLight}`,
            borderRadius: "6px",
            px: 2.5,
            py: 2,
          }}
        >
          <DeleteOutlineIcon
            sx={{
              color: isDarkMode ? P.dangerTextOnDarkSoft : P.dangerIconRed,
              fontSize: 22,
              mt: "1px",
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              color: isDarkMode ? P.white : P.errorAlertText,
              fontSize: 14.5,
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            Are you sure you want to delete this Special Accommodation?
          </Typography>
        </Box>
      </ConfirmationModal>
    </Box>
  );
};

export default AccommodationConfig;
