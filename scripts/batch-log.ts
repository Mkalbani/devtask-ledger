import 'dotenv/config';
import { logTask } from './interact'; // your existing function

const tasks = [
  {
    title: 'Configured Stacks testnet environment',
    description:
      'Set up network, faucet funding, and testnet wallet for development',
  },
  {
    title: 'Implemented batch interaction script',
    description:
      'Created reusable script to submit multiple contract calls sequentially',
  },
  {
    title: 'Handled broadcastTransaction responses',
    description:
      'Improved handling for tx success, rejection, and error objects',
  },
  {
    title: 'Validated contract arguments',
    description: 'Ensured ASCII string limits and safe argument encoding',
  },
  {
    title: 'Reviewed Clarity contract logic',
    description:
      'Audited log-task function for correctness and data consistency',
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
