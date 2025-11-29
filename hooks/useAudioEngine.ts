
import { useEffect, useRef } from 'react';
import { Phase, AudioAssets } from '../types';
import { AUDIO_PATHS } from '../constants';

// 使用 Web Audio API 以获得更精确的时间控制和绕过自动播放限制
export const useAudioEngine = (
  phase: Phase,
  isActive: boolean,
  voiceEnabled: boolean,
  bgEnabled: boolean
) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<{ [key: string]: AudioBuffer }>({});
  const bgSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgGainRef = useRef<GainNode | null>(null);

  // 1. 初始化 AudioContext 并预加载音频
  useEffect(() => {
    const initAudio = async () => {
      // 创建 Context (兼容 Safari)
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new Ctx();
      }

      // 加载函数
      const loadBuffer = async (key: string, url: string) => {
        try {
          console.log(`[Audio] Loading: ${url}`);
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          // decodeAudioData 也是基于 Promise 的
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          buffersRef.current[key] = audioBuffer;
          console.log(`[Audio] Loaded: ${key}`);
        } catch (e) {
          console.error(`[Audio] Failed to load ${key} from ${url}:`, e);
        }
      };

      // 并行加载所有音频
      await Promise.all([
        loadBuffer('inhale', AUDIO_PATHS.inhale),
        loadBuffer('exhale', AUDIO_PATHS.exhale),
        loadBuffer('hold', AUDIO_PATHS.hold),
        loadBuffer('finish', AUDIO_PATHS.finish),
        loadBuffer('bg', AUDIO_PATHS.bgAmbience),
      ]);
    };

    initAudio();

    return () => {
      // 清理
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 2. 暴露给 UI 的“解锁”函数
  // 必须在点击事件中调用
  const resume = async () => {
    const ctx = audioContextRef.current;
    if (ctx) {
      if (ctx.state === 'suspended') {
        await ctx.resume();
        console.log('[Audio] Context Resumed/Unlocked');
      }

      // Hack: 播放一个极短的静音振荡器，强行唤醒 iOS/Android 的音频硬件通道
      // 这能解决部分设备虽然 Context resumed 但依然没有声音的 Bug
      try {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.001; // 极低音量，几乎听不见
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(0);
        oscillator.stop(ctx.currentTime + 0.1);
      } catch (e) {
        console.error('[Audio] Wake up failed', e);
      }
    }
  };

  // 3. 播放单次音效 (Voice)
  const playSound = (key: string) => {
    const ctx = audioContextRef.current;
    const buffer = buffersRef.current[key];
    if (ctx && buffer && ctx.state === 'running') {
      // 如果声音被禁用，直接返回
      if (!voiceEnabled && key !== 'finish') return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // 创建增益节点控制音量
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0; 
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    }
  };

  // 4. 处理背景音乐 (Loop)
  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (isActive && bgEnabled) {
      // 只有当 buffer 加载完毕且当前没有播放时才开始
      if (buffersRef.current['bg'] && !bgSourceRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = buffersRef.current['bg'];
        source.loop = true;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0; // 从 0 开始淡入
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);

        bgSourceRef.current = source;
        bgGainRef.current = gainNode;

        // 淡入
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);
      }
    } else {
      // 淡出并停止
      if (bgSourceRef.current && bgGainRef.current) {
        const gainNode = bgGainRef.current;
        const source = bgSourceRef.current;
        
        // 防止报错：如果 context 已经关闭或时间无效
        try {
            // Cancel current scheduling
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            // Ramp down
            gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
            
            setTimeout(() => {
                try { source.stop(); } catch(e) {}
                source.disconnect();
                gainNode.disconnect();
            }, 1100);
        } catch (e) {
            console.warn("Error stopping BG audio", e);
        }

        bgSourceRef.current = null;
        bgGainRef.current = null;
      }
    }
  }, [isActive, bgEnabled]); // 依赖 isActive 和 bgEnabled

  // 5. 监听 Phase 变化播放语音
  useEffect(() => {
    if (!isActive) return;

    switch (phase) {
      case 'inhale':
        playSound('inhale');
        break;
      case 'exhale':
        playSound('exhale');
        break;
      case 'hold-in':
      case 'hold-out':
        // 只有当 hold 时间足够长时才播放声音，避免太频繁
        // 这里简单处理：只要进入 hold 就播
        playSound('hold');
        break;
      case 'finished':
        playSound('finish');
        break;
    }
  }, [phase, isActive]);

  return { resume };
};
