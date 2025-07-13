"use client";

import { useMemo } from "react";
import WeaponCard from "./WeaponCard";

interface WeaponListProps {
  categoryName: string;
  weapons: string[];
  categoryRoute: string;
  baseWeapons?: Record<string, Record<string, string>>;
}

export default function WeaponList({
  categoryName,
  weapons,
  categoryRoute,
  baseWeapons,
}: WeaponListProps) {
  const weaponsDisplay = useMemo(() => {
    if (!baseWeapons) return null;

    return weapons.map((weapon) => {
      const weaponData = baseWeapons[weapon];

      if (!weaponData) return false;

      return (
        <WeaponCard
          key={weapon}
          weaponKey={weapon}
          displayName={weaponData.name}
          imagePath={weaponData.image}
          categoryRoute={categoryRoute}
        />
      );
    });
  }, [weapons, categoryRoute]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 capitalize">{categoryName}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weaponsDisplay}
      </div>
    </div>
  );
}
