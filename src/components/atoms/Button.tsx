"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Alias for leftIcon or standalone icon
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  icon,
  disabled,
  style,
  className = "",
  ...props
}) => {
  const effectiveLeftIcon = leftIcon || icon;

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "#C8952A",
          color: "#0F2645",
          border: "none",
          fontWeight: "700",
          boxShadow: "0 2px 8px rgba(200, 149, 42, 0.25)",
        };
      case "secondary":
        return {
          backgroundColor: "#F1F5F9",
          color: "#0F2645",
          border: "1px solid #CBD5E1",
          fontWeight: "600",
        };
      case "danger":
        return {
          backgroundColor: "#DC2626",
          color: "#FFFFFF",
          border: "none",
          fontWeight: "700",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "#0F2645",
          border: "1.5px solid #CBD5E1",
          fontWeight: "700",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "#475569",
          border: "none",
          fontWeight: "600",
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case "sm":
        return { padding: children ? "6px 12px" : "6px 8px", fontSize: "12px", borderRadius: "6px" };
      case "md":
        return { padding: children ? "10px 18px" : "10px 12px", fontSize: "14px", borderRadius: "8px" };
      case "lg":
        return { padding: children ? "14px 26px" : "14px 16px", fontSize: "15px", borderRadius: "10px" };
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`btn ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.65 : 1,
        transition: "all 0.2s ease",
        textDecoration: "none",
        boxSizing: "border-box",
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
          {children && <span>Lütfen bekleyin...</span>}
        </>
      ) : (
        <>
          {effectiveLeftIcon && <span style={{ display: "flex", alignItems: "center" }}>{effectiveLeftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
