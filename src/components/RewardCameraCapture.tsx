'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RewardCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export default function RewardCameraCapture({ onCapture, onCancel, isUploading }: RewardCameraCaptureProps) {
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
        
        // Stop the camera stream once captured
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
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner border-2 border-indigo-100">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                <Loader2 className="animate-spin text-white" size={32} />
              </div>
            )}
            {isCameraReady && (
              <button
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-indigo-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <div className="w-12 h-12 bg-indigo-500 rounded-full" />
              </button>
            )}
          </>
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex space-x-3 w-full">
        {capturedImage ? (
          <>
            <button
              onClick={retakePhoto}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} />
              <span>Retake</span>
            </button>
            <button
              onClick={confirmPhoto}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              <span>{isUploading ? 'Uploading...' : 'Confirm'}</span>
            </button>
          </>
        ) : (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
}
