# Multi-Sig-Authentication-System



https://github.com/user-attachments/assets/8237f988-4c7f-4320-9757-6cb14b5a1e7c




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
