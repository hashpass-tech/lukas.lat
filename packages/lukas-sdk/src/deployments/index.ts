/**
 * Contract Deployments
 * 
 * This file provides access to deployed contract addresses across different networks.
 * The deployments.json file is automatically synced from packages/contracts/deployments.json
 * using the sync-sdk-deployments.js script.
 */

import deploymentsData from '../../deployments.json';
import type { ContractAddresses } from '../core/types';

export interface DeploymentInfo {
  address: string | null;
  deployedAt: string | null;
  deployer: string | null;
  version: string;
  verified: boolean;
  note?: string;
}

export interface NetworkDeployment {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  contracts: Record<string, DeploymentInfo>;
}

export interface Deployments {
  networks: Record<string, NetworkDeployment>;
  lastUpdated: string;
  version: string;
}

/**
 * Get all deployments
 */
export function getDeployments(): Deployments {
  return deploymentsData as Deployments;
}

/**
 * Get deployment for a specific network
 */
export function getNetworkDeployment(chainId: number): NetworkDeployment | null {
  const deployments = getDeployments();
  return deployments.networks[chainId.toString()] || null;
}

/**
 * Get contract addresses for a specific network
 * Returns zero addresses for contracts that are not deployed
 */
export function getContractAddresses(chainId: number): ContractAddresses {
  const network = getNetworkDeployment(chainId);
  
  if (!network) {
    console.warn(`No deployments found for chain ID ${chainId}`);
    return getZeroAddresses();
  }

  const normalizeAddress = (address: string | null | undefined): string => {
    if (!address || address === '0x...' || address === 'null') {
      return '0x0000000000000000000000000000000000000000';
    }
    return address;
  };

  return {
    lukasToken: normalizeAddress(network.contracts.LukasToken?.address),
    stabilizerVault: normalizeAddress(network.contracts.StabilizerVault?.address),
    latAmBasketIndex: normalizeAddress(network.contracts.LatAmBasketIndex?.address),
    lukasHook: normalizeAddress(network.contracts.LukasHook?.address),
    usdc: normalizeAddress(network.contracts.USDC?.address),
    poolManager: normalizeAddress(network.contracts.LukasUSDCPool?.address),
  };
}

/**
 * Get zero addresses for all contracts
 */
export function getZeroAddresses(): ContractAddresses {
  return {
    lukasToken: '0x0000000000000000000000000000000000000000',
    stabilizerVault: '0x0000000000000000000000000000000000000000',
    latAmBasketIndex: '0x0000000000000000000000000000000000000000',
    lukasHook: '0x0000000000000000000000000000000000000000',
    usdc: '0x0000000000000000000000000000000000000000',
    poolManager: '0x0000000000000000000000000000000000000000',
  };
}

/**
 * Check if a contract is deployed on a network
 */
export function isContractDeployed(
  chainId: number,
  contractName: keyof ContractAddresses
): boolean {
  const addresses = getContractAddresses(chainId);
  const address = addresses[contractName];
  return address !== '0x0000000000000000000000000000000000000000';
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  const deployments = getDeployments();
  return Object.keys(deployments.networks).map(id => parseInt(id, 10));
}
