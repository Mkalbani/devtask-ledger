import { privateKeyToAddress } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const address = privateKeyToAddress(PRIVATE_KEY, STACKS_TESTNET);

console.log('Your Stacks Address:', address);
console.log('Your Contract Address:', `${address}.devtask-ledger`);
