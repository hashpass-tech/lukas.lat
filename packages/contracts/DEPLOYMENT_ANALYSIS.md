# Deployment Analysis - December 18, 2025

## ⚠️ IMPORTANT: Fresh Deployment Required

**Analysis Result**: Previous deployments were broadcast but transactions **FAILED** or addresses are incorrect.  
**Recommendation**: Deploy ALL contracts fresh to Polygon Amoy testnet.

## Current Deployment Status

### ❌ Previous Deployments (NOT WORKING)

| Contract | Broadcast Address | Status | Issue |
|----------|------------------|--------|-------|
| LukasToken | `0xaee0f26589a21ba4547765f630075262f330f1cb` | ❌ Failed/Empty | RPC returns execution reverted |
| StabilizerVault | `0xe00bd923554e45a47f67e3a78adc7a38a0659a91` | ❌ Unknown | From broadcast but unverified |

### ✅ External Contracts (Use Existing)

| Contract | Address | Status | Action |
|----------|---------|--------|--------|
| **USDC** | `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582` | ✅ Official Polygon USDC | **USE EXISTING** |

### 🆕 Fresh Deployment Required (All Contracts)

| Contract | Status | Action |
|----------|--------|--------|
| **LukasToken** | ❌ Needs redeployment | **DEPLOY FRESH** |
| **StabilizerVault** | ❌ Not properly deployed | **DEPLOY FRESH** |
| **LatAmBasketIndex** | ❌ Never deployed | **DEPLOY FRESH** |
| **PoolManager** | ❌ Never deployed | **DEPLOY FRESH** |
| **PoolSwapTest** | ❌ Never deployed | **DEPLOY FRESH** |
| **PoolModifyLiquidityTest** | ❌ Never deployed | **DEPLOY FRESH** |
| **LukasHook** | ❌ Never deployed | **DEPLOY FRESH** |

## Source Code Analysis

### LukasToken.sol
- **Last Modified**: December 2025 (version bump commit)
- **Deployed Version**: Matches current source (no functional changes)
- **Pragma**: `^0.8.24` (deployed version)
- **Current Pragma**: `^0.8.24` (unchanged)
- **Conclusion**: ✅ **NO CHANGES - KEEP EXISTING DEPLOYMENT**

### StabilizerVault.sol
- **Deployed**: ❌ NO (placeholder address returns empty bytecode)
- **Status**: Never actually deployed
- **Conclusion**: 🆕 **NEEDS FIRST DEPLOYMENT**

### LatAmBasketIndex.sol
- **Deployed**: ❌ NO
- **Status**: New contract for oracle functionality
- **Conclusion**: 🆕 **NEEDS FIRST DEPLOYMENT**

### LukasHook.sol
- **Deployed**: ❌ NO
- **Status**: New contract for Uniswap V4 integration
- **Pragma**: `^0.8.26` (different from LukasToken)
- **Conclusion**: 🆕 **NEEDS FIRST DEPLOYMENT**

## Deployment Strategy - FRESH START

### Phase 1: Deploy Core Token
1. **Deploy LukasToken**
   - Initial supply: TBD (e.g., 0 or 1,000,000)
   - Record address for all subsequent deployments
   - Verify on PolygonScan

### Phase 2: Deploy Oracle
2. **Deploy LatAmBasketIndex**
   - Mock price feeds for testnet (BRL, MXN, ARS, CLP, COP)
   - Record address for StabilizerVault and LukasHook

### Phase 3: Deploy Stabilizer
3. **Deploy StabilizerVault**
   - Requires: LukasToken address (Phase 1)
   - Requires: LatAmBasketIndex address (Phase 2)
   - Requires: USDC address (existing: 0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582)
   - Record address for LukasHook

4. **Set LukasToken Minter**
   - Call `LukasToken.setMinter(stabilizerVault)`
   - Authorizes vault to mint/burn LUKAS

### Phase 4: Deploy Uniswap V4 Infrastructure
5. **Deploy Uniswap V4 Core**
   - PoolManager (500k gas limit)
   - PoolSwapTest (router)
   - PoolModifyLiquidityTest (liquidity manager)
   - Record addresses for LukasHook

### Phase 5: Deploy Hook & Initialize Pool
6. **Deploy LukasHook**
   - Requires: LatAmBasketIndex address (Phase 2)
   - Requires: StabilizerVault address (Phase 3)
   - Requires: LukasToken address (Phase 1)
   - Requires: USDC address (existing)
   - Record address for pool initialization

