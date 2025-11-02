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
    "nav.home": "Home",

    // Sidebar sections
    "sidebar.weapons": "Weapons",
    "sidebar.agents": "Agents",
    "sidebar.special": "Special",

    // Categories
    "category.pistols": "Pistols",
    "category.rifles": "Rifles",
    "category.smgs": "SMGs",
    "category.heavy": "Heavy",
    "category.knives": "Knives",
    "category.gloves": "Gloves",
    "category.equipment": "Equipment",

    // Common actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.reset": "Reset",
    "action.apply": "Apply",
    "action.select": "Select",
    "action.saving": "Saving...",

    // Skin customization
    "skin.wear": "Wear",
    "skin.seed": "Seed",
    "skin.stattrak": "StatTrak™",
    "skin.nametag": "Name Tag",
    "skin.stickers": "Stickers",
    "skin.keychains": "Keychains",
    "skin.customize": "Customize",
    "skin.nametagPlaceholder": "Enter custom name...",
    "skin.kills": "Kills",
    "skin.on": "ON",
    "skin.off": "OFF",
    "skin.selectAnother": "Select another skin",
    "skin.saveConfiguration": "Save Configuration",
    "skin.addStickerSlot": "Add sticker to slot",
    "skin.addKeychain": "Add keychain",
    "skin.keychain": "Keychain",

    // Teams
    "team.terrorists": "Terrorists",
    "team.counterTerrorists": "Counter-Terrorists",
    "team.both": "Both Teams",
    "team.t": "T",
    "team.ct": "CT",
    "team.terrorist": "Terrorist",
    "team.counterTerrorist": "Counter-Terrorist",
    "team.applyT": "Apply T Side",
    "team.applyCT": "Apply CT Side",
    "team.applyBoth": "Apply to both teams",
    "team.label": "Team",
    "team.deployAs": "Deploy as",

    // Wear levels
    "wear.factoryNew": "Factory New",
    "wear.minimalWear": "Minimal Wear",
    "wear.fieldTested": "Field-Tested",
    "wear.wellWorn": "Well-Worn",
    "wear.battleScarred": "Battle-Scarred",
    "wear.fn": "FN",
    "wear.mw": "MW",
    "wear.ft": "FT",
    "wear.ww": "WW",
    "wear.bs": "BS",
    "wear.floatValue": "Float Value",
    "wear.pattern": "Pattern",

    // Dialog actions
    "dialog.equipAgent": "Equip Agent",
    "dialog.equipMusicKit": "Equip Music Kit",
    "dialog.musicKitConfig": "Music Kit Configuration",
    "dialog.musicKitDescription": "This music kit will be equipped and played during matches for the selected team.",

    // Toast messages
    "toast.savingConfig": "Saving configuration...",
    "toast.configSaved": "Configuration saved!",
    "toast.configSavedReconnect": "Please reconnect to the server to apply changes.",
    "toast.configSavedRefresh": "Please type !wp in game chat to refresh.",
    "toast.configFailed": "Failed to save configuration",
    "toast.skinApplied": "Skin configuration applied successfully!",
    "toast.skinAppliedDesc": "has been configured with float",
    "toast.skinAppliedDescPattern": "and pattern",
    "toast.skinFailed": "Failed to apply skin configuration",
    "toast.skinFailedDesc": "There was an error applying the skin configuration. Please try again.",
    "toast.agentEquipped": "Agent equipped successfully!",
    "toast.agentEquippedDesc": "has been equipped for",
    "toast.agentEquippedTeam": "team.",
    "toast.agentFailed": "Failed to equip agent",
    "toast.agentFailedDesc": "There was an error equipping the agent. Please try again.",
    "toast.musicKitEquipped": "Music kit equipped successfully!",
    "toast.musicKitEquippedDesc": "has been equipped for",
    "toast.musicKitEquippedTeam": "team.",
    "toast.musicKitFailed": "Failed to equip music kit",
    "toast.musicKitFailedDesc": "There was an error equipping the music kit. Please try again.",

    // Search
    "search.placeholder": "Search skins, weapons, or categories...",
    "search.loading": "Loading skins...",
    "search.noResults": "No results found.",
    "search.skins": "Skins",
    "search.actions": "Actions",
    "search.searchFor": "Search for",

    // Weapon list
    "weapon.weapons": "weapons",
    "weapon.weapon": "weapon",
    "weapon.noWeaponsFound": "No weapons found",
    "weapon.noWeaponsMatch": "No weapons match your search",
    "weapon.noWeaponsAvailable": "No weapons are available in this category.",
  },
  "zh-CN": {
    // Navigation
    "nav.search": "搜索皮肤...",
    "nav.logout": "登出",
    "nav.gloves": "手套",
    "nav.agents": "探员",
    "nav.musicKits": "音乐盒",
    "nav.weapons": "武器",
    "nav.home": "主页",

    // Sidebar sections
    "sidebar.weapons": "武器",
    "sidebar.agents": "探员",
    "sidebar.special": "特殊",

    // Categories
    "category.pistols": "手枪",
    "category.rifles": "步枪",
    "category.smgs": "冲锋枪",
    "category.heavy": "重型武器",
    "category.knives": "匕首",
    "category.gloves": "手套",
    "category.equipment": "装备",

    // Common actions
    "action.save": "保存",
    "action.cancel": "取消",
    "action.reset": "重置",
    "action.apply": "应用",
    "action.select": "选择",
    "action.saving": "保存中...",

    // Skin customization
    "skin.wear": "磨损",
    "skin.seed": "模板",
    "skin.stattrak": "StatTrak™",
    "skin.nametag": "名称标签",
    "skin.stickers": "印花",
    "skin.keychains": "挂件",
    "skin.customize": "自定义",
    "skin.nametagPlaceholder": "输入自定义名称...",
    "skin.kills": "击杀数",
    "skin.on": "开启",
    "skin.off": "关闭",
    "skin.selectAnother": "选择其他皮肤",
    "skin.saveConfiguration": "保存配置",
    "skin.addStickerSlot": "添加印花到位置",
    "skin.addKeychain": "添加挂件",
    "skin.keychain": "挂件",

    // Teams
    "team.terrorists": "恐怖分子",
    "team.counterTerrorists": "反恐精英",
    "team.both": "双方阵营",
    "team.t": "T",
    "team.ct": "CT",
    "team.terrorist": "恐怖分子",
    "team.counterTerrorist": "反恐精英",
    "team.applyT": "应用到T阵营",
    "team.applyCT": "应用到CT阵营",
    "team.applyBoth": "应用到双方阵营",
    "team.label": "阵营",
    "team.deployAs": "装备",

    // Wear levels
    "wear.factoryNew": "崭新出厂",
    "wear.minimalWear": "略有磨损",
    "wear.fieldTested": "久经沙场",
    "wear.wellWorn": "破损不堪",
    "wear.battleScarred": "战痕累累",
    "wear.fn": "崭新",
    "wear.mw": "略磨",
    "wear.ft": "久经",
    "wear.ww": "破损",
    "wear.bs": "战痕",
    "wear.floatValue": "磨损值",
    "wear.pattern": "模板",

    // Dialog actions
    "dialog.equipAgent": "装备探员",
    "dialog.equipMusicKit": "装备音乐盒",
    "dialog.musicKitConfig": "音乐盒配置",
    "dialog.musicKitDescription": "此音乐盒将在选定阵营的比赛中装备并播放。",

    // Toast messages
    "toast.savingConfig": "正在保存配置...",
    "toast.configSaved": "配置已保存！",
    "toast.configSavedReconnect": "请重新进入服务器以应用更改。",
    "toast.configSavedRefresh": "请在游戏聊天框中输入 !wp 刷新数据。",
    "toast.configFailed": "保存配置失败",
    "toast.skinApplied": "皮肤配置应用成功！",
    "toast.skinAppliedDesc": "已配置磨损值为",
    "toast.skinAppliedDescPattern": "模板为",
    "toast.skinFailed": "应用皮肤配置失败",
    "toast.skinFailedDesc": "应用皮肤配置时出错，请重试。",
    "toast.agentEquipped": "探员装备成功！",
    "toast.agentEquippedDesc": "已为",
    "toast.agentEquippedTeam": "阵营装备。",
    "toast.agentFailed": "装备探员失败",
    "toast.agentFailedDesc": "装备探员时出错，请重试。",
    "toast.musicKitEquipped": "音乐盒装备成功！",
    "toast.musicKitEquippedDesc": "已为",
    "toast.musicKitEquippedTeam": "阵营装备。",
    "toast.musicKitFailed": "装备音乐盒失败",
    "toast.musicKitFailedDesc": "装备音乐盒时出错，请重试。",

    // Search
    "search.placeholder": "搜索皮肤、武器或分类...",
    "search.loading": "加载皮肤中...",
    "search.noResults": "未找到结果。",
    "search.skins": "皮肤",
    "search.actions": "操作",
    "search.searchFor": "搜索",

    // Weapon list
    "weapon.weapons": "件武器",
    "weapon.weapon": "件武器",
    "weapon.noWeaponsFound": "未找到武器",
    "weapon.noWeaponsMatch": "没有武器匹配您的搜索",
    "weapon.noWeaponsAvailable": "此分类中没有可用的武器。",
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
