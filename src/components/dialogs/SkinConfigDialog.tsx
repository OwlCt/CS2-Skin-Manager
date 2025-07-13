"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skin } from "@/lib/types";
import Image from "next/image";
import { toast } from "sonner";

interface SkinConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin: Skin;
  onSave: (config: SkinConfig) => void;
}

interface SkinConfig {
  team: "ct" | "t" | "both";
  wear: number;
  seed: number;
}

export default function SkinConfigDialog({
  open,
  onOpenChange,
  skin,
  onSave,
}: SkinConfigDialogProps) {
  // Initialize team based on the skin's team assignment
  const getInitialTeam = (): "ct" | "t" | "both" => {
    console.log("Skin team data:", { id: skin.team.id, name: skin.team.name });
    if (skin.team.id === "both") return "both";
    if (skin.team.id === "counter-terrorists") return "ct";
    if (skin.team.id === "terrorists") return "t";
    console.log("Falling back to 'both' for team:", skin.team.id);
    return "both"; // fallback
  };

  const [team, setTeam] = useState<"ct" | "t" | "both">(getInitialTeam());
  const [wear, setWear] = useState(0.0);
  const [seed, setSeed] = useState(0);

  // Reset team when skin changes
  useEffect(() => {
    setTeam(getInitialTeam());
  }, [skin.id, skin.team.id]);

  const handleSave = () => {
    console.log("Saving config with team:", team, "for skin:", skin.name);

    try {
      onSave({ team, wear, seed });

      toast.success("Skin configuration applied successfully!", {
        description: `${
          skin.name
        } has been configured with float ${wear.toFixed(
          3
        )} and pattern ${seed}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving skin config:", error);
      toast.error("Failed to apply skin configuration", {
        description:
          "There was an error applying the skin configuration. Please try again.",
      });
    }
  };

  const handleSeedChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    // Clamp seed between 0 and 1000
    setSeed(Math.min(1000, Math.max(0, numValue)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border-border p-6">
        {/* Weapon Image with Checkered Background */}
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
              src={skin.image}
              alt={skin.name}
              width={192}
              height={128}
              className="object-contain relative z-10"
            />
          </div>
        </div>

        {/* Weapon Name */}
        <div className="text-center px-6 mb-4">
          <div className="font-semibold text-lg text-foreground">
            {skin.name} {skin.phase ? `(${skin.phase})` : ""}
          </div>
        </div>

        <div className="grid gap-4 px-6 pb-4">
          {/* Team Selection - only show if weapon supports multiple teams */}
          {skin.team.id === "both" && (
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Team</Label>
              <ToggleGroup
                type="single"
                value={team}
                onValueChange={(value: string) =>
                  value && setTeam(value as "ct" | "t" | "both")
                }
                className="justify-center grid grid-cols-3 gap-1"
              >
                <ToggleGroupItem
                  value="ct"
                  aria-label="Counter-Terrorists"
                  className="flex-1"
                >
                  CT
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="both"
                  aria-label="Both Teams"
                  className="flex-1"
                >
                  Both
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="t"
                  aria-label="Terrorists"
                  className="flex-1"
                >
                  T
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Custom Float Slider */}
          <div className="grid gap-3">
            <Label className="text-sm font-medium">Float Value</Label>

            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {wear.toFixed(3)}
              </div>
            </div>

            <div className="relative px-2">
              <div className="h-3 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full relative">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={wear}
                  onChange={(e) => setWear(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 w-5 h-5 bg-white border-2 border-gray-600 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ left: `${wear * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>FN</span>
                <span>MW</span>
                <span>FT</span>
                <span>WW</span>
                <span>BS</span>
              </div>
            </div>
          </div>

          {/* Seed Configuration */}
          <div className="grid gap-2">
            <Label htmlFor="seed" className="text-sm font-medium">
              Pattern
            </Label>
            <Input
              id="seed"
              type="number"
              value={seed}
              onChange={(e) => handleSeedChange(e.target.value)}
              min={0}
              max={1000}
              placeholder="0"
              className="text-center"
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
