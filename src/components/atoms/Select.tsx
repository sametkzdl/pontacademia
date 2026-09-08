"use client";

import React, { forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, fullWidth = true, className = "", style, ...props }, ref) => {
    return (
      <div style={{ width: fullWidth ? "100%" : "auto", marginBottom: label ? "16px" : "0" }}>
        {label && (
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
            {label}
            {props.required && <span style={{ color: "#DC2626", marginLeft: "4px" }}>*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`form-select ${className}`}
          style={{
            width: "100%",
            minHeight: "48px",
            backgroundColor: "#FFFFFF",
            color: "#0F2645",
            border: error ? "1.5px solid #EF4444" : "1.5px solid #CBD5E1",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "15px",
            fontWeight: "500",
            outline: "none",
            cursor: "pointer",
            boxSizing: "border-box",
            ...style,
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <span style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px", display: "block", fontWeight: "600" }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
