type NetworkConfiguration = {
  chainId: number;
  nftAddress: string;
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

    params: [
      {
        chainId: "0xaa36a7",
        rpcUrls: ["http://127.0.0.1:8545/"],
        chainName: "Sepolia",
        nativeCurrency: {
          name: "NFT",
          symbol: "NFT",
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
