# DevTask Ledger

**Stacks Challenge #3 Project**  
**Goal:** Track developer tasks on-chain while demonstrating Stacks Testnet4 integration, backend scripting, and WalletKit usage.

---

## Project Overview

**DevTask Ledger** is a small but extensible project that lets developers log their completed tasks on the **Stacks Testnet4** blockchain. Each task is stored on-chain, creating a transparent and verifiable record of development activity.

**Why this project?**  
- Provides meaningful **on-chain activity** for the Builder Challenge  
- Backend-focused, lightweight, and easy to extend  
- Can be used in future for **portfolio, Talent Protocol integration, or gamification**

---

## Features (MVP)

- Log a developer task with:
  - **Title**
  - **Description**
  - **Timestamp**
- Query total tasks per developer
- Query individual task details
- Backend integration with **NestJS scripts**
- Optional WalletKit SDK integration for automated contract calls

---

## Repository Structure
```
devtask-ledger/
│
├─ contracts/
│  └─ devtask-ledger.clar          # Clarity contract
├─ scripts/
│  ├─ deploy.ts                     # Deploy contract to Testnet4
│  └─ interact.ts                   # Call log-task function
├─ src/
│  └─ app.module.ts                 # NestJS backend module
├─ README.md
├─ package.json
├─ package-lock.json
└─ .gitignore
```

- `contracts/`: Clarity contract files  
- `scripts/`: scripts for deployment and interactions  
- `src/`: optional NestJS backend for automation or API  
- README.md: project explanation and instructions  

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up a Stacks Testnet4 wallet

* Use Leather Wallet or another Testnet4-compatible wallet
* Fund with test STX from a faucet

### 3. Configure environment

Create a `.env` file:
```
PRIVATE_KEY=<your-testnet-wallet-private-key>
CONTRACT_ADDRESS=<deployed-contract-address>
NETWORK=testnet
```

### 4. Deploy the contract
```bash
npm run deploy
```

This deploys `devtask-ledger.clar` to Testnet4.

### 5. Log a task
```bash
npm run interact -- "Implemented NestJS backend script"
```

* Calls `log-task` function in the contract
* Each call counts as on-chain activity for the leaderboard

### 6. Optional: NestJS API

You can create endpoints to:
* Log tasks programmatically
* Query task count per developer
* Automate multiple task logs for testing
```bash
npm run start:dev
```

---

## GitHub & Challenge Notes

* Daily commits = points for Builder Challenge
* On-chain interactions = leaderboard points
* WalletKit / SDK usage = additional scoring multiplier

**Tip:** Make daily small commits, call `log-task` multiple times, and optionally integrate WalletKit SDK to maximize points.

---

## Future Extensibility

* Add task status (completed/pending)
* Gamification: points, badges, leaderboard
* Integration with Talent Protocol reputation
* Optional frontend dashboard

---

## License

MIT
