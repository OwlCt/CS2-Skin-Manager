"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserNav from "@/components/nav/UserNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { Suspense, lazy } from "react";
const MobileMenu = lazy(() => import("@/components/nav/MobileMenu"));
import SearchCommand from "@/components/nav/SearchCommand";

interface NavigationProps {
  agentTeams: string[];
  categories: Record<string, string[]>;
  user?: {
    steamId: string;
    username?: string;
    avatar?: string;
  } | null;
}

export default function Navigation({
  categories,
  user,
  agentTeams,
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();

  // Handle server connection
  const handleJoinServer = () => {
    // Get server configuration from environment variables
    const serverIP = process.env.NEXT_PUBLIC_SERVER_IP || "127.0.0.1";
    const serverPort = process.env.NEXT_PUBLIC_SERVER_PORT || "27015";

    // Steam connect URL format for CS2 (App ID: 730)
    const steamConnectUrl = `steam://rungameid/730//+connect ${serverIP}:${serverPort}`;

    // Try to open Steam connection
    window.location.href = steamConnectUrl;
  };

  // Keyboard shortcut to open search (no changes here)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="flex h-[65px] items-center justify-between border-b border-border px-4 gap-4 bg-background/80 backdrop-blur-2xl shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Vibrant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-60" />
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/30 to-transparent rounded-full blur-2xl opacity-30" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-2xl opacity-30" />
          {/* Blurred color blob */}
          <div className="absolute -top-1/2 left-1/2 w-[120vw] h-[120vw] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl opacity-60" />
        </div>
        <div className="flex items-center gap-4 flex-1 relative z-10">
          <div className="lg:hidden">
            <Suspense fallback={<div className="px-2">Loading menu...</div>}>
              <MobileMenu categories={categories} agentTeams={agentTeams} />
            </Suspense>
          </div>

          <div className="hidden md:block">
            <Button
              variant="outline"
              className="relative h-9 w-48 justify-start text-sm text-muted-foreground"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              {t("nav.search")}
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Join Server Button */}
          <Button
            size="sm"
            onClick={handleJoinServer}
            className="hidden md:flex bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <img
              src="/cs2-icon.png"
              alt="CS2"
              className="h-4 w-4 mr-2"
            />
            {language === "zh-CN" ? "点击进入服务器" : "Click to Join Server"}
          </Button>
          {user && <UserNav user={user} />}
        </div>
      </header>

      <SearchCommand open={open} onOpenChange={setOpen} />
    </>
  );
}
