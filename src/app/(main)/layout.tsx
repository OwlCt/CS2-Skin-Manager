import Sidebar from "@/components/Sidebar";
import { getCategories } from "@/lib/data";
import { getSession } from "@/lib/session";
import Navigation from "@/components/Navigation";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const session = await getSession();

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-background border-r p-4 overflow-y-auto hidden md:block">
        <Sidebar categories={categories} />
      </aside>
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navigation
          categories={categories}
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
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
