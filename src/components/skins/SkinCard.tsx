"use client";

import BaseCard from "@/components/ui/BaseCard";
import { Skins } from "@/types/skins";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface SkinCardProps {
  skin: Skins;
  userConfig?: {
    team: number;
  };
}

export default function SkinCard({ skin, userConfig }: SkinCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const { getPatternName, loading } = useTranslation();
  console.log(userConfig);

  useEffect(() => {
    const handleHashHighlight = (event: CustomEvent) => {
      if (event.detail.elementId === `skin-${skin.paint}`) {
        setIsHighlighted(true);
        // Remove highlight after animation
        setTimeout(() => setIsHighlighted(false), 3000);
      }
    };

    window.addEventListener(
      "hashHighlight",
      handleHashHighlight as EventListener
    );

    return () => {
      window.removeEventListener(
        "hashHighlight",
        handleHashHighlight as EventListener
      );
    };
  }, [skin.paint]);

  return (
    <div id={`skin-${skin.paint}`}>
      <BaseCard
        imageSrc={skin.image}
        alt={skin.paint_name}
        team={userConfig?.team}
        onClick={() => router.push(`${pathname}/${skin.paint}`)}
        isHighlighted={isHighlighted}
        data-card="true"
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
              {loading
                ? (skin.paint_name.replace("★ ", "").split(" | ")[1])
                : (getPatternName(skin.paint, skin.weapon_defindex) || skin.paint_name.replace("★ ", "").split(" | ")[1])
              }{" "}
              {skin.phase ? `(${skin.phase})` : ""}
            </p>
          </div>
        }
      />
    </div>
  );
}
