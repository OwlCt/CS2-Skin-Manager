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

// Team-specific weapon defindexes
// T-only weapons (team value: 2)
export const T_ONLY_DEFINDEXES = [
  7,  // weapon_ak47
  13, // weapon_galilar
  39, // weapon_sg556
  17, // weapon_mac10
  30, // weapon_tec9
  29, // weapon_sawedoff
  4,  // weapon_glock
  11, // weapon_g3sg1
];

// CT-only weapons (team value: 3)
export const CT_ONLY_DEFINDEXES = [
  16, // weapon_m4a1
  60, // weapon_m4a1_silencer
  10, // weapon_famas
  8,  // weapon_aug
  34, // weapon_mp9
  27, // weapon_mag7
  3,  // weapon_fiveseven
  32, // weapon_hkp2000
  61, // weapon_usp_silencer
  38, // weapon_scar20
];

/**
 * Check if a weapon is T-only
 */
export const isTOnly = (weaponDefindex: number): boolean => {
  return T_ONLY_DEFINDEXES.includes(weaponDefindex);
};

/**
 * Check if a weapon is CT-only
 */
export const isCTOnly = (weaponDefindex: number): boolean => {
  return CT_ONLY_DEFINDEXES.includes(weaponDefindex);
};

/**
 * Check if a weapon is team-specific (either T-only or CT-only)
 */
export const isTeamSpecific = (weaponDefindex: number): boolean => {
  return isTOnly(weaponDefindex) || isCTOnly(weaponDefindex);
};

/**
 * Get the required team for a weapon
 * @returns 2 for T-only, 3 for CT-only, 0 for both teams
 */
export const getRequiredTeam = (weaponDefindex: number): number => {
  if (isTOnly(weaponDefindex)) return 2;
  if (isCTOnly(weaponDefindex)) return 3;
  return 0;
};
