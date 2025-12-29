import './styles.css';
import { renderApp, setupTabSwitching, loadGlobalStats } from './ui';
import { renderDashboard } from './dashboard';
import { renderProfile } from './profile';
import {
  connectLeather,
  connectXverse,
  disconnectWallet,
  initializeAuth,
} from './wallet';
import { logTask, bulkLogTasks, logCommitToBlockchain } from './blockchain';
import { fetchGitHubCommits } from './github';

// Router setup
function App() {
  const currentPath = window.location.pathname;

  if (currentPath === '/dashboard') {
    renderDashboard();
  } else if (currentPath.startsWith('/profile/')) {
    const address = currentPath.split('/').pop();
    if (address) {
      renderProfile(address);
    } else {
      window.location.href = '/dashboard';
    }
  } else {
    renderApp();
    setupTabSwitching();
    wireUpEventListeners();
    initializeAuth();
    loadGlobalStats();
  }
}

function wireUpEventListeners() {
  document
    .getElementById('connectLeatherBtn')
    ?.addEventListener('click', connectLeather);
  document
    .getElementById('connectXverseBtn')
    ?.addEventListener('click', connectXverse);
  document
    .getElementById('disconnectBtn')
    ?.addEventListener('click', disconnectWallet);
  document.getElementById('logTaskBtn')?.addEventListener('click', logTask);
  document
    .getElementById('bulkLogBtn')
    ?.addEventListener('click', bulkLogTasks);
  document
    .getElementById('fetchCommitsBtn')
    ?.addEventListener('click', fetchGitHubCommits);

  // Make functions available globally for inline handlers
  (window as any).logCommitToBlockchain = logCommitToBlockchain;
}

// Handle browser navigation
window.addEventListener('popstate', App);
window.addEventListener('load', App);

// Handle link clicks for SPA navigation
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
    e.preventDefault();
    const href = target.getAttribute('href')!;
    window.history.pushState({}, '', href);
    App();
  }
});

console.log('Frontend initialized with dual SDK support + Team Dashboard');
