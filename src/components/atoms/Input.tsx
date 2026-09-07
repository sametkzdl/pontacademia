"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, fullWidth = true, className = "", style, ...props }, ref) => {
    return (
      <div style={{ width: fullWidth ? "100%" : "auto", marginBottom: label ? "16px" : "0" }}>
        {label && (
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
            {label}
            {props.required && <span style={{ color: "#DC2626", marginLeft: "4px" }}>*</span>}
          </label>
        )}
        <div style={{ position: "relative", width: "100%" }}>
          {leftIcon && (
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`form-input ${className}`}
            style={{
              width: "100%",
              backgroundColor: "#FFFFFF",
              color: "#0F2645",
              border: error ? "1.5px solid #EF4444" : "1px solid #CBD5E1",
              borderRadius: "8px",
              padding: leftIcon ? "10px 14px 10px 38px" : rightIcon ? "10px 38px 10px 14px" : "10px 14px",
              fontSize: "14px",
              fontWeight: "600",
              outline: "none",
              transition: "all 0.2s ease",
              boxSizing: "border-box",
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", alignItems: "center" }}>
              {rightIcon}
            </div>
          )}
        </div>
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

Input.displayName = "Input";
