import { Contract, Provider, Signer, Interface } from 'ethers';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';
import type { ContractAddresses } from './types';

/**
 * Basic ERC-20 ABI for token interactions
 */
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Basic Stabilizer Vault ABI (placeholder - will be replaced with actual ABI)
 */
const STABILIZER_VAULT_ABI = [
  'function getVaultInfo() view returns (tuple(uint256 maxMintPerAction, uint256 maxBuybackPerAction, uint256 deviationThreshold, uint256 cooldownPeriod, uint256 lastStabilization, uint256 totalMinted, uint256 totalBoughtBack))',
  'function getCollateralBalance() view returns (tuple(uint256 usdc, uint256 lukas, uint256 totalValueUSD))',
  'function isAuthorized(address account) view returns (bool)',
  'function shouldStabilize(uint256 poolPrice) view returns (tuple(bool shouldStabilize, bool isOverPeg, uint256 deviationBps, uint256 recommendedAmount, bool canExecute, string reason))',
  'function stabilizeMint(uint256 amount, address recipient) returns (bool)',
  'function stabilizeBuyback(uint256 amount) returns (bool)',
  'event StabilizationMint(uint256 amount, uint256 poolPrice, uint256 fairPrice, address recipient)',
  'event StabilizationBuyback(uint256 amount, uint256 poolPrice, uint256 fairPrice)',
];

/**
 * Basic LatAm Basket Index Oracle ABI (placeholder - will be replaced with actual ABI)
 */
const LATAM_BASKET_INDEX_ABI = [
  'function getCurrentPrice() view returns (uint256)',
  'function getFairPrice() view returns (uint256)',
  'function getIndexUSD() view returns (tuple(uint256 valueUSD, uint256 lastUpdated, bool isStale))',
  'function getCurrencyPrice(string currency) view returns (tuple(string currency, uint256 priceUSD, uint256 lastUpdated, bool isStale))',
  'function getPegStatus() view returns (tuple(uint256 poolPrice, uint256 fairPrice, uint256 deviation, bool isOverPeg, bool shouldStabilize))',
  'function getBasketComposition() view returns (tuple(string[] currencies, uint256[] weights, uint256[] prices, uint256[] lastUpdated))',
  'function hasStaleFeeds() view returns (bool)',
  'event IndexUpdate(uint256 newValue, uint256 timestamp)',
  'event PegDeviation(uint256 poolPrice, uint256 fairPrice, uint256 deviationBps, bool isOverPeg)',
];

/**
 * Basic Lukas Hook ABI (placeholder - will be replaced with actual ABI)
 */
const LUKAS_HOOK_ABI = [
  'function addLiquidity(uint256 lukasAmount, uint256 usdcAmount) returns (uint256 liquidity)',
  'function removeLiquidity(uint256 liquidity) returns (uint256 lukasAmount, uint256 usdcAmount)',
  'function getLiquidityPosition(address account) view returns (tuple(uint256 liquidity, uint256 lukasAmount, uint256 usdcAmount))',
  'event LiquidityAdded(address indexed account, uint256 lukasAmount, uint256 usdcAmount, uint256 liquidity)',
  'event LiquidityRemoved(address indexed account, uint256 lukasAmount, uint256 usdcAmount, uint256 liquidity)',
];

/**
 * Basic Uniswap V4 PoolManager ABI (placeholder - will be replaced with actual ABI)
 */
const POOL_MANAGER_ABI = [
  'function getSlot0(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns (tuple(uint160 sqrtPriceX96, int24 tick, uint16 protocolFee, uint8 unlocked))',
  'function getLiquidity(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns (uint128)',
  'function getPoolId(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns (bytes32)',
  'event Swap(bytes32 indexed poolId, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  'event Mint(bytes32 indexed poolId, address indexed sender, int24 tickLower, int24 tickUpper, uint128 amount, bytes hookData)',
  'event Burn(bytes32 indexed poolId, address indexed sender, int24 tickLower, int24 tickUpper, uint128 amount)',
];

/**
 * Contract manager for managing contract instances and ABI handling
 */
export class ContractManager {
  private contracts: Map<string, Contract> = new Map();
  private provider: Provider | null = null;
  private signer: Signer | null = null;
  private addresses: ContractAddresses;

  constructor(addresses: ContractAddresses, provider?: Provider, signer?: Signer) {
    this.addresses = addresses;
    this.provider = provider || null;
    this.signer = signer || null;
    
    this.validateContractAddresses();
    this.initializeContracts();
  }

  /**
   * Update provider and reinitialize contracts
   */
  updateProvider(provider: Provider, signer?: Signer): void {
    this.provider = provider;
    this.signer = signer || null;
    this.initializeContracts();
  }

  /**
   * Update signer and reinitialize contracts
   */
  updateSigner(signer: Signer): void {
    this.signer = signer;
    this.initializeContracts();
  }

