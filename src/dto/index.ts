export interface CreateTaskDto {
  developerAddress: string;
  taskId: number;
  title: string;
  description: string;
  blockHeight: bigint;
  txId: string;
  timestamp: Date;
}

export interface UpdateDeveloperDto {
  taskCount?: number;
  lastTaskAt?: Date;
}

export interface DeveloperResponseDto {
  address: string;
  taskCount: number;
  firstTaskAt: Date | null;
  lastTaskAt: Date | null;
  createdAt: Date;
  tasks?: TaskResponseDto[];
  achievements?: AchievementResponseDto[];
}

export interface TaskResponseDto {
  id: number;
  developerAddress: string;
  taskId: number;
  title: string;
  description: string | null;
  blockHeight: bigint;
  txId: string;
  timestamp: Date;
  createdAt: Date;
}

export interface AchievementResponseDto {
  id: number;
  achievementId: string;
  unlockedAt: Date;
}

export interface GlobalStatsDto {
  totalDevelopers: number;
  totalTasks: number;
  activeToday: number;
  lastActivity: Date | null;
}

export interface LeaderboardEntryDto {
  address: string;
  taskCount: number;
  lastTaskAt: Date | null;
  rank?: number;
}

export interface ActivityLogDto {
  id: number;
  developerAddress: string;
  actionType: string;
  metadata: any;
  timestamp: Date;
}

export interface SearchResultDto {
  developers: DeveloperResponseDto[];
  total: number;
}

export interface PaginationDto {
  limit: number;
  offset: number;
  total?: number;
}

export interface ErrorResponseDto {
  error: string;
  message?: string;
  statusCode: number;
}
