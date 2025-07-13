"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  ChevronRight,
  Folder,
  Menu,
  Music,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

interface MobileMenuProps {
  categories: Record<string, string[]>;
  agentTeams: string[];
}

export default function MobileMenu(props: MobileMenuProps) {
  const { categories, agentTeams } = props;

  return (
    <div className="lg:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto max-h-[80vh]">
            <MobileSidebar categories={categories} agentTeams={agentTeams} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );

  function MobileSidebar({ categories, agentTeams }: MobileMenuProps) {
    return (
      <nav className="space-y-8">
        {/* Weapons Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Folder className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Weapons
            </h2>
            <span className="ml-auto text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/10 px-2 py-1 rounded">
              {Object.keys(categories).length}
            </span>
          </div>
          <div className="space-y-1">
            {Object.keys(categories).map((category) => (
              <Link
                href={`/${category.toLowerCase()}`}
                key={category}
                className="block px-4 py-2 rounded hover:bg-accent/30 transition-all"
              >
                <span className="font-medium">{category}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {categories[category]?.length || 0}
                </span>
                <ChevronRight className="inline-block w-4 h-4 ml-2 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Agent Teams Section */}
        {agentTeams && agentTeams.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Agents
              </h2>
              <span className="ml-auto text-xs bg-gradient-to-r from-green-500/20 to-blue-500/20 border-white/10 px-2 py-1 rounded">
                {agentTeams.length}
              </span>
            </div>
            <div className="space-y-1">
              {agentTeams.map((team) => (
                <Link
                  href={`/agents/${team.toLowerCase()}`}
                  key={team}
                  className="block px-4 py-2 rounded hover:bg-accent/30 transition-all"
                >
                  <span className="font-medium">{team}</span>
                  <ChevronRight className="inline-block w-4 h-4 ml-2 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Music Kits Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Special
            </h2>
          </div>
          <Link
            href="/music-kits"
            className="block px-4 py-2 rounded hover:bg-accent/30 transition-all"
          >
            <span className="font-medium">Music Kits</span>
            <Sparkles className="inline-block w-3 h-3 text-purple-400 ml-1" />
            <ChevronRight className="inline-block w-4 h-4 ml-2 text-muted-foreground" />
          </Link>
        </div>
      </nav>
    );
  }
}
