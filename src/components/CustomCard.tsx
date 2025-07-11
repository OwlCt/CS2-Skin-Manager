"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hasUserConfig?: boolean;
  rarityColor?: string;
  showEquippedBadge?: boolean;
  equippedBadgeContent?: ReactNode;
  showStripedBackground?: boolean; // New prop for CS:GO style background
}

export default function CustomCard({
  children,
  className,
  onClick,
  hasUserConfig = false,
  rarityColor,
  showEquippedBadge = false,
  equippedBadgeContent,
  showStripedBackground = false, // Initialize new prop
}: CustomCardProps) {
  return (
    <div
      className={cn("group cursor-pointer h-full", className)}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg",
          showStripedBackground
            ? "bg-card border border-border"
            : "bg-muted/30",
          hasUserConfig
            ? "ring-2 ring-green-500/50 bg-accent/50"
            : "hover:ring-2 hover:ring-primary/30"
        )}
        style={{}} // Remove rarity border
      >
        {/* Equipped Badge */}
        {showEquippedBadge && equippedBadgeContent && (
          <div className="absolute top-2 right-2 z-10">
            {equippedBadgeContent}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

interface CustomCardImageProps {
  src: string;
  alt: string;
  isLoaded: boolean;
  onLoad: () => void;
  className?: string;
  rarityColor?: string; // Add rarity color prop
  showStripedBackground?: boolean; // Add striped background prop
}

export function CustomCardImage({
  src,
  alt,
  isLoaded,
  onLoad,
  className,
  rarityColor,
  showStripedBackground = false,
}: CustomCardImageProps) {
  return (
    <div className="relative w-full h-full">
      {/* CS:GO Style Diagonal Striped Background - Centered on Image */}
      {showStripedBackground && rarityColor && (
        <div
          className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              ${rarityColor} 2px,
              ${rarityColor} 4px
            )`,
            opacity: 0.2,
          }}
        />
      )}

      {/* Default ShadCN Skeleton Loader */}
      {!isLoaded && <Skeleton className="absolute inset-0 rounded-lg" />}

      {/* Main Image */}
      <Image
        src={src}
        alt={alt}
        onLoad={onLoad}
        width={300}
        height={300}
        className={cn(
          "w-full h-full object-contain transition-all duration-300 group-hover:scale-105 p-2 relative z-10",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}

interface CustomCardOverlayProps {
  children: ReactNode;
  className?: string;
}

export function CustomCardOverlay({
  children,
  className,
}: CustomCardOverlayProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
