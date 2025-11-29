import React from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Mic, Settings, X, Timer } from 'lucide-react';
import { AppSettings, BreathPattern } from '../types';

interface ControlsProps {
  isActive: boolean;
  onTogglePlay: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onOpenPatternMenu: () => void;
  timeLeft: number;
}

export const Controls: React.FC<ControlsProps> = ({
  isActive,
  onTogglePlay,
  settings,
  onUpdateSettings,
  onOpenPatternMenu,
  timeLeft
}) => {
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-6 z-30 pb-10 safe-area-bottom">
      
      {/* Timer Display */}
      <div className="flex justify-center">
        <div className="text-4xl font-light tracking-tighter opacity-80 font-variant-numeric tabular-nums">
           {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/5">
        
        <button 
          onClick={onOpenPatternMenu}
          className="p-3 rounded-full hover:bg-white/10 transition active:scale-95 text-white/80"
          aria-label="设置"
        >
          <Settings size={24} />
        </button>

        {/* Play/Pause Button - Big and Centered */}
        <button
          onClick={onTogglePlay}
          className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        {/* Audio Toggles */}
        <div className="flex gap-2">
           {/* Voice Toggle */}
          <button
            onClick={() => onUpdateSettings({ isVoiceEnabled: !settings.isVoiceEnabled })}
            className={`p-3 rounded-full transition active:scale-95 ${settings.isVoiceEnabled ? 'text-white/90 bg-white/10' : 'text-white/30'}`}
          >
            {settings.isVoiceEnabled ? <Mic size={20} /> : <div className="relative"><Mic size={20} /><div className="absolute inset-0 flex items-center justify-center rotate-45"><div className="w-full h-0.5 bg-white/50"></div></div></div>}
          </button>
          
          {/* Ambience Toggle */}
          <button
            onClick={() => onUpdateSettings({ isBgEnabled: !settings.isBgEnabled })}
            className={`p-3 rounded-full transition active:scale-95 ${settings.isBgEnabled ? 'text-white/90 bg-white/10' : 'text-white/30'}`}
          >
            {settings.isBgEnabled ? <Music size={20} /> : <div className="relative"><Music size={20} /><div className="absolute inset-0 flex items-center justify-center rotate-45"><div className="w-full h-0.5 bg-white/50"></div></div></div>}
          </button>
        </div>

      </div>
    </div>
  );
};