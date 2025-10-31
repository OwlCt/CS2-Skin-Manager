"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Translations {
  title: string;
  subtitle: string;
  signInWithSteam: string;
  joinServer: string;
  disclaimer: string;
}

const translations: Record<string, Translations> = {
  en: {
    title: process.env.NEXT_PUBLIC_SERVER_NAME || "CS2 Community Server",
    subtitle: "Skins Control Panel",
    signInWithSteam: "Sign in with Steam",
    joinServer: "Join Server",
    disclaimer: "Game content copyright belongs to Valve Corporation. All players on this server must comply with the laws and regulations of the People's Republic of China."
  },
  zh: {
    title: process.env.NEXT_PUBLIC_SERVER_NAME || "CS2 Community Server",
    subtitle: "皮肤控制面板",
    signInWithSteam: "使用 Steam 登录",
    joinServer: "进入服务器",
    disclaimer: "游戏内容版权归 Valve Corporation 所有。\n本服务器中所有玩家均需遵守中国相关法律法规。"
  }
};

export default function LoginPage() {
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith("zh")) {
      setLanguage("zh");
    } else {
      setLanguage("en");
    }
  }, []);

  const t = translations[language];

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

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              WeaponPaints
            </h1>
            <p className="text-muted-foreground">
              CS2 Skin Management System
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
    
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-3 leading-none whitespace-nowrap" style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif' }}>
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Main card */}
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <div className="space-y-4">
            {/* Steam login button */}
            <Button
              size="lg"
              asChild
              className="w-full h-12 bg-[#1b2838] hover:bg-[#2a475e] text-white font-medium transition-colors"
            >
              <Link href="/api/auth/steam" className="flex items-center justify-center gap-3">
                <img
                  src="https://vip.123pan.cn/1820390256/yk6baz03t0n000d7w33hent2voq86m3sDIYvDdD2DdiyApxPBIi1Da==.png"
                  alt="Steam"
                  className="h-5 w-5"
                />
                {t.signInWithSteam}
              </Link>
            </Button>

            {/* Join server button */}
            <Button
              size="lg"
              onClick={handleJoinServer}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <img
                src="https://vip.123pan.cn/1820390256/ymjew503t0m000d7w32xxffyav9ayv8gDIYvDdD2DdiyApxPBIi1Da==.png"
                alt="CS2"
                className="h-5 w-5 mr-2"
              />
              {language === "zh" ? "点击进入服务器" : "Click to Join Server"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}