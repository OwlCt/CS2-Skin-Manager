export interface Keychain {
  id: string;
  name: string;
  description: string;
  def_index: string;
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  collections: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  market_hash_name: string;
  image: string;
  original: {
    loc_name: string;
    image_inventory: string;
  };
}

export interface KeychainSlot {
  id: string;
  pattern: number;
  seed: number;
  offset_x: number;
  offset_y: number;
}
