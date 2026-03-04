'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/typography';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { TranslationKey } from '@/lib/i18n';

interface WeeklyRitualProps {
  data?: { day: TranslationKey; sessions: number }[];
}

const DEFAULT_DATA: { day: TranslationKey; sessions: number }[] = [
  { day: 'mon', sessions: 4 },
  { day: 'tue', sessions: 2 },
  { day: 'wed', sessions: 5 },
  { day: 'thu', sessions: 0 },
  { day: 'fri', sessions: 3 },
  { day: 'sat', sessions: 1 },
  { day: 'sun', sessions: 0 },
];

export default function WeeklyRitual({ data = DEFAULT_DATA }: WeeklyRitualProps) {
  const { t } = useLanguage();
  const maxSessions = Math.max(...data.map(d => d.sessions), 1);

  return (
    <section className="space-y-6">
      <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground px-2">{t('weeklyOverview')}</Text>
      <Card className="academic-card">
        <CardContent className="p-10">
          <div className="grid grid-cols-7 gap-4">
            {data.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-6">
                <div className="h-24 w-full bg-muted/50 rounded-2xl border border-border flex flex-col-reverse p-1.5 overflow-hidden">
                  <div 
                    className={cn(
                      "w-full rounded-xl transition-all duration-1000 ease-out",
                      day.sessions > 0 ? "bg-primary/80" : "bg-transparent"
                    )}
                    style={{ height: `${(day.sessions / maxSessions) * 100}%` }}
                  />
                </div>
                <Text variant="tiny" className={cn(
                  "uppercase tracking-widest",
                  day.sessions > 0 ? "text-foreground" : "text-muted-foreground/30"
                )}>
                  {t(day.day)}
                </Text>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tracking-tight">15</span>
              <Text variant="tiny" className="uppercase tracking-widest text-muted-foreground/50">{t('ritualsThisWeek')}</Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/80" />
              <Text variant="tiny" className="uppercase tracking-widest text-muted-foreground/50">{t('disciplineMaintained')}</Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
