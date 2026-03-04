'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { playTickSound, playBellSound } from '@/lib/audio';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusMode } from "@/lib/contexts/FocusModeContext";
import { Heading, Text } from "@/components/ui/typography";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SessionTimerProps {
  onComplete: (minutes: number) => void;
}

export default function SessionTimer({ onComplete }: SessionTimerProps) {
  const { isFocusMode, setIsFocusMode } = useFocusMode();
  const { t } = useLanguage();
  const [minutesInput, setMinutesInput] = useState<number>(25);
  const [intent, setIntent] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (minutesInput <= 0) return;
    if (!intent.trim()) return;
    setTimeLeft(minutesInput * 60);
    setIsActive(true);
    setIsFinished(false);
    setIsFocusMode(true);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setTimeLeft(0);
    setIsFocusMode(false);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (isSoundEnabled) {
        playTickSound();
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      setIsFocusMode(false);
      if (isSoundEnabled) {
        playBellSound();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, setIsFocusMode, isSoundEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = () => {
    onComplete(minutesInput);
    setIsFinished(false);
    setTimeLeft(0);
  };

  const totalSeconds = minutesInput * 60;
  const progressValue = isActive ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <Card className={cn(
      "mx-auto w-full transition-all duration-1000 ease-in-out overflow-hidden rounded-[2.5rem]",
      isFocusMode 
        ? "border-transparent bg-transparent shadow-none" 
        : "border-border bg-card shadow-xl shadow-slate-200/50"
    )}>
      <CardContent className={cn(
        "flex flex-col items-center relative transition-all duration-1000",
        isFocusMode ? "py-8 md:py-20" : "py-10 md:py-28 px-6 md:px-10"
      )}>
        <button 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="absolute top-6 right-6 md:top-8 md:right-8 text-muted-foreground hover:text-foreground transition-all z-50 p-2.5 bg-muted/20 hover:bg-muted/40 rounded-full"
          title={isSoundEnabled ? t('muteSound') || "Mute sound" : t('enableSound') || "Enable sound"}
        >
          {isSoundEnabled ? <Volume2 className="h-4 w-4 md:h-5 md:w-5" /> : <VolumeX className="h-4 w-4 md:h-5 md:w-5" />}
        </button>
          <AnimatePresence mode="wait">
            {!isActive && !isFinished ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-12 w-full max-w-lg relative z-10"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground mb-2">{t('preparation')}</Text>
                  <Heading level="h3" className="tracking-tight">{t('defineIntent')}</Heading>
                  <Text variant="muted" className="max-w-sm font-medium leading-relaxed">
                    {t('tagline')}
                  </Text>
                </div>

                <div className="w-full space-y-8">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t('intentPlaceholder')}
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      className="w-full h-14 md:h-16 bg-muted/50 border border-border rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-center"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <Text variant="tiny" className="uppercase tracking-[0.3em] text-muted-foreground">{t('duration')}</Text>
                      <Text variant="small" className="font-bold tabular-nums">{minutesInput} {t('minutes')}</Text>
                    </div>
                    <div className="flex gap-2">
                      {[15, 25, 45, 60, 90].map((val) => (
                        <button
                          key={val}
                          onClick={() => setMinutesInput(val)}
                            className={cn(
                              "flex-1 h-10 md:h-12 text-[10px] md:text-xs font-bold rounded-xl border transition-all active:scale-95",
                              minutesInput === val 
                                ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                                : "bg-card text-muted-foreground border-border hover:border-slate-300 hover:bg-muted/50"
                            )}
                        >
                          {val}{t('minutesShort')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={startTimer} 
                  size="lg" 
                  disabled={!intent.trim()}
                  className="w-full h-16 md:h-20 rounded-2xl md:rounded-3xl text-lg md:text-xl font-bold shadow-xl hover:shadow-primary/30 transition-all group active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  <Play className="fill-current h-4 w-4 mr-3" strokeWidth={2.5} />
                  <span>{t('start')}</span>
                </Button>
              </motion.div>
            ) : isFinished ? (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center gap-12 relative z-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
                  <div className="h-32 w-32 rounded-full bg-card border border-border flex items-center justify-center text-primary relative z-10 shadow-xl">
                    <CheckCircle className="h-14 w-14" strokeWidth={1} />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 text-center">
                  <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground mb-2">{t('finished')}</Text>
                  <Heading level="h3" className="tracking-tight">{t('ritualComplete')}</Heading>
                  <div className="px-6 py-2 rounded-full bg-muted/50 border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground italic">
                    &quot;{intent}&quot;
                  </div>
                </div>

                <div className="flex flex-col w-full max-w-sm gap-6">
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="w-full h-20 rounded-3xl text-2xl font-bold shadow-2xl hover:shadow-primary/30 group active:scale-95"
                  >
                    <span>{t('conclude')}</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-12 w-full px-6 relative z-10"
              >
                <div className="flex flex-col items-center gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.6em] text-muted-foreground mb-4"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {t('focusing')}: {intent}
                    </motion.div>
                    <div className="text-timer">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-3xl space-y-12 flex flex-col items-center">
                  <div className="w-full space-y-6">
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border">
                      <motion.div 
                        className="h-full bg-primary/80 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressValue}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground px-1">
                      <span>{Math.round(progressValue)}% {t('discharged')}</span>
                      <span>{formatTime(timeLeft)} {t('remaining')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-8">
                    <button
                      onClick={stopTimer}
                      className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {t('abandonRitual')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      </CardContent>
    </Card>
  );
}
