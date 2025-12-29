export function renderApp(): void {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h1>📋 DevTask Ledger <span class="badge">Dual SDK</span></h1>
        <a href="/dashboard" style="text-decoration: none;">
          <button class="secondary">📊 Team Dashboard</button>
        </a>
      </div>
      <p class="subtitle">Log your completed dev tasks permanently on-chain</p>

      <div class="sdk-indicator">
        <strong>🎯 Multi-SDK Integration Active:</strong> Using both @stacks/connect AND sats-connect for maximum Builder Challenge points!
      </div>

      <div class="wallet-section">
        <div class="wallet-buttons">
          <button id="connectLeatherBtn">Connect Leather (Stacks Connect)</button>
          <button id="connectXverseBtn" class="xverse">Connect Xverse (Sats Connect)</button>
          <button id="disconnectBtn" style="display: none;">Disconnect</button>
        </div>
        <div id="walletInfo" class="wallet-info">
          <strong>Connected via:</strong> <span id="walletType"></span><br>
          <strong>Address:</strong>
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
          
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button id="logTaskBtn" style="flex: 1;">📝 Submit to Blockchain</button>
            <button id="bulkLogBtn" class="secondary" style="flex: 1;">⚡ Bulk Log (5x)</button>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 12px; font-size: 13px;">
            <strong>💰 Gas Fees:</strong> Single log ~0.001 STX | Bulk (5x) ~0.005 STX<br>
            <strong>⚡ Bulk logging = 5x leaderboard points in one transaction!</strong>
          </div>
          
          <p style="font-size: 12px; color: #718096; margin-top: 10px;">💡 Each submission generates on-chain activity and earns Builder Challenge points!</p>
        </div>
      </div>

      <div id="status" class="status" style="display: none;"></div>

      <div id="taskList" class="section" style="display: none;">
        <h3>Your Tasks</h3>
        <p style="color: #718096;">View your tasks on the <a href="#" id="explorerLink" target="_blank" class="link">Stacks Explorer</a></p>
      </div>

      <div class="section" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px;">
        <h3 style="margin-bottom: 15px;">🌍 Global Stats</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #92400e;" id="globalDevCount">...</div>
            <div style="font-size: 12px; color: #78350f;">Active Developers</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #92400e;" id="globalTaskCount">...</div>
            <div style="font-size: 12px; color: #78350f;">Total Tasks</div>
          </div>
          <div style="text-align: center;">
            <a href="/dashboard" style="text-decoration: none;">
              <button class="secondary" style="margin-top: 8px;">View Dashboard →</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load global stats for widget
export async function loadGlobalStats(): Promise<void> {
  // Mock data - in production would aggregate from blockchain
  document.getElementById('globalDevCount')!.textContent = '3';
  document.getElementById('globalTaskCount')!.textContent = '12+';
}

export function showStatus(
  message: string,
  type: 'loading' | 'success' | 'error' | '',
): void {
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

export function setupTabSwitching(): void {
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
}
