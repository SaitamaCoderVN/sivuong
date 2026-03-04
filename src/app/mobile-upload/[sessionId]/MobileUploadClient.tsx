'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Loader2, Image as ImageIcon, Sparkles, ChevronLeft, Target, Trophy, ShieldCheck, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileUploadClientProps {
  sessionId: string;
  session: any;
}

export default function MobileUploadClient({ sessionId, session }: MobileUploadClientProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

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
      setIsCameraReady(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          setIsCameraReady(true);
        }
      } catch (fallbackErr) {
        toast.error("Could not access camera. Please check permissions.");
      }
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

  const uploadPhoto = async () => {
    if (!capturedImage || !canvasRef.current) return;

    setIsUploading(true);
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) throw new Error("Could not process image");

        const formData = new FormData();
        formData.append('file', blob);
        formData.append('sessionId', sessionId);

        const response = await fetch('/api/upload-reward-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        setIsComplete(true);
        toast.success("Ritual artifact preserved!");
      }, 'image/jpeg', 0.8);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to preserve artifact.");
      setIsUploading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] px-8 text-center gap-12 bg-slate-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/5 text-primary shadow-xl shadow-primary/10 border border-primary/20"
          >
            <Check size={48} strokeWidth={1.5} />
          </motion.div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">Merit Documented</h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-[320px] italic mx-auto">
            "Every captured moment is a brick in the temple of your knowledge."
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-[300px]">
           <Card className="w-full border-slate-200 bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center gap-4">
                 <ShieldCheck className="text-primary" size={40} strokeWidth={1.5} />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Ritual Secure</span>
                 <p className="text-xs font-bold text-slate-900">You may now conclude this session by closing the tab.</p>
              </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 p-6 gap-8">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Target size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Sĩ Vương</h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">Academic Handoff</span>
            </div>
        </div>
          <div className="bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ritual Active</span>
          </div>
      </div>

      {/* Main UI */}
      <div className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-200 flex flex-col gap-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <BookOpen size={120} strokeWidth={1} />
        </div>

        <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tighter leading-none py-1">
                Document Merit
            </h2>
            <p className="text-sm text-slate-500 font-medium italic">
              Reward: <span className="text-primary font-bold">{session?.reward_history?.reward_text || 'Your Achievement'}</span>
            </p>
        </div>

        {/* Viewport */}
        <div className="relative aspect-square bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 relative z-10">
          {!capturedImage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover grayscale-[0.1]"
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-4">
                  <Loader2 className="animate-spin text-slate-400" size={32} />
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Initializing Lens</span>
                </div>
              )}
              {isCameraReady && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 group flex items-center justify-center transition-all active:scale-90">
                   <motion.button
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={capturePhoto}
                     className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center shadow-2xl"
                   >
                      <div className="w-14 h-14 bg-white rounded-full" />
                   </motion.button>
                </div>
              )}
            </>
          ) : (
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={capturedImage} 
              alt="Captured Ritual Merit" 
              className="w-full h-full object-cover"
            />
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.div 
                key="actions"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex flex-col gap-4 relative z-10"
            >
              <Button
                onClick={uploadPhoto}
                disabled={isUploading}
                size="lg"
                className="w-full h-18 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 text-lg"
              >
                {isUploading ? (
                    <>
                        <Loader2 size={24} className="animate-spin mr-3" />
                        <span>Preserving...</span>
                    </>
                ) : (
                    <>
                        <ShieldCheck size={24} className="mr-3" />
                        <span>Seal Ritual Proof</span>
                    </>
                )}
              </Button>
              <Button
                onClick={retakePhoto}
                disabled={isUploading}
                variant="ghost"
                className="w-full h-12 text-slate-400 hover:text-slate-900 font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
              >
                <RefreshCw size={16} className="mr-2" />
                <span>Retry Capture</span>
              </Button>
            </motion.div>
          ) : (
              <div className="py-4 relative z-10 text-center space-y-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Document your merit.
                </p>
                <div className="h-0.5 w-12 bg-slate-100 mx-auto" />
                <p className="text-[10px] text-slate-300 font-medium px-4">
                    This proof will be preserved in your permanent academic record.
                </p>
              </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pb-8 flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-900">Sĩ Vương Academic Discipline</span>
          </div>
      </div>
    </div>
  );
}
