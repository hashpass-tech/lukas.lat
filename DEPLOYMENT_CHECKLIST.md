# Deployment Checklist

**Last Updated**: December 18, 2025
**Target Network**: Polygon Amoy Testnet (Chain ID: 80002)

## Pre-Deployment Verification

- [x] All contracts compile successfully (Solidity 0.8.26)
- [x] Core tests passing (LukasToken, LatAmBasketIndex 100%)
- [x] Deployment scripts created and tested
- [x] Type conflicts resolved (IPoolManager types)
- [x] BaseHook vendored to avoid library conflicts
- [ ] Environment variables configured
- [ ] Deployer wallet funded with MATIC (min 1 MATIC)
- [ ] Private key and RPC URL secured

## Deployment Sequence

### Phase 1: Oracle Deployment
- [ ] Deploy LatAmBasketIndex
  - Script: `DeployLatAmBasketIndex.s.sol`
  - Expected: 5 mock price feeds (BRL, MXN, ARS, CLP, COP)
  - Record address: `___________________________`
  - Verify on PolygonScan: [ ]

### Phase 2: Uniswap V4 Core
- [ ] Deploy PoolManager
  - Script: `DeployUniswapV4.s.sol`
  - Gas limit: 500,000
  - Record address: `___________________________`
  - Verify on PolygonScan: [ ]

- [ ] Verify PoolSwapTest deployed
  - Record address: `___________________________`
  
- [ ] Verify PoolModifyLiquidityTest deployed
  - Record address: `___________________________`

### Phase 3: Hook Deployment
- [ ] Update DeployLukasHook.s.sol with addresses
  - [ ] basketIndex address
  - [ ] stabilizerVault address
  - [ ] LUKAS token address
  - [ ] USDC token address

- [ ] Deploy LukasHook
  - Script: `DeployLukasHook.s.sol`
  - Permissions: beforeInitialize=true, afterSwap=true
  - Record address: `___________________________`
  - Verify on PolygonScan: [ ]

### Phase 4: Pool Initialization
- [ ] Update InitializePool.s.sol with addresses
  - [ ] poolManager address
  - [ ] hookAddr address

- [ ] Initialize LUKAS/USDC pool
  - Script: `InitializePool.s.sol`
  - Fee tier: 3000 (0.3%)
  - Tick spacing: 60
  - Initial price: 1:1
  - Transaction hash: `___________________________`

### Phase 5: Liquidity Addition
- [ ] Approve LUKAS tokens (10,000 LUKAS)
  - Transaction hash: `___________________________`

- [ ] Approve USDC tokens (10,000 USDC)
  - Transaction hash: `___________________________`

- [ ] Update AddLiquidity.s.sol with poolManager address

- [ ] Add liquidity
  - Script: `AddLiquidity.s.sol`
  - Amount: 10,000 LUKAS + 10,000 USDC
  - Tick range: -60 to +60
  - Transaction hash: `___________________________`

## Post-Deployment Tasks

### Documentation Updates
- [ ] Update `deployments.json` with all addresses
  - [ ] LatAmBasketIndex
  - [ ] PoolManager
  - [ ] PoolSwapTest
  - [ ] PoolModifyLiquidityTest
  - [ ] LukasHook
  - [ ] Pool ID

- [ ] Run `npm run sync-deployments`
  - [ ] Verify SDK NetworkManager updated
  - [ ] Verify web app config updated
  - [ ] Verify docs updated

- [ ] Update DEPLOYMENT_STATUS.md
  - [ ] Change all statuses from "Ready" to "Deployed"
  - [ ] Add deployment timestamps
  - [ ] Add deployer addresses

### Testing
- [ ] Test swap on pool
  - [ ] Swap LUKAS → USDC
  - [ ] Swap USDC → LUKAS
  - [ ] Verify LukasHook events emitted

- [ ] Test stabilization trigger
  - [ ] Create price deviation
  - [ ] Verify StabilizerVault triggered
  - [ ] Verify mint/buyback executed

