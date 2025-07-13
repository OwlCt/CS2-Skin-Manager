"use client";

import { useMemo, useState } from "react";
import BaseCard from "@/components/ui/BaseCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MusicKit } from "@/types/music-kit";
import { Search } from "lucide-react";
import { toast } from "sonner";

type MusicKitGridProps = {
  kits: MusicKit[];
  team?: number;
};

const MusicKitGrid: React.FC<MusicKitGridProps> = ({ kits, team }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter music kits based on search
  const filteredKits = useMemo(() => {
    if (!searchQuery.trim()) return kits;
    
    const query = searchQuery.toLowerCase().trim();
    return kits.filter(kit => 
      kit.name.toLowerCase().includes(query)
    );
  }, [kits, searchQuery]);

  const handleMusicKitClick = async (kit: MusicKit) => {
    toast.loading("Loading...", {
      id: "musickit-loading",
    });

    setIsLoading(true);
    try {
      const response = await fetch("/api/music-kits/config", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team: 0, // For now update for both teams until i have a better way to handle this
          defIndex: kit.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Failed to save music kit configuration",
          {
            id: "musickit-loading",
          }
        );

        return;
      }

      toast.success("Music kit configuration saved successfully", {
        id: "musickit-loading"
      });
    } catch (error) {
      console.error("Failed to save music kit config:", error);
      toast.error("Failed to save music kit configuration", {
        id: "musickit-loading"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Music Kits</h1>
            <Badge variant="secondary">
              {filteredKits.length} kit{filteredKits.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search music kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Music Kits Grid */}
      {filteredKits.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredKits.map((kit) => (
            <BaseCard
              key={kit.id}
              imageSrc={kit.image}
              alt={kit.name}
              onClick={() => handleMusicKitClick(kit)}
              nameBar={
                <div
                  className="w-full rounded-br rounded-bl px-2 py-1"
                  style={{
                    background: "rgba(30, 32, 40, 0.45)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  <p
                    className="text-sm font-medium truncate text-center w-full transition-colors"
                    style={{ color: "#cbd5e1" }}
                  >
                    {kit.name.includes("|")
                      ? kit.name.split("|")[1].trim()
                      : kit.name}
                  </p>
                  {isLoading && (
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Saving...
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No music kits found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No music kits match your search "${searchQuery}".`
              : "No music kits are available."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicKitGrid;
