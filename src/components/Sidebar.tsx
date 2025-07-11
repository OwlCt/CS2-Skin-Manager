"use client"; // Required for useParams and path matching

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const activeCategory = params.category as string;

  const getCategoryLink = (category: string) => {
    if (category === "Counter-Terrorist Agents") {
      return "/agents/counter-terrorist";
    }
    if (category === "Terrorist Agents") {
      return "/agents/terrorist";
    }
    if (category === "Music Kits") {
      return "/music-kits";
    }
    return `/${category.toLowerCase()}`;
  };

  const isActiveCategory = (category: string) => {
    if (category === "Counter-Terrorist Agents") {
      return pathname.includes("/agents/counter-terrorist");
    }
    if (category === "Terrorist Agents") {
      return pathname.includes("/agents/terrorist");
    }
    if (category === "Music Kits") {
      return pathname.includes("/music-kits");
    }
    return decodeURIComponent(activeCategory) === category.toLowerCase();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 px-3">Categories</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category}>
            <Button
              asChild // This allows the Button to wrap the Link
              variant={isActiveCategory(category) ? "default" : "secondary"}
              className="w-full justify-start"
            >
              <Link href={getCategoryLink(category)}>{category}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
