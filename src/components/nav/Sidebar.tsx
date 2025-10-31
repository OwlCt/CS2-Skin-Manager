"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, memo } from "react";
import { Folder, Users, Music, ChevronRight, Sparkles, LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Types and Interfaces
interface SidebarProps {
  categories: Record<string, string[]>;
  agentTeams: string[];
}

interface SidebarSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  count: number;
  children: React.ReactNode;
}

interface SidebarItemProps {
  href: string;
  label: string;
  isActive: boolean;
  count?: number;
  itemKey: string;
  hoveredItem: string | null;
  onHover: (key: string | null) => void;
  activeGradient: string;
  hoverGradient: string;
  activeColor: string;
  hoverColor: string;
  icon?: React.ReactNode;
}

// Constants
const ANIMATION_VARIANTS = {
  section: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
} as const;

const SECTION_CONFIGS = {
  weapons: {
    title: "Weapons",
    icon: Folder,
    iconColor: "text-blue-400",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-purple-500/20",
    activeGradient: "from-primary/90 to-blue-500/90",
    hoverGradient: "from-blue-500/10 to-purple-500/10",
    activeColor: "border-blue-400",
    hoverColor: "group-hover:bg-blue-400",
    shadowColor: "0 0 8px rgba(96,165,250,0.5)",
  },
  agents: {
    title: "Agents",
    icon: Users,
    iconColor: "text-green-400",
    gradientFrom: "from-green-500/20",
    gradientTo: "to-blue-500/20",
    activeGradient: "from-green-500/90 to-blue-500/90",
    hoverGradient: "from-green-500/10 to-blue-500/10",
    activeColor: "border-green-400",
    hoverColor: "group-hover:bg-green-400",
    shadowColor: "0 0 8px rgba(34,197,94,0.5)",
  },
  special: {
    title: "Special",
    icon: Music,
    iconColor: "text-purple-400",
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-pink-500/20",
    activeGradient: "from-purple-500/90 to-pink-500/90",
    hoverGradient: "from-purple-500/10 to-pink-500/10",
    activeColor: "border-purple-400",
    hoverColor: "group-hover:bg-purple-400",
    shadowColor: "0 0 8px rgba(147,51,234,0.5)",
  },
} as const;

// Custom Hooks
const useSidebarLogic = (categories: Record<string, string[]>, agentTeams: string[]) => {
  const params = useParams();
  const activeCategory = params.category as string;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getCategoryLink = useCallback((category: string) => {
    return `/${category.toLowerCase()}`;
  }, []);

  const isActiveCategory = useCallback((category: string) => {
    return decodeURIComponent(activeCategory || '') === category.toLowerCase();
  }, [activeCategory]);

  const isActiveAgentTeam = useCallback((team: string) => {
    return decodeURIComponent(activeCategory || '') === team.toLowerCase();
  }, [activeCategory]);

  const isMusicKitsActive = useCallback(() => {
    return decodeURIComponent(activeCategory || '') === "music-kits";
  }, [activeCategory]);

  const categoriesCount = useMemo(() => Object.keys(categories).length, [categories]);
  const agentTeamsCount = useMemo(() => agentTeams.length, [agentTeams]);

  return {
    hoveredItem,
    setHoveredItem,
    getCategoryLink,
    isActiveCategory,
    isActiveAgentTeam,
    isMusicKitsActive,
    categoriesCount,
    agentTeamsCount,
  };
};

