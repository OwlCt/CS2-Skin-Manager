"use client";

import BaseCard from "@/components/ui/BaseCard";
import { useRouter } from "next/navigation";

interface WeaponCardProps {
  displayName: string;
  imagePath: string;
  weaponKey: string;
  categoryRoute: string;
}

export default function WeaponCard({
  displayName,
  imagePath,
  weaponKey,
  categoryRoute,
}: WeaponCardProps) {
  const router = useRouter();

  return (
    <BaseCard
      imageSrc={imagePath}
      alt={displayName}
      onClick={() => router.push(`/${categoryRoute}/${weaponKey}`)}
      nameBar={
        <div
          className="w-full rounded-br rounded-bl px-2 py-1"
          style={{
            background: "rgba(30, 32, 40, 0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow: "none",
            border: "none",
          }}
        >
          <p
            className="text-sm font-medium truncate text-center w-full transition-colors"
            style={{ color: "#cbd5e1" }}
          >
            {displayName}
          </p>
        </div>
      }
    />
  );
}
