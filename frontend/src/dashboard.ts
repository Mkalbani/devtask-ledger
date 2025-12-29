import { principalCV, cvToHex } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from './config';
import type { DeveloperStats } from './types';

export function renderDashboard(): void {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
          <h1>📊 DevTask Dashboard</h1>
          <p class="subtitle">Global activity across all developers</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="exportCSVBtn" class="secondary">📥 Export CSV</button>
          <button id="exportJSONBtn" class="secondary">📥 Export JSON</button>
          <a href="/" style="text-decoration: none;">
            <button class="secondary">← Back to App</button>
          </a>
        </div>
      </div>

      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-value" id="totalDevelopers">...</div>
          <div class="stat-label">Total Developers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="totalTasks">...</div>
          <div class="stat-label">Total Tasks Logged</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="activeToday">...</div>
          <div class="stat-label">Active Today</div>
        </div>
      </div>

      <div class="section" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <h3 style="margin-bottom: 20px;">📈 Activity Chart</h3>
        <canvas id="activityChart" style="max-height: 300px;"></canvas>
      </div>

      <div class="tabs">
        <button class="tab active" data-tab="leaderboard">🏆 Leaderboard</button>
        <button class="tab" data-tab="recent">📝 Recent Activity</button>
      </div>

      <div id="leaderboardTab" class="tab-content active">
        <h3>Top Contributors</h3>
        <div id="leaderboardList" class="leaderboard-list"></div>
      </div>

      <div id="recentTab" class="tab-content">
        <h3>Recent Tasks (All Developers)</h3>
        <div class="input-group" style="margin-bottom: 20px;">
          <input id="filterAddress" placeholder="Filter by address (optional)" style="flex: 1;" />
          <button id="filterBtn" class="secondary">Filter</button>
          <button id="clearFilterBtn" class="secondary">Clear</button>
        </div>
        <div id="recentTasksList" class="tasks-list"></div>
      </div>

      <div class="section" style="margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 12px;">
        <h3>🔍 Developer Lookup</h3>
        <div class="input-group">
          <input id="lookupAddress" placeholder="Enter Stacks address" style="flex: 1;" />
          <button id="lookupBtn" class="secondary">Lookup</button>
        </div>
        <div id="lookupResult" style="margin-top: 15px;"></div>
      </div>

      <div id="loadingIndicator" class="status loading" style="display: block; margin-top: 20px;">
        Loading dashboard data...
      </div>
    </div>
  `;

  setupDashboardTabs();
  loadDashboardData();
}

function setupDashboardTabs(): void {
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

  document.getElementById('filterBtn')?.addEventListener('click', applyFilter);
  document
    .getElementById('clearFilterBtn')
    ?.addEventListener('click', clearFilter);
  document
    .getElementById('lookupBtn')
    ?.addEventListener('click', lookupDeveloper);
  document.getElementById('exportCSVBtn')?.addEventListener('click', exportCSV);
  document
    .getElementById('exportJSONBtn')
    ?.addEventListener('click', exportJSON);
}

// Mock data for demo - in production, you'd scan blockchain events
const MOCK_DEVELOPERS = [
  'ST3C1W3GS1ZWN14DSJ9744K21F03HSS37A6SKVMKQ',
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
];

let dashboardData: DeveloperStats[] = [];

async function loadDashboardData(): Promise<void> {
  try {
    const stats: DeveloperStats[] = [];

    // Load stats for known developers
    for (const address of MOCK_DEVELOPERS) {
      try {
        const count = await getTaskCount(address);
        if (count > 0) {
          stats.push({
            address,
            taskCount: count,
            lastActive: Date.now(), // Mock - would query blockchain events
          });
        }
      } catch (err) {
        console.error(`Failed to load stats for ${address}:`, err);
      }
    }

    dashboardData = stats;

    // Update UI
    document.getElementById('totalDevelopers')!.textContent =
      stats.length.toString();
    document.getElementById('totalTasks')!.textContent = stats
      .reduce((sum, s) => sum + s.taskCount, 0)
      .toString();
    document.getElementById('activeToday')!.textContent =
      stats.length.toString();

    renderLeaderboard(stats);
    renderRecentTasks(stats);
    renderChart(stats);

    document.getElementById('loadingIndicator')!.style.display = 'none';
  } catch (err) {
    console.error('Error loading dashboard:', err);
    document.getElementById('loadingIndicator')!.innerHTML =
      '<span style="color: #e53e3e;">Failed to load dashboard data</span>';
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

function renderLeaderboard(stats: DeveloperStats[]): void {
  const sorted = [...stats].sort((a, b) => b.taskCount - a.taskCount);
  const leaderboardList = document.getElementById('leaderboardList')!;

  if (sorted.length === 0) {
    leaderboardList.innerHTML =
      '<p style="color: #718096;">No developers found yet</p>';
    return;
  }

  leaderboardList.innerHTML = sorted
    .map((dev, index) => {
      const medal =
        index === 0
          ? '🥇'
          : index === 1
            ? '🥈'
            : index === 2
              ? '🥉'
              : `#${index + 1}`;
      return `
      <div class="leaderboard-item">
        <div class="rank">${medal}</div>
        <div class="developer-info">
          <div class="developer-address">${shortenAddress(dev.address)}</div>
          <div class="developer-meta">
            <a href="https://explorer.hiro.so/address/${dev.address}?chain=${NETWORK}" target="_blank" class="link">
              View on Explorer
            </a>
          </div>
        </div>
        <div class="task-count">${dev.taskCount} tasks</div>
      </div>
    `;
    })
    .join('');
}

