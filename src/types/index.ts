export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  owner: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  isForSale: boolean;
  isForRent: boolean;
  rentalPrice?: number;
  rentalPeriod?: number;
  createdAt: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

export interface User {
  id: string;
  address: string;
  username: string;
  avatar: string;
  ownedNFTs: string[];
  rentedNFTs: string[];
}

export type TabType = "all" | "recommended" | "latest";
