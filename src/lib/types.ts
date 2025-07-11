// This file will be the single source of truth for our data structures.

// Basic reusable interface
export interface ItemInfo {
  id: string;
  name: string;
}

// Interfaces for nested objects within a Skin
export interface Weapon extends ItemInfo {
  weapon_id: number;
  type?: string; // Optional type field for agents
}

export interface Rarity extends ItemInfo {
  color: string;
}

// The main Skin object type
export interface Skin {
  id: string;
  name: string;
  description: string;
  weapon: Weapon;
  category: ItemInfo;
  pattern: ItemInfo;
  min_float: number;
  max_float: number;
  rarity: Rarity;
  stattrak: boolean;
  souvenir: boolean;
  paint_index: string | number;
  wears: ItemInfo[];
  collections: ItemInfo[];
  team: ItemInfo;
  legacy_model: boolean;
  image: string;
  phase?: string; // Optional property for Dopplers, etc.
}

// Type for the processed data (after removing `crates`)
export type ProcessedSkin = Omit<Skin, "crates"> & { crates?: any[] };

// Type for a collection of skins for one weapon (e.g., all AK-47 skins)
export type WeaponSkins = ProcessedSkin[];

// Type for a collection of weapons within a category (e.g., all Pistols)
export type WeaponData = Record<string, WeaponSkins>;

// Type for the entire skins.json structure
export type SkinsData = Record<string, WeaponData>;

export interface SessionData {
  steamId?: string;
  username?: string;
  avatar?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  def_index: string;
  rarity: Rarity;
  collections: Collection[];
  team: Team;
  market_hash_name: string;
  image: string;
  model_player: string;
}

export interface Collection {
  id: CollectionID;
  name: CollectionName;
  image: string;
}

export enum CollectionID {
  CollectionSetOp10Characters = "collection-set-op10-characters",
  CollectionSetOp11Characters = "collection-set-op11-characters",
  CollectionSetOp9Characters = "collection-set-op9-characters",
}

export enum CollectionName {
  BrokenFangAgents = "Broken Fang Agents",
  OperationRiptideAgents = "Operation Riptide Agents",
  ShatteredWebAgents = "Shattered Web Agents",
}

export interface Rarity {
  id: RarityID;
  name: RarityName;
  color: string;
}

export enum RarityID {
  RarityAncientCharacter = "rarity_ancient_character",
  RarityLegendaryCharacter = "rarity_legendary_character",
  RarityMythicalCharacter = "rarity_mythical_character",
  RarityRareCharacter = "rarity_rare_character",
}

export enum RarityName {
  Distinguished = "Distinguished",
  Exceptional = "Exceptional",
  Master = "Master",
  Superior = "Superior",
}

export interface Team {
  id: TeamID;
  name: TeamName;
}

export enum TeamID {
  CounterTerrorists = "counter-terrorists",
  Terrorists = "terrorists",
}

export enum TeamName {
  CounterTerrorist = "Counter-Terrorist",
  Terrorist = "Terrorist",
}

export interface MusicKit {
  id: string;
  name: string;
  description: string;
  def_index: string;
  rarity: string;
  market_hash_name: null | string;
  exclusive: boolean;
  image: string;
}
