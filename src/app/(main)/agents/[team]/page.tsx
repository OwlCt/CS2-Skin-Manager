import { getAgentsData } from "@/lib/data";
import { notFound } from "next/navigation";
import AppBreadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import SkinView from "@/components/SkinView";

interface AgentTeamPageProps {
  params: Promise<{
    team: string;
  }>;
}

export default async function AgentTeamPage({ params }: AgentTeamPageProps) {
  const { team } = await params;
  const teamName = decodeURIComponent(team);

  const agentsData = await getAgentsData();

  // Determine the correct team key and display name
  let correctTeamKey = "";
  let categoryDisplayName = "";
  let weaponDisplayName = "";

  if (teamName === "counter-terrorist") {
    correctTeamKey = "Counter-Terrorist";
    categoryDisplayName = "Counter-Terrorist Agents";
    weaponDisplayName = "Counter-Terrorists";
  } else if (teamName === "terrorist") {
    correctTeamKey = "Terrorist";
    categoryDisplayName = "Terrorist Agents";
    weaponDisplayName = "Terrorists";
  }

  if (!correctTeamKey || !agentsData[correctTeamKey]) {
    notFound();
  }

  const agents = agentsData[correctTeamKey];

  // Transform agents to match the expected skin format
  const agentsAsSkins = agents.map((agent: any) => ({
    ...agent,
    weapon: {
      id: teamName,
      name: weaponDisplayName,
      type: "Agent",
    },
  }));

  return (
    <div className="p-6">
      <AppBreadcrumb>
        <AppBreadcrumb.Item>
          <Link href="/">Home</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item>
          <Link href={`/agents/${teamName}`}>{categoryDisplayName}</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item isCurrent>{weaponDisplayName}</AppBreadcrumb.Item>
      </AppBreadcrumb>

      <SkinView initialSkins={agentsAsSkins} weaponName={weaponDisplayName} />
    </div>
  );
}
