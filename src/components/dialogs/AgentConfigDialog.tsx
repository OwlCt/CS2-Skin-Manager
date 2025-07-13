"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skin } from "@/lib/types";
import Image from "next/image";
import { toast } from "sonner";

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Skin;
  onSave: (config: AgentConfig) => void;
}

interface AgentConfig {
  team: "ct" | "t";
  modelPlayer: string;
}

export default function AgentConfigDialog({
  open,
  onOpenChange,
  agent,
  onSave,
}: AgentConfigDialogProps) {
  // Initialize team based on the agent's team assignment
  const getInitialTeam = (): "ct" | "t" => {
    console.log("Agent team data:", {
      id: agent.team.id,
      name: agent.team.name,
    });
    if (agent.team.id === "counter-terrorists") return "ct";
    if (agent.team.id === "terrorists") return "t";
    // Default based on agent team name from agents.json
    if (agent.team.name === "Counter-Terrorist") return "ct";
    if (agent.team.name === "Terrorist") return "t";
    console.log("Falling back to 'ct' for team:", agent.team.id);
    return "ct"; // fallback
  };

  const [team, setTeam] = useState<"ct" | "t">(getInitialTeam());

  // Reset team when agent changes
  useEffect(() => {
    setTeam(getInitialTeam());
  }, [agent.id, agent.team.id]);

  const handleSave = () => {
    console.log(
      "Saving agent config with team:",
      team,
      "for agent:",
      agent.name
    );

    try {
      onSave({
        team,
        modelPlayer: (agent as any).model_player || "",
      });

      toast.success("Agent equipped successfully!", {
        description: `${agent.name} has been equipped for ${
          team === "ct" ? "Counter-Terrorist" : "Terrorist"
        } team.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving agent config:", error);
      toast.error("Failed to equip agent", {
        description:
          "There was an error equipping the agent. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border-border p-6">
        {/* Agent Image with Checkered Background */}
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
              src={agent.image}
              alt={agent.name}
              width={192}
              height={128}
              className="object-contain relative z-10"
            />
          </div>
        </div>

        {/* Agent Name */}
        <div className="text-center px-6 mb-4">
          <div className="font-semibold text-lg text-foreground">
            {agent.name}
          </div>
        </div>

        <div className="grid gap-4 px-6 pb-4">
          {/* Team Selection */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Deploy as</Label>
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
                Counter-Terrorist
              </ToggleGroupItem>
              <ToggleGroupItem
                value="t"
                aria-label="Terrorists"
                className="flex-1"
              >
                Terrorist
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Equip Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
