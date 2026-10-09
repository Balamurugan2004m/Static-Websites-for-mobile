import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import trashIcon from "../../assets/trash.svg";
import { GridColDef } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
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

const P = THEME_PRIMITIVES;

const AccommodationConfig = () => {
  const navigate = useNavigate();
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
      await editAccommodation(editTarget.id, trimmedName, trimmedDesc);
      setRows((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? { ...r, name: trimmedName, description: trimmedDesc }
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
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast(
        "The record has been deleted successfully.",
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
                    ? (isDarkMode ? "rgba(255,255,255,0.15)" : "#E5E7EB")
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.12)" : "#E5E7EB",
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
      "& .MuiDataGrid-row": {
        backgroundColor: isDarkMode ? P.black : P.white,
        minHeight: "70px !important",
        maxHeight: "70px !important",
        borderBottom: `1px solid ${isDarkMode ? P.strokeDark : P.stroke} !important`,
        "&:hover": {
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : P.gridHeaderLight,
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
          sx={{
            ml: "auto",
            height: 44,
            width: { xs: "100%", sm: "auto" },
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: 14,
            px: "14px",
            whiteSpace: "nowrap",
            backgroundColor: P.primary,
            color: P.white,
            "&:hover": { backgroundColor: isDarkMode ? P.primaryHoverDark : P.primaryHover },
          }}
        >
          <span style={{ padding: "0 3px" }}>+</span> Add New Record
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
                  "& .MuiDataGrid-cell": {
                    border: "none !important",
                    borderBottom: "none !important",
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
            width: 180,
            borderRadius: "16px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${isDarkMode ? P.strokeDark : "#E5E7EB"}`,
            backgroundColor: isDarkMode ? P.gridHeaderDark : P.white,
            overflow: "hidden",
            p: 0,
            mt: 0.5,
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
            color: isDarkMode ? P.white : "#2D3748",
            borderBottom: `1px solid ${isDarkMode ? P.strokeDark : "#E5E7EB"}`,
            "&:hover": {
              backgroundColor: isDarkMode ? alpha(P.primary, 0.2) : "#EFF6FF",
              color: isDarkMode ? P.white : P.primary,
              "& .MuiSvgIcon-root": {
                color: isDarkMode ? P.white : P.primary,
              },
            },
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 20, color: isDarkMode ? P.white : "#4A5568" }} />
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
            color: isDarkMode ? P.white : "#2D3748",
            "&:hover": {
              backgroundColor: isDarkMode ? alpha(P.primary, 0.2) : "#EFF6FF",
              color: isDarkMode ? P.white : P.primary,
              "& .MuiSvgIcon-root": {
                color: isDarkMode ? P.white : P.primary,
              },
            },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 20, color: isDarkMode ? P.white : "#4A5568" }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Drawer */}
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
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            width: "100%",
            pt: 1,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.75,
                fontSize: 13,
                fontWeight: 500,
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
                  borderRadius: "8px",
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
                fontSize: 13,
                fontWeight: 500,
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
                  borderRadius: "8px",
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
                fontSize: 13,
                fontWeight: 500,
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
                borderRadius: "8px",
                backgroundColor: isDarkMode ? P.inputBgDark : "#E5E5E5",
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
        title="Before you Continue"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
        isDarkMode={isDarkMode}
        actionStyle="filledWarning"
        titleSx={{ pl: 2 }}
        cancelButtonSx={{
          backgroundColor: isDarkMode ? P.inputBgDark : P.cancelFilledButtonBg,
          color: isDarkMode ? P.white : P.neutralButtonTextMedium,
          height: 34,
          px: "40px",
          borderRadius: "10px",
          textTransform: "none",
          fontSize: 14,
          fontWeight: 400,
          minWidth: "auto",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: isDarkMode ? P.inputBgDark : P.cancelFilledButtonHover,
            boxShadow: "none",
          },
        }}
        confirmButtonSx={{
          backgroundColor: isDarkMode ? P.errorAccentStrong : P.errorText,
          color: P.white,
          height: 34,
          px: "40px",
          borderRadius: "10px",
          textTransform: "none",
          fontSize: 14,
          fontWeight: 400,
          minWidth: "auto",
          boxShadow: "none",
          background: isDarkMode ? P.errorAccentStrong : P.errorText,
          "&:hover": {
            background: isDarkMode ? P.errorAccentStrong : P.errorTextHover,
            backgroundColor: isDarkMode ? P.errorAccentStrong : P.errorTextHover,
            boxShadow: "none",
            opacity: 1,
          },
          "&.MuiButton-contained": {
            backgroundColor: isDarkMode ? P.errorAccentStrong : P.errorText,
            background: isDarkMode ? P.errorAccentStrong : P.errorText,
          },
          "&.MuiButton-contained:hover": {
            backgroundColor: isDarkMode ? P.errorAccentStrong : P.errorTextHover,
            background: isDarkMode ? P.errorAccentStrong : P.errorTextHover,
          },
        }}
      >
        <Alert
          severity="error"
          icon={
            <Box
              component="img"
              src={trashIcon}
              alt=""
              sx={{
                width: 16,
                height: 16,
                display: "block",
                filter:
                  "brightness(0) saturate(100%) invert(11%) sepia(100%) saturate(7442%) hue-rotate(0deg) brightness(98%) contrast(115%)",
              }}
            />
          }
          sx={{
            borderRadius: "4px",
            backgroundColor: isDarkMode ? P.alertErrorBgDark : P.errorAlertSurface,
            py: "6px",
            px: 2,
            alignItems: "flex-start",
            "& .MuiAlert-icon": {
              color: isDarkMode ? P.fieldError : P.errorAlertText,
              py: "8px",
              mr: 1.5,
            },
            "& .MuiAlert-message": {
              color: isDarkMode ? P.white : P.errorAlertText,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.5,
              letterSpacing: "0.15px",
              p: 0,
              py: "8px",
            },
          }}
        >
          Are you sure you want to delete this Special Accommodation?
        </Alert>
      </ConfirmationModal>
    </Box>
  );
};

export default AccommodationConfig;
