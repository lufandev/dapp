// Ethereum provider types
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  send: (method: string, params?: any[]) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
} 