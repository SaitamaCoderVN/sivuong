'use server'

import { createClient } from './supabase/server'
import { loadRewardsFromMDX } from './rewardLoader'
import { getRandomReward, calculatePoints } from './rewardSystem'
import { HistoryEntry, Reward, UserStats } from './types'

export async function getRewardsAction(): Promise<Reward[]> {
  return loadRewardsFromMDX()
}

export async function completeSessionAction(minutes: number, lastRewardId: number | null) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const rewards = loadRewardsFromMDX()
    const reward = getRandomReward(rewards, lastRewardId)
    const points = calculatePoints(minutes)

    // 1. Insert reward history
    const { data: history, error: historyError } = await supabase
      .from('reward_history')
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        reward_text: reward.text,
        minutes,
        points_earned: points,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (historyError) {
      console.error("HISTORY INSERT ERROR:", historyError)
      throw historyError
    }

    if (!history) {
      throw new Error("Failed to insert reward history")
    }

    // 2. Update user stats in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points, total_sessions')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("PROFILE FETCH ERROR:", profileError)
      throw profileError
    }

    const currentPoints = profile?.total_points ?? 0
    const currentSessions = profile?.total_sessions ?? 0

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        total_points: currentPoints + points,
        total_sessions: currentSessions + 1,
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      console.error("PROFILE UPSERT ERROR:", updateError)
      throw updateError
    }

    return {
      reward,
      points,
      historyId: history.id
    }
  } catch (error: any) {
    console.error("COMPLETE SESSION ERROR:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })

    // Return structured error for the client to handle
    return {
      error: error.message || "An unknown error occurred during session completion",
      details: error.code ? `Supabase error: ${error.code}` : undefined
    } as any
  }
}

export async function updateHistoryWithImageAction(historyId: string, imageUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { error: updateError } = await supabase
    .from('reward_history')
    .update({ image_url: imageUrl })
    .eq('id', historyId)
    .eq('user_id', user.id)

  if (updateError) throw updateError

  return { success: true }
}

export async function getUserStatsAction(): Promise<UserStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { totalPoints: 0, totalSessions: 0 }

  // Gọi lên Profile, nếu Profile chưa được tự động tạo bởi Trigger, ta phải tạo bù!
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('total_points, total_sessions')
    .eq('id', user.id)
    .single()

  // Bắt lỗi PGRST116 (0 rows returned - Tức là không tìm thấy Profiler của User này trong DB)
  if (profileError && profileError.code === 'PGRST116') {
    // Chủ động tạo mới Profile trên DB luôn
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email ?? '',
      total_points: 0,
      total_sessions: 0
    });
    return { totalPoints: 0, totalSessions: 0 };
  }

  // Nếu đã có sẵn Profile
  return {
    totalPoints: profile?.total_points ?? 0,
    totalSessions: profile?.total_sessions ?? 0
  }
}


export async function getRewardHistoryAction(): Promise<HistoryEntry[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reward_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    rewardId: item.reward_id,
    rewardText: item.reward_text,
    minutes: item.minutes,
    pointsEarned: item.points_earned,
    imageUrl: item.image_url,
    createdAt: item.created_at
  }))
}

export async function createUploadSessionAction(rewardHistoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  const { data, error } = await supabase
    .from('upload_sessions')
    .insert({
      reward_history_id: rewardHistoryId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      used: false
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUploadSessionAction(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('upload_sessions')
    .select('*, reward_history(*)')
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data
}

export async function checkRewardImageAction(historyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reward_history')
    .select('image_url')
    .eq('id', historyId)
    .single()

  if (error) return null
  return data?.image_url
}
