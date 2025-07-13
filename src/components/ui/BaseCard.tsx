"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useState, useRef, useEffect, ReactNode } from "react";
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
}

export default function BaseCard({
  imageSrc,
  alt,
  nameBar,
  onClick,
  aspect = "aspect-square",
  maxWidth = "max-w-xs",
  children,
  team,
}: BaseCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <motion.div
      className={`relative border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl text-card-foreground shadow-2xl cursor-pointer group overflow-hidden ${aspect} w-full ${maxWidth} flex flex-col rounded-xl`}
      tabIndex={0}
      role="button"
      aria-label={alt}
      style={{ willChange: "transform, box-shadow" }}
      onClick={onClick}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 20px 60px -12px rgba(0,0,0,0.25), 0 0 40px rgba(96,165,250,0.15)`,
        border: "1px solid rgba(96,165,250,0.3)",
        zIndex: 10,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 rounded-xl"
        animate={{
          opacity: isHovering ? 1 : 0,
          background: isHovering
            ? "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(147,51,234,0.08) 50%, rgba(236,72,153,0.08) 100%)"
            : "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 50%, rgba(236,72,153,0.05) 100%)",
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 rounded-xl"
        animate={{
          opacity: isHovering ? 1 : 0,
          background: isHovering
            ? "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)"
            : "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.01) 50%, transparent 60%)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles effect */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
        animate={{
          opacity: isHovering ? 0.6 : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 20}%`,
            }}
            animate={
              isHovering
                ? {
                    y: [-10, -20, -10],
                    x: [0, 5, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }
                : {}
            }
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

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

        <motion.div
          className="absolute inset-0 flex items-center justify-center w-full h-full"
          style={{ pointerEvents: "none" }}
          animate={
            isHovering
              ? { scale: 1.05, rotate: -0.5, y: -2 }
              : { scale: 1, rotate: 0, y: 0 }
          }
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
            onLoad={() => setIsLoaded(true)}
            priority={false}
          />
          {!isLoaded && (
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
          )}
        </motion.div>
        {children}

        {/* Team Icon */}
        {team && (
          <motion.div
            className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full"
            animate={{
              scale: isHovering ? 1.1 : 1,
              opacity: isHovering ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          >
            {team === 2 && (
              <Image
                src={TLogo}
                alt="Terrorist"
                width={30}
                height={30}
                className="object-contain"
              />
            )}
            {team === 3 && (
              <Image
                src={CTLogo}
                alt="Counter-Terrorist"
                width={30}
                height={30}
                className="object-contain"
              />
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="relative backdrop-blur-sm bg-gradient-to-r from-background/60 via-background/80 to-background/60 border-t border-white/5 rounded-b-xl"
        animate={{
          backdropFilter: isHovering ? "blur(12px)" : "blur(8px)",
        }}
        transition={{ duration: 0.3 }}
      >
        {nameBar}
      </motion.div>

      <motion.div
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0"
        animate={{
          opacity: isHovering ? 1 : 0,
          scale: isHovering ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
