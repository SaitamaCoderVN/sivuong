'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Reward } from '@/lib/types';
import { Camera, CheckCircle2, Smartphone, Upload, Trophy } from 'lucide-react';
import { updateHistoryWithImageAction } from '@/lib/actions';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import RewardCameraCapture from './RewardCameraCapture';
import RewardQRUpload from './RewardQRUpload';
import { Heading, Text } from '@/components/ui/typography';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface RewardRevealProps {
  reward: Reward | null;
  historyId: string | null;
  onClose: () => void;
}

type UploadMode = 'selection' | 'camera' | 'qr' | 'file';

export default function RewardReveal({ reward, historyId, onClose }: RewardRevealProps) {
    const { t } = useLanguage();
    const [reflection, setReflection] = useState('');
    const [stayedFocused, setStayedFocused] = useState<boolean | null>(null);
    const [showReflection, setShowReflection] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

  const [uploadMode, setUploadMode] = useState<UploadMode>('selection');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (reward) {
      setIsRevealed(false);
      setIsUploaded(false);
      setIsUploading(false);
      setUploadMode('selection');
      
        const timer = setTimeout(() => {
          setIsRevealed(true);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#818cf8', '#c7d2fe', '#1e293b'], // Academic Indigo + Slate palette
          });
        }, 1000);
      return () => clearTimeout(timer);
    }
  }, [reward]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !historyId) return;
    await processUpload(file);
  };

  const processUpload = async (fileOrBlob: File | Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileOrBlob);

      const response = await fetch('/api/upload-reward-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.imageUrl) {
        await updateHistoryWithImageAction(historyId!, data.imageUrl);
        setIsUploaded(true);
        toast.success('Ritual proof preserved!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      console.error('Upload error:', error);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleQRSuccess = (imageUrl: string) => {
    setIsUploaded(true);
    toast.success('Mobile upload complete!');
  };

  if (!reward) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-lg w-full bg-card rounded-[2rem] overflow-hidden shadow-2xl border border-border"
        >
            <div className="p-10 md:p-16 flex flex-col items-center text-center">
              {!isRevealed ? (
                  <div className="py-20 flex flex-col items-center gap-12">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                      className="w-36 h-36 bg-muted/50 rounded-[3rem] flex items-center justify-center border border-border shadow-inner"
                    >
                      <Trophy size={72} className="text-primary/20" strokeWidth={1} />
                    </motion.div>
                    <div className="flex flex-col gap-4">
                      <Text variant="tiny" className="font-bold text-muted-foreground/50 tracking-[0.4em] uppercase">
                        {t('authenticatingMerit')}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-12 w-full"
                  >
                    <div className="flex flex-col gap-10 w-full">
                      <div className="flex flex-col items-center gap-6">
                        <div className="inline-flex px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] border border-border bg-muted/50 text-muted-foreground/50 shadow-sm">
                          {t('achievementUnlocked')}
                        </div>
                        
                        <Heading level="h1" className="text-5xl md:text-7xl tracking-tighter leading-none py-2 border-none">
                          {reward.text}
                        </Heading>
                      </div>
  
                      <div className="w-full">
                          {isUploaded || showReflection ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col items-center gap-10 py-6"
                            >
                              <div className="flex flex-col gap-8 w-full">
                                <div className="flex flex-col items-center gap-4 text-center">
                                  <Text variant="tiny" className="uppercase tracking-[0.5em] text-muted-foreground/50">{t('reflectionPhase')}</Text>
                                  <Heading level="h3" className="tracking-tight">{t('howWasFocus')}</Heading>
                                </div>
  
                                <div className="flex gap-4">
                                    <button
                                      onClick={() => setStayedFocused(true)}
                                      className={cn(
                                        "flex-1 h-16 rounded-2xl border font-bold transition-all",
                                        stayedFocused === true 
                                          ? "bg-primary/5 border-primary/20 text-primary shadow-sm" 
                                          : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                                      )}
                                    >
                                      {t('absoluteFocus')}
                                    </button>
                                    <button
                                      onClick={() => setStayedFocused(false)}
                                      className={cn(
                                        "flex-1 h-16 rounded-2xl border font-bold transition-all",
                                        stayedFocused === false 
                                          ? "bg-secondary border-border text-foreground shadow-sm" 
                                          : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                                      )}
                                    >
                                      {t('somewhatDistracted')}
                                    </button>
                                </div>
  
                                <textarea
                                  placeholder={t('reflectionPlaceholder')}
                                  value={reflection}
                                  onChange={(e) => setReflection(e.target.value)}
                                  className="w-full h-32 bg-muted/50 border border-border rounded-2xl p-6 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                                />
                              </div>
  
                              <Button
                                onClick={onClose}
                                size="lg"
                                disabled={stayedFocused === null}
                                className="w-full h-20 rounded-3xl text-xl font-bold shadow-xl group disabled:opacity-50"
                              >
                                <span>{t('concludeRitual')}</span>
                              </Button>
                            </motion.div>
                          ) : uploadMode === 'selection' ? (
  
                          <div className="flex flex-col gap-10 w-full">
                            <div className="p-8 rounded-[2rem] bg-muted/50 border border-border text-center relative overflow-hidden">
                              <Text variant="muted" className="leading-relaxed relative z-10 max-w-sm mx-auto">
                                {t('captureProofDesc')}
                              </Text>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 w-full">
                              <Button
                                variant="outline"
                                onClick={() => setUploadMode('camera')}
                                className="flex items-center justify-between h-16 rounded-2xl px-8 border-border group hover:border-primary/20 transition-all bg-card"
                              >
                                <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{t('captureProof')}</span>
                                <Camera className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                              </Button>
  
                              {!isMobile && (
                                <Button
                                  variant="outline"
                                  onClick={() => setUploadMode('qr')}
                                  className="flex items-center justify-between h-16 rounded-2xl px-8 border-border group hover:border-primary/20 transition-all bg-card"
                                >
                                  <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{t('scanQR')}</span>
                                  <Smartphone className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                </Button>
                              )}
  
                              <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-between h-16 rounded-2xl px-8 border-border group hover:border-primary/20 transition-all bg-card"
                              >
                                <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{t('uploadProof')}</span>
                                <Upload className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                              </Button>


                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>

                              <div className="flex flex-col gap-4">
                                 <Button
                                  variant="ghost"
                                  onClick={() => setShowReflection(true)}
                                  className="w-full h-12 text-muted-foreground/30 hover:text-foreground font-bold uppercase tracking-widest text-[10px]"
                                >
                                  {t('skipDocumentation')}
                                </Button>
                              </div>


                        </div>
                      ) : uploadMode === 'camera' ? (
                        <RewardCameraCapture 
                          onCapture={processUpload} 
                          onCancel={() => setUploadMode('selection')}
                          isUploading={isUploading}
                        />
                      ) : uploadMode === 'qr' && historyId ? (
                        <RewardQRUpload 
                          historyId={historyId}
                          onSuccess={handleQRSuccess}
                          onCancel={() => setUploadMode('selection')}
                        />
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
