import { STACKS_TESTNET } from '@stacks/network';
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  principalCV,
  uintCV,
} from '@stacks/transactions';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

async function getTaskCount(developer: string) {
  try {
    const [address, contractName] = CONTRACT_ADDRESS.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: contractName,
      functionName: 'get-task-count',
      functionArgs: [principalCV(developer)],
      network: STACKS_TESTNET,
      senderAddress: developer,
    });

    console.log('📊 Task count:', cvToJSON(result).value);
  } catch (error) {
    console.error('❌ Error querying task count:', error);
  }
}

async function getTask(developer: string, taskId: number) {
  try {
    const [address, contractName] = CONTRACT_ADDRESS.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: contractName,
      functionName: 'get-task',
      functionArgs: [principalCV(developer), uintCV(taskId)],
      network: STACKS_TESTNET,
      senderAddress: developer,
    });

    console.log('📋 Task details:', cvToJSON(result).value);
  } catch (error) {
    console.error('❌ Error querying task:', error);
  }
}

const command = process.argv[2];
const developer = process.argv[3];
const taskId = process.argv[4] ? parseInt(process.argv[4]) : 0;

if (command === 'count' && developer) {
  getTaskCount(developer);
} else if (command === 'task' && developer) {
  getTask(developer, taskId);
} else {
  console.log('Usage:');
  console.log('  npm run query count <developer-address>');
  console.log('  npm run query task <developer-address> <task-id>');
}
