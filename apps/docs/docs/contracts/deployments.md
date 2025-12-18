# Contract Deployments

This page tracks all deployed Lukas Protocol smart contracts across different networks.

## Polygon Amoy Testnet (Chain ID: 80002)

### Core Contracts

#### LukasToken
- **Address:** `0xaee0f26589a21ba4547765f630075262f330f1cb`
- **Deployed:** December 17, 2025
- **Version:** 1.0.0
- **Verified:** ❌ Pending
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0xaee0f26589a21ba4547765f630075262f330f1cb)

#### StabilizerVault
- **Address:** `0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3`
- **Deployed:** December 17, 2025
- **Version:** 1.0.0
- **Verified:** ❌ Pending
- **Explorer:** [View on Amoy PolygonScan](https://amoy.polygonscan.com/address/0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3)

#### LatAmBasketIndex
- **Address:** TBD
- **Status:** Not yet deployed
- **Version:** 1.0.0

#### LukasHook
- **Address:** TBD
- **Status:** Not yet deployed
- **Version:** 1.0.0

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
import { LukasSDK } from '@lukas/sdk';

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

- **Twitter:** [@lukaslatam](https://twitter.com/lukaslatam)
- **Discord:** [Join our community](https://discord.gg/lukas)
- **GitHub:** [lukas-protocol/lukas](https://github.com/lukas-protocol/lukas)

## Deployment Configuration

The canonical source of deployment addresses is maintained in:
- **Repository:** `packages/contracts/deployments.json`
- **SDK:** Automatically synced from deployments.json
- **Web App:** Automatically synced from deployments.json

## Emergency Contacts

In case of security issues or concerns:
- **Email:** security@lukas.money
- **GitHub Security:** [Report a vulnerability](https://github.com/lukas-protocol/lukas/security/advisories/new)

## Changelog

### 2025-12-17
- Initial testnet deployment of LukasToken
- Initial testnet deployment of StabilizerVault
- Created deployment tracking system

---

**Last Updated:** December 17, 2025

**Note:** This page is automatically updated when new contracts are deployed. Always verify contract addresses through multiple sources before interacting with them.
