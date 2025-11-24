# $LUKAS Contracts

Smart contracts for the LUKAS token - The Gravity Center of LatAm Pesos.

## Setup

Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install dependencies:
```bash
forge install
```

## Build

```bash
forge build
```

## Test

```bash
forge test
```

## Deploy

```bash
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast
```
