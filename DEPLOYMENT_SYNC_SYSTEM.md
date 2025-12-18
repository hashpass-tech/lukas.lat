# Deployment Sync System

## Overview

This document describes the comprehensive deployment tracking and synchronization system implemented for the Lukas Protocol.

## Problem Statement

Before this system:
- Contract addresses were scattered across multiple files
- SDK, web app, and documentation could have mismatched addresses
- Updating deployments required manual changes in multiple places
- No single source of truth for contract addresses
- Risk of inconsistencies and errors

## Solution

A centralized deployment tracking system with automatic synchronization across all components.

## Architecture

```
packages/contracts/deployments.json (Source of Truth)
                    |
                    v
        scripts/sync-deployments.js
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
      SDK      Web App      Docs
```

## Components

### 1. deployments.json

**Location:** `packages/contracts/deployments.json`

**Purpose:** Single source of truth for all contract addresses across all networks

**Structure:**
```json
{
  "networks": {
    "80002": {
      "name": "Polygon Amoy Testnet",
      "chainId": 80002,
      "rpcUrl": "https://rpc-amoy.polygon.technology",
      "blockExplorer": "https://amoy.polygonscan.com",
      "contracts": {
        "LukasToken": {
          "address": "0x...",
          "deployedAt": "2025-12-17T20:10:24.158Z",
          "deployer": "0x...",
          "version": "1.0.0",
          "verified": false
        }
      }
    }
  }
}
```

### 2. Sync Script

**Location:** `scripts/sync-deployments.js`

**Purpose:** Automatically propagate deployment addresses to all dependent files

**What it updates:**
- SDK NetworkManager (`packages/lukas-sdk/src/core/NetworkManager.ts`)
- Web App Config (`apps/web/src/lib/web3-config.ts`)
- Documentation (`apps/docs/docs/contracts/deployments.md`)

**Usage:**
```bash
npm run sync-deployments
```

### 3. Documentation

**Location:** `apps/docs/docs/contracts/deployments.md`

**Purpose:** Public-facing documentation of all deployed contracts

**Features:**
- Lists all contract addresses per network
- Shows deployment status and verification status
- Provides usage examples
- Includes network information
- Tracks deployment history

### 4. Deployment Workflow Documentation

**Location:** `packages/contracts/DEPLOYMENTS.md`

**Purpose:** Internal documentation for deployment process

**Contents:**
- Step-by-step deployment workflow
- Verification instructions
- Troubleshooting guide
- Best practices
- Security considerations

## Workflow

### Deploying New Contracts

1. **Deploy Contract**
   ```bash
   forge script script/DeployContract.s.sol --broadcast --verify
   ```

2. **Update deployments.json**
   ```json
   {
     "ContractName": {
       "address": "0xNEW_ADDRESS",
       "deployedAt": "2025-12-17T...",
       "deployer": "0x...",
       "version": "1.0.0",
       "verified": true
     }
   }
   ```

3. **Run Sync Script**
   ```bash
   npm run sync-deployments
   ```

4. **Review Changes**
   ```bash
   git diff
   ```

5. **Commit Everything**
   ```bash
   git add .
   git commit -m "chore(contracts): update deployment addresses"
   ```

### Updating Existing Deployments

Same workflow as above - just update the address in `deployments.json` and run the sync script.

## Benefits

### 1. Consistency
- Single source of truth eliminates inconsistencies
- All components always use the same addresses
- Reduces human error

### 2. Maintainability
- One file to update instead of many
- Automated propagation reduces manual work
- Clear documentation of deployment process

### 3. Traceability
- Deployment history tracked in git
- Timestamps and deployer addresses recorded
- Version tracking for contracts

### 4. Developer Experience
- Simple workflow for deployments
- Clear documentation
- Automated tooling reduces friction

### 5. Safety
- Verification status tracked
- Network-specific configurations
- Validation in sync script

## Files Created/Modified

### New Files
- `packages/contracts/deployments.json` - Source of truth
- `packages/contracts/DEPLOYMENTS.md` - Deployment workflow docs
- `packages/contracts/TASK_7_VERIFICATION.md` - Verification tracking
- `apps/docs/docs/contracts/deployments.md` - Public documentation
- `scripts/sync-deployments.js` - Sync automation script

