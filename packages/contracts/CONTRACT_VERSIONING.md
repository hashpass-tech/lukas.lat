# Contract Versioning System

This document explains how the Lukas Protocol manages contract deployments across different environments.

## Overview

The protocol uses a dual-environment system to separate stable, production-ready contracts from testing contracts that may be under active development.

## Environments

### Stable Contracts
- **Purpose**: Production-ready contracts that have been tested and verified
- **Status**: `stable` - Safe for production use
- **Version Format**: `1.0.0`, `1.1.0`, etc.
- **Usage**: Default environment for all production deployments

### Testing Contracts
- **Purpose**: Contracts under active development and testing
- **Status**: `testing` - May be unstable or have breaking changes
- **Version Format**: `1.0.0-test`, `1.1.0-test`, etc.
- **Usage**: Development and testing only

## Configuration

### Using Stable Contracts (Default)
By default, the application uses stable contracts. No configuration needed.

### Using Testing Contracts
To use testing contracts for development:

1. Set the environment variable in `apps/web/.env`:
```bash
NEXT_PUBLIC_USE_TESTING_CONTRACTS=true
```

2. Restart your development server

## Deployment Structure

The `deployments.json` file is structured as follows:

```json
{
  "networks": {
    "80002": {
      "name": "Polygon Amoy Testnet",
      "contracts": {
        "stable": {
          "LukasToken": {
            "address": "0x...",
            "status": "stable",
            "version": "1.0.0"
          }
        },
        "testing": {
          "LukasToken": {
            "address": "0x...",
            "status": "testing",
            "version": "1.0.0-test"
          }
        }
      }
    }
  }
}
```

## Contract Status Values

- `stable`: Production-ready, fully tested
- `testing`: Under active development
- `not-deployed`: Contract not yet deployed to this network

## Deploying New Contracts

### Deploying to Testing Environment

1. Deploy your contract to the testnet
2. Update `deployments.json` under the `testing` section:
```json
"testing": {
  "YourContract": {
    "address": "0xYourNewAddress",
    "deployedAt": "2025-12-18T10:00:00.000Z",
    "deployer": "0xYourAddress",
    "version": "1.0.0-test",
    "verified": false,
    "status": "testing",
    "note": "Testing version - may be unstable"
  }
}
```

3. Test thoroughly in the testing environment

### Promoting to Stable

Once testing is complete:

1. Update the `stable` section with the tested contract address:
```json
"stable": {
  "YourContract": {
    "address": "0xYourTestedAddress",
    "deployedAt": "2025-12-18T12:00:00.000Z",
    "deployer": "0xYourAddress",
    "version": "1.0.0",
    "verified": true,
    "status": "stable"
  }
}
```

2. Commit the changes
3. The contract is now available for production use

## Best Practices

1. **Always test in testing environment first** - Never deploy directly to stable
2. **Verify contracts** - Mark contracts as verified once they're verified on block explorers
3. **Document changes** - Add notes explaining what changed in each version
4. **Version incrementally** - Follow semantic versioning (major.minor.patch)
5. **Keep testing and stable separate** - Don't mix testing contracts with stable ones

## Example Workflow

```bash
# 1. Deploy new contract version to testnet
forge create YourContract --rpc-url $AMOY_RPC_URL

# 2. Update deployments.json (testing section)
# Add the new contract address

# 3. Enable testing contracts
echo "NEXT_PUBLIC_USE_TESTING_CONTRACTS=true" >> apps/web/.env

# 4. Test the new contract
pnpm dev

# 5. Once stable, update deployments.json (stable section)
# Move the tested address to stable

# 6. Disable testing contracts
echo "NEXT_PUBLIC_USE_TESTING_CONTRACTS=false" >> apps/web/.env

# 7. Commit and deploy
git add packages/contracts/deployments.json
git commit -m "feat: promote YourContract to stable"
```

## Troubleshooting

### Contract address shows as 0x000...
- Check that the contract is deployed in the selected environment
- Verify the `deployments.json` has the correct address
- Ensure you're on the correct network

### Testing contracts not loading
- Verify `NEXT_PUBLIC_USE_TESTING_CONTRACTS=true` is set
- Restart your development server
- Check browser console for any errors

### SDK initialization fails
- Ensure all contract addresses are valid Ethereum addresses
- Check that `null` addresses are properly handled
- Verify the network is supported in `deployments.json`
