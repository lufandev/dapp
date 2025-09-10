import { ValueID, User } from "../types";

export const mockValueIDs: ValueID[] = [
  {
    id: "1",
    name: "Value ID #001",
    description: "这是一个独特的数字身份，具有收藏价值和实用性。",
    image: "/images/nft1.jpg",
    indexNumber: "VID-001-2023",
    price: 1299.99,
    owner: { id: "0x1234...5678", username: "用户1" },
    paymentAddress: "0x9876...5432",
    paymentCurrency: "ETH",
    rarity: "rare",
    isForSale: true,
    isForRent: true,
    rentalPrice: 99.99,
    rentalPeriod: 7,
    createdAt: "2023-01-15T08:30:00Z",
    attributes: [
      { traitType: "背景", value: "蓝色" },
      { traitType: "级别", value: "7" },
      { traitType: "稀有度", value: "稀有" },
    ],
    tokenId: "1",
    viewCount: 0,
    favoriteCount: 0,
  },
  {
    id: "2",
    name: "Value ID #042",
    description: "限量版数字身份，拥有独特特权和外观。",
    image: "/images/nft2.jpg",
    indexNumber: "VID-042-2023",
    price: 2499.99,
    owner: { id: "0xabcd...efgh", username: "用户2" },
    paymentAddress: "0xabcd...efgh",
    paymentCurrency: "USDT",
    rarity: "epic",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-02-20T14:15:00Z",
    attributes: [
      { traitType: "类型", value: "身份" },
      { traitType: "特权", value: "高级访问" },
      { traitType: "稀有度", value: "史诗" },
    ],
    tokenId: "2",
    viewCount: 0,
    favoriteCount: 0,
    rentalPrice: 199.99,
    rentalPeriod: 14,
  },
  {
    id: "3",
    name: "Value ID #128",
    description: "元宇宙中的高级身份，可用于特殊场景和活动。",
    image: "/images/nft1.jpg",
    indexNumber: "VID-128-2023",
    price: 5999.99,
    owner: { id: "0x9876...5432", username: "用户3" },
    paymentAddress: "0x9876...5432",
    paymentCurrency: "BTC",
    rarity: "legendary",
    isForSale: true,
    isForRent: true,
    rentalPrice: 299.99,
    rentalPeriod: 30,
    createdAt: "2023-03-05T10:45:00Z",
    attributes: [
      { traitType: "等级", value: "传奇" },
      { traitType: "权限", value: "全域" },
      { traitType: "稀有度", value: "传奇" },
    ],
    tokenId: "3",
    viewCount: 0,
    favoriteCount: 0,
  },
  {
    id: "4",
    name: "Value ID #076",
    description: "由知名设计师创作的限量版数字身份。",
    image: "/images/nft4.jpg",
    indexNumber: "VID-076-2023",
    price: 899.99,
    owner: { id: "0xefgh...ijkl", username: "用户4" },
    paymentAddress: "0xefgh...ijkl",
    paymentCurrency: "ETH",
    rarity: "uncommon",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-04-12T16:20:00Z",
    attributes: [
      { traitType: "设计师", value: "数字大师" },
      { traitType: "创作年份", value: "2023" },
      { traitType: "稀有度", value: "非凡" },
    ],
    tokenId: "4",
    viewCount: 0,
    favoriteCount: 0,
    rentalPrice: 79.99,
    rentalPeriod: 7,
  },
  {
    id: "5",
    name: "Value ID #215",
    description: "基础版数字身份，提供基本功能和权限。",
    image: "/images/nft5.jpg",
    indexNumber: "VID-215-2023",
    price: 499.99,
    owner: { id: "0xmnop...qrst", username: "用户5" },
    paymentAddress: "0xmnop...qrst",
    paymentCurrency: "USDT",
    rarity: "common",
    isForSale: true,
    isForRent: true,
    rentalPrice: 49.99,
    rentalPeriod: 14,
    createdAt: "2023-05-25T09:10:00Z",
    attributes: [
      { traitType: "类型", value: "基础" },
      { traitType: "权限等级", value: "1" },
      { traitType: "稀有度", value: "普通" },
    ],
    tokenId: "5",
    viewCount: 0,
    favoriteCount: 0,
  },
  {
    id: "6",
    name: "Value ID #033",
    description: "数字身份卡，限量发行。",
    image: "/images/nft2.jpg",
    indexNumber: "VID-033-2023",
    price: 799.99,
    owner: { id: "0xuvwx...yz12", username: "用户6" },
    paymentAddress: "0xuvwx...yz12",
    paymentCurrency: "ETH",
    rarity: "rare",
    isForSale: true,
    isForRent: true,
    createdAt: "2023-06-18T11:30:00Z",
    attributes: [
      { traitType: "系列", value: "先锋" },
      { traitType: "编号", value: "33/100" },
      { traitType: "稀有度", value: "稀有" },
    ],
    tokenId: "6",
    viewCount: 0,
    favoriteCount: 0,
    rentalPrice: 69.99,
    rentalPeriod: 10,
  },
];

// 为了保持兼容性
export const mockNFTs = mockValueIDs;

export const mockUser: User = {
  id: 1,
  address: "0x1234...5678",
  username: "数字藏家",
  balance: 1000,
  avatar: "/images/avatar.jpg",
  createdAt: "2023-01-01T00:00:00Z",
  ownedValueIDs: mockValueIDs.filter((id) => ["1", "3", "5"].includes(id.id)),
  rentedValueIDs: mockValueIDs.filter((id) => ["2", "4"].includes(id.id)),
  favorites: mockValueIDs.filter((id) => ["2", "6"].includes(id.id)),
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
    mockUser.favorites?.some(fav => fav.id === valueId.id)
  );
};
