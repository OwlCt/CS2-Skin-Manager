"use client";

import BaseCard from "@/components/ui/BaseCard";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { motion } from "framer-motion";

interface WeaponCardProps {
  displayName: string;
  imagePath: string;
  weaponKey: string;
  categoryRoute: string;
}

const WeaponCard = memo<WeaponCardProps>(({
  displayName,
  imagePath,
  weaponKey,
  categoryRoute,
}) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(`/${categoryRoute}/${weaponKey}`);
  }, [router, categoryRoute, weaponKey]);

  const nameBar = (
    <motion.div
      className="w-full rounded-br rounded-bl px-2 py-1.5 backdrop-blur-md"
      style={{
        background: "rgba(30, 32, 40, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderTop: "none",
      }}
      whileHover={{
        background: "rgba(30, 32, 40, 0.6)",
        backdropFilter: "blur(12px)",
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.p
        className="text-sm font-medium truncate text-center w-full transition-all duration-200"
        style={{ 
          color: "#e2e8f0",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        }}
        whileHover={{
          color: "#f1f5f9",
          scale: 1.05,
        }}
        transition={{ duration: 0.2 }}
      >
        {displayName}
      </motion.p>
    </motion.div>
  );

  return (
    <motion.div
      className="w-full h-full"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <BaseCard
        imageSrc={imagePath}
        alt={`${displayName} weapon`}
        onClick={handleClick}
        nameBar={nameBar}
        aspect="aspect-square"
        maxWidth="max-w-xs"
      />
    </motion.div>
  );
});

WeaponCard.displayName = 'WeaponCard';

export default WeaponCard;
