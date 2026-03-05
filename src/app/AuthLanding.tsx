'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/components/ui/typography';
import { useLanguage } from '@/components/providers/LanguageProvider';
import AuthSession from '@/components/features/AuthSession';
import { Card } from '@/components/ui/card';

export default function AuthLanding() {
  const { t } = useLanguage();

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
