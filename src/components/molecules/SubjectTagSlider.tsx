"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export interface SubjectTagSliderProps {
  subjects: string | string[] | null | undefined;
  target?: string | null;
  maxWidth?: string | number;
  className?: string;
}

export const SubjectTagSlider: React.FC<SubjectTagSliderProps> = ({
  subjects,
  target,
  maxWidth = "280px",
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Normalize subjects into an array of trimmed strings
  const subjectList: string[] = React.useMemo(() => {
    if (!subjects) return ["Eğitim Koçluğu"];
    if (Array.isArray(subjects)) {
      return subjects.map((s) => String(s).trim()).filter(Boolean);
    }
    return String(subjects)
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [subjects]);

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
  }, [subjectList]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 140;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div 
      className={`subject-tag-slider-container ${className}`} 
      style={{ maxWidth, width: "100%", position: "relative" }}
    >
      {/* Slider Header info if multiple */}
      {subjectList.length > 2 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#92400E", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <BookOpen size={11} color="#C8952A" />
            {subjectList.length} Ders Talebi
          </span>
          <div style={{ display: "flex", gap: "2px" }}>
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              style={{
                border: "1px solid #E2E8F0",
                background: canScrollLeft ? "#FFFFFF" : "#F8FAFC",
                color: canScrollLeft ? "#0F2645" : "#CBD5E1",
                borderRadius: "4px",
                width: "18px",
                height: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollLeft ? "pointer" : "default",
                padding: 0,
                transition: "all 0.15s ease",
              }}
              title="Önceki dersler"
            >
              <ChevronLeft size={12} />
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
                width: "18px",
                height: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollRight ? "pointer" : "default",
                padding: 0,
                transition: "all 0.15s ease",
              }}
              title="Sonraki dersler"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "2px",
          scrollBehavior: "smooth",
          alignItems: "center",
        }}
      >
        {subjectList.map((subject, idx) => (
          <span
            key={idx}
            style={{
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FCD34D",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {subject}
          </span>
        ))}
      </div>

      {/* Target Subtitle */}
      {target && (
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
          title={`Hedef: ${target}`}
        >
          <span style={{ fontWeight: "600", color: "#475569" }}>Hedef:</span> {target}
        </div>
      )}
    </div>
  );
};
