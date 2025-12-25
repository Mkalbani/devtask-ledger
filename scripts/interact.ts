import { STACKS_TESTNET } from '@stacks/network';
import {
  broadcastTransaction,
  makeContractCall,
  stringAsciiCV,
} from '@stacks/transactions';
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

async function logTask(title: string, description: string) {
  try {
    const [address, contractName] = CONTRACT_ADDRESS.split('.');

    console.log('📝 Logging task to blockchain...');
    console.log(`   Title: ${title}`);
    console.log(`   Description: ${description}`);

    const txOptions = {
      contractAddress: address,
      contractName: contractName,
      functionName: 'log-task',
      functionArgs: [stringAsciiCV(title), stringAsciiCV(description)],
      senderKey: PRIVATE_KEY,
      network: STACKS_TESTNET,
      fee: 1000n,
    };

    const tx = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction: tx });

    console.log('✅ Task logged successfully!');
    console.log('📝 Transaction ID:', result);
    console.log('🔗 View on explorer:');
    console.log(`   https://explorer.hiro.so/txid/${result}?chain=testnet`);
  } catch (error) {
    console.error('❌ Error logging task:', error);
  }
}

const title = process.argv[2] || 'Sample Task';
const description =
  process.argv[3] || 'This is a sample task logged to the blockchain';

logTask(title, description);
