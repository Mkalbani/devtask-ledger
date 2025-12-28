import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { request } from 'sats-connect';
import { showStatus } from './ui';
import { loadTaskCount } from './blockchain';
import { NETWORK } from './config';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export let userData: any = null;
export let connectedWallet: 'leather' | 'xverse' | null = null;
export let xverseAddress: string | null = null;

export async function connectLeather(): Promise<void> {
  console.log('Connecting with Leather...');
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
        handleAuthResponse();
      },
    });
  } catch (err: any) {
    console.error('Connect error:', err);
    showStatus('Connect failed: ' + (err?.message || String(err)), 'error');
  }
}

export async function connectXverse(): Promise<void> {
  console.log('Connecting with Xverse...');
  showStatus('Opening Xverse wallet...', 'loading');

  try {
    const response = await request('wallet_connect', null);

    if (response.status === 'success') {
      const stacksAddressItem = response.result.addresses.find(
        (address: any) => address.purpose === 'stacks',
      );

      if (stacksAddressItem) {
        xverseAddress = stacksAddressItem.address;
        connectedWallet = 'xverse';
        updateUI();
        showStatus('Xverse wallet connected successfully!', 'success');
      } else {
        showStatus('No Stacks address found', 'error');
      }
    } else {
      showStatus('Connection cancelled', 'error');
    }
  } catch (err: any) {
    console.error('Xverse connect error:', err);
    showStatus(
      'Xverse connection failed: ' + (err?.message || String(err)),
      'error',
    );
  }
}

function handleAuthResponse(): void {
  console.log('Handling auth response...');
  setTimeout(() => {
    if (userSession.isUserSignedIn()) {
      console.log('User is signed in!');
      userData = userSession.loadUserData();
      connectedWallet = 'leather';
      updateUI();
      showStatus('Leather wallet connected successfully!', 'success');
    } else {
      showStatus('Authentication incomplete. Please try again.', 'error');
    }
  }, 100);
}

export function disconnectWallet(): void {
  if (connectedWallet === 'leather') {
    userSession.signUserOut();
    userData = null;
  }
  connectedWallet = null;
  xverseAddress = null;
  updateUI();
  showStatus('Disconnected', '');
}

export function updateUI(): void {
  console.log('Updating UI, connectedWallet:', connectedWallet);
  const connectLeatherBtn = document.getElementById('connectLeatherBtn')!;
  const connectXverseBtn = document.getElementById('connectXverseBtn')!;
  const disconnectBtn = document.getElementById('disconnectBtn')!;
  const walletInfo = document.getElementById('walletInfo')!;
  const mainContent = document.getElementById('mainContent')!;
  const userAddress = document.getElementById('userAddress')!;
  const walletType = document.getElementById('walletType')!;
  const taskList = document.getElementById('taskList')!;
  const explorerLink = document.getElementById(
    'explorerLink',
  )! as HTMLAnchorElement;

  if (connectedWallet) {
    const address =
      connectedWallet === 'leather'
        ? userData.profile.stxAddress[NETWORK]
        : xverseAddress!;

    connectLeatherBtn.style.display = 'none';
    connectXverseBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';
    walletInfo.classList.add('show');
    mainContent.style.display = 'block';
    taskList.style.display = 'block';

    userAddress.textContent = address;
    walletType.textContent =
      connectedWallet === 'leather'
        ? '🦙 Leather (Stacks Connect SDK)'
        : '🟣 Xverse (Sats Connect SDK)';
    explorerLink.href = `https://explorer.hiro.so/address/${address}?chain=${NETWORK}`;

    document.getElementById('taskCount')!.textContent = '...';
    loadTaskCount(address);
  } else {
    connectLeatherBtn.style.display = 'inline-block';
    connectXverseBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
    walletInfo.classList.remove('show');
    mainContent.style.display = 'none';
    taskList.style.display = 'none';
  }
}

export function initializeAuth(): void {
  console.log('Initializing, checking auth state...');
  if (userSession.isUserSignedIn()) {
    userData = userSession.loadUserData();
    connectedWallet = 'leather';
    updateUI();
  } else if (userSession.isSignInPending()) {
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
}