// Memoized Components
const SidebarSection = memo<SidebarSectionProps>(({ 
  title, 
  icon: Icon, 
  iconColor, 
  gradientFrom, 
  gradientTo, 
  count, 
  children 
}) => (
  <motion.div
    className="space-y-3"
    variants={ANIMATION_VARIANTS.section}
    initial="hidden"
    animate="visible"
  >
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5"
      variants={ANIMATION_VARIANTS.item}
      role="heading"
      aria-level={2}
    >
      <div className={`w-8 h-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />
      </div>
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h2>
      <Badge
        variant="secondary"
        className={`ml-auto text-xs bg-gradient-to-r ${gradientFrom} ${gradientTo} border-white/10`}
        aria-label={`${count} ${title.toLowerCase()}`}
      >
        {count}
      </Badge>
    </motion.div>
    <motion.div className="space-y-1" variants={ANIMATION_VARIANTS.section}>
      {children}
    </motion.div>
  </motion.div>
));

SidebarSection.displayName = 'SidebarSection';

const SidebarItem = memo<SidebarItemProps>(({
  href,
  label,
  isActive,
  count,
  itemKey,
  hoveredItem,
  onHover,
  activeGradient,
  hoverGradient,
  activeColor,
  hoverColor,
  icon,
}) => {
  const isHovered = hoveredItem === itemKey;

  const handleMouseEnter = useCallback(() => {
    onHover(itemKey);
  }, [itemKey, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <motion.div variants={ANIMATION_VARIANTS.item}>
      <Button
        asChild
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start group relative transition-all duration-300 rounded-lg overflow-hidden ${
          isActive
            ? `bg-gradient-to-r ${activeGradient} text-primary-foreground shadow-lg border-l-4 ${activeColor}`
            : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:backdrop-blur-sm"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-current={isActive ? "page" : undefined}
      >
        <Link
          href={href}
          className="flex items-center w-full relative z-10"
          aria-label={`Navigate to ${label}${count ? ` (${count} items)` : ''}`}
        >
          <AnimatePresence>
            {isHovered && !isActive && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${hoverGradient} rounded-lg`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 flex-1">
            <motion.div
              className={`w-2 h-2 rounded-full transition-colors ${
                isActive
                  ? "bg-white shadow-lg"
                  : `bg-muted ${hoverColor}`
              }`}
              animate={{
                scale: isActive ? [1, 1.3, 1] : 1,
                boxShadow: isActive
                  ? SECTION_CONFIGS.weapons.shadowColor
                  : "none",
              }}
              transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0,
              }}
              aria-hidden="true"
            />
            <span className="font-medium">{label}</span>
            {icon}
            {count !== undefined && count > 0 && (
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={`ml-auto text-xs transition-all duration-300 ${
                  isActive
                    ? "bg-white/20 text-white border-white/30"
                    : "hover:bg-blue-500/20 hover:border-blue-500/30"
                }`}
                aria-label={`${count} items`}
              >
                {count}
              </Badge>
            )}
          </div>
          <motion.div
            animate={{
              x: isHovered ? 4 : 0,
              rotate: isActive ? 90 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <ChevronRight
              className={`w-4 h-4 transition-colors ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground group-hover:text-blue-400"
              }`}
              aria-hidden="true"
            />
          </motion.div>
        </Link>
      </Button>
    </motion.div>
  );
});

SidebarItem.displayName = 'SidebarItem';

const BackgroundOverlay = memo(() => (
  <>
    {/* Gradient overlay for extra vibrance */}
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-60" />
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/30 to-transparent rounded-full blur-2xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-2xl opacity-30" />
    </div>
    {/* Animated background pattern */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(96,165,250,0.1) 0%, transparent 70%)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  </>
));

BackgroundOverlay.displayName = 'BackgroundOverlay';

const SidebarHeader = memo(() => (
  <motion.div
    className="p-4 shrink-0 relative"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex items-center gap-3 relative z-10">
      <div>
        <h1 className="text-xl font-bold text-foreground">WeaponPaints</h1>
      </div>
    </div>
  </motion.div>
));

SidebarHeader.displayName = 'SidebarHeader';

