export interface Task {
  developer: string;
  taskId: number;
  title: string;
  description: string;
  timestamp: number;
}

export interface DeveloperStats {
  address: string;
  taskCount: number;
  lastActive: number;
}
