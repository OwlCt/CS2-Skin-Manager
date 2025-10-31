"use client";

import { useMemo, useState } from "react";
import { Agent } from "@/types/agent";
import BaseCard from "@/components/ui/BaseCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toast } from "sonner";

type AgentGridProps = {
  agents: Agent[];
};

export default function AgentGrid({ agents }: AgentGridProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    
    const query = searchQuery.toLowerCase().trim();
    return agents.filter(agent => 
      agent.agent_name.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

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
        console.error("Agent config error:", errorData);

        toast.error(errorData.error || "Failed to save agent configuration", {
          id: "agent-loading",
          description: errorData.details ? JSON.stringify(errorData.details) : undefined,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Agents</h1>
            <Badge variant="secondary">
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredAgents.map((agent) => (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No agents found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No agents match your search "${searchQuery}".`
              : "No agents are available."
            }
          </p>
        </div>
      )}
    </div>
  );
}
