import 'dotenv/config';
import { logTask } from './interact'; // your existing function

const tasks = [
  {
    title: 'Improved Stacks testnet RPC configuration',
    description:
      'Updated Stacks testnet network configuration to use the Hiro API endpoint and avoid frequent connection timeouts during contract interactions.',
  },
  {
    title: 'Added extended fetch timeout for blockchain calls',
    description:
      'Configured custom fetch timeout settings to prevent Undici connect timeout errors when fetching account nonce from Stacks testnet.',
  },
  {
    title: 'Diagnosed Stacks testnet connectivity failures',
    description:
      'Traced repeated contract call failures to RPC-level connection timeouts occurring before transaction signing or broadcast.',
  },
  {
    title: 'Hardened blockchain interaction scripts',
    description:
      'Improved resilience of task-logging scripts by isolating network errors from application and signing logic.',
  },
  {
    title: 'Validated Stacks testnet node availability',
    description:
      'Performed direct API health checks against testnet endpoints to confirm node responsiveness prior to submitting batch transactions.',
  },
  {
    title: 'Separated network failures from contract logic',
    description:
      'Confirmed that transaction failures originated from RPC connectivity issues rather than smart contract code or signing flow.',
  },
  {
    title: 'Improved observability for blockchain interactions',
    description:
      'Added structured logging around network calls to clearly surface timeout, retry, and nonce-fetch failures.',
  },
  {
    title: 'Refined batch execution flow for on-chain logging',
    description:
      'Ensured batch task submission handles partial failures gracefully without interrupting subsequent operations.',
  },
  {
    title: 'Confirmed wallet-independent transaction failures',
    description:
      'Verified that repeated task-logging failures were unrelated to wallet provider or key management configuration.',
  },
  {
    title: 'Strengthened development workflow for Stacks testnet',
    description:
      'Documented reliable RPC endpoints and connectivity checks to reduce friction during local blockchain development.',
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  for (const task of tasks) {
    console.log(`📝 Logging: ${task.title}`);
    await logTask(task.title, task.description);

    // wait 8 seconds between txs (safe + realistic)
    await sleep(8000);
  }

  console.log('✅ Batch logging completed');
}

run().catch(console.error);
