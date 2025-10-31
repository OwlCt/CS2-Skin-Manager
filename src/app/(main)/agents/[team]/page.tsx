import AgentsBreadcrumb from "@/components/nav/AgentsBreadcrumb";
import { getAgentsByTeam } from "@/lib/data";
import AgentGrid from "@/components/agents/AgentGrid";

interface AgentTeamPageProps {
  params: Promise<{
    team: string;
  }>;
}

export default async function AgentTeamPage({ params }: AgentTeamPageProps) {
  const { team } = await params;
  const teamName = decodeURIComponent(team);
  const agentsData = await getAgentsByTeam();
  const agents = agentsData[teamName] || [];

  return (
    <div className="p-6">
      <AgentsBreadcrumb teamName={teamName} />
      <AgentGrid agents={agents} teamName={teamName} />
    </div>
  );
}
