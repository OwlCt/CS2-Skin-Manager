import { getMusicKitsData } from "@/lib/data";
import { notFound } from "next/navigation";
import AppBreadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import SkinView from "@/components/SkinView";

export default async function MusicKitsPage() {
  const musicKitsData = await getMusicKitsData();

  if (!musicKitsData) {
    notFound();
  }

  // Filter out music kits that only have an image property
  const validMusicKits = musicKitsData.filter((kit: any) => kit.id && kit.name);

  // Transform music kits to match the expected skin format
  const musicKitsAsSkins = validMusicKits.map((kit: any) => ({
    ...kit,
    weapon: {
      id: "music-kits",
      name: "Music Kits",
      type: "MusicKit",
    },
  }));

  return (
    <div className="p-6">
      <AppBreadcrumb>
        <AppBreadcrumb.Item>
          <Link href="/">Home</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item isCurrent>Music Kits</AppBreadcrumb.Item>
      </AppBreadcrumb>

      <SkinView initialSkins={musicKitsAsSkins} weaponName="Music Kits" />
    </div>
  );
}
