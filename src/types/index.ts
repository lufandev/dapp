export interface ValueID {
  id: string;
  name: string;
  description: string;
  image: string;
  indexNumber: string; // 索引号
  price: number;
  owner: string; // 持有人地址
  paymentAddress?: string; // 支付地址
  paymentCurrency?: string; // 支付币种
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

// 为了保持兼容性，保留NFT类型别名
export type NFT = ValueID;

export interface User {
  id: string;
  address: string;
  username: string;
  avatar: string;
  ownedNFTs: string[];
  rentedNFTs: string[];
  favoriteNFTs: string[];
  balance: number;
}

export type TabType = "all" | "recommended" | "latest";
