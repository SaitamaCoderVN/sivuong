'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Reward } from '@/lib/types';
import { X, Sparkles, Camera, CheckCircle2, Loader2, Smartphone, Upload, ArrowLeft } from 'lucide-react';
import { updateHistoryWithImageAction } from '@/lib/actions';
import { toast } from 'sonner';
import RewardCameraCapture from './RewardCameraCapture';
import RewardQRUpload from './RewardQRUpload';

interface RewardModalProps {
  reward: Reward | null;
  historyId: string | null;
  onClose: () => void;
}

type UploadMode = 'selection' | 'camera' | 'qr' | 'file';

export default function RewardModal({ reward, historyId, onClose }: RewardModalProps) {
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
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
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
        toast.success('Proof uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative max-w-md w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={24} className="text-gray-400" />
          </button>

          <div className="p-8 flex flex-col items-center text-center">
            {!isRevealed ? (
              <div className="py-12 flex flex-col items-center space-y-6">
                <motion.div
                  animate={{ 
                    rotateY: [0, 180, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200"
                >
                  <Sparkles size={64} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-black text-indigo-600 animate-pulse">
                  Revealing your reward...
                </h2>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 w-full"
              >
                {!isUploaded && uploadMode !== 'selection' && (
                  <button 
                    onClick={() => setUploadMode('selection')}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 text-gray-400 flex items-center space-x-1"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}

                <div className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border bg-indigo-50 text-indigo-700 border-indigo-200">
                  New Reward Unlocked
                </div>
                
                <h2 className="text-4xl font-black text-gray-900 leading-tight">
                  {reward.text}
                </h2>

                <div className="w-full">
                  {isUploaded ? (
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} />
                      </div>
                      <p className="text-lg font-bold text-emerald-600">Proof Saved!</p>
                      <button
                        onClick={onClose}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
                      >
                        Continue
                      </button>
                    </div>
                  ) : uploadMode === 'selection' ? (
                    <div className="space-y-4">
                      <p className="text-gray-500 font-medium px-4">
                        Amazing work! You earned this surprise. Want to save a memory of this moment?
                      </p>
                      <div className="grid grid-cols-1 gap-3 w-full">
                        <button
                          onClick={() => setUploadMode('camera')}
                          className="flex items-center justify-between px-6 py-4 bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-600 font-bold rounded-2xl transition-all shadow-sm active:scale-[0.98]"
                        >
                          <div className="flex items-center space-x-3">
                            <Camera size={20} />
                            <span>Take Photo</span>
                          </div>
                          <div className="text-[10px] font-black uppercase text-indigo-300">Fast</div>
                        </button>

                        {!isMobile && (
                          <button
                            onClick={() => setUploadMode('qr')}
                            className="flex items-center justify-between px-6 py-4 bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-600 font-bold rounded-2xl transition-all shadow-sm active:scale-[0.98]"
                          >
                            <div className="flex items-center space-x-3">
                              <Smartphone size={20} />
                              <span>Upload via Phone</span>
                            </div>
                            <div className="text-[10px] font-black uppercase text-indigo-300">QR</div>
                          </button>
                        )}

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-between px-6 py-4 bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-600 font-bold rounded-2xl transition-all shadow-sm active:scale-[0.98]"
                        >
                          <div className="flex items-center space-x-3">
                            <Upload size={20} />
                            <span>Upload from Device</span>
                          </div>
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all active:scale-95"
                      >
                        Skip & Finish
                      </button>
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
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
