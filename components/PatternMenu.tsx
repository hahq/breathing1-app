import React, { useState } from 'react';
import { X, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathPattern, AppSettings } from '../types';
import { BREATH_PATTERNS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPattern: BreathPattern;
  onSelectPattern: (p: BreathPattern) => void;
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  customPattern: BreathPattern | null;
  onUpdateCustomPattern: (p: BreathPattern) => void;
}

const PatternMenu: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  currentPattern, 
  onSelectPattern,
  settings,
  onUpdateSettings,
  customPattern,
  onUpdateCustomPattern
}) => {
  const [editingCustom, setEditingCustom] = useState(false);
  const [tempCustom, setTempCustom] = useState<BreathPattern>(customPattern || {
    id: 'custom',
    name: '自定义',
    description: '你的专属节奏',
    inhale: 4, holdIn: 2, exhale: 4, holdOut: 2,
    color: '#ffffff', textColor: '#000000'
  });

  const handleCustomSave = () => {
    onUpdateCustomPattern(tempCustom);
    onSelectPattern(tempCustom);
    setEditingCustom(false);
    onClose();
  };

  const getPhaseLabel = (phase: string) => {
    switch(phase) {
        case 'inhale': return '吸';
        case 'exhale': return '呼';
        default: return '停';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 pb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">设置</h2>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              {/* Duration Slider */}
              <div className="mb-8 p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm text-gray-300"><Clock size={16}/> 练习时长</span>
                  <span className="font-mono">{settings.durationMinutes} 分钟</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="60" 
                  value={settings.durationMinutes}
                  onChange={(e) => onUpdateSettings({ durationMinutes: parseInt(e.target.value) })}
                  className="w-full accent-white h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">呼吸模式</h3>
              
              <div className="space-y-3">
                {BREATH_PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectPattern(p); onClose(); }}
                    className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all ${currentPattern.id === p.id ? 'bg-white/10 ring-1 ring-white/50' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <div>
                      <div className="font-medium text-lg" style={{ color: p.color }}>{p.name}</div>
                      <div className="text-sm text-gray-400">{p.description}</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        吸:{p.inhale} {p.holdIn > 0 ? `停:${p.holdIn}` : ''} 呼:{p.exhale} {p.holdOut > 0 ? `停:${p.holdOut}` : ''}
                      </div>
                    </div>
                    {currentPattern.id === p.id && <ChevronRight className="text-white/50" />}
                  </button>
                ))}

                {/* Custom Button */}
                <div className={`rounded-xl p-4 transition-all ${currentPattern.id === 'custom' ? 'bg-white/10 ring-1 ring-white/50' : 'bg-white/5'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-lg text-white">自定义节奏</div>
                         <button 
                            onClick={() => setEditingCustom(!editingCustom)}
                            className="text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
                        >
                            {editingCustom ? '取消' : '编辑'}
                        </button>
                    </div>
                    
                    {editingCustom ? (
                        <div className="grid grid-cols-4 gap-3 text-center bg-black/20 p-4 rounded-xl">
                            {['inhale', 'holdIn', 'exhale', 'holdOut'].map((phase) => (
                                <div key={phase} className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{getPhaseLabel(phase)}</label>
                                    <input 
                                        type="number" 
                                        className="bg-white/10 border border-white/10 rounded-lg p-2 text-center w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={(tempCustom as any)[phase]}
                                        onChange={(e) => setTempCustom({...tempCustom, [phase]: Number(e.target.value)})}
                                    />
                                    <span className="text-[10px] text-gray-600">秒</span>
                                </div>
                            ))}
                            <button onClick={handleCustomSave} className="col-span-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors">应用设置</button>
                        </div>
                    ) : (
                         <div 
                            onClick={() => { if(customPattern) { onSelectPattern(customPattern); onClose(); } else { setEditingCustom(true); } }}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                        >
                            {customPattern ? `当前设置: ${customPattern.inhale}秒 - ${customPattern.holdIn}秒 - ${customPattern.exhale}秒 - ${customPattern.holdOut}秒` : '点击这里，创建完全属于你的呼吸节奏。'}
                        </div>
                    )}
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PatternMenu;