'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Loader2, CheckCircle2, X } from 'lucide-react';
import { createUploadSessionAction, checkRewardImageAction } from '@/lib/actions';
import { toast } from 'sonner';
import { getBaseUrl } from '@/lib/config';

interface RewardQRUploadProps {
  historyId: string;
  onSuccess: (imageUrl: string) => void;
  onCancel: () => void;
}

export default function RewardQRUpload({ historyId, onSuccess, onCancel }: RewardQRUploadProps) {
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

  // Poll for image update
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
    <div className="flex flex-col items-center space-y-6 w-full p-4 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100/50 border-dashed">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-indigo-100">
          <Smartphone size={32} className="text-indigo-600" />
        </div>
        <h3 className="text-xl font-black text-indigo-900">Upload via Phone</h3>
        <p className="text-sm text-indigo-600/70 font-medium">
          Scan this QR code with your phone's camera to take a photo and upload it instantly.
        </p>
      </div>

      <div className="relative p-6 bg-white rounded-3xl shadow-xl shadow-indigo-200/50 border-2 border-white aspect-square w-full max-w-[240px] flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="text-xs font-bold text-indigo-400">Generating...</span>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle2 className="text-emerald-500" size={48} />
            <span className="text-sm font-bold text-emerald-600">Upload Complete!</span>
          </div>
        ) : (
          <QRCodeSVG 
            value={uploadUrl} 
            size={180}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/favicon.ico", // Using favicon as logo if exists
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        )}
      </div>

      <div className="flex flex-col items-center space-y-1">
        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
          {isSuccess ? 'Verified' : 'Waiting for upload...'}
        </span>
        {!isSuccess && (
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <button
        onClick={onCancel}
        className="text-indigo-400 hover:text-indigo-600 text-sm font-bold flex items-center space-x-1 px-4 py-2 hover:bg-white rounded-full transition-all"
      >
        <X size={16} />
        <span>Close</span>
      </button>
    </div>
  );
}
