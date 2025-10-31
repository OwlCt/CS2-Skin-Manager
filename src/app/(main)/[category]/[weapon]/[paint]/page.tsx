import PaintUI from "@/components/skins/PaintUI";
import { getSkinByPaintId, getStickers, getKeychains } from "@/lib/data";
import { notFound } from "next/navigation";
import PaintBreadcrumb from "@/components/nav/PaintBreadcrumb";

type PaintProps = {
  params: Promise<{
    category: string;
    weapon: string;
    paint: string;
  }>;
};

export default async function Paint({ params }: PaintProps) {
  const { paint, category, weapon } = await params;
  const [skin, stickers, keychains] = await Promise.all([
    getSkinByPaintId(weapon, parseInt(paint, 10)),
    getStickers(),
    getKeychains(),
  ]);

  if (!skin) {
    return notFound();
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <PaintBreadcrumb
        category={category}
        weapon={weapon}
        skinCategory={skin.category}
        weaponName={skin.paint_name.split("|")[0].trim()}
        skinName={skin.paint_name.split("|")[1]?.trim() || skin.paint_name}
        phase={skin.phase}
        paintIndex={skin.paint}
        weaponDefindex={skin.weapon_defindex}
      />

      <PaintUI skin={skin} stickers={stickers} keychains={keychains} />
    </div>
  );
}
