
import React, { useState, useEffect } from 'react';
import { QuizQuestion, GlossaryEntry } from './types';
import { GLOSSARY } from './constants';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onClose: () => void;
  onShowDefinition: (entry: GlossaryEntry) => void;
  isFullPage?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onClose, onShowDefinition, isFullPage }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [points, setPoints] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string, originalIdx: number }[]>([]);

  const current = questions[currentIdx];

  useEffect(() => {
    if (current) {
      const options = current.options.map((opt, idx) => ({ text: opt, originalIdx: idx }));
      setShuffledOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [currentIdx]);

  if (!questions || questions.length === 0) return null;

  const handleNext = () => {
    const isCorrect = selected !== null && shuffledOptions[selected].originalIdx === current.correctAnswer;
    const finalPoints = points + (isCorrect ? 10 : 0);
    
    if (currentIdx < questions.length - 1) {
      setPoints(finalPoints);
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      onComplete(finalPoints);
    }
  };

  const renderRichText = (text: string): React.ReactNode[] | null => {
    if (!text) return null;
    let parts: React.ReactNode[] = [text];
    GLOSSARY.forEach(entry => {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        const regex = new RegExp(`(\\b${entry.term}\\b)`, 'gi');
        const split = part.split(regex);
        split.forEach((s, i) => {
          if (s.toLowerCase() === entry.term.toLowerCase()) {
            newParts.push(
              <button 
                key={`${entry.term}-${i}`}
                type="button"
                onClick={(e) => { e.stopPropagation(); onShowDefinition(entry); }}
                className="underline decoration-dotted decoration-[#8DB339] cursor-help font-bold hover:text-[#8DB339] transition-colors inline-block px-1"
              >
                {s}
              </button>
            );
          } else {
            newParts.push(s);
          }
        });
      });
      parts = newParts;
    });
    return parts;
  };

  const isCorrect = selected !== null && shuffledOptions[selected]?.originalIdx === current.correctAnswer;

  const containerStyles = isFullPage 
    ? "max-w-4xl w-full p-12 md:p-20 bg-white rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col my-12"
    : "bg-white max-w-3xl w-full rounded-[4rem] p-16 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]";

  const outerWrapperStyles = isFullPage
    ? "w-full max-w-5xl px-6"
    : "fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D434E]/60 backdrop-blur-xl";

  return (
    <div className={outerWrapperStyles}>
      <div className={containerStyles}>
        <div className="absolute top-0 left-0 w-full h-3 bg-stone-100">
          <div className="h-full bg-gradient-to-r from-[#FFD97D] to-[#8DB339] transition-all duration-700" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="flex justify-between items-center mb-8 shrink-0">
          <span className="text-[#8DB339] font-black tracking-[0.3em] text-[10px] uppercase">Vibe Assessment</span>
          {!isFullPage && <button onClick={onClose} className="text-[#2D434E] text-2xl">✕</button>}
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
          <h2 className="text-3xl font-black text-[#2D434E] font-serif mb-8 leading-tight">
            {renderRichText(current.question)}
          </h2>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={idx} 
                disabled={showResult} 
                onClick={() => setSelected(idx)}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all font-bold flex items-center gap-4 ${
                  selected === idx ? 'border-[#FFD97D] bg-[#FFD97D]/5 shadow-md' : 'border-[#F8F9F2]'
                } ${showResult && opt.originalIdx === current.correctAnswer ? 'border-[#8DB339] bg-[#8DB339]/5 text-[#8DB339]' : ''}
                ${showResult && selected === idx && opt.originalIdx !== current.correctAnswer ? 'border-red-400 bg-red-50 text-red-600' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + idx)}</div>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`p-8 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500 border-2 mb-8 ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex gap-4">
                  <span className="text-3xl">{isCorrect ? '⭐' : '💡'}</span>
                  <div>
                      <span className={`font-black uppercase tracking-[0.2em] text-[10px] block mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? 'Correct Path!' : 'Analysis Insight:'}
                      </span>
                      <p className="text-sm font-semibold leading-relaxed text-stone-700">
                        {renderRichText(current.explanation)}
                      </p>
                  </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 shrink-0">
          {!showResult ? (
            <button disabled={selected === null} onClick={() => setShowResult(true)} className="w-full py-8 bg-[#8DB339] text-white rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg">
              Analyze Answer
            </button>
          ) : (
            <button onClick={handleNext} className="w-full py-8 bg-[#2D434E] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-lg">
              {currentIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
