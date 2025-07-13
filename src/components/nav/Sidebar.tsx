// Sidebar.tsx
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Folder, Users, Music, ChevronRight, Sparkles } from "lucide-react";

interface SidebarProps {
  categories: Record<string, string[]>;
  agentTeams: string[];
}

export default function Sidebar({ categories, agentTeams }: SidebarProps) {
  const params = useParams();
  const activeCategory = params.category as string;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getCategoryLink = (category: string) => {
    return `/${category.toLowerCase()}`;
  };

  const isActiveCategory = (category: string) => {
    return decodeURIComponent(activeCategory) === category.toLowerCase();
  };

  const isActiveAgentTeam = (team: string) => {
    return decodeURIComponent(activeCategory) === team.toLowerCase();
  };

  const isMusicKitsActive = () => {
    return decodeURIComponent(activeCategory) === "music-kits";
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="fixed inset-y-0 left-0 w-72 flex flex-col bg-background/80 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-2xl border border-white/10 z-30 overflow-hidden shadow-2xl">
      {/* Gradient overlay for extra vibrance */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Vibrant gradient overlay, matching PaintUI */}
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

      {/* Header */}
      <motion.div
        className="p-4 shrink-0 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg" /> */}
        <div className="flex items-center gap-3 relative z-10">
          <div>
            <h1 className="text-xl font-bold text-foreground">WeaponPaints</h1>
            {/* <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1" /> */}
          </div>
        </div>
      </motion.div>

      <ScrollArea className="flex-1 px-4 min-h-0">
        <div className="space-y-8 pb-6">
          {/* Weapons Section */}
          <motion.div
            className="space-y-3"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5"
              variants={itemVariants}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <Folder className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Weapons
              </h2>
              <Badge
                variant="secondary"
                className="ml-auto text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/10"
              >
                {Object.keys(categories).length}
              </Badge>
            </motion.div>

            <motion.div className="space-y-1" variants={sectionVariants}>
              {Object.keys(categories).map((category, index) => {
                const isActive = isActiveCategory(category);
                const itemCount = categories[category]?.length || 0;
                const isHovered = hoveredItem === `weapon-${category}`;

                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start group relative transition-all duration-300 rounded-lg overflow-hidden ${
                        isActive
                          ? "bg-gradient-to-r from-primary/90 to-blue-500/90 text-primary-foreground shadow-lg border-l-4 border-blue-400"
                          : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:backdrop-blur-sm"
                      }`}
                      onMouseEnter={() => setHoveredItem(`weapon-${category}`)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        href={getCategoryLink(category)}
                        className="flex items-center w-full relative z-10"
                      >
                        {/* Animated background for hover */}
                        <AnimatePresence>
                          {isHovered && !isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"
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
                                : "bg-muted group-hover:bg-blue-400"
                            }`}
                            animate={{
                              scale: isActive ? [1, 1.3, 1] : 1,
                              boxShadow: isActive
                                ? "0 0 8px rgba(96,165,250,0.5)"
                                : "none",
                            }}
                            transition={{
                              duration: 2,
                              repeat: isActive ? Infinity : 0,
                            }}
                          />
                          <span className="font-medium">{category}</span>
                          {itemCount > 0 && (
                            <Badge
                              variant={isActive ? "secondary" : "outline"}
                              className={`ml-auto text-xs transition-all duration-300 ${
                                isActive
                                  ? "bg-white/20 text-white border-white/30"
                                  : "hover:bg-blue-500/20 hover:border-blue-500/30"
                              }`}
                            >
                              {itemCount}
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
                          />
                        </motion.div>
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Agent Teams Section */}
          {agentTeams && agentTeams.length > 0 && (
            <motion.div
              className="space-y-3"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5"
                variants={itemVariants}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Agents
                </h2>
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-gradient-to-r from-green-500/20 to-blue-500/20 border-white/10"
                >
                  {agentTeams.length}
                </Badge>
              </motion.div>

              <motion.div className="space-y-1" variants={sectionVariants}>
                {agentTeams.map((team, index) => {
                  const isActive = isActiveAgentTeam(team);
                  const isHovered = hoveredItem === `agent-${team}`;

                  return (
                    <motion.div
                      key={team}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        asChild
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start group relative transition-all duration-300 rounded-lg overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-green-500/90 to-blue-500/90 text-primary-foreground shadow-lg border-l-4 border-green-400"
                            : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:backdrop-blur-sm"
                        }`}
                        onMouseEnter={() => setHoveredItem(`agent-${team}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Link
                          href={`/agents/${team.toLowerCase()}`}
                          className="flex items-center w-full relative z-10"
                        >
                          <AnimatePresence>
                            {isHovered && !isActive && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg"
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
                                  : "bg-muted group-hover:bg-green-400"
                              }`}
                              animate={{
                                scale: isActive ? [1, 1.3, 1] : 1,
                                boxShadow: isActive
                                  ? "0 0 8px rgba(34,197,94,0.5)"
                                  : "none",
                              }}
                              transition={{
                                duration: 2,
                                repeat: isActive ? Infinity : 0,
                              }}
                            />
                            <span className="font-medium">{team}</span>
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
                                  : "text-muted-foreground group-hover:text-green-400"
                              }`}
                            />
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Music Kits Section */}
          <motion.div
            className="space-y-3"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-white/5"
              variants={itemVariants}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                <Music className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Special
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                asChild
                variant={isMusicKitsActive() ? "default" : "ghost"}
                className={`w-full justify-start group relative transition-all duration-300 rounded-lg overflow-hidden ${
                  isMusicKitsActive()
                    ? "bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-primary-foreground shadow-lg border-l-4 border-purple-400"
                    : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:backdrop-blur-sm"
                }`}
                onMouseEnter={() => setHoveredItem("music-kits")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href="/music-kits"
                  className="flex items-center w-full relative z-10"
                >
                  <AnimatePresence>
                    {hoveredItem === "music-kits" && !isMusicKitsActive() && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg"
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
                        isMusicKitsActive()
                          ? "bg-white shadow-lg"
                          : "bg-muted group-hover:bg-purple-400"
                      }`}
                      animate={{
                        scale: isMusicKitsActive() ? [1, 1.3, 1] : 1,
                        boxShadow: isMusicKitsActive()
                          ? "0 0 8px rgba(147,51,234,0.5)"
                          : "none",
                      }}
                      transition={{
                        duration: 2,
                        repeat: isMusicKitsActive() ? Infinity : 0,
                      }}
                    />
                    <span className="font-medium">Music Kits</span>
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
                      <Sparkles className="w-3 h-3 text-purple-400 ml-1" />
                    </motion.div>
                  </div>
                  <motion.div
                    animate={{
                      x: hoveredItem === "music-kits" ? 4 : 0,
                      rotate: isMusicKitsActive() ? 90 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-colors ${
                        isMusicKitsActive()
                          ? "text-white"
                          : "text-muted-foreground group-hover:text-purple-400"
                      }`}
                    />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
