import { STACKS_TESTNET } from '@stacks/network';
import { makeContractDeploy, broadcastTransaction } from '@stacks/transactions';
import fs from 'fs';
import dotenv from 'dotenv';

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

    console.log('✅ Contract deployed successfully!');
    console.log('📝 Transaction ID:', result);
    console.log('🔗 View on explorer:');
    console.log(`   https://explorer.hiro.so/txid/${result}?chain=testnet`);
    console.log('\n⚠️  Save this contract address to your .env:');
    console.log(`   CONTRACT_ADDRESS=<your-address>.devtask-ledger`);
  } catch (error) {
    console.error('❌ Error during deployment:', error);
  }
}

deployContract();
