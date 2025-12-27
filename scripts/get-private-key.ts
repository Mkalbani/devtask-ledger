import { generateWallet } from '@stacks/wallet-sdk';

const mnemonic = 'your 24 word phrase here'; // Paste your recovery phrase

async function getPrivateKey() {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: '',
  });

  const account = wallet.accounts[0];
  console.log('Private Key:', account.stxPrivateKey);
}

getPrivateKey();
