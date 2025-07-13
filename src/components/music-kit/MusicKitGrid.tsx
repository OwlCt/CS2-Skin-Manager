"use client";

import React, { useState } from "react";
import BaseCard from "@/components/ui/BaseCard";
import { MusicKit } from "@/types/music-kit";
import { toast } from "sonner";

type MusicKitGridProps = {
  kits: MusicKit[];
  team?: number;
};

const MusicKitGrid: React.FC<MusicKitGridProps> = ({ kits, team }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMusicKitClick = async (kit: MusicKit) => {
    if (!team) {
      console.error("Team is required to save music kit configuration");
      return;
    }

    toast.loading("Loading...", {
      id: "musickit-loading",
    });
    setIsLoading(true);
    try {
      const response = await fetch("/api/music-kits/config", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team: 0, // For now update for both teams until i have a better way to handle this
          defIndex: kit.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Failed to save music kit configuration",
          {
            id: "musickit-loading",
          }
        );

        return;
      }

      toast.success("Music kit configuration saved successfully");
    } catch (error) {
      console.error("Failed to save music kit config:", error);
      toast.error("Failed to save music kit configuration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {kits.map((kit, idx) => (
        <BaseCard
          key={kit.id}
          imageSrc={kit.image}
          alt={kit.name}
          onClick={() => handleMusicKitClick(kit)}
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
                {kit.name.includes("|")
                  ? kit.name.split("|")[1].trim()
                  : kit.name}
              </p>
              {isLoading && (
                <div className="text-xs text-center text-muted-foreground mt-1">
                  Saving...
                </div>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
};

export default MusicKitGrid;
