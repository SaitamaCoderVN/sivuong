export type RewardTag = 'food' | 'exercise' | 'entertainment' | 'relax' | 'mental';

export interface Reward {
  id: number;
  text: string;
}

export interface HistoryEntry {
  id?: string;
  userId?: string;
  rewardId: number;
  rewardText: string;
  minutes: number;
  pointsEarned: number;
  imageUrl?: string | null;
  createdAt: string; // ISO string
}

export interface UserStats {
  totalPoints: number;
  totalSessions: number;
}
