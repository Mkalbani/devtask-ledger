import { principalCV, cvToHex } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from './config';
import { getAchievements, renderAchievementCard } from './achievements';

export function renderProfile(address: string): void {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <a href="/dashboard" style="text-decoration: none;">
          <button class="secondary">← Back to Dashboard</button>
        </a>
        <div style="display: flex; gap: 10px;">
          <button id="shareProfileBtn" class="secondary">🔗 Share Profile</button>
          <button id="copyAddressBtn" class="secondary">📋 Copy Address</button>
        </div>
      </div>

      <div class="profile-header">
        <h1>Developer Profile</h1>
        <div class="profile-address">${address}</div>
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="profile-stat-value" id="profileTaskCount">...</div>
            <div class="profile-stat-label">Tasks Logged</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value" id="profileRank">...</div>
            <div class="profile-stat-label">Global Rank</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value" id="profileAchievements">...</div>
            <div class="profile-stat-label">Achievements</div>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button class="tab active" data-tab="achievements">🏆 Achievements</button>
        <button class="tab" data-tab="activity">📝 Activity History</button>
      </div>

      <div id="achievementsTab" class="tab-content active">
        <h3>Achievements</h3>
        <div id="achievementsList" class="achievements-grid"></div>
      </div>

      <div id="activityTab" class="tab-content">
        <h3>Recent Activity</h3>
        <div id="activityFeed" class="activity-feed"></div>
      </div>

      <div id="shareModal" style="display: none;"></div>

      <div id="loadingIndicator" class="status loading" style="display: block; margin-top: 20px;">
        Loading profile...
      </div>
    </div>
  `;

  setupProfileTabs();
  loadProfileData(address);
}

function setupProfileTabs(): void {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      document
        .querySelectorAll('.tab')
        .forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}Tab`)?.classList.add('active');
    });
  });

  document.getElementById('shareProfileBtn')?.addEventListener('click', () => {
    showShareModal(window.location.href);
  });

  document.getElementById('copyAddressBtn')?.addEventListener('click', () => {
    const address = window.location.pathname.split('/').pop();
    if (address) {
      navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    }
  });
}

async function loadProfileData(address: string): Promise<void> {
  try {
    const taskCount = await getTaskCount(address);

    document.getElementById('profileTaskCount')!.textContent =
      taskCount.toString();
    document.getElementById('profileRank')!.textContent =
      '#' + Math.floor(Math.random() * 10 + 1); // Mock rank

    const achievements = getAchievements(taskCount);
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    document.getElementById('profileAchievements')!.textContent =
      `${unlockedCount}/${achievements.length}`;

    renderAchievements(achievements);
    renderActivityFeed(address, taskCount);

    document.getElementById('loadingIndicator')!.style.display = 'none';
  } catch (err) {
    console.error('Error loading profile:', err);
    document.getElementById('loadingIndicator')!.innerHTML =
      '<span style="color: #e53e3e;">Failed to load profile</span>';
  }
}

async function getTaskCount(address: string): Promise<number> {
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

  if (data.okay && data.result) {
    const resultHex = data.result.replace('0x', '');
    if (resultHex.length > 0) {
      const safeHex = resultHex.slice(-16);
      const count = parseInt(safeHex, 16);
      return isNaN(count) || count > 1000000 ? 0 : count;
    }
  }
  return 0;
}

function renderAchievements(achievements: any[]): void {
  const achievementsList = document.getElementById('achievementsList')!;
  achievementsList.innerHTML = achievements
    .map((a) => renderAchievementCard(a))
    .join('');
}

function renderActivityFeed(address: string, taskCount: number): void {
  const activityFeed = document.getElementById('activityFeed')!;

  if (taskCount === 0) {
    activityFeed.innerHTML = '<p style="color: #718096;">No activity yet</p>';
    return;
  }

  // Mock activity feed
  const activities = Array.from(
    { length: Math.min(taskCount, 10) },
    (_, i) => ({
      time: Date.now() - i * 3600000 * 24,
      title: `Logged task #${taskCount - i}`,
      description: 'Task completed and logged on-chain',
    }),
  );

  activityFeed.innerHTML = activities
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-time">${timeAgo(activity.time)}</div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-meta">${activity.description}</div>
      </div>
    </div>
  `,
    )
    .join('');
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function showShareModal(url: string): void {
  const modal = document.getElementById('shareModal')!;
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="document.getElementById('shareModal').style.display='none'">
      <div class="modal" onclick="event.stopPropagation()">
        <h2>Share Profile</h2>
        <p style="color: #718096; margin-bottom: 20px;">Share this profile link with others</p>
        
        <div class="share-link-box">${url}</div>
        
        <div class="share-buttons">
          <button onclick="navigator.clipboard.writeText('${url}'); alert('Link copied!')">
            📋 Copy Link
          </button>
          <button onclick="window.open('https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out my DevTask Ledger profile!', '_blank')" class="secondary">
            🐦 Share on Twitter
          </button>
        </div>
        
        <button onclick="document.getElementById('shareModal').style.display='none'" style="margin-top: 20px; width: 100%;">
          Close
        </button>
      </div>
    </div>
  `;
}
