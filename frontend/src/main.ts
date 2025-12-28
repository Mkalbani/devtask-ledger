import './styles.css';
import { renderApp, setupTabSwitching } from './ui';
import {
  connectLeather,
  connectXverse,
  disconnectWallet,
  initializeAuth,
} from './wallet';
import { logTask, bulkLogTasks, logCommitToBlockchain } from './blockchain';
import { fetchGitHubCommits } from './github';

// Render the app
renderApp();

// Setup tab switching
setupTabSwitching();

// Wire up event listeners
document
  .getElementById('connectLeatherBtn')!
  .addEventListener('click', connectLeather);
document
  .getElementById('connectXverseBtn')!
  .addEventListener('click', connectXverse);
document
  .getElementById('disconnectBtn')!
  .addEventListener('click', disconnectWallet);
document.getElementById('logTaskBtn')!.addEventListener('click', logTask);
document.getElementById('bulkLogBtn')!.addEventListener('click', bulkLogTasks);
document
  .getElementById('fetchCommitsBtn')!
  .addEventListener('click', fetchGitHubCommits);

// Make functions available globally for inline handlers
(window as any).logCommitToBlockchain = logCommitToBlockchain;

// Initialize authentication
initializeAuth();

console.log('Frontend initialized with dual SDK support');
