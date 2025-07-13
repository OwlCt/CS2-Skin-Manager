import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import Link from "next/link";
import { getAgentsByTeam, getAgentTeamsMap } from "@/lib/agents";
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
  const agentTeamsMap = getAgentTeamsMap();

  return (
    <div className="p-6">
      <AppBreadcrumb>
        <AppBreadcrumbItem>
          <Link href="/">Home</Link>
        </AppBreadcrumbItem>
        <AppBreadcrumbItem>
          <Link href={`/agents/${teamName}`}>
            {agentTeamsMap[teamName]} Agents
          </Link>
        </AppBreadcrumbItem>
      </AppBreadcrumb>

      <AgentGrid agents={agentsData[teamName]} />
    </div>
  );
}
