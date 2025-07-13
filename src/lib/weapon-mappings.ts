export const KNIFE_DEFINDEXES = [
  500, 503, 505, 506, 507, 508, 509, 512, 514, 515, 516, 517, 518, 519, 520,
  521, 522, 523, 525, 526,
];

export const KNIFE_MAPPING: Record<number, string> = {
  500: "weapon_bayonet",
  503: "weapon_knife_css",
  505: "weapon_knife_flip",
  506: "weapon_knife_gut",
  507: "weapon_knife_karambit",
  508: "weapon_knife_m9_bayonet",
  509: "weapon_knife_tactical",
  512: "weapon_knife_falchion",
  514: "weapon_knife_survival_bowie",
  515: "weapon_knife_butterfly",
  516: "weapon_knife_push",
  517: "weapon_knife_cord",
  518: "weapon_knife_canis",
  519: "weapon_knife_ursus",
  520: "weapon_knife_gypsy_jackknife",
  521: "weapon_knife_outdoor",
  522: "weapon_knife_stiletto",
  523: "weapon_knife_widowmaker",
  525: "weapon_knife_skeleton",
  526: "weapon_knife_kukri",
};

export const GLOVE_DEFINDEXES = [
  4725, 5027, 5030, 5031, 5032, 5033, 5034, 5035,
];

export const GLOVE_MAPPING: Record<number, string> = {
  4725: "studded_brokenfang_gloves",
  5027: "studded_bloodhound_gloves",
  5030: "sporty_gloves",
  5031: "slick_gloves",
  5032: "leather_handwraps",
  5033: "motorcycle_gloves",
  5034: "specialist_gloves",
  5035: "studded_hydra_gloves",
};

export const getKnifeName = (weaponDefindex: number): string => {
  return KNIFE_MAPPING[weaponDefindex] || "weapon_knife";
};

export const getGloveName = (weaponDefindex: number): string => {
  return GLOVE_MAPPING[weaponDefindex] || "leather_handwraps";
};

export const isKnife = (weaponDefindex: number): boolean => {
  return KNIFE_DEFINDEXES.includes(weaponDefindex);
};

export const isGlove = (weaponDefindex: number): boolean => {
  return GLOVE_DEFINDEXES.includes(weaponDefindex);
};
