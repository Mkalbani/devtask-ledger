import dotenv from 'dotenv';
dotenv.config();

const address = process.env.CONTRACT_ADDRESS!.split('.')[0];
fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`)
  .then((r) => r.json())
  .then((data) => console.log('Balance:', data.stx.balance, 'microSTX'));
