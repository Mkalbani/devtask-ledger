import { Octokit } from '@octokit/rest';
import { showStatus } from './ui';
import { GITHUB_TOKEN } from './config';

const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

export async function fetchGitHubCommits(): Promise<void> {
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

function displayCommits(commits: any[]): void {
  const commitsList = document.getElementById('commitsList')!;

  if (commits.length === 0) {
    commitsList.innerHTML = '<p style="color: #718096;">No commits found</p>';
    return;
  }

  commitsList.innerHTML = commits
    .map((commit, index) => {
      const message = commit.commit.message.split('\n')[0];
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

  (window as any).githubCommits = commits;
}
