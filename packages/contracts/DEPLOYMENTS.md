# Contract Deployments

This document explains the contract deployment tracking system for the Lukas Protocol.

## Overview

The Lukas Protocol uses a centralized deployment tracking system to ensure consistency across:
- Smart Contracts
- SDK
- Web Application
- Documentation

## Source of Truth

**`deployments.json`** is the single source of truth for all contract addresses across all networks.

### Structure

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

## Deployment Workflow

### 1. Deploy Contracts

Deploy contracts using Foundry:

```bash
# Deploy to testnet
forge script script/DeployLukasToken.s.sol:DeployLukasToken \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify

# Deploy StabilizerVault
forge script script/DeployStabilizerVault.s.sol:DeployStabilizerVault \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

### 2. Update deployments.json

After deployment, update `deployments.json` with the new contract addresses:

```json
{
  "networks": {
    "80002": {
      "contracts": {
        "LukasToken": {
          "address": "0xNEW_ADDRESS_HERE",
          "deployedAt": "2025-12-17T20:10:24.158Z",
          "deployer": "0xDEPLOYER_ADDRESS",
          "version": "1.0.0",
          "verified": false
        }
      }
    }
  }
}
```

### 3. Sync Across Codebase

Run the sync script to update all dependent files:

```bash
npm run sync-deployments
```

This will automatically update:
- SDK: `packages/lukas-sdk/src/core/NetworkManager.ts`
- Web App: `apps/web/src/lib/web3-config.ts`
- Documentation: `apps/docs/docs/contracts/deployments.md`

### 4. Verify Changes

Review the changes made by the sync script:

```bash
git diff
```

### 5. Commit Changes

Commit all changes together:

```bash
git add packages/contracts/deployments.json
git add packages/lukas-sdk/src/core/NetworkManager.ts
git add apps/web/src/lib/web3-config.ts
git add apps/docs/docs/contracts/deployments.md
git commit -m "chore(contracts): update deployment addresses for [network]"
```

## Deployment Checklist

When deploying new contracts:

- [ ] Deploy contract using Foundry
- [ ] Verify contract on block explorer
- [ ] Update `deployments.json` with new address
- [ ] Run `npm run sync-deployments`
- [ ] Test SDK with new addresses
- [ ] Test web app with new addresses
- [ ] Update documentation if needed
- [ ] Commit all changes
- [ ] Tag release if appropriate

## Network-Specific Information

### Polygon Amoy Testnet (80002)

- **RPC URL:** https://rpc-amoy.polygon.technology
- **Block Explorer:** https://amoy.polygonscan.com
- **Faucet:** https://faucet.polygon.technology
- **Chain ID:** 80002

**Current Deployments:**
- LukasToken: `0xaee0f26589a21ba4547765f630075262f330f1cb`
- StabilizerVault: `0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3`
- USDC (Testnet): `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`

### Polygon Mainnet (137)

- **RPC URL:** https://polygon-rpc.com
- **Block Explorer:** https://polygonscan.com
- **Chain ID:** 137

**Status:** Not yet deployed

## Verification

### Verify on PolygonScan

```bash
forge verify-contract \
  --chain-id 80002 \
  --num-of-optimizations 200 \
  --watch \
  --constructor-args $(cast abi-encode "constructor(uint256)" 1000000000000000000000000) \
  --etherscan-api-key $POLYGONSCAN_API_KEY \
  --compiler-version v0.8.24+commit.e11b9ed9 \
  0xCONTRACT_ADDRESS \
  src/ContractName.sol:ContractName
```

### Update Verification Status

After verification, update `deployments.json`:

```json
{
  "LukasToken": {
    "address": "0x...",
    "verified": true  // Update this
  }
}
```

Then run `npm run sync-deployments` again.

## Troubleshooting

### Sync Script Fails

If the sync script fails:

1. Check that `deployments.json` is valid JSON
2. Ensure all required fields are present
3. Check file permissions
4. Review error messages for specific issues

### Address Mismatch

If addresses don't match across files:

1. Check `deployments.json` is correct
2. Run `npm run sync-deployments`
3. Verify changes with `git diff`
4. Commit if correct

### SDK Not Using New Addresses

If the SDK isn't using new addresses:

1. Verify `NetworkManager.ts` was updated
2. Rebuild the SDK: `cd packages/lukas-sdk && npm run build`
3. Clear node_modules and reinstall if needed
4. Check that you're using the correct network ID

## Best Practices

1. **Always update deployments.json first** - It's the source of truth
2. **Run sync script immediately** - Don't manually edit dependent files
3. **Commit atomically** - Commit all deployment-related changes together
4. **Test before committing** - Verify SDK and web app work with new addresses
5. **Document changes** - Add notes to deployment commits
6. **Tag releases** - Tag important deployment milestones

## Automated Deployment (Future)

Future improvements may include:

- Automatic deployment address extraction from Foundry broadcasts
- CI/CD integration for automatic syncing
- Deployment notifications
- Multi-signature deployment workflows
- Automated verification

## Security Considerations

- **Never commit private keys** - Use environment variables
- **Verify addresses** - Always double-check addresses before updating
- **Test on testnet first** - Deploy to testnet before mainnet
- **Use multi-sig for mainnet** - Consider using Gnosis Safe for mainnet deployments
- **Audit before mainnet** - Get contracts audited before mainnet deployment

## Support

For questions or issues:

- **GitHub Issues:** [Report an issue](https://github.com/lukas-protocol/lukas/issues)
- **Discord:** [Join our community](https://discord.gg/lukas)
- **Email:** dev@lukas.money

## Changelog

### 2025-12-17
- Created deployment tracking system
- Added sync-deployments script
- Documented deployment workflow
- Initial testnet deployments

---

**Last Updated:** December 17, 2025
