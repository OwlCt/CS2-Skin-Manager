"use client";

import { Skins } from "@/types/skins";
import { Sticker } from "@/types/sticker";
import { Keychain } from "@/types/keychain";
import { motion } from "framer-motion";
import { Settings, Star, Tag, Target, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import CTLogo from "@/assets/ct_logo.svg";
import TLogo from "@/assets/t_logo.svg";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { toast } from "sonner";
import { MotionSelect } from "@/components/ui/motion-select";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StickerSelector from "@/components/skins/StickerSelector";
import KeychainSelector from "@/components/skins/KeychainSelector";
import { isKnife, isGlove } from "@/lib/weapons";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, duration: 0.6 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PaintUI({
  skin,
  stickers,
  keychains,
}: {
  skin: Skins;
  stickers: Sticker[];
  keychains: Keychain[];
}) {
  // Translation hooks
  const { getSkinName, getWearName, loading: translationLoading } = useTranslation();
  const { t } = useLanguage();

  // Determine weapon type
  const weaponDefindex = skin.weapon_defindex;
  const isKnifeWeapon = isKnife(weaponDefindex);
  const isGloveWeapon = isGlove(weaponDefindex);

  // Feature availability based on weapon type
  const canHaveStickers = !isKnifeWeapon && !isGloveWeapon;
  const canHaveKeychains = !isKnifeWeapon && !isGloveWeapon;
  const canHaveStatTrak = !isGloveWeapon;
  const canHaveNametag = !isGloveWeapon;

  const [selectedWear, setSelectedWear] = useState("Factory New");
  const [customWearValue, setCustomWearValue] = useState(0.000001);
  const [initialWearValue, setInitialWearValue] = useState(0.000001);
  const [seedRange, setSeedRange] = useState(500);
  const [initialSeedRange, setInitialSeedRange] = useState(500);
  const [nameTag, setNameTag] = useState("");
  const [statTrak, setStatTrak] = useState(false);
  const [kills, setKills] = useState(0);
  const [activeTab, setActiveTab] = useState("T");
  const [saveLoading, setSaveLoading] = useState(false);
  const router = useRouter();

  // Stickers state (5 slots)
  const [selectedStickers, setSelectedStickers] = useState<
    (Sticker | null)[]
  >([null, null, null, null, null]);
  const [stickerDialogOpen, setStickerDialogOpen] = useState(false);
  const [currentStickerSlot, setCurrentStickerSlot] = useState<number>(0);

  // Keychain state (1 slot)
  const [selectedKeychain, setSelectedKeychain] = useState<Keychain | null>(
    null
  );
  const [keychainDialogOpen, setKeychainDialogOpen] = useState(false);

  const wearOptions = [
    "Factory New",
    "Minimal Wear",
    "Field-Tested",
    "Well-Worn",
    "Battle-Scarred",
  ];
  const wearValues: Record<string, number> = {
    "Factory New": 0.000001,
    "Minimal Wear": 0.07,
    "Field-Tested": 0.15,
    "Well-Worn": 0.38,
    "Battle-Scarred": 0.45,
  };

  // Function to get translated wear label
  const getWearLabel = (wear: string) => {
    const wearKey = wear.replace(/\s+/g, "").replace("-", "");
    return t(`wear.${wearKey.charAt(0).toLowerCase() + wearKey.slice(1)}`);
  };

  // Determine wear level based on float value
  function getWearLevelFromFloat(floatValue: number): string {
    if (floatValue < 0.07) return "Factory New";
    if (floatValue < 0.15) return "Minimal Wear";
    if (floatValue < 0.38) return "Field-Tested";
    if (floatValue < 0.45) return "Well-Worn";
    return "Battle-Scarred";
  }

  // Handle wear preset selection
  function handleWearChange(wear: string) {
    setSelectedWear(wear);
    setCustomWearValue(wearValues[wear]);
  }

  // Handle custom wear value input
  function handleCustomWearChange(value: string) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Clamp value between 0 and 1
      const clampedValue = Math.max(0, Math.min(1, numValue));
      setCustomWearValue(clampedValue);
      // Update the wear preset selector to match the float value
      setSelectedWear(getWearLevelFromFloat(clampedValue));
    }
  }

  // Load current skin configuration on mount
  useEffect(() => {
    async function loadCurrentConfig() {
      try {
        const res = await fetch("/api/skins/config", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          // Find the current skin config for this weapon
          const currentConfig = data.skins?.find(
            (s: any) =>
              s.weapon_defindex === skin.weapon_defindex &&
              s.weapon_paint_id === skin.paint
          );
          if (currentConfig) {
            // Set initial values from database
            setInitialWearValue(currentConfig.weapon_wear);
            setCustomWearValue(currentConfig.weapon_wear);
            setSelectedWear(getWearLevelFromFloat(currentConfig.weapon_wear));
            setInitialSeedRange(currentConfig.weapon_seed);
            setSeedRange(currentConfig.weapon_seed);
          }
        }
      } catch (error) {
        console.error("Failed to load current config:", error);
      }
    }
    loadCurrentConfig();
  }, [skin.weapon_defindex, skin.paint]);

  function getTeamValue(tab: string) {
    if (tab === "T") return 2;
    if (tab === "CT") return 3;
    return 0;
  }

  function handleOpenStickerDialog(slotIndex: number) {
    setCurrentStickerSlot(slotIndex);
    setStickerDialogOpen(true);
  }

  function handleSelectSticker(sticker: Sticker | null) {
    const newStickers = [...selectedStickers];
    newStickers[currentStickerSlot] = sticker;
    setSelectedStickers(newStickers);
  }

  function formatStickerForDatabase(sticker: Sticker | null): string {
    if (!sticker) return "0;0;0;0;0;0;0";
    // Format: defIndex;wear;rotation;x;y;scale;tint
    // Using default values for now, these could be customizable in the future
    return `${sticker.def_index};0;0;0;0;1;0`;
  }

  function formatKeychainForDatabase(keychain: Keychain | null): string {
    if (!keychain) return "0;0;0;0;0";
    // Format: defIndex;pattern;seed;offset_x;offset_y
    return `${keychain.def_index};0;0;0;0`;
  }

  async function handleSaveConfig() {
    if (saveLoading) return; // Prevent multiple submissions

    setSaveLoading(true);
    toast.loading(t("toast.savingConfig"), {
      id: "save-config",
    });

    try {
      const payload = {
        weaponDefindex: skin.weapon_defindex,
        weaponPaintId: skin.paint,
        weaponTeam: getTeamValue(activeTab),
        wear: Number(customWearValue),
        seed: seedRange.toString(),
        // Only send nametag if weapon supports it (not gloves)
        nametag: canHaveNametag ? nameTag : "",
        // Only send StatTrak if weapon supports it (not gloves)
        stattrak: canHaveStatTrak ? statTrak : false,
        stattrakCount: canHaveStatTrak ? kills.toString() : "0",
        // Only send stickers if weapon supports them (not knives or gloves)
        stickers: canHaveStickers
          ? selectedStickers.map(formatStickerForDatabase)
          : ["0;0;0;0;0;0;0", "0;0;0;0;0;0;0", "0;0;0;0;0;0;0", "0;0;0;0;0;0;0", "0;0;0;0;0;0;0"],
        // Only send keychain if weapon supports it (not knives or gloves)
        keychain: canHaveKeychains
          ? formatKeychainForDatabase(selectedKeychain)
          : "0;0;0;0;0",
      };

      console.log("Saving skin config:", payload);

      const res = await fetch("/api/skins/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          weaponDefindex: skin.weapon_defindex,
          weaponPaintId: skin.paint,
          weaponTeam: getTeamValue(activeTab),
          wear: Number(customWearValue),
          seed: seedRange.toString(),
          // Only send nametag if weapon supports it (not gloves)
          nametag: canHaveNametag ? nameTag : "",
          // Only send StatTrak if weapon supports it (not gloves)
          stattrak: canHaveStatTrak ? statTrak : false,
          stattrakCount: canHaveStatTrak ? kills.toString() : "0",
          // Only send stickers if weapon supports them (not knives or gloves)
          stickers: canHaveStickers
            ? selectedStickers.map(formatStickerForDatabase)
            : ["0;0;0;0;0;0;0", "0;0;0;0;0;0;0", "0;0;0;0;0;0;0", "0;0;0;0;0;0;0", "0;0;0;0;0;0;0"],
          // Only send keychain if weapon supports it (not knives or gloves)
          keychain: canHaveKeychains
            ? formatKeychainForDatabase(selectedKeychain)
            : "0;0;0;0;0",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save configuration", {
          id: "save-config",
        });
      } else {
        // Check if wear value was decreased (requires reconnect)
        const wearDecreased = customWearValue < initialWearValue;

        // Check if there are other changes (requires !wp command)
        const seedChanged = seedRange !== initialSeedRange;
        const hasOtherChanges = seedChanged || customWearValue > initialWearValue;

        let description: string | undefined;
        if (wearDecreased) {
          // Wear decreased: need to reconnect
          description = t("toast.configSavedReconnect");
        } else if (hasOtherChanges) {
          // Other changes: use !wp command
          description = t("toast.configSavedRefresh");
        }
        // else: no description (no changes or first save)

        toast.success(t("toast.configSaved"), {
          id: "save-config",
          description,
        });

        // Update initial values for future comparisons
        setInitialWearValue(customWearValue);
        setInitialSeedRange(seedRange);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save configuration", {
        id: "save-config",
      });
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <motion.div
        className="relative z-10 max-w-7xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-center lg:items-start w-full">
          {/* Image Section */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center min-w-0 w-full lg:w-auto"
            variants={itemVariants}
          >
            {/* Weapon Name Badge */}
            <motion.div
              className="mb-6 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur opacity-40" />
              <div className="relative bg-muted/40 backdrop-blur-md border border-border rounded-full px-6 py-3">
                <h4 className="text-foreground text-xl font-bold">
                  {translationLoading
                    ? skin.paint_name
                    : (getSkinName(skin.paint, skin.weapon_defindex) || skin.paint_name)
                  } {skin.phase ? `(${skin.phase})` : ""}
                </h4>
              </div>
            </motion.div>
            {/* Image Container */}
            <motion.div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-muted/40 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-lg">
                <motion.img
                  src={skin.image}
                  alt={skin.paint_name}
                  className="w-full max-w-md h-auto object-contain drop-shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </div>
            </motion.div>
            {/* Team Selection & Actions */}
            <motion.div
              className="mt-4 flex flex-col gap-2 md:gap-4 justify-center w-full"
              variants={itemVariants}
            >
              <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                {["T", "Both", "CT"].map((team) => (
                  <Tooltip key={team}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => setActiveTab(team)}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 border ${
                          activeTab === team
                            ? "bg-primary text-primary-foreground border-primary shadow"
                            : "bg-muted/40 backdrop-blur-md border-border text-muted-foreground hover:bg-muted/60"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {team === "T" ? (
                          <Image
                            src={TLogo}
                            alt="T"
                            className="inline-block h-6 w-6 md:h-8 md:w-8"
                          />
                        ) : team === "CT" ? (
                          <Image
                            src={CTLogo}
                            alt="CT"
                            className="inline-block h-6 w-6 md:h-8 md:w-8"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Image
                              src={CTLogo}
                              alt="CT"
                              className="inline-block h-6 w-6 md:h-8 md:w-8"
                            />
                            <Image
                              src={TLogo}
                              alt="T"
                              className="inline-block h-6 w-6 md:h-8 md:w-8"
                            />
                          </div>
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      {team === "T"
                        ? t("team.applyT")
                        : team === "CT"
                        ? t("team.applyCT")
                        : t("team.applyBoth")}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <button
                type="button"
                onClick={() => router.back()}
                className="mt-2 px-8 py-3 rounded-xl font-semibold border bg-muted/40 backdrop-blur-md border-border text-muted-foreground hover:bg-muted/60 transition-all duration-300"
              >
                {t("skin.selectAnother")}
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saveLoading}
                className="mt-2 px-8 py-3 rounded-xl font-semibold border bg-primary text-primary-foreground border-primary shadow hover:bg-primary/80 transition-all duration-300"
              >
                {saveLoading ? t("action.saving") : t("skin.saveConfiguration")}
              </button>
            </motion.div>
          </motion.div>
          {/* Controls */}
          <motion.div
            className="flex-1 max-w-md w-full min-w-0 lg:w-auto"
            variants={itemVariants}
          >
            <div className="bg-muted/40 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-6 shadow-lg">
              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Settings className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  {t("skin.customize")}
                </h2>
              </motion.div>
              <div className="space-y-6">
                {/* Wear */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    {t("skin.wear")}
                  </label>
                  <motion.div className="relative mb-3" whileHover={{ scale: 1.02 }}>
                    <MotionSelect
                      options={wearOptions.map((w) => ({ value: w, label: getWearLabel(w) }))}
                      value={selectedWear}
                      onChange={handleWearChange}
                      placeholder={t("skin.wear")}
                      className="w-full"
                    />
                  </motion.div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      {t("wear.floatValue")} (0.00 - 1.00)
                    </label>
                    <motion.input
                      type="number"
                      value={customWearValue}
                      onChange={(e) => handleCustomWearChange(e.target.value)}
                      min="0"
                      max="1"
                      step="0.000001"
                      className="w-full bg-muted/40 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                </motion.div>
                {/* Seed */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                    <Zap className="w-5 h-5 text-blue-400" />
                    {t("skin.seed")}
                  </label>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      {t("wear.pattern")} (1 - 1000)
                    </label>
                    <motion.input
                      type="number"
                      value={seedRange}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setSeedRange(Math.max(1, Math.min(1000, value)));
                      }}
                      min="1"
                      max="1000"
                      step="1"
                      className="w-full bg-muted/40 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                </motion.div>
                {/* Name Tag - Only for weapons and knives (not gloves) */}
                {canHaveNametag && (
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                      <Tag className="w-5 h-5 text-green-400" />
                      {t("skin.nametag")}
                    </label>
                    <motion.input
                      type="text"
                      value={nameTag}
                      onChange={(e) => setNameTag(e.target.value)}
                      placeholder={t("skin.nametagPlaceholder")}
                      className="w-full bg-muted/40 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>
                )}
                {/* StatTrak & Kills - Only for weapons and knives (not gloves) */}
                {canHaveStatTrak && (
                  <motion.div variants={itemVariants}>
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                          <Target className="w-5 h-5 text-red-400" />
                          {t("skin.stattrak")}
                        </label>
                        <motion.button
                          onClick={() => setStatTrak(!statTrak)}
                          className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                            statTrak
                              ? "bg-primary text-primary-foreground border-primary shadow"
                              : "bg-muted/40 backdrop-blur-md border-border text-muted-foreground"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {statTrak ? t("skin.on") : t("skin.off")}
                        </motion.button>
                      </div>
                      <div className="flex-1">
                        <label className="text-lg font-medium text-foreground mb-3 block">
                          {t("skin.kills")}
                        </label>
                        <motion.input
                          type="number"
                          value={kills}
                          onChange={(e) =>
                            setKills(parseInt(e.target.value) || 0)
                          }
                          className="w-full bg-muted/40 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          disabled={!statTrak}
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* Stickers & Keychains - Only for regular weapons (not knives or gloves) */}
                {(canHaveStickers || canHaveKeychains) && (
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-6 mt-6 md:mt-8"
                  >
                    {canHaveStickers && (
                      <div className="flex-1">
                        <label className="text-lg font-medium text-foreground mb-3 block">
                          {t("skin.stickers")}
                        </label>
                        <div className="flex gap-1 md:gap-2 flex-wrap">
                          {selectedStickers.map((sticker, i) => (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <motion.button
                                  type="button"
                                  onClick={() => handleOpenStickerDialog(i)}
                                  className="w-12 h-12 md:w-14 md:h-14 bg-muted/40 rounded-md border border-border hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {sticker ? (
                                    <Image
                                      src={sticker.image}
                                      alt={sticker.name}
                                      width={40}
                                      height={40}
                                      className="object-contain"
                                    />
                                  ) : (
                                    <span className="text-lg md:text-xl text-muted-foreground">
                                      +
                                    </span>
                                  )}
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {sticker
                                  ? sticker.name.replace("Sticker | ", "")
                                  : `${t("skin.addStickerSlot")} ${i + 1}`}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    )}
                    {canHaveKeychains && (
                      <div className="flex-1">
                        <label className="text-lg font-medium text-foreground mb-3 block">
                          {t("skin.keychain")}
                        </label>
                        <div className="flex gap-1 md:gap-2 flex-wrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                type="button"
                                onClick={() => setKeychainDialogOpen(true)}
                                className="w-12 h-12 md:w-14 md:h-14 bg-muted/40 rounded-md border border-border hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {selectedKeychain ? (
                                  <Image
                                    src={selectedKeychain.image}
                                    alt={selectedKeychain.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                  />
                                ) : (
                                  <span className="text-lg md:text-xl text-muted-foreground">
                                    +
                                  </span>
                                )}
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {selectedKeychain
                                ? selectedKeychain.name.replace("Charm | ", "")
                                : t("skin.addKeychain")}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sticker Selector Dialog - Only for regular weapons */}
      {canHaveStickers && (
        <StickerSelector
          open={stickerDialogOpen}
          onOpenChange={setStickerDialogOpen}
          onSelect={handleSelectSticker}
          stickers={stickers}
        />
      )}

      {/* Keychain Selector Dialog - Only for regular weapons */}
      {canHaveKeychains && (
        <KeychainSelector
          open={keychainDialogOpen}
          onOpenChange={setKeychainDialogOpen}
          onSelect={setSelectedKeychain}
          keychains={keychains}
        />
      )}

    </div>
  );
}
