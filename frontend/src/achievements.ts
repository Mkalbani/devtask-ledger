export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  unlocked: boolean;
}

export function getAchievements(taskCount: number): Achievement[] {
  return [
    {
      id: 'first-task',
      title: 'Getting Started',
      description: 'Log your first task',
      icon: '🎯',
      requirement: 1,
      current: taskCount,
      unlocked: taskCount >= 1,
    },
    {
      id: 'early-adopter',
      title: 'Early Adopter',
      description: 'Log 5 tasks',
      icon: '🌟',
      requirement: 5,
      current: taskCount,
      unlocked: taskCount >= 5,
    },
    {
      id: 'consistent',
      title: 'Consistent Contributor',
      description: 'Log 10 tasks',
      icon: '💪',
      requirement: 10,
      current: taskCount,
      unlocked: taskCount >= 10,
    },
    {
      id: 'power-user',
      title: 'Power User',
      description: 'Log 25 tasks',
      icon: '🚀',
      requirement: 25,
      current: taskCount,
      unlocked: taskCount >= 25,
    },
    {
      id: 'legendary',
      title: 'Legendary Builder',
      description: 'Log 50 tasks',
      icon: '👑',
      requirement: 50,
      current: taskCount,
      unlocked: taskCount >= 50,
    },
    {
      id: 'unstoppable',
      title: 'Unstoppable',
      description: 'Log 100 tasks',
      icon: '🔥',
      requirement: 100,
      current: taskCount,
      unlocked: taskCount >= 100,
    },
  ];
}

export function renderAchievementCard(achievement: Achievement): string {
  const progress = Math.min(
    (achievement.current / achievement.requirement) * 100,
    100,
  );
  const opacity = achievement.unlocked ? '1' : '0.5';

  return `
    <div class="achievement-card" style="opacity: ${opacity}">
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-desc">${achievement.description}</div>
        <div class="achievement-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-text">${achievement.current} / ${achievement.requirement}</div>
        </div>
      </div>
      ${achievement.unlocked ? '<div class="achievement-badge">✓ Unlocked</div>' : ''}
    </div>
  `;
}
