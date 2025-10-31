"use client";

import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgentsBreadcrumbProps {
  teamName: string;
}

export default function AgentsBreadcrumb({ teamName }: AgentsBreadcrumbProps) {
  const { t } = useLanguage();

  // Get translated team name
  const getTeamLabel = (team: string) => {
    if (team === "terrorists") return t("team.terrorists");
    if (team === "counter-terrorists") return t("team.counterTerrorists");
    return team;
  };

  return (
    <AppBreadcrumb>
      <AppBreadcrumbItem>
        <Link href="/">{t("nav.home")}</Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem isCurrent>
        {getTeamLabel(teamName)} {t("nav.agents")}
      </AppBreadcrumbItem>
    </AppBreadcrumb>
  );
}