### Modified Files
- `package.json` - Added sync-deployments script
- `apps/docs/sidebars.js` - Added deployments to navigation

## Usage Examples

### For SDK Users

The SDK automatically uses the correct addresses:

```typescript
import { LukasSDK } from '@lukas/sdk';

const sdk = new LukasSDK({
  network: {
    chainId: 80002,
    name: 'amoy',
  },
});

// Automatically uses addresses from deployments.json
const contractManager = sdk.getContractManager();
```

### For Web App Developers

```typescript
import { getContractAddresses } from '@/lib/web3-config';

const addresses = getContractAddresses(80002);
console.log(addresses.lukasToken); // 0x...
```

### For Direct Contract Interaction

```typescript
import deployments from '@lukas/contracts/deployments.json';

const lukasTokenAddress = deployments.networks['80002'].contracts.LukasToken.address;
```

## Maintenance

### Adding New Networks

1. Add network to `deployments.json`:
   ```json
   {
     "networks": {
       "1": {
         "name": "Ethereum Mainnet",
         "chainId": 1,
         "rpcUrl": "https://eth.llamarpc.com",
         "blockExplorer": "https://etherscan.io",
         "contracts": { ... }
       }
     }
   }
   ```

2. Run sync script:
   ```bash
   npm run sync-deployments
   ```

3. Commit changes

### Adding New Contracts

1. Add contract to relevant networks in `deployments.json`:
   ```json
   {
     "NewContract": {
       "address": "0x...",
       "deployedAt": "2025-12-17T...",
       "deployer": "0x...",
       "version": "1.0.0",
       "verified": false
     }
   }
   ```

2. Run sync script
3. Update SDK types if needed
4. Commit changes

### Updating Addresses

1. Update address in `deployments.json`
2. Run sync script
3. Test SDK and web app
4. Commit changes

## Future Improvements

Potential enhancements:

- [ ] Automatic address extraction from Foundry broadcasts
- [ ] CI/CD integration for automatic syncing
- [ ] Deployment notifications (Discord, Telegram)
- [ ] Multi-signature deployment workflows
- [ ] Automated contract verification
- [ ] Deployment rollback capabilities
- [ ] Address validation and checksums
- [ ] Network health monitoring
- [ ] Gas price tracking for deployments

## Security Considerations

- Never commit private keys
- Always verify addresses before updating
- Test on testnet before mainnet
- Use multi-sig for mainnet deployments
- Audit contracts before mainnet deployment
- Verify contracts on block explorers
- Monitor deployed contracts for issues

## Testing

### Manual Testing

After running sync script:

1. **SDK Test:**
   ```bash
   cd packages/lukas-sdk
   npm test
   ```

2. **Web App Test:**
   ```bash
   cd apps/web
   npm run build
   ```

3. **Documentation Test:**
   ```bash
   cd apps/docs
   npm run build
   ```

### Automated Testing

Future: Add automated tests to verify:
- deployments.json is valid JSON
- All required fields are present
- Addresses are valid Ethereum addresses
- Sync script successfully updates all files
- No address mismatches across files

## Troubleshooting

### Sync Script Fails

**Problem:** Script exits with error

**Solutions:**
- Check deployments.json is valid JSON
- Ensure all required fields are present
- Check file permissions
- Review error message for specific issue

### Address Mismatch

**Problem:** Different addresses in different files

**Solutions:**
- Verify deployments.json is correct
- Run `npm run sync-deployments`
- Check git diff to see what changed
- Commit if changes are correct

### SDK Not Using New Addresses

**Problem:** SDK still uses old addresses

**Solutions:**
- Verify NetworkManager.ts was updated
- Rebuild SDK: `cd packages/lukas-sdk && npm run build`
- Clear node_modules and reinstall
- Check you're using correct network ID

## Support

For questions or issues:

- **GitHub Issues:** [Report an issue](https://github.com/lukas-protocol/lukas/issues)
- **Discord:** [Join our community](https://discord.gg/lukas)
- **Email:** dev@lukas.money

## Changelog

### 2025-12-17
- Initial implementation of deployment tracking system
- Created deployments.json as source of truth
- Implemented sync-deployments script
- Added comprehensive documentation
- Integrated with SDK, web app, and docs

---

**Last Updated:** December 17, 2025

**Version:** 1.0.0
