import MusicKitGrid from "@/components/music-kit/MusicKitGrid";
import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import { getMusicKits } from "@/lib/data";
import Link from "next/link";

export default async function MusicKitsPage() {
  const kits = await getMusicKits();

  return (
    <div className="p-6">
      <AppBreadcrumb>
        <AppBreadcrumbItem>
          <Link href="/">Home</Link>
        </AppBreadcrumbItem>
        <AppBreadcrumbItem isCurrent>Music Kits</AppBreadcrumbItem>
      </AppBreadcrumb>

      <MusicKitGrid kits={kits} />
    </div>
  );
}
