import AppBreadcrumb from "@/components/nav/Breadcrumb";
import PaintUI from "@/components/skins/PaintUI";
import { getSkinByPaintId } from "@/lib/skins";
import Link from "next/link";
import { notFound } from "next/navigation";

type PaintProps = {
  params: Promise<{
    category: string;
    weapon: string;
    paint: string;
  }>;
};

export default async function Paint({ params }: PaintProps) {
  const { paint, category, weapon } = await params;
  const skin = await getSkinByPaintId(weapon, parseInt(paint, 10));

  if (!skin) {
    return notFound();
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <AppBreadcrumb>
        <AppBreadcrumb.Item>
          <Link href="/">Home</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item>
          <Link href={`/${category}`}>{skin.category}</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item>
          <Link href={`/${category}/${weapon}`}>
            {skin.paint_name.split("|")[0]}
          </Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item isCurrent>
          {skin.paint_name.split("|")[1]} {skin.phase ? `(${skin.phase})` : ""}
        </AppBreadcrumb.Item>
      </AppBreadcrumb>

      <PaintUI skin={skin} />
    </div>
  );
}
