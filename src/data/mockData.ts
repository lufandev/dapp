import { NFT, User } from "../types";

export const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "数字藏品 #001",
    description: "这是一个独特的数字藏品，具有收藏价值和实用性。",
    image: "/images/nft1.jpg",
    price: 1299.99,
    owner: "0x1234...5678",
    rarity: "rare",
    isForSale: true,
    isForRent: true,
    rentalPrice: 99.99,
    rentalPeriod: 7,
    createdAt: "2023-01-15T08:30:00Z",
    attributes: [
      { trait_type: "背景", value: "蓝色" },
      { trait_type: "级别", value: "7" },
      { trait_type: "稀有度", value: "稀有" },
    ],
  },
  {
    id: "2",
    name: "限量版角色 #042",
    description: "游戏中的限量版角色，拥有独特技能和外观。",
    image: "/images/nft2.jpg",
    price: 2499.99,
    owner: "0xabcd...efgh",
    rarity: "epic",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-02-20T14:15:00Z",
    attributes: [
      { trait_type: "类型", value: "角色" },
      { trait_type: "技能", value: "隐身" },
      { trait_type: "稀有度", value: "史诗" },
    ],
  },
  {
    id: "3",
    name: "虚拟地块 #128",
    description: "元宇宙中的虚拟地块，可用于建造和开发。",
    image: "/images/nft1.jpg",
    price: 5999.99,
    owner: "0x9876...5432",
    rarity: "legendary",
    isForSale: true,
    isForRent: true,
    rentalPrice: 299.99,
    rentalPeriod: 30,
    createdAt: "2023-03-05T10:45:00Z",
    attributes: [
      { trait_type: "面积", value: "500平方米" },
      { trait_type: "位置", value: "中心区" },
      { trait_type: "稀有度", value: "传奇" },
    ],
  },
  {
    id: "4",
    name: "数字艺术品 #076",
    description: "由知名数字艺术家创作的限量版艺术品。",
    image: "/images/nft4.jpg",
    price: 899.99,
    owner: "0xefgh...ijkl",
    rarity: "uncommon",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-04-12T16:20:00Z",
    attributes: [
      { trait_type: "艺术家", value: "数字大师" },
      { trait_type: "创作年份", value: "2023" },
      { trait_type: "稀有度", value: "非凡" },
    ],
  },
  {
    id: "5",
    name: "游戏道具 #215",
    description: "游戏中的稀有道具，提供独特能力。",
    image: "/images/nft5.jpg",
    price: 499.99,
    owner: "0xmnop...qrst",
    rarity: "common",
    isForSale: true,
    isForRent: true,
    rentalPrice: 49.99,
    rentalPeriod: 14,
    createdAt: "2023-05-25T09:10:00Z",
    attributes: [
      { trait_type: "类型", value: "武器" },
      { trait_type: "攻击力", value: "85" },
      { trait_type: "稀有度", value: "普通" },
    ],
  },
  {
    id: "6",
    name: "收藏卡片 #033",
    description: "数字收藏卡片，限量发行。",
    image: "/images/nft2.jpg",
    price: 799.99,
    owner: "0xuvwx...yz12",
    rarity: "rare",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-06-18T11:30:00Z",
    attributes: [
      { trait_type: "系列", value: "英雄" },
      { trait_type: "编号", value: "33/100" },
      { trait_type: "稀有度", value: "稀有" },
    ],
  },
];

export const mockUser: User = {
  id: "1",
  address: "0x1234...5678",
  username: "数字藏家",
  balance: 1000,
  avatar: "/images/avatar.jpg",
  ownedNFTs: ["1", "3", "5"],
  rentedNFTs: ["2", "4"],
  favoriteNFTs: ["2", "6"],
};

export const getRecommendedNFTs = (): NFT[] => {
  return mockNFTs.filter(
    (nft) => nft.rarity === "epic" || nft.rarity === "legendary"
  );
};

export const getLatestNFTs = (): NFT[] => {
  return [...mockNFTs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getNFTById = (id: string): NFT | undefined => {
  return mockNFTs.find((nft) => nft.id === id);
};

export const getRentalNFTs = (): NFT[] => {
  return mockNFTs.filter((nft) => nft.isForRent);
};

export const getFavoriteNFTs = (): NFT[] => {
  return mockNFTs.filter((nft) => mockUser.favoriteNFTs.includes(nft.id));
};
