# On-chain (Solidity Smart Contract)

- **You can write a simple contract that:**

1. Maps each main wallet to 3 auth wallets.
2. Stores approval state per session/operation.
3. Requires at least 2 approvals from the 3 addresses before marking the main wallet as authenticated.

- **Example flow:**

1. `registerMainWallet`(mainWallet, [w1, w2, w3])
2. `approve`(mainWallet, operationId) → called by w1/w2/w3.
3. Contract tracks confirmations.
4. Once ≥2, emits event Authenticated(mainWallet, operationId).