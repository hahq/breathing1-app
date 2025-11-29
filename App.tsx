
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BreathingCircle from './components/BreathingCircle';
import { Controls } from './components/Controls';
import PatternMenu from './components/PatternMenu';
import { useAudioEngine } from './hooks/useAudioEngine';
import { BREATH_PATTERNS, DEFAULT_PATTERN } from './constants';
import { BreathPattern, Phase, AppSettings } from './types';

const App: React.FC = () => {
  // --- State ---
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentPattern, setCurrentPattern] = useState<BreathPattern>(DEFAULT_PATTERN);
  const [customPattern, setCustomPattern] = useState<BreathPattern | null>(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // Default 5 mins
  const [settings, setSettings] = useState<AppSettings>({
    durationMinutes: 5,
    isVoiceEnabled: true,
    isBgEnabled: true,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Refs for Timing ---
  const timerRef = useRef<number | null>(null); // For session countdown
  const phaseTimeoutRef = useRef<number | null>(null); // For breathing phase switching

  // --- Audio ---
  // 获取 resume 方法
  const { resume } = useAudioEngine(phase, isActive, settings.isVoiceEnabled, settings.isBgEnabled);

  // --- Logic: Session Timer ---
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  // --- Logic: Breathing State Machine ---
  const runBreathingCycle = useCallback(() => {
    // Determine duration based on current phase and pattern
    let duration = 0;
    let nextPhase: Phase = 'idle';

    switch (phase) {
      case 'idle':
        // Start Cycle
        nextPhase = 'inhale';
        duration = 0; // Immediate start
        break;
      case 'inhale':
        duration = currentPattern.inhale;
        nextPhase = currentPattern.holdIn > 0 ? 'hold-in' : 'exhale';
        break;
      case 'hold-in':
        duration = currentPattern.holdIn;
        nextPhase = 'exhale';
        break;
      case 'exhale':
        duration = currentPattern.exhale;
        nextPhase = currentPattern.holdOut > 0 ? 'hold-out' : 'inhale';
        break;
      case 'hold-out':
        duration = currentPattern.holdOut;
        nextPhase = 'inhale';
        break;
      case 'finished':
        return; // Stop logic
    }

    if (phase === 'idle' && isActive) {
        // Initial kick-off
        setPhase('inhale');
        return;
    }

    if (isActive && duration > 0) {
      phaseTimeoutRef.current = window.setTimeout(() => {
        setPhase(nextPhase);
      }, duration * 1000);
    }

  }, [phase, currentPattern, isActive]);

  // Trigger cycle when phase changes or activation state changes
  useEffect(() => {
    if (isActive) {
      runBreathingCycle();
    } else {
        // If paused, clear timeouts
        if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
        if (phase !== 'finished') setPhase('idle');
    }
    return () => { if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current); };
  }, [phase, isActive, runBreathingCycle]);


  // --- Handlers ---
  const handleTogglePlay = async () => {
    // 关键：在用户点击时恢复音频上下文
    await resume();

    if (phase === 'finished') {
        // Reset
        setTimeLeft(settings.durationMinutes * 60);
        setPhase('idle');
        setIsActive(true);
    } else {
        setIsActive(!isActive);
    }
  };

  const handleSessionEnd = () => {
    setIsActive(false);
    setPhase('finished');
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
        const next = { ...prev, ...newSettings };
        // If duration changed, update timeLeft if not currently playing
        if (newSettings.durationMinutes && !isActive) {
            setTimeLeft(newSettings.durationMinutes * 60);
        }
        return next;
    });
  };

  const handleSelectPattern = (p: BreathPattern) => {
      setCurrentPattern(p);
      setPhase('idle');
      setIsActive(false);
      setTimeLeft(settings.durationMinutes * 60);
  };

  // --- Dynamic Background Style ---
  // Subtle radial gradient based on the pattern color
  const bgStyle = {
    background: `radial-gradient(circle at 50% 50%, ${currentPattern.color}22 0%, #0f172a 70%)`
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white font-sans" style={bgStyle}>
      
      {/* Visual Core */}
      <main className="absolute inset-0 z-10">
        <BreathingCircle phase={phase} pattern={currentPattern} />
      </main>

      {/* Finished Overlay */}
      <AnimatePresence>
        {phase === 'finished' && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
            >
                <h1 className="text-4xl font-light mb-4">练习结束</h1>
                <p className="text-gray-300">身心合一</p>
                <button 
                    onClick={handleTogglePlay}
                    className="mt-8 px-6 py-2 bg-white text-black rounded-full hover:scale-105 transition"
                >
                    再次开始
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <Controls 
        isActive={isActive}
        onTogglePlay={handleTogglePlay}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenPatternMenu={() => setIsMenuOpen(true)}
        timeLeft={timeLeft}
      />

      {/* Settings Drawer */}
      <PatternMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPattern={currentPattern}
        onSelectPattern={handleSelectPattern}
        settings={settings}
        onUpdateSettings={updateSettings}
        customPattern={customPattern}
        onUpdateCustomPattern={setCustomPattern}
      />
    </div>
  );
};

export default App;
