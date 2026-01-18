
import React from 'react';
import { ModuleData, ModuleType } from '../types';

interface ModuleCardProps {
  module: ModuleData;
  isLocked: boolean;
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, isLocked, isCompleted, isActive, onClick }) => {
  const getCategoryStyles = () => {
    if (module.id === ModuleType.CREATIVITY) return 'category-vision text-[#FFB703] bg-[#FFD97D]/5';
    if (module.id === ModuleType.PROMPTING) return 'category-tone text-[#0077B6] bg-[#CAF0F8]/10';
    if (module.id === ModuleType.CODE_ONRAMP) return 'category-systems text-[#2D6A4F] bg-[#2D6A4F]/5';
    return 'bg-white';
  };

  return (
    <button
      onClick={!isLocked ? onClick : undefined}
      className={`bloom-card w-full text-left p-12 rounded-[3.5rem] relative overflow-hidden h-full flex flex-col border-2 border-stone-50 ${getCategoryStyles()} ${
        isLocked ? 'opacity-40 grayscale scale-95 cursor-not-allowed' : isActive ? 'ring-8 ring-[#8DB339]/10' : ''
      }`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-10">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-[#2D434E] rotate-2 group-hover:rotate-0 transition-transform">
            {module.icon}
          </div>
          <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            isCompleted ? 'bg-[#8DB339] text-white border-transparent' : 'bg-white border-black/5 text-stone-400'
          }`}>
            {isCompleted ? '✓ Achieved' : isLocked ? 'Locked' : 'Available'}
          </div>
        </div>
        
        <h3 className="text-3xl font-black text-[#2D434E] mb-3 font-serif leading-none">{module.title}</h3>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 opacity-70">{module.subtitle}</p>
        
        <p className="text-stone-500 text-sm mb-10 font-medium leading-relaxed">
            {module.description}
        </p>

        <div className="mt-auto pt-8 border-t border-black/5 flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-stone-300' : 'text-[#2D434E]'}`}>
                {isLocked ? 'Complete Previous' : 'Enter Studio'}
            </span>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isLocked ? 'bg-stone-50 text-stone-200' : 'bg-white text-[#8DB339] shadow-sm'}`}>
                {isLocked ? '🔒' : '→'}
            </div>
        </div>
      </div>
    </button>
  );
};

export default ModuleCard;
