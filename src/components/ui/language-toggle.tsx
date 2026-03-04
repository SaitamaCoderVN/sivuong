'use client';

import * as React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-[10px] font-bold tracking-widest px-2"
    >
      {language === 'en' ? 'EN | VI' : 'VI | EN'}
    </Button>
  );
}
