import { ValueID, User } from "../types";

export const mockValueIDs: ValueID[] = [
  {
    id: "1",
    name: "Value ID #001",
    description: "这是一个独特的数字身份，具有收藏价值和实用性。",
    image: "/images/nft1.jpg",
    indexNumber: "VID-001-2023",
    price: 1299.99,
    owner: "0x1234...5678",
    paymentAddress: "0x9876...5432",
    paymentCurrency: "ETH",
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
    name: "Value ID #042",
    description: "限量版数字身份，拥有独特特权和外观。",
    image: "/images/nft2.jpg",
    indexNumber: "VID-042-2023",
    price: 2499.99,
    owner: "0xabcd...efgh",
    paymentAddress: "0xabcd...efgh",
    paymentCurrency: "USDT",
    rarity: "epic",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-02-20T14:15:00Z",
    attributes: [
      { trait_type: "类型", value: "身份" },
      { trait_type: "特权", value: "高级访问" },
      { trait_type: "稀有度", value: "史诗" },
    ],
  },
  {
    id: "3",
    name: "Value ID #128",
    description: "元宇宙中的高级身份，可用于特殊场景和活动。",
    image: "/images/nft1.jpg",
    indexNumber: "VID-128-2023",
    price: 5999.99,
    owner: "0x9876...5432",
    paymentAddress: "0x9876...5432",
    paymentCurrency: "BTC",
    rarity: "legendary",
    isForSale: true,
    isForRent: true,
    rentalPrice: 299.99,
    rentalPeriod: 30,
    createdAt: "2023-03-05T10:45:00Z",
    attributes: [
      { trait_type: "等级", value: "传奇" },
      { trait_type: "权限", value: "全域" },
      { trait_type: "稀有度", value: "传奇" },
    ],
  },
  {
    id: "4",
    name: "Value ID #076",
    description: "由知名设计师创作的限量版数字身份。",
    image: "/images/nft4.jpg",
    indexNumber: "VID-076-2023",
    price: 899.99,
    owner: "0xefgh...ijkl",
    paymentAddress: "0xefgh...ijkl",
    paymentCurrency: "ETH",
    rarity: "uncommon",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-04-12T16:20:00Z",
    attributes: [
      { trait_type: "设计师", value: "数字大师" },
      { trait_type: "创作年份", value: "2023" },
      { trait_type: "稀有度", value: "非凡" },
    ],
  },
  {
    id: "5",
    name: "Value ID #215",
    description: "基础版数字身份，提供基本功能和权限。",
    image: "/images/nft5.jpg",
    indexNumber: "VID-215-2023",
    price: 499.99,
    owner: "0xmnop...qrst",
    paymentAddress: "0xmnop...qrst",
    paymentCurrency: "USDT",
    rarity: "common",
    isForSale: true,
    isForRent: true,
    rentalPrice: 49.99,
    rentalPeriod: 14,
    createdAt: "2023-05-25T09:10:00Z",
    attributes: [
      { trait_type: "类型", value: "基础" },
      { trait_type: "权限等级", value: "1" },
      { trait_type: "稀有度", value: "普通" },
    ],
  },
  {
    id: "6",
    name: "Value ID #033",
    description: "数字身份卡，限量发行。",
    image: "/images/nft2.jpg",
    indexNumber: "VID-033-2023",
    price: 799.99,
    owner: "0xuvwx...yz12",
    paymentAddress: "0xuvwx...yz12",
    paymentCurrency: "ETH",
    rarity: "rare",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-06-18T11:30:00Z",
    attributes: [
      { trait_type: "系列", value: "先锋" },
      { trait_type: "编号", value: "33/100" },
      { trait_type: "稀有度", value: "稀有" },
    ],
  },
];

// 为了保持兼容性
export const mockNFTs = mockValueIDs;

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

export const getRecommendedNFTs = (): ValueID[] => {
  return mockValueIDs.filter(
    (id) => id.rarity === "epic" || id.rarity === "legendary"
  );
};

export const getLatestNFTs = (): ValueID[] => {
  return [...mockValueIDs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getNFTById = (id: string): ValueID | undefined => {
  return mockValueIDs.find((valueId) => valueId.id === id);
};

export const getRentalNFTs = (): ValueID[] => {
  return mockValueIDs.filter((valueId) => valueId.isForRent);
};

export const getFavoriteNFTs = (): ValueID[] => {
  return mockValueIDs.filter((valueId) =>
    mockUser.favoriteNFTs.includes(valueId.id)
  );
};
