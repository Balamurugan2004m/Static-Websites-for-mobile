/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import SearchableSelect from "./searchable-select";
import CustomSelect from "./custom-select";
import { Box } from "@mui/material";
import { THEME_PRIMITIVES } from "../../../theme";

const resolveOptionLabel = (options: any[], raw: any): string => {
    if (raw == null || raw === "") return "";
    const rawStr = String(raw);
    const match = (options || []).find(
        (o) =>
            o === raw ||
            String(o?.keyValueId) === rawStr ||
            String(o?.Id) === rawStr ||
            o?.Name === raw ||
            o?.keyValue === raw ||
            o?.Description === raw ||
            String(o?.LookupValueId) === rawStr
    );
    if (typeof match === "string") return match;
    return (
        match?.keyValue ??
        match?.Name ??
        match?.Description ??
        match?.FullName ??
        String(raw)
    );
};

const formatViewValue = (value: any, options: any[]): string => {
    if (value == null || value === "") return "";
    if (Array.isArray(value)) {
        if (!value.length) return "";
        return value.map((v) => resolveOptionLabel(options, v)).filter(Boolean).join(", ");
    }
    return resolveOptionLabel(options, value);
};

const SelectField = React.memo(
    ({
        label,
        field,
        options,
        value,
        disabled = false,
        isEditing,
        isAdding,
        onChange,
        styles,
        formData,
        error,
        isMulti = false,
        required,
        handleFormChange,
        accountUsersForm = false,
        facilityAutoQueue = false,
        placeholder,
    }: {
        label?: string;
        field: string;
        disabled?: boolean;
        options: any[];
        value: any;
        isEditing?: boolean;
        isAdding?: boolean;
        onChange: (field: string, value: string) => void;
        styles: any;
        isMulti?: boolean;
        formData: any;
        error?: string;
        required?: boolean;
        handleFormChange: (field: string, value: string | string[]) => void;
        accountUsersForm?: boolean;
        facilityAutoQueue?: boolean;
        placeholder?: string;
    }) => {
        const isEditable = isEditing || isAdding;
        const searchableBaseProps = {
            dataField: field,
            readOnly: !isEditable,
            options,
            value,
            onChange: (val: any) => onChange(field, val),
            error,
            accountUsersForm,
            placeholder,
        };

        const customBaseProps = {
            field: label,
            dataField: field,
            readOnly: !isEditable,
            formData,
            value,
            handleChange: handleFormChange,
            options,
            error,
            accountUsersForm,
            facilityAutoQueue,
            placeholder: placeholder || "Select",
        };

        const renderSelectControl = () => {
            if (accountUsersForm && !isEditable) {
                const display = formatViewValue(value, options);
                return (
                    <div
                        data-testid={`view-${field}`}
                        style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "normal",
                            minHeight: "17px",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            ...(styles?.inputReadOnly || {}),
                            backgroundColor: "transparent",
                        }}
                    >
                        {display}
                    </div>
                );
            }

            switch (field) {
                case "Affiliation":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="Affiliation"
                            placeholder={placeholder || "Select Affiliation"}
                        />
                    );
                case "FacilityState":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="states"
                            disabled={disabled}
                            placeholder={placeholder || "Select State"}
                        />
                    );
                case "TimeZone":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="TimeZone"
                            placeholder={placeholder || "Select TimeZone"}
                        />
                    );
                case "Accommodations":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="Accommodations"
                            isMulti={isMulti}
                            placeholder={placeholder || "Select Accommodations"}
                        />
                    );
                case "FacilityIdentifier":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="FacilityIdentifier"
                            placeholder={placeholder || "Select Facility Identifier"}
                        />
                    );
                case "SchedulingType":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="SchedulingType"
                            placeholder={placeholder || "Select scheduling type"}
                        />
                    );
                case "OrganizationId":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="Organization"
                            placeholder={placeholder || "Select Organization"}
                        />
                    );
                case "ProfessionalTitle":
                    return (
                        <SearchableSelect
                            {...searchableBaseProps}
                            label="ProfessionalTitle"
                            placeholder={placeholder || "Select Professional Title"}
                        />
                    );
                default:
                    break;
            }

            if (label === "Manager") {
                return (
                    <SearchableSelect
                        {...searchableBaseProps}
                        label="Manager"
                        placeholder={placeholder || "Select Manager"}
                    />
                );
            }

            if (["Clusters Assignment", "Facility Cluster"].includes(label ?? "")) {
                return (
                    <SearchableSelect
                        {...searchableBaseProps}
                        label="Clusters Assignment"
                        isMulti={isMulti}
                        isCluster={"Facility Cluster" !== label}
                        placeholder={placeholder || "Select Clusters"}
                    />
                );
            }

            if (label === "Roles") {
                return (
                    <CustomSelect
                        {...customBaseProps}
                        isCheckbox
                        multiple
                        placeholder={placeholder || "Select Roles"}
                    />
                );
            }

            if (label === "Speciality") {
                return (
                    <CustomSelect
                        {...customBaseProps}
                        disabled={disabled}
                        placeholder={placeholder || "Select Speciality"}
                    />
                );
            }

            if (label === "Credential Status") {
                return (
                    <CustomSelect
                        {...customBaseProps}
                        placeholder={placeholder || "Select Credential Status"}
                    />
                );
            }

            return <CustomSelect {...customBaseProps} disabled={disabled} />;
        };

        return (
            <div
                style={{
                    ...styles.formGroup,
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: facilityAutoQueue
                        ? 0
                        : field === "Priority"
                          ? 0
                          : (styles.formGroup?.marginBottom ?? 12),
                    width: "100%",
                }}
            >
               {label ? (
                <label
                    style={{
                        marginBottom: facilityAutoQueue ? "9px" : "10px",
                        fontSize: facilityAutoQueue ? "12px" : "14px",
                        fontWeight: 400,
                        lineHeight: "normal",
                        ...(styles?.label || {}),
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        ...(facilityAutoQueue
                            ? {
                                  fontSize: "12px",
                                  fontWeight: 400,
                                  color: THEME_PRIMITIVES.labelMuted,
                                  lineHeight: "normal",
                              }
                            : {}),
                    }}
                >
                    <span>{label} </span>
                    {required && (
                        <span style={{ color: THEME_PRIMITIVES.dangerText }}>*</span>
                    )}
                </label>
               ) : null}
                <Box sx={{ width: "100%", mt: 0, pt: 0 }}>
                    {renderSelectControl()}
                </Box>
            </div>
        );
    }
);

export default SelectField;
