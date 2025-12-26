import { STACKS_TESTNET } from '@stacks/network';
import { makeContractDeploy, broadcastTransaction } from '@stacks/transactions';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CONTRACT_PATH = './contracts/devtask-ledger.clar';

async function deployContract() {
  try {
    console.log('📦 Reading contract file...');
    const codeBody = fs.readFileSync(CONTRACT_PATH, 'utf8');

    console.log('🚀 Deploying contract to Testnet...');
    const txOptions = {
      contractName: 'devtask-ledger',
      codeBody,
      senderKey: PRIVATE_KEY,
      network: STACKS_TESTNET,
      fee: 2000n,
    };

    const tx = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction({ transaction: tx });

    if ('txid' in result) {
      console.log('✅ Contract deployment broadcasted!');
      console.log('📝 Transaction ID:', result.txid);
      console.log(
        `🔗 View on explorer:\n   https://explorer.hiro.so/txid/${result.txid}?chain=testnet`,
      );

      console.log('\n⚠️  After confirmation, save this to your .env:');
      console.log(`   CONTRACT_ADDRESS=<your-address>.devtask-ledger`);
    } else {
      console.error('❌ Deployment failed:', result);
    }
  } catch (error) {
    console.error('❌ Error during deployment:', error);
  }
}

deployContract();
