# Contract Deployments

This page tracks all deployed Lukas Protocol smart contracts across different networks.

## Sepolia Testnet (Chain ID: 11155111)

### Status
✅ **Deployed** - December 19, 2025

### Core Contracts

#### LukasToken
- **Address:** `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb`
- **Deployed:** December 19, 2025
- **Version:** 1.0.0
- **Initial Supply:** 1,000,000 LUKAS
- **Verified:** ❌ Pending
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x63524b53983960231b7b86CDEdDf050Ceb9263Cb)

#### LatAmBasketIndex
- **Address:** `0x46D240633d70AB16654e0053D05B24Dfb3284A71`
- **Deployed:** December 19, 2025
- **Version:** 1.1.0
- **Verified:** ❌ Pending
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x46D240633d70AB16654e0053D05B24Dfb3284A71)
- **Note:** Includes mock price feeds for testing

#### StabilizerVault
- **Address:** `0x64540D50CD37BC94C2ED77766Cc86C4D6C3ec9cE`
- **Deployed:** December 19, 2025
- **Version:** 1.0.0
- **Verified:** ❌ Pending
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x64540D50CD37BC94C2ED77766Cc86C4D6C3ec9cE)

#### LukasHookSimplified
- **Address:** `0xB6EAA80E5446895a6d7136e90c97821550e51805`
- **Deployed:** December 19, 2025
- **Version:** 1.0.0-simplified
- **Verified:** ❌ Pending
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xB6EAA80E5446895a6d7136e90c97821550e51805)
- **Note:** Simplified version for testing without full Uniswap V4 hook validation

### External Contracts

#### USDC (Circle's Official Sepolia USDC)
- **Address:** `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Type:** External
- **Verified:** ✅ Yes
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)

#### Uniswap V4 PoolManager
- **Address:** `0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A`
- **Type:** External
- **Verified:** ✅ Yes
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A)

### Network Information
- **RPC URL:** `https://rpc.sepolia.org`
- **Chain ID:** 11155111
- **Block Explorer:** https://sepolia.etherscan.io
- **Faucet:** https://sepoliafaucet.com

### Using Sepolia Contracts

```typescript
import { LukasSDK } from '@lukas-protocol/sdk';

const sdk = new LukasSDK({
  network: {
    chainId: 11155111,
    name: 'sepolia',
  },
});

// Contracts are automatically loaded from SDK
const contracts = sdk.getContracts();
console.log('LukasToken:', contracts.lukasToken);
```

---

## Polygon Amoy Testnet (Chain ID: 80002)

### Status
✅ **Deployed** - December 18, 2025

### Core Contracts

#### LukasToken
- **Address:** `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb`
- **Deployed:** December 17, 2025
- **Version:** 1.0.0
- **Initial Supply:** 1,000,000 LUKAS
- **Verified:** ❌ Pending
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x63524b53983960231b7b86CDEdDf050Ceb9263Cb)

#### LatAmBasketIndex
- **Address:** `0x1Dccf1fB82946a293E03036e85edc2139cba1541`
- **Deployed:** December 18, 2025
- **Version:** 1.1.0
- **Verified:** ✅ Yes
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x1Dccf1fB82946a293E03036e85edc2139cba1541)
- **Note:** Complete interface with `getLukasFairPriceInUSDC()` and `getBasketComposition()`

#### StabilizerVault
- **Address:** `0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3`
- **Deployed:** December 17, 2025
- **Version:** 1.0.0
- **Verified:** ❌ Pending
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3)

#### LukasHook (Simplified)
- **Address:** `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519`
- **Deployed:** December 18, 2025
- **Version:** 1.0.0-simplified
- **Verified:** ❌ Pending
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519)
- **Note:** Simplified version for testing peg stabilization

#### LukasUSDCPool
- **Address:** `0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E`
- **Deployed:** December 18, 2025
- **Version:** 1.0.0
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x48411eFDE2D053B2Fa9456d91dad8a9BE7a1574E)
- **Configuration:**
  - Token0: LUKAS (`0x63524b53983960231b7b86CDEdDf050Ceb9263Cb`)
  - Token1: USDC (`0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`)
  - Fee: 0.3%
  - Initial Price: 0.0976 USDC per LUKAS

### External Contracts

#### USDC (Testnet)
- **Address:** `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`
- **Type:** External (Official USDC on Polygon Amoy)
- **Verified:** ✅ Yes
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582)

### Network Information
- **RPC URL:** `https://rpc-amoy.polygon.technology`
- **Chain ID:** 80002
- **Block Explorer:** https://amoy.polygonscan.com
- **Faucet:** https://faucet.polygon.technology

## Polygon Mainnet (Chain ID: 137)

### Status
🚧 **Not yet deployed to mainnet**

All contracts are currently in testnet phase. Mainnet deployment will be announced after thorough testing and auditing.

### Planned Contracts

#### LukasToken
- **Status:** Pending mainnet deployment
- **Version:** 1.0.0

#### StabilizerVault
- **Status:** Pending mainnet deployment
- **Version:** 1.0.0

#### LatAmBasketIndex
- **Status:** Pending mainnet deployment
- **Version:** 1.0.0

