export type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle' | 'finished';

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  color: string; // Hex code
  textColor: string; // Usually white or off-white
}

export interface AppSettings {
  durationMinutes: number;
  isVoiceEnabled: boolean;
  isBgEnabled: boolean;
}

export interface AudioAssets {
  inhale: string;
  exhale: string;
  hold: string;
  finish: string;
  bgAmbience: string;
}