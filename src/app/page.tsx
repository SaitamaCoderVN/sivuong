import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import { createClient } from '@/lib/supabase/server';
import { getUserStatsAction, getRewardsAction } from '@/lib/actions';
import AuthLanding from './AuthLanding';

export const metadata: Metadata = {
  title: 'Si Vuong Academy - Focused Study',
  description: 'Study with purpose, focus, and unlock rewards.',
};

export default async function StudyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <AuthLanding />;
  }

  // Fetch initial data on the server side
  const stats = await getUserStatsAction();
  
  return (
    <DashboardClient initialUser={user} initialStats={stats} />
  );
}
