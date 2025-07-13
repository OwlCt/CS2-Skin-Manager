import MusicKitGrid from "@/components/music-kit/MusicKitGrid";
import AppBreadcrumb from "@/components/nav/Breadcrumb";
import { getMusicKits } from "@/lib/music-kit";
import Link from "next/link";

export default async function MusicKitsPage() {
  const kits = await getMusicKits();

  return (
    <div className="p-6">
      <AppBreadcrumb>
        <AppBreadcrumb.Item>
          <Link href="/">Home</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item isCurrent>Music Kits</AppBreadcrumb.Item>
      </AppBreadcrumb>

      <MusicKitGrid kits={kits} />
    </div>
  );
}
