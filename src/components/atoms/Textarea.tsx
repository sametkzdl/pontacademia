"use client";

import React, { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className = "", style, ...props }, ref) => {
    return (
      <div style={{ width: fullWidth ? "100%" : "auto", marginBottom: label ? "16px" : "0" }}>
        {label && (
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
            {label}
            {props.required && <span style={{ color: "#DC2626", marginLeft: "4px" }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`form-input ${className}`}
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            color: "#0F2645",
            border: error ? "1.5px solid #EF4444" : "1px solid #CBD5E1",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "14px",
            fontWeight: "500",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            ...style,
          }}
          {...props}
        />
        {error ? (
          <span style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px", display: "block", fontWeight: "600" }}>
            {error}
          </span>
        ) : helperText ? (
          <span style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", display: "block" }}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
