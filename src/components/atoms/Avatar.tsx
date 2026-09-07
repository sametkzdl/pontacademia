"use client";

import React, { useState } from "react";
import { getPhotoUrl } from "@/utils/media";
import { User } from "lucide-react";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showBorder?: boolean;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = "Kullanıcı",
  size = 40,
  className = "",
  style = {},
  onClick,
  showBorder = false,
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = getPhotoUrl(src);

  const getInitial = () => {
    if (!name || !name.trim()) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    cursor: onClick ? "pointer" : "default",
    border: showBorder ? "2px solid #C8952A" : "1px solid rgba(15, 38, 69, 0.1)",
    backgroundColor: "#0F2645",
    color: "#C8952A",
    fontWeight: 800,
    fontSize: `${Math.max(12, Math.floor(size * 0.42))}px`,
    userSelect: "none",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ...style,
  };

  if (resolvedSrc && !hasError) {
    return (
      <div 
        className={`pont-avatar ${className}`}
        style={containerStyle} 
        onClick={onClick}
        title={name || "Profil"}
      >
        <img
          src={resolvedSrc}
          alt={alt || name || "Avatar"}
          onError={() => setHasError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`pont-avatar-fallback ${className}`}
      style={containerStyle} 
      onClick={onClick}
      title={name || "Profil"}
    >
      {getInitial()}
    </div>
  );
};
