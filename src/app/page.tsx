'use client';

import React, { useState, useEffect } from 'react';
import SessionTimer from '@/components/features/SessionTimer';
import RewardReveal from '@/components/features/RewardReveal';
import AuthSession from '@/components/features/AuthSession';
import WeeklyRitual from '@/components/features/WeeklyRitual';
import { Reward, UserStats } from '@/lib/types';
import { completeSessionAction, getUserStatsAction } from '@/lib/actions';
import { Zap, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatItem } from '@/components/ui/stat-item';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFocusMode } from '@/lib/contexts/FocusModeContext';
import { Heading, Text } from '@/components/ui/typography';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function StudyPage() {
  const { isFocusMode } = useFocusMode();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 1. Initial check
    const checkUser = async () => {
      // Small timeout to allow auth cookie to set after redirect
      if (window.location.search.includes('code=') || window.location.search.includes('token_hash=')) {
        setIsLoading(true);
        // Supabase client auto-handles URL params in the background when instance starts
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const stats = await getUserStatsAction();
        setUserStats(stats);
      }
      setIsLoading(false);
    };

    checkUser();

    // 2. Listen to state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const stats = await getUserStatsAction();
          setUserStats(stats);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserStats(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSessionComplete = async (minutes: number) => {
    if (!user) {
      toast.error(t('identityRequired'));
      return;
    }

    try {
      const result = await completeSessionAction(minutes, null);
      
      if (result && 'error' in result) {
        toast.error(result.error as string || t('ritualFailed'));
        return;
      }

      setCurrentReward(result.reward);
      setCurrentHistoryId(result.historyId);
      
      const stats = await getUserStatsAction();
      setUserStats(stats);
    } catch (error) {
      toast.error(t('connectionDisrupted'));
    }
  };

  const closeRewardModal = () => {
    setCurrentReward(null);
    setCurrentHistoryId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

    if (!user) {
      return (
        <div className="py-24 md:py-40 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-16 max-w-4xl mb-32"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-6 py-2 text-[10px] font-bold text-muted-foreground shadow-sm uppercase tracking-[0.5em]">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {t('disciplineOfFocus')}
            </div>
            
            <div className="space-y-8">
              <Heading level="h1" className="text-5xl md:text-[9rem] leading-[0.8] tracking-tighter mb-6">
                {t('brand')}
              </Heading>
              <Text variant="lead" className="text-xl md:text-2xl max-w-2xl mx-auto font-medium">
                {t('tagline')}
              </Text>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 gap-8">
                {[
                  { title: t('start'), desc: t('defineIntent') },
                  { title: t('rewardReveal'), desc: t('tagline') },
                  { title: t('statusFocused'), desc: t('disciplineOfFocus') },
                ].map((feature, i) => (
                  <Card key={i} className="academic-card p-12 group">
                    <div className="space-y-4">
                      <Heading level="h3" className="text-2xl group-hover:text-primary transition-colors">{feature.title}</Heading>
                      <Text variant="muted" className="text-lg font-medium leading-relaxed">{feature.desc}</Text>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
  
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-16 rounded-[2.5rem] border border-border shadow-2xl shadow-slate-200/50 md:sticky md:top-40"
            >
              <div className="space-y-12">
                <div className="space-y-6">
                  <Heading level="h2" className="border-none pb-0 text-4xl tracking-tighter">{t('beginJourney')}</Heading>
                  <Text variant="muted" className="text-lg font-medium leading-relaxed">{t('joinCommunity')}</Text>
                </div>
                <AuthSession />
                <div className="pt-10 border-t border-border">
                  <Text variant="tiny" className="text-center uppercase tracking-[0.5em] leading-relaxed">
                    {t('commitmentText')}
                  </Text>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }


  return (
    <div className={cn("flex flex-col gap-16 transition-all duration-1000", isFocusMode && "gap-0")}>
      {/* Dashboard Header */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12 pb-12 lg:pb-16 border-b border-border"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('portal')}
              </div>
              <Heading level="h1" className="text-6xl tracking-tighter leading-none">
                {t('brand')}
              </Heading>
                <div className="flex flex-col gap-2">
                  <Text variant="lead" className="text-lg lg:text-xl font-medium max-w-lg leading-relaxed">
                    {t('welcome')}, <span className="text-foreground font-bold break-all">{user.email?.split('@')[0]}</span>.
                  </Text>
                  <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.4em] bg-primary/5 w-fit px-4 py-1.5 rounded-full border border-primary/10">
                    {t('streak')}: 6 {t('days')}
                  </div>
                </div>
            </div>

              <div className="flex items-center gap-6">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleSignOut}
                  className="rounded-2xl px-8 h-14 font-bold transition-all active:scale-95 text-[10px] uppercase tracking-widest"
                >
                  {t('signOut')}
                </Button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-16 transition-all duration-1000",
        isFocusMode && "lg:grid-cols-1 gap-0"
      )}>
        {/* Main Focus Area */}
        <div className={cn(
          "lg:col-span-8 space-y-16 transition-all duration-1000",
          isFocusMode && "lg:col-span-12 space-y-0"
        )}>
          <section className="space-y-6">
            <AnimatePresence>
              {!isFocusMode && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between px-2"
                >
                  <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground">
                    {t('activeSession')}
                  </Text>
                  <div className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border uppercase tracking-widest">
                    {t('statusFocused')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              layout
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <SessionTimer onComplete={handleSessionComplete} />
            </motion.div>
          </section>

          <AnimatePresence>
            {!isFocusMode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-16"
              >
                <WeeklyRitual />

                <section className="space-y-6">
                  <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground px-2">
                    {t('performanceMetrics')}
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                    <Card className="academic-card group">
                      <CardContent className="p-8 lg:p-12">
                        <StatItem 
                          label={t('points')}
                          value={userStats?.totalPoints || 0}
                          icon={Zap}
                          description={t('pointsDesc')}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="academic-card group">
                      <CardContent className="p-8 lg:p-12">
                        <StatItem 
                          label={t('rituals')}
                          value={userStats?.totalSessions || 0}
                          icon={Star}
                          description={t('ritualsDesc')}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Info */}
        <AnimatePresence>
          {!isFocusMode && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="lg:col-span-4 space-y-16"
            >
              <section className="space-y-6">
                <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground px-2">
                  {t('dailyDiscipline')}
                </Text>
                <Card className="academic-card">
                  <CardContent className="p-8 lg:p-12 space-y-10 lg:space-y-12">
                    <div className="space-y-6">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.4em]">
                        <span className="text-muted-foreground">{t('targetProgress')}</span>
                        <span className="text-foreground">75%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-primary/80 w-3/4 rounded-full transition-all duration-1000 ease-out" />
                      </div>
                      <Text variant="tiny" className="text-center uppercase tracking-[0.3em]">3 of 4 {t('ritualsComplete')}</Text>
                    </div>
                    
                    <div className="p-8 lg:p-10 rounded-[2rem] bg-muted/30 border border-border relative overflow-hidden group hover:bg-card hover:border-border transition-all shadow-inner hover:shadow-md">
                      <p className="text-base lg:text-lg text-muted-foreground italic leading-relaxed relative z-10 font-medium">
                        &quot;Concentrated study is not just a habit, it is a ritual of self-respect and intellectual pursuit.&quot;
                      </p>
                      <Text variant="tiny" className="mt-8 uppercase tracking-[0.4em]">{t('ritualWisdom')}</Text>
                    </div>

                    <div className="pt-8 space-y-8 border-t border-border">
                      <Text variant="tiny" className="uppercase tracking-[0.5em] px-1">{t('academyLinks')}</Text>
                      <div className="grid grid-cols-1 gap-6">
                        <Button variant="outline" className="justify-between h-16 rounded-2xl px-8 group border-border hover:border-primary/30 transition-all active:scale-95 shadow-sm" asChild>
                          <Link href="/achievements">
                            <span className="font-bold text-muted-foreground group-hover:text-foreground">{t('meritRecords')}</span>
                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RewardReveal 
        reward={currentReward} 
        historyId={currentHistoryId}
        onClose={closeRewardModal} 
      />
    </div>
  );
}
