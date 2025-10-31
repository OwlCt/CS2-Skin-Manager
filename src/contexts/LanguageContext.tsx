"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh-CN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// UI translations for the interface (not game data)
const uiTranslations = {
  en: {
    // Navigation
    "nav.search": "Search skins...",
    "nav.logout": "Log out",
    "nav.gloves": "Gloves",
    "nav.agents": "Agents",
    "nav.musicKits": "Music Kits",
    "nav.weapons": "Weapons",

    // Categories
    "category.pistols": "Pistols",
    "category.rifles": "Rifles",
    "category.smgs": "SMGs",
    "category.heavy": "Heavy",
    "category.knives": "Knives",
    "category.gloves": "Gloves",

    // Common actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.reset": "Reset",
    "action.apply": "Apply",
    "action.select": "Select",

    // Skin customization
    "skin.wear": "Wear",
    "skin.seed": "Seed",
    "skin.stattrak": "StatTrak™",
    "skin.nametag": "Name Tag",
    "skin.stickers": "Stickers",
    "skin.keychains": "Keychains",

    // Teams
    "team.terrorists": "Terrorists",
    "team.counterTerrorists": "Counter-Terrorists",
    "team.both": "Both Teams",
  },
  "zh-CN": {
    // Navigation
    "nav.search": "搜索皮肤...",
    "nav.logout": "登出",
    "nav.gloves": "手套",
    "nav.agents": "特工",
    "nav.musicKits": "音乐盒",
    "nav.weapons": "武器",

    // Categories
    "category.pistols": "手枪",
    "category.rifles": "步枪",
    "category.smgs": "冲锋枪",
    "category.heavy": "重型武器",
    "category.knives": "匕首",
    "category.gloves": "手套",

    // Common actions
    "action.save": "保存",
    "action.cancel": "取消",
    "action.reset": "重置",
    "action.apply": "应用",
    "action.select": "选择",

    // Skin customization
    "skin.wear": "磨损",
    "skin.seed": "模板",
    "skin.stattrak": "StatTrak™",
    "skin.nametag": "名称标签",
    "skin.stickers": "印花",
    "skin.keychains": "挂件",

    // Teams
    "team.terrorists": "恐怖分子",
    "team.counterTerrorists": "反恐精英",
    "team.both": "双方阵营",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "zh-CN")) {
      setLanguageState(savedLang);
    }
  }, []);

  // Save language preference to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function for UI strings
  const t = (key: string): string => {
    return uiTranslations[language][key as keyof typeof uiTranslations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
