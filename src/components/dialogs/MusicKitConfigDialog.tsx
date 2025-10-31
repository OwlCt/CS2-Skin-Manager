"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MusicKit } from "@/lib/types";
import Image from "next/image";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface MusicKitConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musicKit: MusicKit;
  onSave: (config: MusicKitConfig) => void;
}

interface MusicKitConfig {
  team: "ct" | "t";
  defIndex: string;
}

export default function MusicKitConfigDialog({
  open,
  onOpenChange,
  musicKit,
  onSave,
}: MusicKitConfigDialogProps) {
  const { t } = useLanguage();
  const [team, setTeam] = useState<"ct" | "t">("ct");

  const handleSave = () => {
    console.log("Saving music kit config for:", musicKit.name, "team:", team);

    try {
      onSave({
        team,
        defIndex: musicKit.def_index,
      });

      toast.success(t("toast.musicKitEquipped"), {
        description: `${musicKit.name} ${t("toast.musicKitEquippedDesc")} ${
          team === "ct" ? t("team.counterTerrorist") : t("team.terrorist")
        } ${t("toast.musicKitEquippedTeam")}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving music kit config:", error);
      toast.error(t("toast.musicKitFailed"), {
        description: t("toast.musicKitFailedDesc"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border-border p-6">
        {/* Music Kit Image with Checkered Background */}
        <div className="flex justify-center mb-4">
          <div
            className="bg-background border border-border rounded-lg p-4 shadow-lg relative"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
                linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
                linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
              `,
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
              backgroundColor: "#1a1a1a",
            }}
          >
            <Image
              src={musicKit.image}
              alt={musicKit.name}
              width={192}
              height={128}
              className="object-contain relative z-10"
            />
          </div>
        </div>

        {/* Music Kit Name */}
        <div className="text-center px-6 mb-4">
          <div className="font-semibold text-lg text-foreground">
            {musicKit.name}
          </div>
          {musicKit.description && (
            <div className="text-sm text-muted-foreground mt-2">
              {musicKit.description}
            </div>
          )}
        </div>

        <div className="grid gap-4 px-6 pb-4">
          {/* Team Selection */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">{t("team.label")}</Label>
            <ToggleGroup
              type="single"
              value={team}
              onValueChange={(value: string) =>
                value && setTeam(value as "ct" | "t")
              }
              className="justify-center grid grid-cols-2 gap-1"
            >
              <ToggleGroupItem
                value="ct"
                aria-label="Counter-Terrorists"
                className="flex-1"
              >
                {t("team.counterTerrorist")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="t"
                aria-label="Terrorists"
                className="flex-1"
              >
                {t("team.terrorist")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              {t("dialog.musicKitConfig")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("dialog.musicKitDescription")}
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("action.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("dialog.equipMusicKit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
