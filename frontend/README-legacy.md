# DevTask Ledger - Frontend

A Web3 application for logging development tasks on the Stacks blockchain with GitHub integration.

## Features

- 🔗 **Stacks Wallet Integration** - Connect with Leather wallet using WalletKit SDK
- 🔄 **GitHub Commit Import** - Fetch and log commits from any public repository
- ✍️ **Manual Task Logging** - Directly log completed tasks to the blockchain
- 📊 **On-Chain Verification** - Immutable, timestamped proof of work
- 🎯 **Builder Challenge Optimized** - Generates on-chain activity for leaderboard points

## Tech Stack

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **@stacks/connect** - Wallet connection and contract calls
- **@stacks/transactions** - Transaction building
- **@octokit/rest** - GitHub API integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Stacks wallet (Leather recommended)
- Testnet STX for gas fees
- GitHub Personal Access Token (for commit fetching)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configuration

Create a `.env` file in the `frontend/` directory:

```bash
# Optional: GitHub integration (for fetching commits)
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

**To get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `repo` (read access to repositories)
4. Copy the token to your `.env` file

**Note:** The GitHub token is optional. Without it, you can still manually log tasks.

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Usage

### 1. Connect Wallet

Click "Connect Wallet" and approve the connection in your Leather wallet.

### 2. Option A: Import from GitHub

- Enter any GitHub username and public repository name
- Click "Fetch Commits"
- Click "Log to Chain" on any commit to log it permanently on-chain
- Approve the transaction in Leather

### 3. Option B: Manual Entry

- Switch to "Manual Entry" tab
- Fill in task title (max 100 chars)
- Fill in task description (max 500 chars)
- Click "Submit to Blockchain"
- Approve the transaction in Leather

### 4. View Your Tasks

Click the Stacks Explorer link to view all your logged tasks on-chain.

## Smart Contract

The frontend interacts with the `devtask-ledger` smart contract deployed on Stacks Testnet:

- **Contract:** `ST3C1W3GS1ZWN14DSJ9744K21F03HSS37A6SKVMKQ.devtask-ledger`
- **Network:** Testnet4
- **Function:** `log-task` - Logs a task with title and description

## Builder Challenge Integration

This project is designed for the Stacks Builder Challenge and generates points through:

- ✅ **WalletKit SDK Usage** - Full integration with @stacks/connect
- ✅ **On-Chain Transactions** - Each logged task generates blockchain activity
- ✅ **Smart Contract Fees** - Transaction fees contribute to leaderboard scoring
- ✅ **GitHub Activity** - Commits to this repo count toward challenge points

## Project Structure

```
frontend/
├── src/
│   ├── main.ts           # Main application logic
│   └── vite-env.d.ts     # TypeScript environment types
├── public/               # Static assets
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration (if needed)
└── .env                  # Environment variables (not committed)
```

## Use Cases

### For Individual Developers
- Build an immutable portfolio of completed work
- Prove task completion with blockchain timestamps
- Showcase contributions across multiple repositories

### For Teams & DAOs
- Transparent activity tracking for all contributors
- Verifiable work history for grant applications
- Decentralized proof-of-work for token distributions

### For Open Source
- Log contributions to any public repository
- Build reputation across projects
- Create verifiable contribution history

## Security Notes

- **Private Keys:** Never commit `.env` files or expose private keys
- **GitHub Token:** Only needs read access to public repos
- **Contract Address:** Public and safe to expose (it's on-chain)
- **Wallet Address:** Your Stacks address is public by design

## Future Enhancements

- [ ] OAuth integration for verified GitHub login
- [ ] Team dashboards showing all members' tasks
- [ ] NFT badges for milestones (10 tasks, 30-day streak)
- [ ] Public portfolio generator (yourname.devtask.xyz)
- [ ] IDE plugins (VS Code extension)
- [ ] Integration with Jira, Linear, GitLab
- [ ] Token rewards for logged contributions

## Troubleshooting

**Wallet won't connect:**
- Ensure Leather wallet is installed and set to Testnet
- Clear browser cache and try again
- Check console for error messages

**GitHub commits won't load:**
- Verify your `VITE_GITHUB_TOKEN` is set correctly
- Ensure the repository is public
- Check that the username and repo name are correct

**Transaction fails:**
- Ensure you have testnet STX (get from faucet)
- Check that contract address is correct
- Verify you're on Testnet4 in your wallet

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Links

- [Stacks Explorer (Testnet)](https://explorer.hiro.so/?chain=testnet)
- [Leather Wallet](https://leather.io/)
- [Stacks Docs](https://docs.stacks.co/)
- [Builder Challenge](https://www.stacks.co/builder-challenge)