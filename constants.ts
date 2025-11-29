import { BreathPattern, AudioAssets } from './types';

// 配置音频路径
// 请确保在项目根目录下创建 'public/audio' 文件夹，并将对应的 MP3 文件放入其中
export const AUDIO_PATHS: AudioAssets = {
  inhale: '/audio/inhale.mp3',      // 吸气音效
  exhale: '/audio/exhale.mp3',      // 呼气音效
  hold: '/audio/hold.mp3',          // 屏息音效
  finish: '/audio/finish.mp3',      // 结束钟声
  bgAmbience: '/audio/background.mp3' // 背景白噪音 (雨声/森林等)
};

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'sleep',
    name: '4-7-8 助眠',
    description: '快速进入深度睡眠',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    color: '#1e3a8a', // Dark Blue
    textColor: '#bfdbfe'
  },
  {
    id: 'focus',
    name: '箱式呼吸',
    description: '提升专注力与表现',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    color: '#0ea5e9', // Sky Blue
    textColor: '#e0f2fe'
  },
  {
    id: 'balance',
    name: '平衡呼吸',
    description: '建立身心平衡节奏',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    color: '#059669', // Emerald
    textColor: '#d1fae5'
  },
  {
    id: 'calm',
    name: '缓解焦虑',
    description: '即刻缓解紧张焦虑',
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    color: '#7c3aed', // Violet
    textColor: '#ede9fe'
  },
  {
    id: 'energy',
    name: '瞬间提神',
    description: '唤醒大脑活力',
    inhale: 4,
    holdIn: 0,
    exhale: 2,
    holdOut: 0,
    color: '#ea580c', // Orange
    textColor: '#ffedd5'
  },
  {
    id: 'rest',
    name: '深度休息',
    description: '重置神经系统',
    inhale: 4,
    holdIn: 2,
    exhale: 6,
    holdOut: 2,
    color: '#4338ca', // Indigo
    textColor: '#e0e7ff'
  },
  {
    id: 'capacity',
    name: '肺活量挑战',
    description: '挑战呼吸极限',
    inhale: 5,
    holdIn: 10,
    exhale: 10,
    holdOut: 0,
    color: '#475569', // Slate
    textColor: '#f1f5f9'
  },
  {
    id: 'resonance',
    name: '共振呼吸',
    description: '提升心率变异性 (6 bpm)',
    inhale: 5.5,
    holdIn: 0,
    exhale: 5.5,
    holdOut: 0,
    color: '#0d9488', // Teal
    textColor: '#ccfbf1'
  }
];

export const DEFAULT_PATTERN = BREATH_PATTERNS[1]; // Default to Box Breathing