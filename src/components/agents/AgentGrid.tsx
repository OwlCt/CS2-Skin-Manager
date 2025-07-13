"use client";

import { Agent } from "@/types/agent";
import BaseCard from "@/components/ui/BaseCard";
import React, { useState } from "react";
import { toast } from "sonner";

type AgentGridProps = {
  agents: Agent[];
};

export default function AgentGrid({ agents }: AgentGridProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAgentClick = async (agent: Agent) => {
    if (!agent.team) {
      console.error("Team is required to save agent configuration");
      return;
    }

    toast.loading("Saving...", {
      id: "agent-loading",
    });
    setIsLoading(true);
    try {
      const response = await fetch("/api/agents/config", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team: agent.team,
          modelPlayer: agent.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        toast.error(errorData.error || "Failed to save agent configuration", {
          id: "agent-loading",
        });

        return;
      }

      toast.success("Agent configuration saved successfully", {
        id: "agent-loading",
      });
    } catch (error) {
      console.error("Failed to save agent config:", error);
      toast.error("Failed to save agent configuration", {
        id: "agent-loading",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <BaseCard
          key={agent.model || agent.agent_name}
          imageSrc={agent.image}
          alt={agent.agent_name}
          onClick={() => handleAgentClick(agent)}
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
                {agent.agent_name}
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
}
