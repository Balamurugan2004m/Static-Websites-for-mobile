import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import trashIcon from "../../assets/trash.svg";
import { GridColDef } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { showToast } from "../../utils/toast";
import { TOAST_TYPES } from "../../types/toast-types";

import { RootState, useAppDispatch } from "../../store";
import { fetchSpecialAccommodations } from "../../store/slice/provider-facility-slice";
import ContentBox from "../../layouts/content-box";
import DataGridTable from "../../ui/data-grid-table";
import PageTitleChip from "../../components/page-title-chip";
import ConfirmationModal from "../../ui/confirmation-modal";
import { THEME_PRIMITIVES } from "../../theme";
import { paths } from "../../constants/paths";
import {
  AccommodationItem,
  deleteAccommodation,
  getAccommodations,
} from "../../services/accommodation-config";

const P = THEME_PRIMITIVES;

const AccommodationConfig = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<AccommodationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AccommodationItem | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccommodation(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      dispatch(fetchSpecialAccommodations() as any);
      showToast(
        "The record has been deleted successfully.",
        TOAST_TYPES.SUCCESS,
        "TOP_RIGHT",
        3000,
        undefined,
        "Success!",
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
        flex: 1.4,
        minWidth: 140,
        renderCell: (params) => (
          <Typography sx={{ fontSize: 16, color: isDarkMode ? P.white : P.black }}>
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2.8,
        minWidth: 200,
        renderCell: (params) => (
          <Typography sx={{ fontSize: 16, color: isDarkMode ? P.white : P.black }}>
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "visibility",
        headerName: "Visibility",
        flex: 1.5,
        minWidth: 120,
        renderCell: (params) => (
          <Typography sx={{ fontSize: 16, color: isDarkMode ? P.white : P.black }}>
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 0.6,
        minWidth: 100,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(params.row as AccommodationItem);
            }}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 400,
              px: 2,
              py: 1,
              boxShadow: "none",
              backgroundColor: isDarkMode ? P.deleteButtonBgDark : P.deleteButtonBgLight,
              color: isDarkMode ? P.white : P.dangerText,
              "&:hover, &.MuiButton-contained, &.MuiButton-contained:hover": {
                boxShadow: "none",
                backgroundColor: isDarkMode ? P.deleteButtonBgDark : P.deleteButtonBgLight,
                color: isDarkMode ? P.white : P.dangerText,
              },
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [isDarkMode]
  );

  const gridContainerSx = useMemo(
    () => ({
      width: "100%",
      p: 0,
      m: 0,
      "& .MuiDataGrid-root": {
        border: "none",
        borderRight: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke}`,
      },
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: isDarkMode ? P.gridHeaderDark : P.gridHeaderLight,
      },
      "& .MuiDataGrid-columnHeaderTitle": {
        fontSize: 14,
        fontWeight: 400,
        color: isDarkMode ? P.white : P.black,
      },
      "& .MuiDataGrid-cell": {
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke}`,
        backgroundColor: isDarkMode ? P.black : P.white,
      },
      "& .MuiDataGrid-row": {
        backgroundColor: isDarkMode ? P.black : P.white,
        minHeight: "74px !important",
        maxHeight: "74px !important",
        "&:hover": {
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : P.gridHeaderLight,
        },
      },
      "& .MuiDataGrid-footerContainer": {
        minHeight: 52,
        display: "flex",
        alignItems: "center",
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
              borderRadius: "8px",
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
              rowHeight={74}
              noRowsMessage="No accommodation records found."
              sx={{
                border: "none !important",
                borderRight: `1px solid ${isDarkMode ? P.inputBgDark : P.stroke} !important`,
                p: 0,
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
