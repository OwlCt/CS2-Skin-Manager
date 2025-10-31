export interface Sticker {
  id: string;
  name: string;
  description: string;
  def_index: string;
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  crates: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  collections: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  type: string;
  market_hash_name: string | null;
  effect: string;
  tournament?: {
    id: number;
    name: string;
  };
  image: string;
  original: {
    name: string;
    image_inventory: string;
  };
}

export interface StickerSlot {
  id: string;
  wear: number;
  rotation: number;
  x: number;
  y: number;
  scale: number;
  tint: number;
}
