import MusicKitGrid from "@/components/music-kit/MusicKitGrid";
import MusicKitsBreadcrumb from "@/components/nav/MusicKitsBreadcrumb";
import { getMusicKits } from "@/lib/data";

export default async function MusicKitsPage() {
  const kits = await getMusicKits();

  return (
    <div className="p-6">
      <MusicKitsBreadcrumb />
      <MusicKitGrid kits={kits} />
    </div>
  );
}