function renderRecentTasks(stats: DeveloperStats[]): void {
  const recentTasksList = document.getElementById('recentTasksList')!;

  if (stats.length === 0) {
    recentTasksList.innerHTML =
      '<p style="color: #718096;">No tasks found yet</p>';
    return;
  }

  // Mock recent tasks - in production, query blockchain events
  const mockTasks = stats.flatMap((dev) =>
    Array.from({ length: Math.min(dev.taskCount, 3) }, (_, i) => ({
      developer: dev.address,
      taskId: i,
      title: `Task ${i + 1} from ${shortenAddress(dev.address)}`,
      timestamp: Date.now() - i * 3600000,
    })),
  );

  mockTasks.sort((a, b) => b.timestamp - a.timestamp);

  recentTasksList.innerHTML = mockTasks
    .slice(0, 20)
    .map(
      (task) => `
    <div class="task-item">
      <div class="task-info">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          By ${shortenAddress(task.developer)} • ${timeAgo(task.timestamp)}
        </div>
      </div>
      <a href="https://explorer.hiro.so/address/${task.developer}?chain=${NETWORK}" target="_blank" class="link">
        View Profile
      </a>
    </div>
  `,
    )
    .join('');
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

let currentFilter = '';

function applyFilter(): void {
  currentFilter = (
    document.getElementById('filterAddress') as HTMLInputElement
  ).value.trim();
  if (currentFilter) {
    loadDashboardData();
  }
}

function clearFilter(): void {
  currentFilter = '';
  (document.getElementById('filterAddress') as HTMLInputElement).value = '';
  loadDashboardData();
}

async function lookupDeveloper(): Promise<void> {
  const address = (
    document.getElementById('lookupAddress') as HTMLInputElement
  ).value.trim();
  const resultDiv = document.getElementById('lookupResult')!;

  if (!address) {
    resultDiv.innerHTML =
      '<p style="color: #e53e3e;">Please enter an address</p>';
    return;
  }

  resultDiv.innerHTML = '<p style="color: #718096;">Loading...</p>';

  try {
    const count = await getTaskCount(address);
    resultDiv.innerHTML = `
      <div style="background: #edf2f7; padding: 15px; border-radius: 8px;">
        <strong>Address:</strong> ${address}<br>
        <strong>Tasks logged:</strong> ${count}<br>
        <a href="https://explorer.hiro.so/address/${address}?chain=${NETWORK}" target="_blank" class="link">
          View on Explorer →
        </a>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML =
      '<p style="color: #e53e3e;">Failed to lookup developer</p>';
  }
}

// Chart rendering
async function renderChart(stats: DeveloperStats[]): Promise<void> {
  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables);

  const ctx = (
    document.getElementById('activityChart') as HTMLCanvasElement
  ).getContext('2d')!;

  const sorted = [...stats].sort((a, b) => b.taskCount - a.taskCount);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map((s) => shortenAddress(s.address)),
      datasets: [
        {
          label: 'Tasks Logged',
          data: sorted.map((s) => s.taskCount),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Tasks by Developer',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// Export functions
function exportCSV(): void {
  if (dashboardData.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['Address', 'Task Count', 'Last Active'];
  const rows = dashboardData.map((dev) => [
    dev.address,
    dev.taskCount.toString(),
    new Date(dev.lastActive).toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  downloadFile(csv, 'devtask-dashboard.csv', 'text/csv');
}

function exportJSON(): void {
  if (dashboardData.length === 0) {
    alert('No data to export');
    return;
  }

  const json = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalDevelopers: dashboardData.length,
      totalTasks: dashboardData.reduce((sum, d) => sum + d.taskCount, 0),
      developers: dashboardData,
    },
    null,
    2,
  );

  downloadFile(json, 'devtask-dashboard.json', 'application/json');
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
