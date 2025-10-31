// layout.tsx
import Sidebar from "@/components/nav/Sidebar";
import { getCategories } from "@/lib/data";
import { getSession } from "@/lib/session";
import Navigation from "@/components/nav/Navigation";
import { getAgentTeamsMap } from "@/lib/data";
import FloatingLanguageSwitcher from "@/components/nav/FloatingLanguageSwitcher";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const session = await getSession();
  const agentTeamsMap = await getAgentTeamsMap();
  const agentTeams = Object.values(agentTeamsMap);

  return (
    <div className="flex h-screen w-full bg-background">
      <aside
        className="hidden lg:block shrink-0 h-full overflow-hidden"
        style={{ width: "18rem" }}
      >
        <Sidebar categories={categories} agentTeams={agentTeams} />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Navigation bar */}
        <Navigation
          categories={categories}
          agentTeams={agentTeams}
          user={
            session.steamId
              ? {
                  steamId: session.steamId,
                  username: session.username,
                  avatar: session.avatar,
                }
              : null
          }
        />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="h-full">{children}</div>
        </div>
      </main>

      {/* Floating language switcher at bottom left */}
      <FloatingLanguageSwitcher />
    </div>
  );
}
