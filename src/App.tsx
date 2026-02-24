/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Download, Image as ImageIcon, RefreshCw, Check, Info, X, Lock, Sparkles, Video, Film, Play, Pause, Trash2 } from 'lucide-react';
import gifshot from 'gifshot';
import { BorderRenderer } from './components/BorderRenderer';
import { BORDER_PRESETS, SECONDARY_BORDER_PRESETS, BorderPreset } from './constants/borders';
import { drawBorderToCanvas } from './utils/borderUtils';

const COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'White', value: '#FFFFFF' },
];

const PREMIUM_COLORS = [
  { name: 'Gold', value: '#FFD700' },
  { name: 'Silver', value: '#C0C0C0' },
  { name: 'Bronze', value: '#CD7F32' },
  { name: 'Neon Lime', value: '#32CD32' },
  { name: 'Electric Indigo', value: '#6F00FF' },
  { name: 'Deep Crimson', value: '#8B0000' },
  { name: 'Midnight Blue', value: '#191970' },
  { name: 'Rose Gold', value: '#B76E79' },
];

export default function App() {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [gifResult, setGifResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBorder, setSelectedBorder] = useState<BorderPreset>(BORDER_PRESETS[0]);
  const [selectedColor, setSelectedColor] = useState(BORDER_PRESETS[0].color);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0.75);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(() => {
    return localStorage.getItem('circle_fxz_premium_colors') === 'true';
  });
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(() => {
    return localStorage.getItem('circle_fxz_video_fx') === 'true';
  });
  const [isSecondaryUnlocked, setIsSecondaryUnlocked] = useState(() => {
    return localStorage.getItem('circle_fxz_secondary_borders') === 'true';
  });
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isVideoUnlocking, setIsVideoUnlocking] = useState(false);
  const [isSecondaryUnlocking, setIsSecondaryUnlocking] = useState(false);
  const [isGiphyUploading, setIsGiphyUploading] = useState(false);
  const [giphyId, setGiphyId] = useState<string | null>(null);
  const [freeGifs, setFreeGifs] = useState(() => {
    const saved = localStorage.getItem('circle_fxz_free_gifs');
    return saved !== null ? parseInt(saved, 10) : 2;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlocked') === 'colors') {
      setIsPremiumUnlocked(true);
      localStorage.setItem('circle_fxz_premium_colors', 'true');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('unlocked') === 'video') {
      setIsVideoUnlocked(true);
      localStorage.setItem('circle_fxz_video_fx', 'true');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('unlocked') === 'secondary') {
      setIsSecondaryUnlocked(true);
      localStorage.setItem('circle_fxz_secondary_borders', 'true');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleUnlockColors = async () => {
    setIsUnlocking(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'colors' }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleUnlockVideo = async () => {
    setIsVideoUnlocking(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'video_fx' }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsVideoUnlocking(false);
    }
  };

  const handleUnlockSecondary = async () => {
    setIsSecondaryUnlocking(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'secondary_borders' }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsSecondaryUnlocking(false);
    }
  };

  useEffect(() => {
    setSelectedColor(selectedBorder.color);
  }, [selectedBorder]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMode('image');
      };
      reader.readAsDataURL(file);
    } else if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideo(url);
      setVideoFile(file);
      setMode('video');
      setGifResult(null);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const drawFinalImage = async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const size = 1024; // High res export
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const center = size / 2;
        const radius = (size / 2) - 40;

        // 1. Draw masked image
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.clip();

        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.restore();

        // 2. Draw border using utility
        drawBorderToCanvas({
          ctx,
          type: selectedBorder.type,
          color: selectedColor,
          secondaryColor: selectedBorder.secondaryColor,
          size,
          progress,
          shape: 'circle',
        });

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = image || 'https://picsum.photos/seed/circlefx/1024/1024';
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      if (mode === 'image') {
        const dataUrl = await drawFinalImage();
        const link = document.createElement('a');
        link.download = `circle-fx-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else if (gifResult) {
        const link = document.createElement('a');
        link.download = `community-gif-${Date.now()}.gif`;
        link.href = gifResult;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateGif = async () => {
    if (!video) return;
    setIsProcessing(true);
    setGiphyId(null);

    const videoElement = document.createElement('video');
    videoElement.src = video;
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const frames: string[] = [];
    const frameCount = 12;
    const duration = Math.min(videoElement.duration, 3); // Max 3 seconds
    const interval = duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
      videoElement.currentTime = i * interval;
      await new Promise((resolve) => {
        videoElement.onseeked = resolve;
      });

      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        
        // Draw video frame (square format)
        ctx.save();
        
        const vWidth = videoElement.videoWidth;
        const vHeight = videoElement.videoHeight;
        const minDim = Math.min(vWidth, vHeight);
        const sx = (vWidth - minDim) / 2;
        const sy = (vHeight - minDim) / 2;
        
        ctx.drawImage(videoElement, sx, sy, minDim, minDim, 0, 0, size, size);
        ctx.restore();

        // Draw Border using utility
        drawBorderToCanvas({
          ctx,
          type: selectedBorder.type,
          color: selectedColor,
          secondaryColor: selectedBorder.secondaryColor,
          size,
          progress,
          shape: 'square',
        });

        frames.push(canvas.toDataURL('image/png'));
      }
    }

    gifshot.createGIF({
      images: frames,
      gifWidth: size,
      gifHeight: size,
      interval: 0.1,
      numFrames: frameCount,
    }, (obj: any) => {
      if (!obj.error) {
        setGifResult(obj.image);
        if (!isVideoUnlocked) {
          setFreeGifs(prev => {
            const next = Math.max(0, prev - 1);
            localStorage.setItem('circle_fxz_free_gifs', next.toString());
            return next;
          });
        }
      }
      setIsProcessing(false);
    });
  };

  const handleGiphyUpload = async (gifData: string) => {
    setIsGiphyUploading(true);
    try {
      const response = await fetch('/api/giphy/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: gifData,
          tags: 'circlefxz,community,profile'
        }),
      });
      const data = await response.json();
      if (data.data?.id) {
        setGiphyId(data.data.id);
      }
    } catch (error) {
      console.error('GIPHY Upload Error:', error);
    } finally {
      setIsGiphyUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center pt-20 pb-24 p-4 md:p-8 overflow-x-hidden">
      {/* Scrolling Banner */}
      <div className="fixed top-0 left-0 w-full bg-blue-600/10 border-b border-blue-500/20 py-2.5 z-[100] overflow-hidden whitespace-nowrap backdrop-blur-sm">
        <div className="flex animate-marquee">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                Customize your profile for 
                <span className="text-blue-400 ml-2">LinkedIn</span> • 
                <span className="text-blue-400 ml-2">Facebook</span> • 
                <span className="text-blue-400 ml-2">Instagram</span> • 
                <span className="text-blue-400 ml-2">X</span> • 
                <span className="text-blue-400 ml-2">Skool</span> • 
                <span className="text-blue-400 ml-2">Telegram</span>
              </span>
              <div className="w-1 h-1 rounded-full bg-blue-500/40" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-7xl flex flex-col items-center">
        <header className="mb-16 text-center w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-1 mb-2"
        >
          <span className="text-blue-500 font-display font-bold text-sm tracking-[0.3em] uppercase opacity-80">ZETSU EDU</span>
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] mb-2">PRESENTS</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter flex items-center gap-2">
            CIRCLE <span className="text-blue-500">FXZ</span>
          </h1>
        </motion.div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
          Stylized Circular Borders
        </p>

        {/* Mode Switcher */}
        <div className="flex items-center justify-center mt-12">
          <div className="glass-panel p-1 flex gap-1">
            <button
              onClick={() => setMode('image')}
              className={`px-6 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                mode === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <ImageIcon size={14} />
              Image FX
            </button>
            <button
              onClick={() => setMode('video')}
              className={`relative px-6 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                mode === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Film size={14} />
              GIF Creator <span className="text-[8px] opacity-60 ml-1">BETA</span>
              {mode === 'image' && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                  className="absolute -top-2 -right-2 bg-blue-500 text-[8px] px-1.5 py-0.5 rounded-full shadow-lg border border-white/20"
                >
                  NEW
                </motion.div>
              )}
            </button>
          </div>
        </div>
      </header>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-8 xl:gap-16 items-start">
          <main className="w-full flex flex-col items-center min-w-0 lg:order-2">
        {mode === 'image' ? (
          /* Image Mode Card */
          <div className="w-full flex flex-col items-center">
            <div className="relative group mb-8">
              <motion.div
                layoutId="preview-container"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-64 h-64 md:w-96 md:h-96 premium-bevel flex items-center justify-center cursor-pointer transition-all duration-500 p-4 ${
                  isDragging ? 'scale-105 ring-4 ring-blue-500/30' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#121212] shadow-inner">
                  <AnimatePresence mode="wait">
                    {image ? (
                      <motion.img
                        key="user-image"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        src={image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center text-white/20"
                      >
                        <div className="p-6 rounded-full bg-white/5 mb-4">
                          <Upload size={48} strokeWidth={1.5} className="text-blue-400" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/40">Drop Image or Click</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/20">to load your photo</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Border Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <BorderRenderer 
                    type={selectedBorder.type} 
                    color={selectedColor} 
                    secondaryColor={selectedBorder.secondaryColor}
                    size={window.innerWidth < 768 ? 256 : 384} 
                    progress={progress}
                    isActive={true}
                    shape="circle"
                  />
                </div>

                {/* Quick Download Overlay */}
                {image && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 backdrop-blur-sm"
                  >
                    <div className="bg-emerald-500 p-4 rounded-full shadow-2xl mb-2">
                      <Download size={32} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-widest uppercase">Download Now</span>
                  </motion.button>
                )}
              </motion.div>

              {/* Floating Info */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#2A2A2A] border border-white/10 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
                {selectedBorder.name}
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col md:flex-row gap-4 w-full mb-12">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <ImageIcon size={20} className="text-blue-400" />
                {image ? 'CHANGE IMAGE' : 'LOAD IMAGE'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!image || isExporting}
                className="flex-1 h-16 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
              >
                {isExporting ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                DOWNLOAD CIRCLE FX
              </button>
            </div>
          </div>
        ) : (
          /* Video Mode Card */
          <div className="w-full flex flex-col items-center">
            <div className="relative group mb-8">
              <motion.div
                layoutId="preview-container"
                onClick={() => isVideoUnlocked && !gifResult && fileInputRef.current?.click()}
                className={`relative w-64 h-64 md:w-96 md:h-96 premium-bevel flex items-center justify-center cursor-pointer transition-all duration-500 p-4 bg-[#121212] ${
                  isProcessing ? 'scale-105' : 'hover:scale-[1.02]'
                }`}
              >
                <div className={`relative w-full h-full ${mode === 'video' ? 'rounded-3xl' : 'rounded-full'} overflow-hidden bg-black shadow-inner`}>
                  <AnimatePresence mode="wait">
                    {gifResult ? (
                      <motion.img
                        key="gif-result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={gifResult}
                        alt="GIF Result"
                        className="w-full h-full object-cover"
                      />
                    ) : video ? (
                      <motion.video
                        key="user-video"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <motion.div
                        key="video-placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-white/20"
                      >
                        <div className="p-6 rounded-full bg-white/5 mb-4">
                          <Video size={48} strokeWidth={1.5} className="text-blue-400" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/40">Load Video</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/20">to create community GIFs</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <RefreshCw size={48} className="text-blue-500 animate-spin mb-4" />
                      <p className="text-white text-[10px] font-bold uppercase tracking-[0.3em]">Processing GIF...</p>
                    </div>
                  )}

                  {(!isVideoUnlocked && freeGifs <= 0) && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-8 text-center">
                      <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                        <Lock size={32} className="text-blue-400" />
                      </div>
                      <h3 className="text-white font-display font-bold text-lg mb-2">GIF CREATOR IS PREMIUM</h3>
                      <p className="text-white/60 text-xs mb-6 max-w-[200px]">Unlock the ability to create custom circular-bordered GIFs for your community.</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockVideo();
                        }}
                        disabled={isVideoUnlocking}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isVideoUnlocking ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Unlock GIF Creator ($4.99)
                      </button>
                    </div>
                  )}
                </div>

                {/* Border Overlay */}
                {!gifResult && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <BorderRenderer 
                      type={selectedBorder.type} 
                      color={selectedColor} 
                      secondaryColor={selectedBorder.secondaryColor}
                      size={window.innerWidth < 768 ? 256 : 384} 
                      progress={progress}
                      isActive={true}
                      shape="square"
                    />
                  </div>
                )}
              </motion.div>

              {/* Floating Info */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#2A2A2A] border border-white/10 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
                {gifResult ? 'ANIMATED GIF' : selectedBorder.name}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md mb-12">
              <div className="flex gap-4">
                <button
                  onClick={() => (isVideoUnlocked || freeGifs > 0) && fileInputRef.current?.click()}
                  disabled={!isVideoUnlocked && freeGifs <= 0}
                  className="flex-1 h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Film size={20} className="text-blue-400" />
                  {video ? 'CHANGE VIDEO' : 'LOAD VIDEO'}
                </button>
                {video && !gifResult && (
                  <button
                    onClick={handleCreateGif}
                    disabled={isProcessing || (!isVideoUnlocked && freeGifs <= 0)}
                    className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                  >
                    <Sparkles size={20} />
                    GENERATE GIF
                  </button>
                )}
                {gifResult && (
                  <div className="flex-1 flex flex-col gap-2">
                    <button
                      onClick={handleDownload}
                      className="h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
                    >
                      <Download size={20} />
                      DOWNLOAD GIF
                    </button>
                    {!giphyId ? (
                      <button
                        onClick={() => handleGiphyUpload(gifResult)}
                        disabled={isGiphyUploading}
                        className="h-10 bg-[#6157ff] hover:bg-[#7c74ff] disabled:opacity-50 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        {isGiphyUploading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {isGiphyUploading ? 'Uploading...' : 'Sync to GIPHY'}
                      </button>
                    ) : (
                      <div className="h-10 bg-white/5 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2">
                        <Check size={12} />
                        Synced to GIPHY
                      </div>
                    )}
                  </div>
                )}
              </div>
              {video && (isVideoUnlocked || freeGifs > 0) && (
                <button
                  onClick={() => { setVideo(null); setGifResult(null); }}
                  className="text-[10px] text-white/20 hover:text-white/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={12} />
                  Clear Video
                </button>
              )}
              {!isVideoUnlocked && freeGifs > 0 && (
                <p className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest text-center">
                  {freeGifs} Free Generations Remaining
                </p>
              )}
            </div>
          </div>
        )}

        {/* Color Selection */}
        <div className="w-full mb-8">
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] text-center mb-3">Standard Palette</p>
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            {COLORS.map((color) => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          <p className="text-[9px] text-blue-500/50 font-bold uppercase tracking-[0.2em] text-center mb-3 flex items-center justify-center gap-2">
            <Sparkles size={10} />
            Premium Palette
            <Sparkles size={10} />
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-3 flex-wrap transition-all duration-500">
              {PREMIUM_COLORS.map((color) => (
                <div key={color.value} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => isPremiumUnlocked ? setSelectedColor(color.value) : handleUnlockColors()}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                  {!isPremiumUnlocked && (
                    <div className="absolute -top-1 -right-1 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 pointer-events-none">
                      <Lock size={8} className="text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isPremiumUnlocked && (
              <button 
                onClick={handleUnlockColors}
                disabled={isUnlocking}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
              >
                {isUnlocking ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} className="text-blue-200" />
                )}
                Unlock Premium Palette ($1.99)
              </button>
            )}
          </div>
        </div>

        {/* Border Selection Carousel */}
        <div className="w-full mb-4">
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] px-4 mb-2">Primary Effects</p>
          <div className="flex items-center justify-start gap-4 overflow-x-auto pb-4 px-4 no-scrollbar">
            {BORDER_PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBorder(preset)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-full glass-panel flex items-center justify-center transition-all duration-300 ${
                  selectedBorder.id === preset.id ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20' : 'hover:border-white/30'
                }`}
              >
                <BorderRenderer 
                  type={preset.type} 
                  color={preset.color} 
                  secondaryColor={preset.secondaryColor}
                  size={64} 
                  progress={0.75} 
                  shape={mode === 'video' ? 'square' : 'circle'}
                />
                {selectedBorder.id === preset.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 shadow-lg"
                  >
                    <Check size={10} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Second Border Selection Carousel */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em]">Secondary Effects</p>
            {!isSecondaryUnlocked && (
              <button 
                onClick={handleUnlockSecondary}
                disabled={isSecondaryUnlocking}
                className="text-[9px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                {isSecondaryUnlocking ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                Unlock Pack ($1.99)
              </button>
            )}
          </div>
          <div className="relative">
            <div className={`flex items-center justify-start gap-4 overflow-x-auto pb-4 px-4 no-scrollbar transition-all duration-500 ${!isSecondaryUnlocked ? 'blur-[2px] pointer-events-none opacity-50' : ''}`}>
              {SECONDARY_BORDER_PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBorder(preset)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-full glass-panel flex items-center justify-center transition-all duration-300 ${
                    selectedBorder.id === preset.id ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20' : 'hover:border-white/30'
                  }`}
                >
                  <BorderRenderer 
                    type={preset.type} 
                    color={preset.color} 
                    secondaryColor={preset.secondaryColor}
                    size={64} 
                    progress={0.75} 
                    shape={mode === 'video' ? 'square' : 'circle'}
                  />
                  {selectedBorder.id === preset.id && (
                    <motion.div
                      layoutId="active-indicator-2"
                      className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 shadow-lg"
                    >
                      <Check size={10} className="text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            {!isSecondaryUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <button 
                  onClick={handleUnlockSecondary}
                  className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                >
                  Unlock Secondary Effects
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
          Change Border & Download
        </p>
      </main>

      {/* Left Sidebar (Ads) - Now at bottom on mobile, left on desktop */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-12 lg:order-1">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 border-blue-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl rounded-full" />
          
          <h3 className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            ZETSU PROMO
          </h3>

          <div className="relative aspect-square rounded-2xl bg-black/40 border border-white/5 overflow-hidden mb-4">
            {/* Placeholder for "New FX" */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-[2px] group-hover:opacity-40 transition-opacity duration-500">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-blue-500 animate-[spin_10s_linear_infinite]" />
              <div className="absolute w-24 h-24 rounded-full border-2 border-white/20" />
              <div className="absolute w-40 h-40 rounded-full border border-blue-500/30 animate-[pulse_4s_ease-in-out_infinite]" />
              {/* Crosshair elements */}
              <div className="absolute w-full h-[1px] bg-blue-500/20" />
              <div className="absolute h-full w-[1px] bg-blue-500/20" />
            </div>
            
            {/* Coming Soon Banner */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.3em] px-6 py-2.5 -rotate-12 shadow-[0_10px_30px_rgba(37,99,235,0.4)] border border-white/20 whitespace-nowrap"
              >
                COMING SOON
              </motion.div>
            </div>
          </div>

          <p className="text-white text-xs font-bold uppercase tracking-widest leading-tight">
            MORE CIRCLE FXZ <br/> 
            <span className="text-blue-400">COMING SOON</span>
          </p>
          
          <p className="mt-2 text-white/30 text-[9px] font-medium uppercase tracking-widest leading-relaxed">
            New geometric patterns and dynamic glow effects are currently in R&D.
          </p>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-white/20">
              <span>STATUS: STAGING</span>
              <span>V3.0_ALPHA</span>
            </div>
          </div>
        </motion.div>
      </aside>

      {/* Right Sidebar (GIF Hype) */}
      <aside className="hidden lg:flex flex-col gap-6 lg:sticky lg:top-12 lg:order-3">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 border-blue-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <h3 className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Sparkles size={12} className="animate-pulse" />
            FEATURE SPOTLIGHT
          </h3>

          <div className="relative aspect-video rounded-xl bg-black/40 border border-white/5 overflow-hidden mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border border-dashed border-blue-500/30 flex items-center justify-center"
            >
              <Film size={32} className="text-blue-400/40" />
            </motion.div>
            
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md border border-white/5 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">GIPHY SYNC ACTIVE</span>
              </div>
            </div>
          </div>

          <p className="text-white text-xs font-bold uppercase tracking-widest leading-tight">
            PRO COMMUNITY <br/> 
            <span className="text-blue-400">GIF CREATOR</span>
          </p>
          
          <p className="mt-2 text-white/30 text-[9px] font-medium uppercase tracking-widest leading-relaxed">
            Convert video clips into circular-bordered GIFs. Perfect for Skool, Telegram & Discord.
          </p>

          <button 
            onClick={() => setMode('video')}
            className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            TRY IT NOW
            <Play size={10} fill="currentColor" />
          </button>
        </motion.div>

        <div className="glass-panel p-4 border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Video size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-white font-bold uppercase tracking-widest">Direct Sync</p>
              <p className="text-[8px] text-white/30 uppercase tracking-widest">To GIPHY Library</p>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <footer className="mt-32 w-full border-t border-white/5 pt-12 pb-12 text-center">
      <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.2em] leading-relaxed mb-4">
        Zetsumetsu EOe™ | Zetsu EDU™ | Zetsu R&D ⓒ | © 2024 - 2026 Zetsumetsu Corporation™ | Artworqq Kevin Suber
      </p>
      <button 
        onClick={() => setIsAboutOpen(true)}
        className="text-[10px] text-blue-500/60 hover:text-blue-400 font-bold uppercase tracking-[0.3em] transition-colors"
      >
        About CIRCLE FXZ
      </button>
    </footer>
  </div>

  <AnimatePresence>
        {isAboutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAboutOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-8 md:p-12 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsAboutOpen(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <span className="text-blue-500 font-display font-bold text-xs tracking-[0.3em] uppercase opacity-80 block mb-2">ZETSU EDU</span>
                <h2 className="text-3xl font-display font-bold tracking-tighter text-white mb-4">ABOUT CIRCLE FXZ</h2>
                <div className="w-12 h-1 bg-blue-500 rounded-full" />
              </div>

              <div className="space-y-6 text-white/60 text-sm leading-relaxed font-medium">
                <section>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">How it works</h3>
                  <p>
                    CIRCLE FXZ is a high-performance image processing tool designed for creating stylized circular profile pictures and tokens. 
                    It uses a custom Canvas-based rendering engine to apply complex, multi-layered decorative borders in real-time.
                  </p>
                </section>

                <section>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">How it's made</h3>
                  <p>
                    Built with <span className="text-blue-400">React</span> and <span className="text-blue-400">TypeScript</span>, the app leverages <span className="text-blue-400">Tailwind CSS</span> for its "Mission Control" aesthetic. 
                    Animations are powered by <span className="text-blue-400">Framer Motion</span>, while the core graphics logic is handled via the <span className="text-blue-400">HTML5 Canvas API</span> for maximum export quality and performance.
                  </p>
                </section>

                <section>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Community GIF Creator</h3>
                  <p>
                    Transform your short video clips into high-impact circular-bordered GIFs for your community. 
                    Perfect for sharing on <span className="text-blue-400">LinkedIn</span>, <span className="text-blue-400">Facebook</span>, <span className="text-blue-400">Instagram</span>, <span className="text-blue-400">X</span>, <span className="text-blue-400">Skool</span>, and <span className="text-blue-400">Telegram</span>. 
                    Our engine applies decorative borders while maintaining a square format for maximum compatibility across all feeds.
                  </p>
                </section>

                <section>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Exclusivity</h3>
                  <p>
                    The "Premium Bevel" effect uses advanced CSS box-shadow layering and radial gradients to create a physical, recessed look that sets your images apart.
                  </p>
                </section>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Version 2.5.0</p>
                <button 
                  onClick={() => setIsAboutOpen(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
