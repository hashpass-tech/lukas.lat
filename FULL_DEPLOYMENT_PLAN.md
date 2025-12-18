# Full Lukas Protocol Deployment - Amoy Testnet

## Deployment Order (Critical!)

The contracts must be deployed in this exact order due to dependencies:

### Phase 1: Core Token & Oracle
1. **LukasToken** - ERC20 token (no dependencies)
2. **LatAmBasketIndex** - Oracle (no dependencies)

### Phase 2: Stabilization
3. **StabilizerVault** - Depends on LukasToken + LatAmBasketIndex

### Phase 3: Uniswap V4 Integration
4. **Uniswap V4 PoolManager** - Core V4 (no dependencies)
5. **Uniswap V4 SwapRouter** - Swap execution (depends on PoolManager)
6. **LukasHook** - Depends on PoolManager + StabilizerVault + LatAmBasketIndex

### Phase 4: Pool Setup
7. **Initialize Pool** - Create LUKAS/USDC pool with hook
8. **Add Liquidity** - Bootstrap pool with initial liquidity

## Deployment Commands

### Phase 1: Deploy LukasToken

```bash
cd packages/contracts

source .env

forge script script/DeployLukasToken.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  --verify \
  -vvvv
```

**Save Output:**
- LukasToken address: `0x...`

### Phase 1: Deploy LatAmBasketIndex

```bash
forge script script/DeployLatAmBasketIndex.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  --verify \
  -vvvv
```

**Save Output:**
- LatAmBasketIndex address: `0x...`

### Phase 2: Deploy StabilizerVault

**BEFORE RUNNING:** Update `DeployStabilizerVault.s.sol`:
```solidity
address constant LUKAS_TOKEN = 0x...; // From Phase 1
address constant BASKET_INDEX = 0x...; // From Phase 1
```

```bash
forge script script/DeployStabilizerVault.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  --verify \
  -vvvv
```

**Save Output:**
- StabilizerVault address: `0x...`

### Phase 2: Set Vault as Minter

```bash
cast send 0x[LUKAS_TOKEN] \
  "setMinter(address)" \
  0x[STABILIZER_VAULT] \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key $PRIVATE_KEY
```

### Phase 3: Deploy Uniswap V4 PoolManager

```bash
forge script script/DeployUniswapV4.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  -vvvv
```

**Save Output:**
- PoolManager address: `0x...`
- SwapRouter address: `0x...`

### Phase 3: Deploy LukasHook

**BEFORE RUNNING:** Update `DeployLukasHook.s.sol`:
```solidity
address constant POOL_MANAGER = 0x...; // From V4 deployment
address constant BASKET_INDEX = 0x...; // From Phase 1
```

```bash
forge script script/DeployLukasHook.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  --verify \
  -vvvv
```

**Save Output:**
- LukasHook address: `0x...`

### Phase 4: Initialize Pool

**BEFORE RUNNING:** Update `InitializePool.s.sol` with:
- POOL_MANAGER address
- LUKAS_HOOK address

```bash
forge script script/InitializePool.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  -vvvv
```

### Phase 4: Add Liquidity

**BEFORE RUNNING:** Update `AddLiquidity.s.sol` with:
- POOL address (from initialization)
- Liquidity amounts

```bash
forge script script/AddLiquidity.s.sol \
  --rpc-url https://rpc-amoy.polygon.technology \
  --broadcast \
  -vvvv
```

## Testing After Each Phase

### After Phase 1: Test Token & Oracle

```bash
# Check LukasToken
cast call 0x[LUKAS_TOKEN] "name()" --rpc-url https://rpc-amoy.polygon.technology
cast call 0x[LUKAS_TOKEN] "totalSupply()" --rpc-url https://rpc-amoy.polygon.technology

# Check Oracle
cast call 0x[BASKET_INDEX] "getLukasFairPriceInUSDC()" --rpc-url https://rpc-amoy.polygon.technology
```

### After Phase 2: Test Vault

```bash
# Check vault info
cast call 0x[VAULT] "getCollateralBalance()" --rpc-url https://rpc-amoy.polygon.technology

# Check authorization
cast call 0x[VAULT] "isAuthorized(address)" 0x[YOUR_ADDRESS] --rpc-url https://rpc-amoy.polygon.technology
```

### After Phase 3: Test Hook

```bash
# Check hook is deployed
cast call 0x[HOOK] "basketIndex()" --rpc-url https://rpc-amoy.polygon.technology
```

### After Phase 4: Test Pool & Swaps

```bash
# Check pool exists
cast call 0x[POOL_MANAGER] "getSlot0(bytes32)" --rpc-url https://rpc-amoy.polygon.technology

# Execute test swap
cast send 0x[USDC] \
  "approve(address,uint256)" \
  0x[SWAP_ROUTER] \
  "1000000" \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key $PRIVATE_KEY
```

## Final Deployment Addresses

After all phases, you'll have:

```
LUKAS_TOKEN:        0x...
BASKET_INDEX:       0x...
STABILIZER_VAULT:   0x...
POOL_MANAGER:       0x...
SWAP_ROUTER:        0x...
LUKAS_HOOK:         0x...
LUKAS_USDC_POOL:    0x...
```

Update `packages/contracts/deployments.json` with these addresses.

## Verification on PolygonScan

For each contract, verify on [Amoy PolygonScan](https://amoy.polygonscan.com/):

1. Go to contract address
2. Click "Verify and Publish"
3. Select Solidity compiler version (0.8.24)
4. Paste contract code
5. Submit

## Troubleshooting

### "LUKAS_TOKEN not set"
Update the address in the deployment script before running.

### "Insufficient gas"
Get more MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### "Contract verification failed"
Verify manually on PolygonScan or check compiler version matches.

### "setMinter failed"
Ensure you're calling from the token owner address.

## Success Criteria

✅ All contracts deployed
✅ All contracts verified on PolygonScan
✅ Vault set as token minter
✅ Pool initialized with hook
✅ Initial liquidity added
✅ Test swap executes successfully
✅ Hook events emitted during swaps
✅ Peg monitoring working

## Next Steps After Deployment

1. Update web app with contract addresses
2. Test SDK integration
3. Deploy web app to production
4. Monitor peg on mainnet
5. Prepare for mainnet deployment
