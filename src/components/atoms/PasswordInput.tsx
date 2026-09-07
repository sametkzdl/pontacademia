"use client";

import React, { useState, forwardRef } from "react";
import { Lock, Eye, EyeOff, Key } from "lucide-react";

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  showGenerator?: boolean;
  showGenerateButton?: boolean;
  onGenerate?: (generated: string) => void;
  onGeneratePassword?: (generated: string) => void;
  fullWidth?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, showGenerator = false, showGenerateButton = false, onGenerate, onGeneratePassword, fullWidth = true, className = "", style, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const hasGenerator = showGenerator || showGenerateButton;
    const generateHandler = onGenerate || onGeneratePassword;

    const handleGeneratePassword = () => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generated = `Pont${randomNum}!`;
      if (generateHandler) {
        generateHandler(generated);
      }
    };

    return (
      <div style={{ width: fullWidth ? "100%" : "auto", marginBottom: label ? "16px" : "0" }}>
        {label && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#0F2645" }}>
              {label}
              {props.required && <span style={{ color: "#DC2626", marginLeft: "4px" }}>*</span>}
            </label>
            {hasGenerator && (
              <button
                type="button"
                onClick={handleGeneratePassword}
                style={{ fontSize: "12px", color: "#1D4ED8", background: "none", border: "none", cursor: "pointer", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                🎲 Rastgele Şifre Üret
              </button>
            )}
          </div>
        )}

        <div style={{ position: "relative", width: "100%" }}>
          <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <Key size={16} />
          </div>

          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`form-input ${className}`}
            style={{
              width: "100%",
              backgroundColor: "#FFFFFF",
              color: "#0F2645",
              border: error ? "1.5px solid #EF4444" : "1px solid #CBD5E1",
              borderRadius: "8px",
              padding: "10px 40px 10px 38px",
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: showPassword ? "0.5px" : "1px",
              outline: "none",
              boxSizing: "border-box",
              ...style,
            }}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              padding: "4px"
            }}
            title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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

PasswordInput.displayName = "PasswordInput";
