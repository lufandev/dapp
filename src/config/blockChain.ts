type NetworkConfiguration = {
  chainId: number;
  nftAddress: string;
  // 新增三个合约地址
  nftCoreAddress: string;
  nftSaleAddress: string;
  nftRentalAddress: string;
  params: {
    chainId: string;
    rpcUrls: string[];
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls: string[];
  }[];
};

const confs: NetworkConfiguration[] = [
  {
    chainId: 0x7a69,

    nftAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    // TODO: 部署后更新这些地址
    nftCoreAddress: "0x0000000000000000000000000000000000000000",
    nftSaleAddress: "0x0000000000000000000000000000000000000000",
    nftRentalAddress: "0x0000000000000000000000000000000000000000",

    params: [
      {
        chainId: "0x7A69",
        rpcUrls: ["http://127.0.0.1:8545/"],
        chainName: "localhost-hardhat",
        nativeCurrency: {
          name: "MYETH",
          symbol: "MYETH",
          decimals: 18,
        },
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
    ],
  },
  {
    chainId: 0xaa36a7,
    nftAddress: "0xf27b70557f83956823c3174bf7955660b7c13a4d",
    // TODO: 用你在Remix部署的实际地址替换这些
    nftCoreAddress: "0xd6902B0A99b7f101A1D4F0AF343061D1C6ffb7eA",
    nftSaleAddress: "0x12eFCAb5dD61d7c951748dDc661963723fC49157",
    nftRentalAddress: "0xf0ED65D6cF133c6960B7799C636c6ba8BD5E4b47",

    params: [
      {
        chainId: "0xaa36a7",
        rpcUrls: ["https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
        chainName: "Sepolia",
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        blockExplorerUrls: ["https://sepolia.etherscan.io/"],
      },
    ],
  },
];
export const configuration = () => confs[selection];
const selection = 1;
export const rpcUrl = () => {
  return confs[selection].params[0].rpcUrls[0];
};
export const IPFS = {
  domain: "127.0.0.1",
  url_prefix: "http://127.0.0.1:8080/ipfs/",
};
export const ARWEAVE = {
  domain: "127.0.0.1",
  port: 1984,
  protocol: "http",
  url_prefix: "http://127.0.0.1:1984/",
};
