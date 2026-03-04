'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Loader2, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createUploadSessionAction, checkRewardImageAction } from '@/lib/actions';
import { toast } from 'sonner';
import { getBaseUrl } from '@/lib/config';
import { motion } from "framer-motion";
import { useLanguage } from '@/components/providers/LanguageProvider';

interface RewardQRUploadProps {
  historyId: string;
  onSuccess: (imageUrl: string) => void;
  onCancel: () => void;
}

export default function RewardQRUpload({ historyId, onSuccess, onCancel }: RewardQRUploadProps) {
  const { t } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    generateSession();
  }, [historyId]);

  const generateSession = async () => {
    try {
      setIsGenerating(true);
      const session = await createUploadSessionAction(historyId);
      setSessionId(session.id);
      setIsWaiting(true);
    } catch (err) {
      console.error("Session generation error:", err);
      toast.error("Failed to generate upload session.");
      onCancel();
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaiting && sessionId) {
      interval = setInterval(async () => {
        const imageUrl = await checkRewardImageAction(historyId);
        if (imageUrl) {
          setIsSuccess(true);
          setIsWaiting(false);
          onSuccess(imageUrl);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isWaiting, sessionId, historyId, onSuccess]);

  const baseUrl = getBaseUrl();
  const uploadUrl = sessionId ? `${baseUrl}/mobile-upload/${sessionId}` : '';

  return (
    <div className="flex flex-col items-center gap-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary/5 text-primary shadow-sm border border-primary/10">
            <Smartphone size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{t('academicHandoff')}</h3>
            <p className="text-sm text-slate-500 font-medium max-w-[300px] leading-relaxed italic">
              {t('tagline')}
            </p>
          </div>
        </div>

      <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-[3rem] bg-white p-10 shadow-xl border border-slate-100 transition-all hover:border-primary/20">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-slate-400" size={32} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{t('authenticatingMerit')}</span>
          </div>
          ) : isSuccess ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <CheckCircle2 className="text-primary" size={64} strokeWidth={1.5} />
              <span className="text-sm font-bold text-primary uppercase tracking-widest">{t('meritAuthenticated')}</span>
            </motion.div>
        ) : (
          <div className="relative group p-2 bg-white rounded-2xl">
            <QRCodeSVG 
              value={uploadUrl} 
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#1e293b"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 w-full">
        {!isSuccess && !isGenerating && (
          <div className="flex items-center gap-3 bg-slate-50 px-6 py-2.5 rounded-full border border-slate-100 shadow-sm">
             <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
              {t('awaitingDocument')}
            </span>
          </div>
        )}

        <Button
          onClick={onCancel}
          variant="ghost"
          className="h-10 text-slate-400 hover:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={14} className="mr-2" />
          <span>{t('abandonHandoff')}</span>
        </Button>
      </div>
    </div>
  );
}
