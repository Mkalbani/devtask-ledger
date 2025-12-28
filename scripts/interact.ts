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

export async function logTask(title: string, description: string) {
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

    if (typeof result === 'object' && 'error' in result) {
      console.error('❌ Transaction failed:', result.error);
      console.error('Reason:', result.reason);
    } else {
      const txid = typeof result === 'string' ? result : result.txid;
      console.log('✅ Task logged successfully!');
      console.log('📝 Transaction ID:', txid);
      console.log('🔗 View on explorer:');
      console.log(`   https://explorer.hiro.so/txid/${txid}?chain=testnet`);
    }
  } catch (error) {
    console.error('❌ Error logging task:', error);
  }
}

// If this file is executed directly (node ts-node), run with default args.
if (require.main === module) {
  const title = process.argv[2] || 'Sample Task';
  const description =
    process.argv[3] || 'This is a sample task logged to the blockchain';

  logTask(title, description);
}
