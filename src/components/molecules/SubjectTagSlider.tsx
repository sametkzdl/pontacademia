"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, BookOpen, MapPin, Calendar, GraduationCap, Clock } from "lucide-react";

export type TagSliderVariant = "gold" | "blue" | "green" | "purple" | "slate" | "navy";

export interface TagSliderProps {
  /** Array or comma-separated string of items */
  items?: string | string[] | null | undefined;
  /** Backwards compatibility alias for items */
  subjects?: string | string[] | null | undefined;
  tags?: string | string[] | null | undefined;

  /** Target or subtitle text shown below slider */
  target?: string | null;
  subtitle?: string | null;

  /** Header title text or count label (e.g. "İlçe", "Ders", "Bölge") */
  itemCountLabel?: string;
  headerTitle?: string;

  /** Icon displayed in the counter header */
  icon?: React.ReactNode | "book" | "map" | "calendar" | "graduation" | "clock";

  /** Visual color theme */
  variant?: TagSliderVariant;

  /** Max width of container (default: 100% or 280px) */
  maxWidth?: string | number;

  /** Custom prefix for each badge (e.g., "📍 ") */
  itemPrefix?: string;

  /** Empty state message if no items are found */
  emptyText?: string;

  /** Hide or always show counter header */
  showCounter?: boolean;

  /** Compact mode for tight table cells */
  compact?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_STYLES: Record<
  TagSliderVariant,
  {
    tagBg: string;
    tagColor: string;
    tagBorder: string;
    headerColor: string;
    defaultIconColor: string;
    accentDot: string;
  }
> = {
  gold: {
    tagBg: "#FEF3C7",
    tagColor: "#92400E",
    tagBorder: "#FCD34D",
    headerColor: "#92400E",
    defaultIconColor: "#C8952A",
    accentDot: "#F59E0B",
  },
  blue: {
    tagBg: "#EFF6FF",
    tagColor: "#1E40AF",
    tagBorder: "#BFDBFE",
    headerColor: "#1D4ED8",
    defaultIconColor: "#2563EB",
    accentDot: "#3B82F6",
  },
  green: {
    tagBg: "#ECFDF5",
    tagColor: "#065F46",
    tagBorder: "#A7F3D0",
    headerColor: "#047857",
    defaultIconColor: "#059669",
    accentDot: "#10B981",
  },
  purple: {
    tagBg: "#FAF5FF",
    tagColor: "#6B21A8",
    tagBorder: "#E9D5FF",
    headerColor: "#7E22CE",
    defaultIconColor: "#9333EA",
    accentDot: "#A855F7",
  },
  slate: {
    tagBg: "#F1F5F9",
    tagColor: "#334155",
    tagBorder: "#CBD5E1",
    headerColor: "#475569",
    defaultIconColor: "#64748B",
    accentDot: "#94A3B8",
  },
  navy: {
    tagBg: "#0F2645",
    tagColor: "#FFFFFF",
    tagBorder: "#1E3A8A",
    headerColor: "#0F2645",
    defaultIconColor: "#C8952A",
    accentDot: "#C8952A",
  },
};

export const TagSlider: React.FC<TagSliderProps> = ({
  items,
  subjects,
  tags,
  target,
  subtitle,
  itemCountLabel,
  headerTitle,
  icon,
  variant = "gold",
  maxWidth = "280px",
  itemPrefix,
  emptyText,
  showCounter = true,
  compact = false,
  className = "",
  style = {},
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Normalize input into an array of trimmed strings
  const itemList: string[] = useMemo(() => {
    const raw = items ?? tags ?? subjects;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((s) => String(s).trim()).filter(Boolean);
    }
    return String(raw)
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [items, tags, subjects]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [itemList]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 140;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const theme = VARIANT_STYLES[variant] || VARIANT_STYLES.gold;

  // Resolve Icon
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    const iconSize = compact ? 10 : 12;
    switch (icon) {
      case "map":
        return <MapPin size={iconSize} color={theme.defaultIconColor} />;
      case "calendar":
        return <Calendar size={iconSize} color={theme.defaultIconColor} />;
      case "graduation":
        return <GraduationCap size={iconSize} color={theme.defaultIconColor} />;
      case "clock":
        return <Clock size={iconSize} color={theme.defaultIconColor} />;
      case "book":
      default:
        return variant === "blue" ? (
          <MapPin size={iconSize} color={theme.defaultIconColor} />
        ) : (
          <BookOpen size={iconSize} color={theme.defaultIconColor} />
        );
    }
  };

  const effectiveSubtitle = subtitle ?? target;
  const countLabel = itemCountLabel || (variant === "blue" ? "Hizmet Bölgesi" : "Ders");

  if (itemList.length === 0) {
    if (!emptyText) return null;
    return (
      <div style={{ fontSize: "11px", color: "#94A3B8", fontStyle: "italic", ...style }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div
      className={`tag-slider-container ${className}`}
      style={{
        maxWidth,
        width: "100%",
        position: "relative",
        ...style,
      }}
    >
      {/* Header Info when multiple items */}
      {showCounter && itemList.length > (compact ? 1 : 2) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: compact ? "2px" : "4px",
          }}
        >
          <span
            style={{
              fontSize: compact ? "10px" : "11px",
              fontWeight: "700",
              color: theme.headerColor,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              letterSpacing: "-0.2px",
            }}
          >
            {renderIcon()}
            {headerTitle || `${itemList.length} ${countLabel}`}
          </span>
          <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              style={{
                border: "1px solid #E2E8F0",
                background: canScrollLeft ? "#FFFFFF" : "#F8FAFC",
                color: canScrollLeft ? "#0F2645" : "#CBD5E1",
                borderRadius: "4px",
                width: compact ? "16px" : "18px",
                height: compact ? "16px" : "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollLeft ? "pointer" : "default",
                padding: 0,
                transition: "all 0.15s ease",
              }}
              title="Geri kaydır"
            >
              <ChevronLeft size={compact ? 10 : 12} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              style={{
                border: "1px solid #E2E8F0",
                background: canScrollRight ? "#FFFFFF" : "#F8FAFC",
                color: canScrollRight ? "#0F2645" : "#CBD5E1",
                borderRadius: "4px",
                width: compact ? "16px" : "18px",
                height: compact ? "16px" : "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollRight ? "pointer" : "default",
                padding: 0,
                transition: "all 0.15s ease",
              }}
              title="İleri kaydır"
            >
              <ChevronRight size={compact ? 10 : 12} />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: compact ? "4px" : "6px",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "2px",
          scrollBehavior: "smooth",
          alignItems: "center",
        }}
      >
        {itemList.map((item, idx) => (
          <span
            key={idx}
            style={{
              backgroundColor: theme.tagBg,
              color: theme.tagColor,
              border: `1px solid ${theme.tagBorder}`,
              padding: compact ? "2px 6px" : "3px 8px",
              borderRadius: "6px",
              fontSize: compact ? "10px" : "11px",
              fontWeight: "700",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {itemPrefix && <span>{itemPrefix}</span>}
            {item}
          </span>
        ))}
      </div>

      {/* Subtitle / Target */}
      {effectiveSubtitle && (
        <div
          style={{
            fontSize: "11px",
            color: "#64748B",
            marginTop: "3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
          title={effectiveSubtitle}
        >
          {effectiveSubtitle}
        </div>
      )}
    </div>
  );
};

/** Backwards-compatible alias for existing imports */
export interface SubjectTagSliderProps extends TagSliderProps {}
export const SubjectTagSlider: React.FC<SubjectTagSliderProps> = (props) => {
  return <TagSlider {...props} />;
};
