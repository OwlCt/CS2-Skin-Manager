import path from "path";
import fs from "fs";
import { Agent } from "@/types/agent";

export function loadAgents(): Agent[] {
  const agentsPath = path.resolve(process.cwd(), "data/agents.json");
  const raw = fs.readFileSync(agentsPath, "utf-8");
  return JSON.parse(raw);
}

export function getAgentTeamsMap(): Record<string, string> {
  return {
    "counter-terrorists": "CT",
    terrorists: "T",
  };
}

export function getAgentsByTeam(): Record<string, Agent[]> {
  const agents = loadAgents();
  // Team numbers: 2 = T, 3 = CT
  const teamMap: Record<string, Agent[]> = {
    terrorists: [],
    "counter-terrorists": [],
  };

  for (const agent of agents) {
    if (agent.team === 2) {
      teamMap.terrorists.push(agent);
    } else {
      teamMap["counter-terrorists"].push(agent);
    }
  }
  return teamMap;
}
