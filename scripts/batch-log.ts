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
