import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from '@stacks/connect';
import { stringAsciiCV } from '@stacks/transactions';
import { Octokit } from '@octokit/rest';

const CONTRACT_ADDRESS = 'ST3C1W3GS1ZWN14DSJ9744K21F03HSS37A6SKVMKQ';
const CONTRACT_NAME = 'devtask-ledger';
const NETWORK = 'testnet';

// GitHub integration
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

// Add global styles
const style = document.createElement('style');
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
  }
  .container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 800px;
    margin: 40px auto;
    padding: 40px;
  }
  h1 { color: #2d3748; margin-bottom: 10px; font-size: 32px; }
  h3 { color: #2d3748; margin-bottom: 15px; font-size: 20px; }
  .subtitle { color: #718096; margin-bottom: 30px; font-size: 14px; }
  button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }
  button:hover { transform: translateY(-2px); }
  button:active { transform: translateY(0); }
  button:disabled { background: #cbd5e0; cursor: not-allowed; }
  button.secondary {
    background: #e2e8f0;
    color: #2d3748;
    padding: 8px 16px;
    font-size: 14px;
  }
  button.secondary:hover { background: #cbd5e0; }
  .wallet-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f7fafc;
    border-radius: 12px;
  }
  .wallet-info {
    display: none;
    padding: 15px;
    background: #edf2f7;
    border-radius: 8px;
    margin-top: 15px;
  }
  .wallet-info.show { display: block; }
  .address {
    font-family: monospace;
    font-size: 12px;
    color: #4a5568;
    word-break: break-all;
  }
  input, textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 12px;
  }
  input:focus, textarea:focus {
    outline: none;
    border-color: #667eea;
  }
  textarea { min-height: 100px; resize: vertical; font-family: inherit; }
  .status {
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
    font-size: 14px;
  }
  .status.success { background: #c6f6d5; color: #22543d; }
  .status.error { background: #fed7d7; color: #742a2a; }
  .status.loading { background: #bee3f8; color: #2c5282; }
  .section {
    margin-top: 30px;
    padding-top: 30px;
    border-top: 2px solid #e2e8f0;
  }
  .commit-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .commit-item {
    background: #f7fafc;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #667eea;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  .commit-content { flex: 1; }
  .commit-message {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 5px;
  }
  .commit-meta {
    font-size: 12px;
    color: #718096;
  }
  .link { color: #667eea; text-decoration: none; font-weight: 600; }
  .link:hover { text-decoration: underline; }
  #disconnectBtn { margin-left: 10px; }
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
  }
  .tab {
    padding: 10px 20px;
    background: none;
    border: none;
    color: #718096;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
  }
  .tab.active {
    color: #667eea;
    border-bottom-color: #667eea;
  }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  .input-group input {
    margin-bottom: 0;
  }
`;
document.head.appendChild(style);

// Render UI
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="container">
    <h1>📋 DevTask Ledger</h1>
    <p class="subtitle">Log your completed dev tasks permanently on-chain</p>

    <div class="wallet-section">
      <button id="connectBtn">Connect Wallet</button>
      <button id="disconnectBtn" style="display: none;">Disconnect</button>
      <div id="walletInfo" class="wallet-info">
        <strong>Connected:</strong>
        <div class="address" id="userAddress"></div>
        <div style="margin-top: 10px;">
          <strong>Tasks logged:</strong> <span id="taskCount">0</span>
        </div>
      </div>
    </div>

    <div id="mainContent" style="display: none;">
      <div class="tabs">
        <button class="tab active" data-tab="github">🔄 GitHub Commits</button>
        <button class="tab" data-tab="manual">✍️ Manual Entry</button>
      </div>

      <div id="githubTab" class="tab-content active">
        <h3>Recent GitHub Commits</h3>
        <div class="input-group">
          <input id="githubUsername" placeholder="GitHub username" style="flex: 1;" />
          <input id="repoName" placeholder="Repository name" style="flex: 1;" />
          <button id="fetchCommitsBtn" class="secondary">Fetch Commits</button>
        </div>
        <div id="commitsList" class="commit-list"></div>
      </div>

      <div id="manualTab" class="tab-content">
        <h3>✍️ Log a Completed Task</h3>
        <input id="taskTitle" placeholder="e.g., Implemented user authentication" maxlength="100" />
        <textarea id="taskDesc" placeholder="e.g., Added JWT-based auth with password hashing and session management" maxlength="500"></textarea>
        <button id="logTaskBtn" style="width: 100%;">📝 Submit to Blockchain</button>
        <p style="font-size: 12px; color: #718096; margin-top: 10px;">💡 Each submission generates on-chain activity and earns Builder Challenge points!</p>
      </div>
    </div>

    <div id="status" class="status" style="display: none;"></div>

    <div id="taskList" class="section" style="display: none;">
      <h3>Your Tasks</h3>
      <p style="color: #718096;">View your tasks on the <a href="#" id="explorerLink" target="_blank" class="link">Stacks Explorer</a></p>
    </div>
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
  el.className = `status ${type}`;
  el.style.display = message ? 'block' : 'none';
  if (message && type !== 'loading') {
    setTimeout(() => {
      el.style.display = 'none';
    }, 5000);
  }
}

async function connectWallet() {
  console.log('Connecting wallet...');
  showStatus('Opening Leather wallet...', 'loading');

  try {
    await showConnect({
      appDetails: {
        name: 'DevTask Ledger',
        icon: window.location.origin + '/favicon.svg',
      },
      redirectTo: '/',
      userSession,
      onFinish: () => {
        console.log('onFinish called');
        handleAuthResponse();
      },
    });
  } catch (err: any) {
    console.error('Connect error:', err);
    showStatus('Connect failed: ' + (err?.message || String(err)), 'error');
  }
}

function handleAuthResponse() {
  console.log('Handling auth response...');
  setTimeout(() => {
    if (userSession.isUserSignedIn()) {
      console.log('User is signed in!');
      userData = userSession.loadUserData();
      console.log('User data:', userData);
      updateUI();
      showStatus('Wallet connected successfully!', 'success');
    } else {
      console.log('User not signed in after auth');
      showStatus('Authentication incomplete. Please try again.', 'error');
    }
  }, 100);
}

function disconnectWallet() {
  userSession.signUserOut();
  userData = null;
  updateUI();
  showStatus('Disconnected', '');
}

async function fetchGitHubCommits() {
  if (!octokit) {
    showStatus(
      'GitHub token not configured. Add VITE_GITHUB_TOKEN to .env',
      'error',
    );
    return;
  }

  const username = (
    document.getElementById('githubUsername') as HTMLInputElement
  ).value.trim();
  const repo = (
    document.getElementById('repoName') as HTMLInputElement
  ).value.trim();

  if (!username || !repo) {
    showStatus('Please enter both username and repository name', 'error');
    return;
  }

  showStatus('Fetching commits from GitHub...', 'loading');

  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: username,
      repo: repo,
      per_page: 10,
    });

    displayCommits(commits);
    showStatus(`Loaded ${commits.length} commits`, 'success');
  } catch (err: any) {
    console.error('GitHub fetch error:', err);
    showStatus(
      'Failed to fetch commits: ' + (err?.message || 'Repository not found'),
      'error',
    );
  }
}

function displayCommits(commits: any[]) {
  const commitsList = document.getElementById('commitsList')!;

  if (commits.length === 0) {
    commitsList.innerHTML = '<p style="color: #718096;">No commits found</p>';
    return;
  }

  commitsList.innerHTML = commits
    .map((commit, index) => {
      const message = commit.commit.message.split('\n')[0]; // First line only
      const date = new Date(commit.commit.author.date).toLocaleDateString();
      const shortSha = commit.sha.substring(0, 7);

      return `
      <div class="commit-item">
        <div class="commit-content">
          <div class="commit-message">${message}</div>
          <div class="commit-meta">${shortSha} • ${date} • by ${commit.commit.author.name}</div>
        </div>
        <button class="secondary" onclick="logCommitToBlockchain(${index})">Log to Chain</button>
      </div>
    `;
    })
    .join('');

  // Store commits globally for logging
  (window as any).githubCommits = commits;
}

(window as any).logCommitToBlockchain = async function (index: number) {
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
};

async function logTask() {
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

  // Clear form
  (document.getElementById('taskTitle') as HTMLInputElement).value = '';
  (document.getElementById('taskDesc') as HTMLTextAreaElement).value = '';
}

async function logTaskToChain(title: string, description: string) {
  console.log('Logging task:', title, description);
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
        console.log('Task logged:', data);
        showStatus('Task logged! Tx: ' + data.txId, 'success');
      },
    });
  } catch (err: any) {
    console.error('logTask error', err);
    showStatus('Error: ' + (err?.message || String(err)), 'error');
  }
}

function updateUI() {
  console.log('Updating UI, userData:', userData);
  const connectBtn = document.getElementById('connectBtn')!;
  const disconnectBtn = document.getElementById('disconnectBtn')!;
  const walletInfo = document.getElementById('walletInfo')!;
  const mainContent = document.getElementById('mainContent')!;
  const userAddress = document.getElementById('userAddress')!;
  const taskList = document.getElementById('taskList')!;
  const explorerLink = document.getElementById(
    'explorerLink',
  )! as HTMLAnchorElement;

  if (userData) {
    console.log('User connected, showing UI');
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';
    walletInfo.classList.add('show');
    mainContent.style.display = 'block';
    taskList.style.display = 'block';

    const address = userData.profile.stxAddress[NETWORK] || '';
    userAddress.textContent = address;
    explorerLink.href = `https://explorer.hiro.so/address/${address}?chain=${NETWORK}`;

    document.getElementById('taskCount')!.textContent = '0';
  } else {
    console.log('User not connected, hiding UI');
    connectBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
    walletInfo.classList.remove('show');
    mainContent.style.display = 'none';
    taskList.style.display = 'none';
  }
}

// Tab switching
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');

    // Update active tab
    document
      .querySelectorAll('.tab')
      .forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`)?.classList.add('active');
  });
});

// Wire UI
document.getElementById('connectBtn')!.addEventListener('click', connectWallet);
document
  .getElementById('disconnectBtn')!
  .addEventListener('click', disconnectWallet);
document.getElementById('logTaskBtn')!.addEventListener('click', logTask);
document
  .getElementById('fetchCommitsBtn')!
  .addEventListener('click', fetchGitHubCommits);

// Check auth state on load
console.log('Initializing, checking auth state...');
if (userSession.isUserSignedIn()) {
  console.log('User already signed in');
  userData = userSession.loadUserData();
  updateUI();
} else if (userSession.isSignInPending()) {
  console.log('Sign in pending, handling...');
  showStatus('Completing authentication...', 'loading');
  userSession
    .handlePendingSignIn()
    .then(() => {
      handleAuthResponse();
    })
    .catch((err) => {
      console.error('handlePendingSignIn error:', err);
      showStatus('Authentication failed: ' + err.message, 'error');
    });
}

console.log('Frontend initialized');
