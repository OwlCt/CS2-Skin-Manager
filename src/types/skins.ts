export interface Skins {
  weapon_defindex: number;
  weapon_name: string;
  paint: null | number;
  image: string;
  paint_name: string;
  legacy_model: boolean;
  team: number;
  category: Category;
  phase?: string;
}

export enum Category {
  Equipment = "Equipment",
  Gloves = "Gloves",
  Heavy = "Heavy",
  Knives = "Knives",
  Pistols = "Pistols",
  Rifles = "Rifles",
  SMGs = "SMGs",
}

export enum Name {
  Classified = "Classified",
  ConsumerGrade = "Consumer Grade",
  Contraband = "Contraband",
  Covert = "Covert",
  Extraordinary = "Extraordinary",
  IndustrialGrade = "Industrial Grade",
  MilSpecGrade = "Mil-Spec Grade",
  Restricted = "Restricted",
}

export interface CategoryObj {
  name: string;
  icon: string | null;
  items: string[];
}

export interface UserSkinConfig {
  skins: Array<{
    steamid: string;
    weapon_team: number;
    weapon_defindex: number;
    weapon_paint_id: number;
    weapon_wear: number;
    weapon_seed: number;
    weapon_nametag?: string | null;
    weapon_stattrak: boolean;
    weapon_stattrak_count: number;
    weapon_sticker_0?: string;
    weapon_sticker_1?: string;
    weapon_sticker_2?: string;
    weapon_sticker_3?: string;
    weapon_sticker_4?: string;
    weapon_keychain?: string;
  }>;
  knives: Array<{
    steamid: string;
    weapon_team: number;
    knife: string;
  }>;
  gloves: Array<{
    steamid: string;
    weapon_team: number;
    weapon_defindex: number;
  }>;
}
