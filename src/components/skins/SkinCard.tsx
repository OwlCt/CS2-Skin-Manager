"use client";

import { Skins, UserSkinConfig } from "@/types/skins";
import BaseCard from "@/components/ui/BaseCard";
import { usePathname, useRouter } from "next/navigation";

interface SkinCardProps {
  skin: Skins;
  userConfig?: {
    team: number;
  };
}

export default function SkinCard({ skin, userConfig }: SkinCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  console.log(userConfig);

  return (
    <BaseCard
      imageSrc={skin.image}
      alt={skin.paint_name}
      team={userConfig?.team}
      onClick={() => router.push(`${pathname}/${skin.paint}`)}
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
            {skin.paint_name.replace("★ ", "").split(" | ")[1]}{" "}
            {skin.phase ? `(${skin.phase})` : ""}
          </p>
        </div>
      }
    />
  );
}
