'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Loader2, ArrowLeft as ArrowLeftIcon, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from '@/components/providers/LanguageProvider';

interface RewardCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export default function RewardCameraCapture({ onCapture, onCancel, isUploading }: RewardCameraCaptureProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera. Please check permissions.");
      onCancel();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative w-full aspect-square bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover grayscale-[0.1]"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            )}
            {isCameraReady && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 group flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center shadow-2xl transition-all"
                >
                  <div className="w-14 h-14 bg-white rounded-full group-hover:bg-slate-50 transition-colors" />
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured Ritual Proof" 
            className="w-full h-full object-cover animate-in zoom-in-95 duration-300"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col gap-4 w-full">
        {capturedImage ? (
          <div className="flex gap-3 w-full">
            <Button
              onClick={retakePhoto}
              disabled={isUploading}
              variant="outline"
              className="flex-1 h-16 rounded-2xl border-slate-200 font-bold"
            >
              <RefreshCw size={18} className={cn("mr-2", isUploading && "animate-spin")} />
              <span>{t('retake')}</span>
            </Button>
            <Button
              onClick={confirmPhoto}
              disabled={isUploading}
              className="flex-1 h-16 rounded-2xl font-bold shadow-lg shadow-primary/20"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
              <span>{isUploading ? t('preserving') : t('sealRitual')}</span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full h-12 text-slate-400 hover:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            <ArrowLeftIcon size={14} className="mr-2" />
            <span>{t('abandonCapture')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