- [ ] Test oracle integration
  - [ ] Query LatAmBasketIndex
  - [ ] Verify fair price calculation
  - [ ] Check all currency feeds active

### SDK Release
- [ ] Update SDK version to 0.2.11
  - [ ] Add Uniswap V4 contract addresses
  - [ ] Add PoolManager ABI
  - [ ] Add LukasHook ABI
  - [ ] Update NetworkManager with new contracts

- [ ] Run SDK tests
  - [ ] Network connection tests
  - [ ] Contract interaction tests
  - [ ] Hook integration tests

- [ ] Publish SDK to npm
  - [ ] Run `npm run release`
  - [ ] Verify on npmjs.com
  - [ ] Update CHANGELOG.md

### Web App Updates
- [ ] Update web3-config.ts with new addresses
- [ ] Test swap UI with new pool
- [ ] Verify hook events displayed
- [ ] Test wallet connection
- [ ] Deploy web app update

### Documentation Site
- [ ] Update contract addresses in docs
- [ ] Add Uniswap V4 integration guide
- [ ] Update API reference
- [ ] Publish documentation updates

### Communications
- [ ] Announce testnet deployment
  - [ ] Discord/Telegram
  - [ ] Twitter/X
  - [ ] Medium article

- [ ] Share pool links
  - [ ] PolygonScan pool link
  - [ ] Swap interface link
  - [ ] Documentation link

## Verification Commands

### Check Contract Deployments
```bash
# Verify LukasToken
cast call $LUKAS_TOKEN "name()" --rpc-url $AMOY_RPC_URL

# Verify LatAmBasketIndex
cast call $BASKET_INDEX "getIndexUSD()" --rpc-url $AMOY_RPC_URL

# Verify PoolManager
cast call $POOL_MANAGER "protocolFeesAccrued(address)" $LUKAS_TOKEN --rpc-url $AMOY_RPC_URL

# Verify LukasHook
cast call $LUKAS_HOOK "getHookPermissions()" --rpc-url $AMOY_RPC_URL
```

### Test Swap
```bash
# Encode swap params
cast send $POOL_MANAGER "swap(tuple,tuple,bytes)" \
  "($LUKAS_TOKEN,$USDC_TOKEN,3000,60,$LUKAS_HOOK)" \
  "(true,1000000000000000000,79228162514264337593543950335)" \
  "0x" \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY \
  --value 0
```

## Rollback Plan

If deployment fails:

1. **Document the failure**
   - Save error messages
   - Record transaction hashes
   - Note which step failed

2. **Analyze the issue**
   - Check contract code
   - Verify addresses
   - Review gas settings
   - Check approvals

3. **Fix and retry**
   - Update scripts with correct addresses
   - Adjust gas limits if needed
   - Re-run from failed step

4. **Update tracking**
   - Mark failed deployments in deployments.json
   - Document lessons learned
   - Update deployment scripts if needed

## Success Criteria

Deployment is complete when:
- [x] All 5 deployment phases executed successfully
- [ ] All contracts verified on PolygonScan
- [ ] Swap functionality tested on LUKAS/USDC pool
- [ ] LukasHook events confirmed in transactions
- [ ] Oracle providing prices correctly
- [ ] StabilizerVault responding to deviations
- [ ] deployments.json updated and synced
- [ ] SDK v0.2.11 released to npm
- [ ] Web app deployed with new pool integration
- [ ] Documentation site updated
- [ ] Testnet announcement published

## Notes

- Keep all transaction hashes for verification
- Save contract addresses immediately after deployment
- Test each phase before proceeding to next
- Monitor gas usage and optimize if needed
- Have backup MATIC for unexpected costs

## Contact

For deployment support:
- Check documentation: `/packages/contracts/README.md`
- Review deployment guide: `/UNISWAP_V4_DEPLOYMENT.md`
- Open GitHub issue for blockers
