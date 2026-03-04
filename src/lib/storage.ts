import { UserData, HistoryEntry } from './types';

const STORAGE_KEY = 'study_reward_roulette_data';

const DEFAULT_DATA: UserData = {
  totalPoints: 0,
  totalSessions: 0,
  lastRewardId: null,
  rewardHistory: [],
};

export function loadFromStorage(): UserData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_DATA;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse storage', e);
    return DEFAULT_DATA;
  }
}

export function saveToStorage(data: UserData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addSessionToHistory(
  rewardId: string,
  rewardText: string,
  minutes: number,
  pointsEarned: number
): UserData {
  const currentData = loadFromStorage();
  
  const newEntry: HistoryEntry = {
    rewardId,
    rewardText,
    minutes,
    pointsEarned,
    timestamp: Date.now(),
  };

  const newData: UserData = {
    ...currentData,
    totalPoints: currentData.totalPoints + pointsEarned,
    totalSessions: currentData.totalSessions + 1,
    lastRewardId: rewardId,
    rewardHistory: [newEntry, ...currentData.rewardHistory],
  };

  saveToStorage(newData);
  return newData;
}
