# Multi-Sig-Authentication-System


## About contract

- contract `ABI` and `contractAddress` are stored in `frontend/my-app/contracts/`

## Run locally

```bash
cd frontend/my-app
npm install
npm run dev
```


## Test smart contract

```bash
# start anvil in one terminal
cd backend
anvil
# In another terminal
cd backend
forge install foundry-rs/forge-std 
forge install openzeppelin/openzeppelin-contracts
forge build
forge test
```