// Main Component
export default function Sidebar({ categories, agentTeams }: SidebarProps) {
  const { t } = useLanguage();
  const {
    hoveredItem,
    setHoveredItem,
    getCategoryLink,
    isActiveCategory,
    isActiveAgentTeam,
    isMusicKitsActive,
    categoriesCount,
    agentTeamsCount,
  } = useSidebarLogic(categories, agentTeams);

  // Helper function to translate category names
  const getCategoryLabel = useCallback((category: string) => {
    const categoryKey = `category.${category.toLowerCase()}`;
    return t(categoryKey);
  }, [t]);

  const weaponItems = useMemo(() =>
    Object.keys(categories).map((category, index) => {
      const isActive = isActiveCategory(category);
      const itemCount = categories[category]?.length || 0;
      const config = SECTION_CONFIGS.weapons;

      return (
        <SidebarItem
          key={category}
          href={getCategoryLink(category)}
          label={getCategoryLabel(category)}
          isActive={isActive}
          count={itemCount}
          itemKey={`weapon-${category}`}
          hoveredItem={hoveredItem}
          onHover={setHoveredItem}
          activeGradient={config.activeGradient}
          hoverGradient={config.hoverGradient}
          activeColor={config.activeColor}
          hoverColor={config.hoverColor}
        />
      );
    }),
    [categories, hoveredItem, setHoveredItem, getCategoryLink, isActiveCategory, getCategoryLabel]
  );

  // Helper function to translate team names
  const getTeamLabel = useCallback((team: string) => {
    if (team.toLowerCase() === "counter-terrorists") return t("team.counterTerrorists");
    if (team.toLowerCase() === "terrorists") return t("team.terrorists");
    return team;
  }, [t]);

  const agentItems = useMemo(() =>
    agentTeams.map((team, index) => {
      const isActive = isActiveAgentTeam(team);
      const config = SECTION_CONFIGS.agents;

      return (
        <SidebarItem
          key={team}
          href={`/agents/${team.toLowerCase()}`}
          label={getTeamLabel(team)}
          isActive={isActive}
          itemKey={`agent-${team}`}
          hoveredItem={hoveredItem}
          onHover={setHoveredItem}
          activeGradient={config.activeGradient}
          hoverGradient={config.hoverGradient}
          activeColor={config.activeColor}
          hoverColor={config.hoverColor}
        />
      );
    }),
    [agentTeams, hoveredItem, setHoveredItem, isActiveAgentTeam, getTeamLabel]
  );

  const musicKitItem = useMemo(() => {
    const isActive = isMusicKitsActive();
    const config = SECTION_CONFIGS.special;

    return (
      <SidebarItem
        href="/music-kits"
        label={t("nav.musicKits")}
        isActive={isActive}
        itemKey="music-kits"
        hoveredItem={hoveredItem}
        onHover={setHoveredItem}
        activeGradient={config.activeGradient}
        hoverGradient={config.hoverGradient}
        activeColor={config.activeColor}
        hoverColor={config.hoverColor}
        icon={
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-3 h-3 text-purple-400 ml-1" aria-hidden="true" />
          </motion.div>
        }
      />
    );
  }, [hoveredItem, setHoveredItem, isMusicKitsActive, t]);

  return (
    <nav 
      className="fixed inset-y-0 left-0 w-72 flex flex-col bg-background/80 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-2xl border border-white/10 z-30 overflow-hidden shadow-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <BackgroundOverlay />
      <SidebarHeader />

      <ScrollArea className="flex-1 px-4 min-h-0">
        <div className="space-y-8 pb-6">
          {/* Weapons Section */}
          <SidebarSection
            title={t("sidebar.weapons")}
            icon={SECTION_CONFIGS.weapons.icon}
            iconColor={SECTION_CONFIGS.weapons.iconColor}
            gradientFrom={SECTION_CONFIGS.weapons.gradientFrom}
            gradientTo={SECTION_CONFIGS.weapons.gradientTo}
            count={categoriesCount}
          >
            {weaponItems}
          </SidebarSection>

          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Agent Teams Section */}
          {agentTeams && agentTeams.length > 0 && (
            <>
              <SidebarSection
                title={t("sidebar.agents")}
                icon={SECTION_CONFIGS.agents.icon}
                iconColor={SECTION_CONFIGS.agents.iconColor}
                gradientFrom={SECTION_CONFIGS.agents.gradientFrom}
                gradientTo={SECTION_CONFIGS.agents.gradientTo}
                count={agentTeamsCount}
              >
                {agentItems}
              </SidebarSection>

              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
            </>
          )}

          {/* Music Kits Section */}
          <SidebarSection
            title={t("sidebar.special")}
            icon={SECTION_CONFIGS.special.icon}
            iconColor={SECTION_CONFIGS.special.iconColor}
            gradientFrom={SECTION_CONFIGS.special.gradientFrom}
            gradientTo={SECTION_CONFIGS.special.gradientTo}
            count={1}
          >
            {musicKitItem}
          </SidebarSection>
        </div>
      </ScrollArea>
    </nav>
  );
}
