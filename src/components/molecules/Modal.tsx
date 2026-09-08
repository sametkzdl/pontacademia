"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  maxWidth = "640px",
}) => {
  const [mounted, setMounted] = useState(false);
  const effectiveIcon = icon || titleIcon;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isOpen) return null;

  const modalElement = (
    <div
      className="modal-backdrop-anim"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 38, 69, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "24px 16px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content-anim"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          maxWidth,
          width: "100%",
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 38, 69, 0.4), 0 0 0 1px rgba(15, 38, 69, 0.08)",
          border: "1px solid #DDE6F0",
          boxSizing: "border-box",
          overflow: "hidden",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Sticky / Fixed at top of modal) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 22px",
            borderBottom: "1px solid #E2E8F0",
            flexShrink: 0,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {effectiveIcon}
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#0F2645",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </h3>
            </div>
            {subtitle && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  margin: "4px 0 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E2E8F0";
              e.currentTarget.style.color = "#0F2645";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F1F5F9";
              e.currentTarget.style.color = "#64748B";
            }}
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body (Smooth Scrollable Area) */}
        <div
          style={{
            color: "#0F2645",
            padding: "22px",
            overflowY: "auto",
            flex: "1 1 auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>

        {/* Optional Footer (Sticky / Fixed at bottom of modal) */}
        {footer && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "14px 22px",
              borderTop: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              flexShrink: 0,
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};
