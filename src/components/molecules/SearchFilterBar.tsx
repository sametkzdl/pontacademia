"use client";

import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface SearchFilterBarProps {
  title?: string;
  subtitle?: string;
  titleIcon?: React.ReactNode;
  searchQuery?: string;
  searchValue?: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterLabel?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
  extraControls?: React.ReactNode;
  extraActions?: React.ReactNode;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  title,
  subtitle,
  titleIcon,
  searchQuery,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Arama yapın...",
  filterLabel = "Filtre:",
  filterValue,
  onFilterChange,
  filterOptions,
  sortValue,
  onSortChange,
  sortOptions,
  extraControls,
  extraActions,
}) => {
  const currentSearch = searchValue !== undefined ? searchValue : (searchQuery || "");

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #DDE6F0", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)", marginBottom: "20px" }}>
      {(title || extraActions) && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", borderBottom: (filterOptions || sortOptions || extraControls) ? "1px solid #F1F5F9" : "none", paddingBottom: (filterOptions || sortOptions || extraControls) ? "14px" : "0" }}>
          <div style={{ flex: "1 1 auto", minWidth: "200px" }}>
            {title && (
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                {titleIcon} {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          {extraActions && <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{extraActions}</div>}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", flex: "1 1 auto" }}>
          {/* Filter Dropdown */}
          {filterOptions && onFilterChange && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F8FAFC", padding: "7px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
              <Filter size={14} color="#64748B" />
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>{filterLabel}</span>
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0F2645", backgroundColor: "transparent", cursor: "pointer" }}
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Dropdown */}
          {sortOptions && onSortChange && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F8FAFC", padding: "7px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
              <ArrowUpDown size={14} color="#64748B" />
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Sırala:</span>
              <select
                value={sortValue}
                onChange={(e) => onSortChange(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0F2645", backgroundColor: "transparent", cursor: "pointer" }}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {extraControls}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px 8px 36px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#FFFFFF",
              color: "#0F2645",
              fontSize: "13px",
              fontWeight: "600",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              boxSizing: "border-box"
            }}
          />
          <Search size={15} color="#94A3B8" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};
