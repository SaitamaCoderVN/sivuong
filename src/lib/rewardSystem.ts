import { Reward } from './types';

/**
 * Returns a random reward that is not the same as the last reward.
 * If only one reward exists, allow repeat safely.
 */
export function getRandomReward(rewards: Reward[], lastRewardId: number | null): Reward {
  if (rewards.length === 0) {
    throw new Error('No rewards available');
  }

  if (rewards.length === 1) {
    return rewards[0];
  }

  const availableRewards = rewards.filter(r => r.id !== lastRewardId);
  const randomIndex = Math.floor(Math.random() * availableRewards.length);
  return availableRewards[randomIndex];
}

/**
 * Calculate points based on session duration.
 * formula: points = floor(minutes / 5) * 2
 */
export function calculatePoints(minutes: number): number {
  return Math.floor(minutes / 5) * 2;
}
