import { Contract, BigNumberish, isAddress } from 'ethers';
import type { PriceInfo, PegStatus, BasketComposition, IndexInfo, CurrencyPriceInfo, BigNumber } from '../types';
import type { OracleService } from './OracleService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Implementation of OracleService for price and index data
 */
export class OracleServiceImpl implements OracleService {
  private contract: Contract;
  private contractAddress: string;
  private indexUpdateListeners: Map<string, (event: any) => void> = new Map();
  private pegDeviationListeners: Map<string, (event: any) => void> = new Map();
  private listenerCounter = 0;

  constructor(contract: Contract, contractAddress: string) {
    if (!contract) {
      throw new Error('Contract instance is required');
    }
    if (!contractAddress || !isAddress(contractAddress)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid contract address: ${contractAddress}`
      );
    }
    this.contract = contract;
    this.contractAddress = contractAddress;
  }

  /**
   * Validate an Ethereum address
   */
  private validateAddress(address: string, fieldName: string = 'address'): void {
    if (!address || !isAddress(address)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid ${fieldName}: ${address}`
      );
    }
  }

  /**
   * Validate a currency string
   */
  private validateCurrency(currency: string, fieldName: string = 'currency'): void {
    if (!currency || typeof currency !== 'string' || currency.length === 0) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_PARAMETERS,
        `Invalid ${fieldName}: ${currency}`
      );
    }
  }

  /**
   * Get current market price of LUKAS
   */
  async getCurrentPrice(): Promise<PriceInfo> {
    try {
      const price = await (this.contract as any).getCurrentPrice();

      // Validate response - must be a number-like value (BigInt, number, or string)
      if (price === null || price === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid price returned from contract'
        );
      }

      // Check if it's a valid numeric value
      let priceStr: string;
      try {
        if (typeof price === 'object' && !price.toString().match(/^\d+$/)) {
          throw new LukasSDKError(
            LukasSDKErrorCode.INVALID_RESPONSE,
            'Invalid price returned from contract'
          );
        }
        priceStr = price.toString();
        // Verify it's a valid numeric string
        if (!priceStr.match(/^\d+$/)) {
          throw new LukasSDKError(
            LukasSDKErrorCode.INVALID_RESPONSE,
            'Invalid price returned from contract'
          );
        }
      } catch (e) {
        if (e instanceof LukasSDKError) throw e;
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid price returned from contract'
        );
      }

      return {
        price: priceStr,
        decimals: 18, // Standard ERC-20 decimals
        timestamp: Math.floor(Date.now() / 1000),
        source: 'LatAmBasketIndex',
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get current price',
        error
      );
    }
  }

  /**
   * Get fair price from the oracle
   */
  async getFairPrice(): Promise<BigNumber> {
    try {
      const fairPrice = await (this.contract as any).getFairPrice();

      // Validate response - must be a number-like value
      if (fairPrice === null || fairPrice === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid fair price returned from contract'
        );
      }

      // Check if it's a valid numeric value
      let fairPriceStr: string;
      try {
        if (typeof fairPrice === 'object' && !fairPrice.toString().match(/^\d+$/)) {
          throw new LukasSDKError(
            LukasSDKErrorCode.INVALID_RESPONSE,
            'Invalid fair price returned from contract'
          );
        }
        fairPriceStr = fairPrice.toString();
        // Verify it's a valid numeric string
        if (!fairPriceStr.match(/^\d+$/)) {
          throw new LukasSDKError(
            LukasSDKErrorCode.INVALID_RESPONSE,
            'Invalid fair price returned from contract'
          );
        }
      } catch (e) {
        if (e instanceof LukasSDKError) throw e;
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid fair price returned from contract'
        );
      }

      return fairPriceStr;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get fair price',
        error
      );
    }
  }

  /**
   * Get index value in USD
   */
  async getIndexUSD(): Promise<IndexInfo> {
    try {
      const indexData = await (this.contract as any).getIndexUSD();

      // Validate response structure
      if (!indexData || typeof indexData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid index data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const valueUSD = indexData.valueUSD || indexData[0];
      const lastUpdated = indexData.lastUpdated || indexData[1];
      const isStale = indexData.isStale || indexData[2];

      if (valueUSD === null || valueUSD === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid index value in response'
        );
      }

      return {
        valueUSD: valueUSD.toString(),
        lastUpdated: Number(lastUpdated || 0),
        isStale: Boolean(isStale || false),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get index USD',
        error
      );
    }
  }

  /**
   * Get price for a specific currency
   */
  async getCurrencyPrice(currency: string): Promise<CurrencyPriceInfo> {
    try {
      this.validateCurrency(currency, 'currency');

      const currencyData = await (this.contract as any).getCurrencyPrice(currency);

      // Validate response structure
      if (!currencyData || typeof currencyData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          `Invalid currency price data for ${currency}`
        );
      }

      // Handle both tuple and object responses
      const currencySymbol = currencyData.currency || currencyData[0];
      const priceUSD = currencyData.priceUSD || currencyData[1];
      const lastUpdated = currencyData.lastUpdated || currencyData[2];
      const isStale = currencyData.isStale || currencyData[3];

      if (priceUSD === null || priceUSD === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          `Invalid price for currency ${currency}`
        );
      }

      return {
        currency: currencySymbol || currency,
        priceUSD: priceUSD.toString(),
        lastUpdated: Number(lastUpdated || 0),
        isStale: Boolean(isStale || false),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        `Failed to get price for currency ${currency}`,
        error
      );
    }
  }

  /**
   * Get peg status information
   */
  async getPegStatus(): Promise<PegStatus> {
    try {
      const pegData = await (this.contract as any).getPegStatus();

      // Validate response structure
      if (!pegData || typeof pegData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid peg status data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const poolPrice = pegData.poolPrice || pegData[0];
      const fairPrice = pegData.fairPrice || pegData[1];
      const deviation = pegData.deviation || pegData[2];
      const isOverPeg = pegData.isOverPeg || pegData[3];
      const shouldStabilize = pegData.shouldStabilize || pegData[4];

      // Validate required fields
      if (poolPrice === null || poolPrice === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid pool price in peg status'
        );
      }
      if (fairPrice === null || fairPrice === undefined) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid fair price in peg status'
        );
      }

      return {
        poolPrice: poolPrice.toString(),
        fairPrice: fairPrice.toString(),
        deviation: Number(deviation || 0),
        isOverPeg: Boolean(isOverPeg || false),
        shouldStabilize: Boolean(shouldStabilize || false),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get peg status',
        error
      );
    }
  }

  /**
   * Get basket composition with currency weights and prices
   */
  async getBasketComposition(): Promise<BasketComposition> {
    try {
      const basketData = await (this.contract as any).getBasketComposition();

      // Validate response structure
      if (!basketData || typeof basketData !== 'object') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid basket composition data returned from contract'
        );
      }

      // Handle both tuple and object responses
      const currencies = basketData.currencies || basketData[0];
      const weights = basketData.weights || basketData[1];
      const prices = basketData.prices || basketData[2];
      const lastUpdated = basketData.lastUpdated || basketData[3];

      // Validate required fields
      if (!Array.isArray(currencies) || currencies.length === 0) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid currencies array in basket composition'
        );
      }
      if (!Array.isArray(weights) || weights.length !== currencies.length) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid weights array in basket composition'
        );
      }
      if (!Array.isArray(prices) || prices.length !== currencies.length) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid prices array in basket composition'
        );
      }

      // Convert prices to strings
      const priceStrings = prices.map((p: any) => p.toString());

      // Convert lastUpdated to numbers if provided
      const lastUpdatedNumbers = Array.isArray(lastUpdated)
        ? lastUpdated.map((t: any) => Number(t || 0))
        : currencies.map(() => Math.floor(Date.now() / 1000));

      return {
        currencies,
        weights: weights.map((w: any) => Number(w)),
        prices: priceStrings,
        lastUpdated: lastUpdatedNumbers,
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get basket composition',
        error
      );
    }
  }

  /**
   * Check if any price feeds are stale
   */
  async hasStaleFeeds(): Promise<boolean> {
    try {
      const isStale = await (this.contract as any).hasStaleFeeds();

      // Validate response
      if (typeof isStale !== 'boolean') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid stale feeds status returned from contract'
        );
      }

      return isStale;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to check stale feeds',
        error
      );
    }
  }

  /**
   * Subscribe to IndexUpdate events
   */
  onIndexUpdate(callback: (event: any) => void): () => void {
    const listenerId = `indexUpdate_${this.listenerCounter++}`;
    this.indexUpdateListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const indexUpdateFilter = (this.contract as any).filters.IndexUpdate?.();
    if (indexUpdateFilter) {
      const listener = (newValue: BigNumberish, timestamp: BigNumberish, event: any) => {
        const indexUpdateEvent = {
          newValue: newValue.toString(),
          timestamp: Number(timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };
        callback(indexUpdateEvent);
      };

      (this.contract as any).on(indexUpdateFilter, listener);

      // Return unsubscribe function
      return () => {
        this.indexUpdateListeners.delete(listenerId);
        (this.contract as any).off(indexUpdateFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.indexUpdateListeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to PegDeviation events
   */
  onPegDeviation(callback: (event: any) => void): () => void {
    const listenerId = `pegDeviation_${this.listenerCounter++}`;
    this.pegDeviationListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const pegDeviationFilter = (this.contract as any).filters.PegDeviation?.();
    if (pegDeviationFilter) {
      const listener = (
        poolPrice: BigNumberish,
        fairPrice: BigNumberish,
        deviationBps: BigNumberish,
        isOverPeg: boolean,
        event: any
      ) => {
        const pegDeviationEvent = {
          poolPrice: poolPrice.toString(),
          fairPrice: fairPrice.toString(),
          deviationBps: Number(deviationBps),
          isOverPeg,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Math.floor(Date.now() / 1000),
        };
        callback(pegDeviationEvent);
      };

      (this.contract as any).on(pegDeviationFilter, listener);

      // Return unsubscribe function
      return () => {
        this.pegDeviationListeners.delete(listenerId);
        (this.contract as any).off(pegDeviationFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.pegDeviationListeners.delete(listenerId);
    };
  }
}
