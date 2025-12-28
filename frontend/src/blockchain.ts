import { openContractCall } from '@stacks/connect';
import { stringAsciiCV, principalCV, cvToHex } from '@stacks/transactions';
import { request } from 'sats-connect';
import { showStatus } from './ui';
import { connectedWallet, userData, xverseAddress } from './wallet';
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  NETWORK,
  DEFAULT_FEE_MICRO,
} from './config';

export async function loadTaskCount(address: string): Promise<void> {
  try {
    const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-task-count`;
    const principalArg = cvToHex(principalCV(address));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [principalArg],
      }),
    });

    const data = await response.json();
    console.log('Raw API response:', data);

    if (data.okay && data.result) {
      const resultHex = data.result.replace('0x', '');
      let count = 0;

      if (resultHex.length > 0) {
        const safeHex = resultHex.slice(-16);
        count = parseInt(safeHex, 16);

        if (count > 1000000 || isNaN(count)) {
          console.error('Invalid task count:', count, 'from hex:', resultHex);
          count = 0;
        }
      }

      console.log('Parsed task count:', count);
      document.getElementById('taskCount')!.textContent = count.toString();
    } else {
      console.error('API returned error:', data);
      document.getElementById('taskCount')!.textContent = '0';
    }
  } catch (error) {
    console.error('Error loading task count:', error);
    document.getElementById('taskCount')!.textContent = '0';
  }
}

export async function logTask(): Promise<void> {
  const title = (
    document.getElementById('taskTitle') as HTMLInputElement
  ).value.trim();
  const description = (
    document.getElementById('taskDesc') as HTMLTextAreaElement
  ).value.trim();

  if (!title || !description) {
    return showStatus('Please fill both fields', 'error');
  }

  await logTaskToChain(title, description);

  (document.getElementById('taskTitle') as HTMLInputElement).value = '';
  (document.getElementById('taskDesc') as HTMLTextAreaElement).value = '';
}

export async function bulkLogTasks(): Promise<void> {
  const title = (
    document.getElementById('taskTitle') as HTMLInputElement
  ).value.trim();
  const description = (
    document.getElementById('taskDesc') as HTMLTextAreaElement
  ).value.trim();

  if (!title || !description) {
    return showStatus('Please fill both fields', 'error');
  }

  const confirmed = confirm(
    'This will submit 5 tasks in sequence. Each will require wallet approval. Continue?',
  );
  if (!confirmed) return;

  showStatus('Bulk logging 5 tasks...', 'loading');

  let successCount = 0;
  for (let i = 1; i <= 5; i++) {
    try {
      const taskTitle = `${title} (${i}/5)`;
      showStatus(`Logging task ${i}/5...`, 'loading');

      await logTaskToChain(taskTitle, description, true);
      successCount++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to log task ${i}:`, error);
      showStatus(
        `Failed at task ${i}. ${successCount} tasks logged successfully.`,
        'error',
      );
      return;
    }
  }

  showStatus(`✅ Successfully logged ${successCount} tasks!`, 'success');

  (document.getElementById('taskTitle') as HTMLInputElement).value = '';
  (document.getElementById('taskDesc') as HTMLTextAreaElement).value = '';

  setTimeout(() => {
    const address =
      connectedWallet === 'leather'
        ? userData.profile.stxAddress[NETWORK]
        : xverseAddress!;
    loadTaskCount(address);
  }, 3000);
}

async function logTaskToChain(
  title: string,
  description: string,
  silent = false,
  feeMicro?: number,
): Promise<void> {
  console.log('Logging task:', title, description);
  if (!silent) {
    showStatus('Submitting transaction...', 'loading');
  }
  const feeToUse = feeMicro ?? DEFAULT_FEE_MICRO;

  return new Promise<void>((resolve, reject) => {
    if (connectedWallet === 'leather') {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'log-task',
        functionArgs: [stringAsciiCV(title), stringAsciiCV(description)],
        network: NETWORK,
        fee: String(feeToUse),
        appDetails: {
          name: 'DevTask Ledger',
          icon: window.location.origin + '/favicon.svg',
        },
        onFinish: (data: any) => {
          console.log('Task logged:', data);
          if (!silent) {
            showStatus('Task logged! Tx: ' + data.txId, 'success');
            setTimeout(() => {
              const address = userData.profile.stxAddress[NETWORK];
              loadTaskCount(address);
            }, 3000);
          }
          resolve();
        },
        onCancel: () => {
          if (!silent) {
            showStatus('Transaction cancelled', 'error');
          }
          reject(new Error('Transaction cancelled'));
        },
      }).catch((err) => {
        if (!silent) {
          showStatus('Error: ' + (err?.message || String(err)), 'error');
        }
        reject(err);
      });
    } else if (connectedWallet === 'xverse') {
      const xverseOptions: any = {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: 'log-task',
        arguments: [`"${title}"`, `"${description}"`],
        postConditionMode: 'allow',
        fee: String(feeToUse),
      };

      request('stx_callContract', xverseOptions)
        .then((response) => {
          if (response.status === 'success') {
            console.log('Task logged:', response.result);
            if (!silent) {
              showStatus('Task logged! Tx: ' + response.result.txid, 'success');
              setTimeout(() => {
                loadTaskCount(xverseAddress!);
              }, 3000);
            }
            resolve();
          } else {
            reject(new Error('Transaction cancelled'));
          }
        })
        .catch((err) => {
          if (!silent) {
            showStatus('Error: ' + (err?.message || String(err)), 'error');
          }
          reject(err);
        });
    }
  });
}

export async function logCommitToBlockchain(index: number): Promise<void> {
  const commits = (window as any).githubCommits;
  if (!commits || !commits[index]) return;

  const commit = commits[index];
  const title = commit.commit.message.split('\n')[0].substring(0, 100);
  const description =
    `${commit.commit.message}\n\nCommit: ${commit.sha}\nRepo: ${commit.html_url}`.substring(
      0,
      500,
    );

  await logTaskToChain(title, description);
}
