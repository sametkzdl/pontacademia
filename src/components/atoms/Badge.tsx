"use client";

import React from "react";

export type BadgeVariant = 
  | "PENDING" 
  | "APPROVED" 
  | "REJECTED" 
  | "UNREAD" 
  | "READ" 
  | "REPLIED" 
  | "ACTIVE" 
  | "PASSIVE" 
  | "KOCLUK" 
  | "OZEL_DERS" 
  | "GOLD" 
  | "BLUE";

export interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "BLUE", children, style }) => {
  const getBadgeConfig = () => {
    switch (variant) {
      case "PENDING":
        return {
          bg: "#FEF3C7",
          color: "#92400E",
          border: "#FCD34D",
          defaultText: "⏳ Bekliyor",
        };
      case "APPROVED":
        return {
          bg: "#DCFCE7",
          color: "#15803D",
          border: "#86EFAC",
          defaultText: "✓ Onaylandı",
        };
      case "REJECTED":
        return {
          bg: "#FEE2E2",
          color: "#B91C1C",
          border: "#FCA5A5",
          defaultText: "✕ Reddedildi",
        };
      case "UNREAD":
        return {
          bg: "#FEE2E2",
          color: "#DC2626",
          border: "#FECACA",
          defaultText: "🔴 Okunmadı",
        };
      case "READ":
        return {
          bg: "#EFF6FF",
          color: "#1D4ED8",
          border: "#BFDBFE",
          defaultText: "🔵 Okundu",
        };
      case "REPLIED":
        return {
          bg: "#ECFDF5",
          color: "#047857",
          border: "#A7F3D0",
          defaultText: "🟢 Cevaplandı",
        };
      case "ACTIVE":
        return {
          bg: "#DCFCE7",
          color: "#15803D",
          border: "#86EFAC",
          defaultText: "🟢 Aktif",
        };
      case "PASSIVE":
        return {
          bg: "#FEE2E2",
          color: "#B91C1C",
          border: "#FCA5A5",
          defaultText: "🔴 Pasif",
        };
      case "KOCLUK":
        return {
          bg: "#F3E8FF",
          color: "#7E22CE",
          border: "#E9D5FF",
          defaultText: "🎓 Eğitim Koçluğu",
        };
      case "OZEL_DERS":
        return {
          bg: "#ECFDF5",
          color: "#047857",
          border: "#A7F3D0",
          defaultText: "📚 Özel Ders",
        };
      case "GOLD":
        return {
          bg: "rgba(200, 149, 42, 0.15)",
          color: "#92400E",
          border: "rgba(200, 149, 42, 0.3)",
          defaultText: "",
        };
      case "BLUE":
      default:
        return {
          bg: "#EFF6FF",
          color: "#1D4ED8",
          border: "#BFDBFE",
          defaultText: "",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700",
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        ...style,
      }}
    >
      {children || config.defaultText}
    </span>
  );
};
