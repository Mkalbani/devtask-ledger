import 'dotenv/config';
import { logTask } from './interact'; // your existing function

const tasks = [
  {
    title: 'Refactored deployment workflow',
    description: 'Separated deploy and interact logic for cleaner scripts',
  },
  {
    title: 'Tested contract calls with low fees',
    description: 'Observed fee behavior and rejection conditions on testnet',
  },
  {
    title: 'Improved developer ergonomics',
    description: 'Simplified CLI arguments for task logging script',
  },
  {
    title: 'Documented environment variables',
    description: 'Clarified PRIVATE_KEY, CONTRACT_ADDRESS, and network usage',
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