  /**
   * Update contract addresses and reinitialize contracts
   */
  updateAddresses(addresses: ContractAddresses): void {
    this.addresses = addresses;
    this.validateContractAddresses();
    this.initializeContracts();
  }

  /**
   * Get LUKAS token contract
   */
  getLukasTokenContract(): Contract {
    const contract = this.contracts.get('lukasToken');
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'LUKAS token contract not initialized'
      );
    }
    return contract;
  }

  /**
   * Get USDC token contract
   */
  getUSDCContract(): Contract {
    const contract = this.contracts.get('usdc');
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'USDC token contract not initialized'
      );
    }
    return contract;
  }

  /**
   * Get Stabilizer Vault contract
   */
  getStabilizerVaultContract(): Contract {
    const contract = this.contracts.get('stabilizerVault');
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'Stabilizer Vault contract not initialized'
      );
    }
    return contract;
  }

  /**
   * Get LatAm Basket Index contract
   */
  getLatAmBasketIndexContract(): Contract {
    const contract = this.contracts.get('latAmBasketIndex');
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'LatAm Basket Index contract not initialized'
      );
    }
    return contract;
  }

  /**
   * Get Lukas Hook contract
   */
  getLukasHookContract(): Contract {
    const contract = this.contracts.get('lukasHook');
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'Lukas Hook contract not initialized'
      );
    }
    return contract;
  }

  /**
   * Get PoolManager contract
   */
  getPoolManagerContract(): Contract {
    const contract = this.contracts.get('poolManager');
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        'PoolManager contract not initialized'
      );
    }
    return contract;
  }

  /**
   * Get contract by name
   */
  getContract(name: keyof ContractAddresses): Contract {
    const contract = this.contracts.get(name);
    if (!contract) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_NOT_DEPLOYED,
        `Contract ${name} not initialized`
      );
    }
    return contract;
  }

  /**
   * Check if contracts are initialized
   */
  areContractsInitialized(): boolean {
    return this.contracts.size > 0;
  }

  /**
   * Get current contract addresses
   */
  getAddresses(): ContractAddresses {
    return { ...this.addresses };
  }

  /**
   * Validate contract addresses format
   */
  private validateContractAddresses(): void {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;

    Object.entries(this.addresses).forEach(([key, address]) => {
      if (!addressRegex.test(address)) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_ADDRESS,
          `Invalid contract address for ${key}: ${address}`
        );
      }
    });
  }

  /**
   * Initialize all contract instances
   */
  private initializeContracts(): void {
    this.contracts.clear();

    if (!this.provider) {
      return; // Cannot initialize contracts without provider
    }

    try {
      // Initialize LUKAS token contract
      this.contracts.set(
        'lukasToken',
        new Contract(
          this.addresses.lukasToken,
          ERC20_ABI,
          this.signer || this.provider
        )
      );

      // Initialize USDC token contract
      this.contracts.set(
        'usdc',
        new Contract(
          this.addresses.usdc,
          ERC20_ABI,
          this.signer || this.provider
        )
      );

      // Initialize Stabilizer Vault contract
      this.contracts.set(
        'stabilizerVault',
        new Contract(
          this.addresses.stabilizerVault,
          STABILIZER_VAULT_ABI,
          this.signer || this.provider
        )
      );

      // Initialize LatAm Basket Index contract
      this.contracts.set(
        'latAmBasketIndex',
        new Contract(
          this.addresses.latAmBasketIndex,
          LATAM_BASKET_INDEX_ABI,
          this.signer || this.provider
        )
      );

      // Initialize Lukas Hook contract
      this.contracts.set(
        'lukasHook',
        new Contract(
          this.addresses.lukasHook,
          LUKAS_HOOK_ABI,
          this.signer || this.provider
        )
      );

      // Initialize PoolManager contract
      this.contracts.set(
        'poolManager',
        new Contract(
          this.addresses.poolManager,
          POOL_MANAGER_ABI,
          this.signer || this.provider
        )
      );
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to initialize contracts',
        error
      );
    }
  }

  /**
   * Validate ABI format
   */
  static validateABI(abi: any[]): void {
    if (!Array.isArray(abi)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_RESPONSE,
        'ABI must be an array'
      );
    }

    try {
      new Interface(abi);
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_RESPONSE,
        'Invalid ABI format',
        error
      );
    }
  }

  /**
   * Create contract instance with custom ABI
   */
  static createContract(
    address: string,
    abi: any[],
    providerOrSigner: Provider | Signer
  ): Contract {
    // Validate address
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid contract address: ${address}`
      );
    }

    // Validate ABI
    ContractManager.validateABI(abi);

    try {
      return new Contract(address, abi, providerOrSigner);
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to create contract instance',
        error
      );
    }
  }
}