7. **Initialize LUKAS/USDC Pool**
   - Requires: PoolManager address (Phase 4)
   - Requires: LukasHook address (Phase 6)
   - Fee: 3000 (0.3%)
   - Tick spacing: 60
   - Initial price: 1:1

8. **Add Initial Liquidity**
   - Approve LUKAS and USDC for PoolManager
   - Add 10,000 LUKAS + 10,000 USDC
   - Tick range: -60 to +60

## Updated Deployment Scripts

All scripts need minimal updates for fresh deployment:

### ✅ Ready to Use (No Changes)
- `DeployLukasToken.s.sol` - Deploy fresh LukasToken ✅
- `DeployLatAmBasketIndex.s.sol` - Deploy oracle ✅
- `DeployUniswapV4.s.sol` - Deploy V4 core ✅

### ⚠️ Need Address Updates (After Phase 1-4)
- `DeployStabilizerVault.s.sol` - Update with LukasToken, LatAmBasketIndex, USDC addresses
- `DeployLukasHook.s.sol` - Update with all deployed addresses
- `InitializePool.s.sol` - Update with PoolManager, LukasHook addresses
- `AddLiquidity.s.sol` - Update with PoolManager address

## Configuration Updates Needed

### Update deployments.json (After All Deployments)
```json
{
  "networks": {
    "80002": {
      "name": "Polygon Amoy Testnet",
      "contracts": {
        "stable": {
          "LukasToken": {
            "address": "<DEPLOYED_ADDRESS>",
            "deployedAt": "<TIMESTAMP>",
            "deployer": "<DEPLOYER>",
            "status": "stable",
            "version": "1.0.0"
          },
          "StabilizerVault": {
            "address": "<DEPLOYED_ADDRESS>",
            "deployedAt": "<TIMESTAMP>",
            "status": "stable"
          },
          "LatAmBasketIndex": {
            "address": "<DEPLOYED_ADDRESS>",
            "deployedAt": "<TIMESTAMP>",
            "status": "stable"
          },
          "PoolManager": {
            "address": "<DEPLOYED_ADDRESS>",
            "deployedAt": "<TIMESTAMP>",
            "status": "stable"
          },
          "LukasHook": {
            "address": "<DEPLOYED_ADDRESS>",
            "deployedAt": "<TIMESTAMP>",
            "status": "stable"
          },
          "USDC": {
            "address": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
            "status": "external",
            "note": "Official Polygon USDC"
          }
        }
      }
    }
  }
}
```

## Cost Estimation

### All Fresh Deployments (7 contracts)
1. LukasToken - ~$10-15 in MATIC
2. LatAmBasketIndex - ~$5-10 in MATIC
3. StabilizerVault - ~$10-15 in MATIC
4. PoolManager - ~$15-20 in MATIC
5. PoolSwapTest - ~$5-10 in MATIC
6. PoolModifyLiquidityTest - ~$5-10 in MATIC
7. LukasHook - ~$10-15 in MATIC

**Total Estimated Gas**: ~$60-95 in MATIC

### External Contracts (No Cost)
- USDC ✅ (existing official contract)

## Risk Assessment

### Low Risk
- ✅ LukasToken already deployed and verified
- ✅ No need to migrate token holders
- ✅ Existing token address already distributed

### Medium Risk
- ⚠️ New contracts need thorough testing after deployment
- ⚠️ StabilizerVault integration with existing LukasToken
- ⚠️ Hook integration with existing LukasToken

##DEPLOY FRESH** (All new contracts):
- 🆕 LukasToken
- 🆕 LatAmBasketIndex
- 🆕 StabilizerVault
- 🆕 PoolManager
- 🆕 PoolSwapTest
- 🆕 PoolModifyLiquidityTest
- 🆕 LukasHook

**USE EXISTING** (External contracts):
- ✅ USDC (0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582)

**TOTAL**: 1 external + 7 new = 8 contracts in the system
**DEPLOYMENT ACTIONS**: 7 fresh deployments + 1 initialization + 1 liquidity addition

## Recommendation

**Start fresh with all deployments**. Previous deployments are not functional, so there's no benefit to trying to reuse them. This ensures:
- Clean deployment history
- All contracts verified from the start
- Proper integration testing
- No legacy issues

Follow [DEPLOYMENT_CHECKLIST.md](../../DEPLOYMENT_CHECKLIST.md) for step-by-step execution.
- 🆕 PoolManager
- 🆕 PoolSwapTest
- 🆕 PoolModifyLiquidityTest
- 🆕 LukasHook

**TOTAL**: 2 existing + 6 new = 8 contracts in the system
**DEPLOYMENT ACTIONS**: 6 new deployments only
