// Auto-generated weapon mappings from CS:GO API
// Generated on: 2025-10-31T07:28:29.092Z

// --- KNIVES ---
export const KNIFE_DEFINDEXES: number[] = [500, 503, 505, 506, 507, 508, 509, 512, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 525, 526];

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

// --- GLOVES ---
export const GLOVE_DEFINDEXES: number[] = [4725, 5027, 5030, 5031, 5032, 5033, 5034, 5035];

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

// --- WEAPONS ---
export const WEAPON_DEFINDEXES: number[] = [1, 2, 3, 4, 7, 8, 9, 10, 11, 13, 14, 16, 17, 19, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 39, 40, 60, 61, 63, 64];

export const WEAPON_MAPPING: Record<number, string> = {
  1: "weapon_deagle",
  2: "weapon_elite",
  3: "weapon_fiveseven",
  4: "weapon_glock",
  7: "weapon_ak47",
  8: "weapon_aug",
  9: "weapon_awp",
  10: "weapon_famas",
  11: "weapon_g3sg1",
  13: "weapon_galilar",
  14: "weapon_m249",
  16: "weapon_m4a1",
  17: "weapon_mac10",
  19: "weapon_p90",
  23: "weapon_mp5sd",
  24: "weapon_ump45",
  25: "weapon_xm1014",
  26: "weapon_bizon",
  27: "weapon_mag7",
  28: "weapon_negev",
  29: "weapon_sawedoff",
  30: "weapon_tec9",
  31: "weapon_taser",
  32: "weapon_hkp2000",
  33: "weapon_mp7",
  34: "weapon_mp9",
  35: "weapon_nova",
  36: "weapon_p250",
  38: "weapon_scar20",
  39: "weapon_sg556",
  40: "weapon_ssg08",
  60: "weapon_m4a1_silencer",
  61: "weapon_usp_silencer",
  63: "weapon_cz75a",
  64: "weapon_revolver",
};

// --- HELPER FUNCTIONS ---
export const getKnifeName = (defindex: number): string | undefined => KNIFE_MAPPING[defindex];
export const getGloveName = (defindex: number): string | undefined => GLOVE_MAPPING[defindex];
export const getWeaponName = (defindex: number): string | undefined => WEAPON_MAPPING[defindex];

export const isKnife = (defindex: number): boolean => KNIFE_DEFINDEXES.includes(defindex);
export const isGlove = (defindex: number): boolean => GLOVE_DEFINDEXES.includes(defindex);
