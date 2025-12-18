export type Web3Network = {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrencySymbol: string;
  rpcUrl?: string;
  explorerBaseUrl: string;
};

export const WEB3_NETWORKS: Web3Network[] = [
  {
    chainId: 1,
    name: "Ethereum Mainnet",
    shortName: "Mainnet",
    nativeCurrencySymbol: "ETH",
    explorerBaseUrl: "https://etherscan.io",
  },
  {
    chainId: 80002,
    name: "Polygon Amoy Testnet",
    shortName: "Amoy",
    nativeCurrencySymbol: "MATIC",
    explorerBaseUrl: "https://amoy.polygonscan.com",
  },
  {
    chainId: 11155111,
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    nativeCurrencySymbol: "ETH",
    explorerBaseUrl: "https://sepolia.etherscan.io",
  },
];

export type VerifiedContract = {
  name: string;
  address: string;
};

export const VERIFIED_CONTRACTS_BY_CHAIN: Record<number, VerifiedContract[]> = {
  1: [],
  80002: [],
  11155111: [],
};

export function getNetworkByChainId(chainId: number | null | undefined): Web3Network | undefined {
  if (!chainId) return undefined;
  return WEB3_NETWORKS.find((n) => n.chainId === chainId);
}

export function formatChainIdHex(chainId: number): `0x${string}` {
  return (`0x${chainId.toString(16)}`) as `0x${string}`;
}
