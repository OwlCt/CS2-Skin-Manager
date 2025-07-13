"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useState, useRef, useEffect, ReactNode, useCallback, memo } from "react";
import CTLogo from "@/assets/ct_logo.svg";
import TLogo from "@/assets/t_logo.svg";

interface BaseCardProps {
  imageSrc: string;
  alt: string;
  nameBar: ReactNode;
  onClick?: () => void;
  aspect?: string;
  maxWidth?: string;
  children?: ReactNode;
  team?: number;
  priority?: boolean;
  className?: string;
}

// Animation variants for better performance
const ANIMATION_VARIANTS = {
  card: {
    hover: {
      scale: 1.02,
      boxShadow: `0 20px 60px -12px rgba(0,0,0,0.25), 0 0 40px rgba(96,165,250,0.15)`,
      border: "1px solid rgba(96,165,250,0.3)",
      zIndex: 10,
    },
    tap: { scale: 0.98 },
  },
  overlay: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(147,51,234,0.08) 50%, rgba(236,72,153,0.08) 100%)",
    },
  },
  shimmer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
    },
  },
  image: {
    hover: { scale: 1.05, rotate: -0.5, y: -2 },
    rest: { scale: 1, rotate: 0, y: 0 },
  },
  nameBar: {
    hover: {
      background: "rgba(30, 32, 40, 0.6)",
      backdropFilter: "blur(12px)",
    },
    rest: {
      background: "rgba(30, 32, 40, 0.45)",
      backdropFilter: "blur(8px)",
    },
  },
} as const;

// Memoized floating particles component
const FloatingParticles = memo<{ isVisible: boolean }>(({ isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 20}%`,
            }}
            animate={{
              y: [-10, -20, -10],
              x: [0, 5, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
));

FloatingParticles.displayName = 'FloatingParticles';

// Memoized team icon component
const TeamIcon = memo<{ team: number; isHovering: boolean }>(({ team, isHovering }) => {
  if (!team || (team !== 2 && team !== 3)) return null;

  return (
    <motion.div
      className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-background/20 backdrop-blur-sm"
      animate={{
        scale: isHovering ? 1.1 : 1,
        opacity: isHovering ? 1 : 0.8,
      }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src={team === 2 ? TLogo : CTLogo}
        alt={team === 2 ? "Terrorist" : "Counter-Terrorist"}
        width={24}
        height={24}
        className="object-contain"
      />
    </motion.div>
  );
});

TeamIcon.displayName = 'TeamIcon';

// Memoized loading skeleton
const LoadingSkeleton = memo(() => (
  <motion.div
    className="absolute inset-0 w-full h-full rounded-none"
    animate={{
      background: [
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      ],
      backgroundPosition: ["-200px 0", "200px 0"],
    }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <Skeleton className="w-full h-full rounded-none bg-muted/20" />
  </motion.div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default memo<BaseCardProps>(function BaseCard({
  imageSrc,
  alt,
  nameBar,
  onClick,
  aspect = "aspect-square",
  maxWidth = "max-w-xs",
  children,
  team,
  priority = false,
  className = "",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }, [onClick]);

  return (
    <motion.div
      className={`
        relative border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 
        backdrop-blur-xl text-card-foreground shadow-2xl cursor-pointer group overflow-hidden 
        ${aspect} w-full ${maxWidth} flex flex-col rounded-xl focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 
        focus-visible:ring-offset-background transition-shadow ${className}
      `}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : "img"}
      aria-label={alt}
      style={{ willChange: "transform, box-shadow" }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      variants={ANIMATION_VARIANTS.card}
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl"
        variants={ANIMATION_VARIANTS.overlay}
        initial="hidden"
        animate={isHovering ? "visible" : "hidden"}
        transition={{ duration: 0.6 }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        variants={ANIMATION_VARIANTS.shimmer}
        initial="hidden"
        animate={isHovering ? "visible" : "hidden"}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles effect */}
      <FloatingParticles isVisible={isHovering} />

      {/* Main image container */}
      <motion.div
        className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-t-xl"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(96,165,250,0.03) 0%, transparent 70%)`,
          backgroundSize: `40px 40px`,
        }}
      >
        {/* Inner glow effect */}
        <motion.div
          className="absolute inset-0 rounded-t-xl"
          animate={{
            boxShadow: isHovering
              ? "inset 0 0 30px rgba(96,165,250,0.1)"
              : "inset 0 0 0px rgba(96,165,250,0.05)",
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Image container with hover animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center w-full h-full"
          style={{ pointerEvents: "none" }}
          variants={ANIMATION_VARIANTS.image}
          animate={isHovering ? "hover" : "rest"}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Image
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-contain transition-all duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${isHovering ? "brightness-110 contrast-105" : ""}`}
            onLoad={handleImageLoad}
            priority={priority}
          />
          
          {/* Loading skeleton */}
          {!isLoaded && <LoadingSkeleton />}
        </motion.div>

        {/* Additional children */}
        {children}

        {/* Team Icon */}
        <TeamIcon team={team || 0} isHovering={isHovering} />
      </motion.div>

      {/* Name bar with enhanced styling */}
      <motion.div
        className="relative backdrop-blur-sm bg-gradient-to-r from-background/60 via-background/80 to-background/60 border-t border-white/5 rounded-b-xl"
        variants={ANIMATION_VARIANTS.nameBar}
        animate={isHovering ? "hover" : "rest"}
        transition={{ duration: 0.3 }}
      >
        {nameBar}
      </motion.div>

      {/* Decorative corner element */}
      <motion.div
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
        animate={{
          opacity: isHovering ? 1 : 0,
          scale: isHovering ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
});