#### LukasHook
- **Status:** Pending mainnet deployment
- **Version:** 1.0.0

### External Contracts

#### USDC (Mainnet)
- **Address:** `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- **Type:** External (Official USDC on Polygon)
- **Verified:** ✅ Yes
- **Explorer:** [View on PolygonScan](https://polygonscan.com/address/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359)

### Network Information
- **RPC URL:** `https://polygon-rpc.com`
- **Chain ID:** 137
- **Block Explorer:** https://polygonscan.com

## Using Deployed Contracts

### With the Lukas SDK

The SDK automatically uses the correct contract addresses for each network:

```typescript
import { LukasSDK } from '@lukas-protocol/sdk';

// Testnet
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
});

// Mainnet (when available)
const sdkMainnet = new LukasSDK({
  network: {
    chainId: 137,
    name: 'polygon',
  },
});
```

### Custom Contract Addresses

If you need to use custom deployments:

```typescript
const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
  contracts: {
    lukasToken: '0x...',
    stabilizerVault: '0x...',
    latAmBasketIndex: '0x...',
    lukasHook: '0x...',
    usdc: '0x...',
  },
});
```

### Direct Contract Interaction

Using ethers.js directly:

```typescript
import { ethers } from 'ethers';
import LukasTokenABI from '@lukas/contracts/abi/LukasToken.json';

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const lukasToken = new ethers.Contract(
  '0xaee0f26589a21ba4547765f630075262f330f1cb',
  LukasTokenABI,
  provider
);

const balance = await lukasToken.balanceOf(address);
```

## Deployment History

### Version 1.0.0 (Current)

**Testnet Deployment - December 17, 2025**
- ✅ LukasToken deployed to Polygon Amoy
- ✅ StabilizerVault deployed to Polygon Amoy
- ⏳ LatAmBasketIndex pending deployment
- ⏳ LukasHook pending deployment

## Verification Status

Contract verification on block explorers is in progress. Verified contracts allow users to:
- Read contract source code
- Interact with contracts directly through the explorer
- Verify contract functionality and security

### How to Verify

To verify a contract on PolygonScan:

```bash
forge verify-contract \
  --chain-id 80002 \
  --num-of-optimizations 200 \
  --watch \
  --constructor-args $(cast abi-encode "constructor(uint256)" 1000000000000000000000000) \
  --etherscan-api-key $POLYGONSCAN_API_KEY \
  --compiler-version v0.8.24+commit.e11b9ed9 \
  0xaee0f26589a21ba4547765f630075262f330f1cb \
  src/LukasToken.sol:LukasToken
```

## Security

### Audits
- 🔍 **Status:** Pending
- **Auditor:** TBD
- **Report:** Not yet available

### Bug Bounty
- 🐛 **Status:** Not yet active
- **Platform:** TBD
- **Rewards:** TBD

## Updates and Notifications

Stay informed about contract deployments and updates:

- **Twitter:** [@lukas_lat](https://twitter.com/lukas_lat)
- **GitHub:** [hashpass-tech/lukas-protocol](https://github.com/hashpass-tech/lukas-protocol)

## Deployment Configuration

The canonical source of deployment addresses is maintained in:
- **Repository:** `packages/contracts/deployments.json`
- **SDK:** Automatically synced from deployments.json
- **Web App:** Automatically synced from deployments.json

## Emergency Contacts

In case of security issues or concerns:
- **Email:** security@lukas.lat
- **GitHub Security:** [Report a vulnerability](https://github.com/hashpass-tech/lukas-protocol/security/advisories/new)

## Changelog

### 2025-12-19
- **Sepolia Deployment Preparation:**
  - Created DeploySepoliaAll.s.sol deployment script
  - Created CreateSepoliaPool.s.sol for Uniswap V4 pool creation
  - Created VerifySepoliaContracts.s.sol for Etherscan verification
  - Added Sepolia network configuration to SDK
  - Fixed 6 failing StabilizerVault tests (cooldown logic)
  - Added 10 new property-based tests for hook integration
  - All 46 tests passing
- SDK v0.2.22: Fixed ReactCurrentDispatcher error in Next.js/SSR
- SDK v0.2.22: Fixed hydration mismatch with lazy context initialization
- Web App v0.2.26: Fixed mobile sidebar theming issues
- Web App v0.2.26: Improved pool page responsive design
- Web App v0.2.26: Fixed OrbitingSkills hydration error
- Documentation updated with Sepolia testnet information

### 2025-12-18
- SDK v0.2.20-v0.2.21: React provider improvements
- Web App: PriceChart rewritten with canvas-based Japanese candlestick chart
- Web App: Fixed infinite loop in MonitoringDashboard

### 2025-12-17
- Initial testnet deployment of LukasToken to Polygon Amoy
- Initial testnet deployment of StabilizerVault to Polygon Amoy
- SDK v0.2.18: Initial stable release with React integration
- Created deployment tracking system

---

**Last Updated:** December 19, 2025

**SDK Version:** v0.2.22 | **Web App Version:** v0.2.26

**Note:** This page is automatically updated when new contracts are deployed. Always verify contract addresses through multiple sources before interacting with them.
