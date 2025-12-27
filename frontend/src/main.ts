import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from '@stacks/connect';
import { stringAsciiCV } from '@stacks/transactions';

const CONTRACT_ADDRESS = 'ST3C1W3GS1ZWN14DSJ9744K21F03HSS37A6SKVMKQ';
const CONTRACT_NAME = 'devtask-ledger';
const NETWORK = 'testnet';

// Minimal UI rendered into #app to avoid keeping fragile large HTML in two places.
const app = document.getElementById('app')!;
app.innerHTML = `
  <div style="font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; max-width:720px; margin:40px auto;">
    <h1>📋 DevTask Ledger (Frontend)</h1>
    <div style="margin:20px 0;">
      <button id="connectBtn">Connect Wallet</button>
      <button id="disconnectBtn" style="display:none; margin-left:8px;">Disconnect</button>
    </div>
    <div id="walletInfo" style="display:none; background:#f3f4f6; padding:12px; border-radius:8px;">
      <div><strong>Connected:</strong> <span id="userAddress" style="font-family:monospace"></span></div>
      <div style="margin-top:8px">Tasks logged: <span id="taskCount">0</span></div>
    </div>

    <div id="taskForm" style="display:none; margin-top:16px;">
      <div style="margin-bottom:8px"><input id="taskTitle" placeholder="Task title" style="width:100%; padding:8px;"/></div>
      <div style="margin-bottom:8px"><textarea id="taskDesc" placeholder="Task description" style="width:100%; padding:8px; height:100px"></textarea></div>
      <div><button id="logTaskBtn">Log Task</button></div>
    </div>

    <div id="status" style="margin-top:12px; min-height:24px"></div>
  </div>
`;

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
let userData: any = null;

function showStatus(
  message: string,
  type: 'loading' | 'success' | 'error' | '',
) {
  const el = document.getElementById('status')!;
  el.textContent = message;
  el.style.color =
    type === 'error' ? '#b91c1c' : type === 'success' ? '#065f46' : '#0f172a';
}

async function connectWallet() {
  showStatus('Connecting wallet...', 'loading');
  try {
    await showConnect({
      appDetails: {
        name: 'DevTask Ledger',
        icon: window.location.origin + '/favicon.svg',
      },
      redirectTo: '/',
      userSession,
      onFinish: () => {
        userData = userSession.loadUserData();
        updateUI();
        showStatus('Wallet connected', 'success');
      },
    });
  } catch (err: any) {
    console.error(err);
    showStatus('Connect failed: ' + (err?.message || String(err)), 'error');
  }
}

function disconnectWallet() {
  userSession.signUserOut();
  userData = null;
  updateUI();
  showStatus('Disconnected', '');
}

async function logTask() {
  const title = (
    document.getElementById('taskTitle') as HTMLInputElement
  ).value.trim();
  const description = (
    document.getElementById('taskDesc') as HTMLTextAreaElement
  ).value.trim();
  if (!title || !description)
    return showStatus('Please fill both fields', 'error');

  showStatus('Submitting transaction...', 'loading');
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'log-task',
      functionArgs: [stringAsciiCV(title), stringAsciiCV(description)],
      network: NETWORK,
      appDetails: {
        name: 'DevTask Ledger',
        icon: window.location.origin + '/favicon.svg',
      },
      onFinish: (data: any) => {
        showStatus('Task logged! Tx: ' + data.txId, 'success');
        (document.getElementById('taskTitle') as HTMLInputElement).value = '';
        (document.getElementById('taskDesc') as HTMLTextAreaElement).value = '';
        setTimeout(loadTasks, 2000);
      },
    });
  } catch (err: any) {
    console.error('logTask error', err);
    showStatus('Error: ' + (err?.message || String(err)), 'error');
  }
}

function updateUI() {
  const connectBtn = document.getElementById('connectBtn')!;
  const disconnectBtn = document.getElementById('disconnectBtn')!;
  const walletInfo = document.getElementById('walletInfo')!;
  const taskForm = document.getElementById('taskForm')!;
  const userAddress = document.getElementById('userAddress')!;

  if (userData) {
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';
    walletInfo.style.display = 'block';
    taskForm.style.display = 'block';
    userAddress.textContent = userData.profile.stxAddress[NETWORK] || '';
    loadTasks();
  } else {
    connectBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
    walletInfo.style.display = 'none';
    taskForm.style.display = 'none';
  }
}

async function loadTasks() {
  const tasksEl = document.getElementById('tasks');
  // minimal: update count
  try {
    // Could call a read-only function here; skipping network call for brevity
    document.getElementById('taskCount')!.textContent = '—';
  } catch (e) {
    console.warn('loadTasks error', e);
  }
}

// Wire UI
document.getElementById('connectBtn')!.addEventListener('click', connectWallet);
document
  .getElementById('disconnectBtn')!
  .addEventListener('click', disconnectWallet);
document.getElementById('logTaskBtn')!.addEventListener('click', logTask);

// If already signed in
if (userSession.isUserSignedIn()) {
  userData = userSession.loadUserData();
  updateUI();
}

console.log('Frontend initialized');
