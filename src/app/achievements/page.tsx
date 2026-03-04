'use client';

import React, { useEffect, useState } from 'react';
import { UserStats, HistoryEntry } from '@/lib/types';
import { getUserStatsAction, getRewardHistoryAction } from '@/lib/actions';
import { Trophy, Clock, Zap, History, ImageIcon, X, Target, Star, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import AuthSession from '@/components/features/AuthSession';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { StatItem } from '@/components/ui/stat-item';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface User {
  id: string;
  email?: string;
}

export default function AchievementsPage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User);
      if (user) {
        const [stats, historyData] = await Promise.all([
          getUserStatsAction(),
          getRewardHistoryAction(),
        ]);
        setUserStats(stats);
        setHistory(historyData);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase.auth]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <div className="flex flex-col items-center gap-16">
          <div className="text-center space-y-6">
            <Heading level="h1" className="text-5xl tracking-tighter">{t('academicHall')}</Heading>
            <Text variant="lead" className="max-w-lg mx-auto font-medium leading-relaxed">
              {t('hallDesc')}
            </Text>
          </div>
          <AuthSession />
        </div>
      </div>
    );
  }

  const totalMinutes = history.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="flex flex-col gap-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-border pb-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            {t('ritualLedger')}
          </div>
          <Heading level="h1" className="text-6xl tracking-tighter leading-none">{t('yourLegacy')}</Heading>
          <Text variant="muted" className="font-medium">{t('legacyDesc')}</Text>
        </div>
        
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 rounded-full bg-muted/50 border border-border flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('ritualStatusActive')}</span>
             </div>
          </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <Card className="academic-card group">
          <CardContent className="p-12">
            <StatItem 
              label={t('points')}
              value={userStats?.totalPoints || 0}
              icon={Zap}
              description={t('totalPoints')}
            />
          </CardContent>
        </Card>
        <Card className="academic-card group">
          <CardContent className="p-12">
            <StatItem 
              label={t('rituals')}
              value={userStats?.totalSessions || 0}
              icon={Star}
              description={t('totalRituals')}
            />
          </CardContent>
        </Card>
        <Card className="academic-card group">
          <CardContent className="p-12">
            <StatItem 
              label={t('focusMinutes')}
              value={totalMinutes}
              icon={Clock}
              description={t('flowTimeDesc')}
            />
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <Heading level="h3" className="text-xl flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span>{t('meritHistory')}</span>
          </Heading>
          <Badge variant="outline" className="text-muted-foreground font-bold px-4 py-1.5 rounded-xl border-border bg-card">
             {history.length} {t('ritualEntries')}
          </Badge>
        </div>
        
        <Card className="academic-card overflow-hidden min-h-[400px]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center border border-border mb-2">
                 <BookOpen className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <Text variant="large">{t('noMeritHistory')}</Text>
                <Text variant="muted" className="max-w-[280px] leading-relaxed">{t('noMeritDesc')}</Text>
              </div>
              <Button variant="outline" className="mt-4 rounded-xl px-8 border-border hover:bg-muted/50 font-bold" onClick={() => window.location.href = '/'}>
                 {t('initiateFirstSession')}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {history.map((entry, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={entry.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-12 hover:bg-muted/30 transition-all gap-10"
                  >
                    <div className="flex items-start gap-8">
                       <div className="mt-1 h-14 w-14 flex-shrink-0 rounded-2xl bg-muted/50 flex items-center justify-center border border-border text-muted-foreground/40 group-hover:bg-card group-hover:text-primary transition-all duration-300">
                          <Target className="h-6 w-6" />
                       </div>
                       <div className="space-y-2">
                          <Heading level="h4" className="text-2xl tracking-tighter leading-none group-hover:text-primary transition-colors">{entry.rewardText}</Heading>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            <span>{formatDate(entry.createdAt)}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span>{entry.minutes} {t('minsRitual')}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-12">
                         <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-foreground font-bold">
                               <Zap className="h-4 w-4 text-primary fill-primary" />
                               <span className="text-3xl tabular-nums leading-none tracking-tighter">+{entry.pointsEarned}</span>
                            </div>
                            <Text variant="tiny" className="uppercase tracking-widest leading-none">{t('points')}</Text>
                         </div>

                      {entry.imageUrl ? (
                        <button 
                          onClick={() => setSelectedImage(entry.imageUrl!)}
                          className="relative h-20 w-20 flex-shrink-0 rounded-3xl overflow-hidden border border-border group-hover:border-primary transition-all shadow-sm group-hover:shadow-md active:scale-95"
                        >
                          <img 
                            src={entry.imageUrl} 
                            alt="Ritual Proof" 
                            className="h-full w-full object-cover transition-all group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                            <ImageIcon className="h-6 w-6 text-white drop-shadow-sm" />
                          </div>
                        </button>
                      ) : (
                        <div className="h-20 w-20 flex-shrink-0 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground/20 border border-border/50">
                          <ImageIcon className="h-8 w-8" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                  </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Image Portal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full flex flex-col items-center gap-8"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 text-slate-900 bg-white hover:bg-slate-50 rounded-full h-12 w-12 shadow-xl border-slate-200 z-10"
              >
                <X className="h-6 w-6" />
              </Button>
              <img 
                src={selectedImage} 
                alt="Enlarged Ritual Proof" 
                className="max-w-full max-h-[75vh] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] border-8 border-white"
              />
              <div className="flex flex-col items-center gap-2">
                 <Text variant="tiny" className="text-white uppercase tracking-[0.4em]">{t('artifactPreserved')}</Text>
                 <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
