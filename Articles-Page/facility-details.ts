import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";

import { RootState } from "../../../store";
import ContentBox from "../../../layouts/content-box";
import AccordionComponent from "../../../ui/common-accordion";
import { THEME_PRIMITIVES } from "../../../theme";
import { OrgFacility, getOrganization, getFacility } from "../../../services/provider-organization";

const P = THEME_PRIMITIVES;

const FacilityDetail = () => {
  const { orgId, facilityId } = useParams<{ orgId: string; facilityId: string }>();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<OrgFacility | null>(null);
  const [orgName, setOrgName] = useState("Organization");
  const [loading, setLoading] = useState(true);

  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";

  useEffect(() => {
    const load = async () => {
      if (!orgId || !facilityId) return;
      setLoading(true);
      try {
        const [org, fac] = await Promise.all([getOrganization(orgId), getFacility(orgId, facilityId)]);
        if (org) setOrgName(org.name);
        if (fac) setFacility(fac);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [orgId, facilityId]);

  const labelSx = { fontSize: 13, color: isDarkMode ? P.lightMutedText : P.uploadButtonBg, mb: 0.25 };
  const valueSx = { fontSize: 14, color: isDarkMode ? P.white : P.black };
  const fieldWrap = { display: "flex", flexDirection: "column" as const, gap: 0.25, mb: 1.5 };

  const renderField = (label: string, value: string | undefined, required = false) => (
    <Box sx={fieldWrap}>
      <Typography sx={{ ...labelSx, display: "flex", alignItems: "center", gap: "3px" }}>
        {label}{required && <Box component="span" sx={{ color: P.dangerText }}>*</Box>}
      </Typography>
      <Typography sx={valueSx}>{value || "—"}</Typography>
    </Box>
  );

  if (loading) return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;
  if (!facility) return <Box sx={{ p: 4 }}><Typography>Facility not found.</Typography></Box>;

  return (
    <Box>
      {/* Breadcrumb */}
      <Box
        onClick={() => navigate(`/provider-management/provider-organization/${orgId ?? ""}`)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.5, px: 2, pt: 1, pb: 0.5,
          cursor: "pointer",
          color: isDarkMode ? P.lightMutedText : P.uploadButtonBg,
          fontSize: 13,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        ‹ Organization - {orgName}
      </Box>


      <ContentBox sx={{ p: 1 }}>
        <Box p={{ xs: 1, sm: 2 }}>

          {/* Facility info card */}
          <Box
            sx={{
              backgroundColor: isDarkMode ? P.secondaryElevatedDark : P.gridHeaderLight,
              borderRadius: "10px",
              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
              p: "16px 24px 20px",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: isDarkMode ? P.white : P.black }}>
                {facility.practiceName.split(",")[0]}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  height: 34, borderRadius: "8px", textTransform: "none", fontWeight: 400,
                  fontSize: 14, px: 2.5, backgroundColor: P.primary,
                  "&:hover": { backgroundColor: P.primaryHover },
                }}
              >
                Edit
              </Button>
            </Box>

            {/* 3-column fields */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: "0 32px", alignItems: "start" }}>
              <Box>
                {renderField("Practice Name", facility.practiceName, true)}
                {renderField("NPI Number", facility.npiNumber)}
                {renderField("Primary Phone", facility.primaryPhone, true)}
                {renderField("Alternate Phone", facility.altPhone)}
                {renderField("Fax Number", facility.faxNumber, true)}
                {renderField("Email", facility.email, true)}
                {renderField("Organization", facility.organization, true)}
                {renderField("Calendar Administrator", facility.calendarAdministrator)}
              </Box>
              <Box>
                {renderField("Special Accommodation Request", facility.specialAccommodation)}
                {renderField("Address 1", facility.address, true)}
                {renderField("Address 2", facility.address2)}
                {renderField("City", facility.city, true)}
                {renderField("County", facility.county, true)}
                {renderField("State", facility.state, true)}
              </Box>
              <Box>
                {renderField("Facility Identifier", facility.facilityIdentifier)}
                {renderField("External Facility ID", facility.externalFacilityId)}
                {renderField("Facility Cluster", facility.facilityCluster, true)}
              </Box>
            </Box>
          </Box>

          {/* Hours of Operation */}
          <AccordionComponent
            title="Hours of Operation"
            defaultExpanded
            sx={{ borderRadius: "10px", border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}` }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500, color: isDarkMode ? P.white : P.black }}>Days</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500, color: isDarkMode ? P.white : P.black }}>Office Open</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500, color: isDarkMode ? P.white : P.black }}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(facility.hoursOfOperation ?? []).map((h) => (
                  <TableRow key={h.day}>
                    <TableCell sx={{ fontSize: 14, color: isDarkMode ? P.white : P.black }}>{h.day}</TableCell>
                    <TableCell>
                      <RadioGroup row value={h.isOpen === true ? "yes" : h.isOpen === false ? "no" : ""}>
                        <FormControlLabel value="yes" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>Yes</Typography>} />
                        <FormControlLabel value="no" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>No</Typography>} />
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      {h.isOpen ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Box
                            sx={{
                              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
                              borderRadius: "6px", px: 1, py: 0.5,
                              fontSize: 13, color: isDarkMode ? P.white : P.black,
                              display: "flex", alignItems: "center", gap: 0.5,
                            }}
                          >
                            {h.openTime} 🕐
                          </Box>
                          <Box
                            sx={{
                              border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`,
                              borderRadius: "6px", px: 1, py: 0.5,
                              fontSize: 13, color: isDarkMode ? P.white : P.black,
                              display: "flex", alignItems: "center", gap: 0.5,
                            }}
                          >
                            {h.closeTime} 🕐
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Box sx={{ border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`, borderRadius: "6px", px: 1, py: 0.5, fontSize: 13, color: "text.disabled" }}>--:-- 🕐</Box>
                          <Box sx={{ border: `1px solid ${isDarkMode ? P.strokeDark : P.stroke}`, borderRadius: "6px", px: 1, py: 0.5, fontSize: 13, color: "text.disabled" }}>--:-- 🕐</Box>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionComponent>
        </Box>
      </ContentBox>
    </Box>
  );
};

export default FacilityDetail;
