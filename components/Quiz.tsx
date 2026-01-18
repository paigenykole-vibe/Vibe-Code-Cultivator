
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [points, setPoints] = useState(0);

  const current = questions[currentIdx];

  const handleNext = () => {
    if (selected === current.correctAnswer) {
      setPoints(p => p + 10);
    }
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      onComplete(points + (selected === current.correctAnswer ? 10 : 0));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D434E]/60 backdrop-blur-xl">
      <div className="bg-white max-w-3xl w-full rounded-[4rem] p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in duration-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-stone-100">
            <div 
              className="h-full bg-gradient-to-r from-[#FFD97D] to-[#8DB339] transition-all duration-700 rounded-r-full" 
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
        </div>

        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#F8F9F2] flex items-center justify-center text-xs border border-black/5">🏵️</span>
            <span className="text-[#8DB339] font-black tracking-[0.3em] text-[10px] uppercase">The Knowledge Harvest</span>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-[#F8F9F2] flex items-center justify-center text-[#2D434E] hover:bg-[#F07167] hover:text-white transition-all transform hover:rotate-90">✕</button>
        </div>

        <div className="mb-12">
          <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-3">Tending Step {currentIdx + 1} of {questions.length}</div>
          <h2 className="text-4xl font-black text-[#2D434E] font-serif leading-tight">{current.question}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => setSelected(idx)}
              className={`w-full p-8 rounded-3xl text-left border-2 transition-all text-lg font-bold flex items-center gap-5 ${
                selected === idx 
                  ? 'border-[#FFD97D] bg-[#FFD97D]/5 text-[#2D434E] shadow-md' 
                  : 'border-[#F8F9F2] bg-[#F8F9F2]/50 text-[#2D434E]/60 hover:border-[#8DB339]/20'
              } ${
                showResult && idx === current.correctAnswer ? 'border-[#8DB339] bg-[#8DB339]/5 text-[#8DB339]' : ''
              } ${
                showResult && selected === idx && idx !== current.correctAnswer ? 'border-[#F07167] bg-[#F07167]/5 text-[#F07167]' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${selected === idx ? 'bg-[#FFD97D] border-transparent text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="leading-tight">{opt}</span>
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`mt-10 p-8 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500 border-2 ${selected === current.correctAnswer ? 'bg-[#8DB339]/5 border-[#8DB339]/10 text-[#2D434E]' : 'bg-[#F07167]/5 border-[#F07167]/10 text-[#2D434E]'}`}>
            <div className="flex gap-4">
                <span className="text-3xl">{selected === current.correctAnswer ? '✨' : '💡'}</span>
                <div>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] block mb-2">{selected === current.correctAnswer ? 'Bloom Achieved!' : 'Growth Opportunity:'}</span>
                    <p className="text-sm font-semibold leading-relaxed opacity-80">{current.explanation}</p>
                </div>
            </div>
          </div>
        )}

        <div className="mt-16">
          {!showResult ? (
            <button
              disabled={selected === null}
              onClick={() => setShowResult(true)}
              className="w-full py-8 bg-[#8DB339] disabled:opacity-50 disabled:cursor-not-allowed rounded-[2rem] font-black text-white text-xl uppercase tracking-widest transition-all hover:bg-[#6E8B2C] shadow-xl"
            >
              Check the Vibe
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-8 bg-[#2D434E] rounded-[2rem] font-black text-white text-xl uppercase tracking-widest transition-all hover:bg-[#1D353F] shadow-xl"
            >
              {currentIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Step'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
