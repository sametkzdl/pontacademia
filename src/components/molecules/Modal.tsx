"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  titleIcon?: React.ReactNode; // Alias for icon
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  titleIcon,
  children,
  footer,
  maxWidth = "560px",
}) => {
  const effectiveIcon = icon || titleIcon;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 38, 69, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "12px",
        animation: "fadeIn 0.15s ease",
        boxSizing: "border-box"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "20px 20px",
          maxWidth,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(15, 38, 69, 0.25)",
          border: "1px solid #DDE6F0",
          boxSizing: "border-box"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {effectiveIcon}
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                {title}
              </h3>
            </div>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
            }}
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ color: "#0F2645" }}>{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "10px", marginTop: "20px", borderTop: "1px solid #E2E8F0", paddingTop: "14px" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
