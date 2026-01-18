
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ModuleType, UserStats, GlossaryEntry, QuizQuestion } from './types';
import { MODULES, QUIZZES, GLOSSARY, INITIAL_ASSESSMENT_POOL } from './constants';
import ModuleCard from './components/ModuleCard';
import Quiz from './quiz-component';
import { generateVibeFeedback, generatePracticePromptChallenge } from './geminiService';
import confetti from 'https://esm.sh/canvas-confetti@1.9.3';

const App: React.FC = () => {
  const [hasTakenAssessment, setHasTakenAssessment] = useState(() => {
    return localStorage.getItem('cultivator_assessment_done') === 'true';
  });
  
  const [isAssessmentView, setIsAssessmentView] = useState(false);

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('cultivator_stats');
    if (saved) return JSON.parse(saved);
    return {
      points: 0,
      bucketXP: { [ModuleType.CREATIVITY]: 0, [ModuleType.PROMPTING]: 0, [ModuleType.CODE_ONRAMP]: 0 },
      completedModules: [],
      currentModule: null,
      level: 1
    };
  });

  const [unlockedStudios, setUnlockedStudios] = useState<ModuleType[]>(() => {
    const saved = localStorage.getItem('cultivator_unlocks');
    return saved ? JSON.parse(saved) : [ModuleType.CREATIVITY];
  });

  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [activePlayground, setActivePlayground] = useState<ModuleType | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [activeDefinition, setActiveDefinition] = useState<GlossaryEntry | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  
  const labRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cultivator_stats', JSON.stringify(stats));
    localStorage.setItem('cultivator_unlocks', JSON.stringify(unlockedStudios));
    
    const allDone = Object.values(stats.bucketXP).every(xp => xp >= 50);
    if (allDone && !stats.allBucketsComplete) {
      setStats(s => ({ ...s, allBucketsComplete: true }));
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    }
  }, [stats, unlockedStudios]);

  useEffect(() => {
    if (showGlossary || activeQuiz || activeDefinition) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showGlossary, activeQuiz, activeDefinition]);

  const assessmentQuestions = useMemo(() => {
    return [...INITIAL_ASSESSMENT_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  }, [isAssessmentView]);

  const startInitialAssessment = () => {
    setIsAssessmentView(true);
    setActiveQuiz('INITIAL_ASSESSMENT');
    window.scrollTo(0, 0);
  };

  const resetToHome = () => {
    setActivePlayground(null);
    setIsAnalyzed(false);
    setFeedback(null);
    setIsAssessmentView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssessmentComplete = (totalPoints: number) => {
    setHasTakenAssessment(true);
    setIsAssessmentView(false);
    localStorage.setItem('cultivator_assessment_done', 'true');
    
    const newUnlocks = [ModuleType.CREATIVITY];
    if (totalPoints >= 30) newUnlocks.push(ModuleType.PROMPTING);
    if (totalPoints >= 50) newUnlocks.push(ModuleType.CODE_ONRAMP);

    setUnlockedStudios(newUnlocks);
    setStats(s => ({
      ...s,
      points: s.points + totalPoints
    }));
    setActiveQuiz(null);
  };

  const fetchNewChallenge = async (moduleType: ModuleType) => {
    setChallengeLoading(true);
    setFeedback(null);
    setPromptInput('');
    setIsAnalyzed(false);
    try {
      const newChallenge = await generatePracticePromptChallenge(moduleType);
      setChallenge(newChallenge);
    } catch (err) {
      console.error(err);
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleModuleClick = async (module: ModuleType) => {
    setActivePlayground(module);
    setStats(s => ({ ...s, currentModule: module }));
    setTimeout(() => { labRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
    await fetchNewChallenge(module);
  };

  const handleVibeCheck = async () => {
    if (!promptInput.trim()) return;
    setLoading(true);
    const res = await generateVibeFeedback(promptInput, activePlayground || 'creativity');
    setFeedback(res);
    setLoading(false);
    setIsAnalyzed(true);
    
    if (res && activePlayground) {
      const xpGain = Math.max(5, Math.floor(res.score * 1.5));
      setStats(s => {
        const currentXP = s.bucketXP[activePlayground];
        const newBucketXP = { ...s.bucketXP, [activePlayground]: Math.min(50, currentXP + xpGain) };
        const totalPoints = s.points + xpGain;
        return {
          ...s,
          bucketXP: newBucketXP,
          points: totalPoints,
          level: Math.floor(totalPoints / 50) + 1
        };
      });
    }
  };

  const currentModuleData = MODULES.find(m => m.id === activePlayground);
  const getCategoryColor = (type?: ModuleType) => {
    if (type === ModuleType.CREATIVITY) return '#FFB703'; 
    if (type === ModuleType.PROMPTING) return '#0077B6';   
    if (type === ModuleType.CODE_ONRAMP) return '#2D6A4F'; 
    return '#8DB339';
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
                onClick={(e) => { e.stopPropagation(); setActiveDefinition(entry); }}
                className="underline decoration-dotted decoration-[#8DB339] cursor-help font-bold hover:text-[#8DB339] transition-colors"
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

  const getMasterEncouragement = (module: ModuleType) => {
    if (module === ModuleType.CREATIVITY) {
      return "You are a master storyteller! You proved that great apps start with drawings, stories, and clear ideas. Your creativity is your greatest vibe-coding tool.";
    }
    if (module === ModuleType.PROMPTING) {
      return "Your communication is crystal clear! You have learned to speak 'AI' with precision and style. You can turn any fuzzy idea into a solid plan.";
    }
    return "You think like a builder! You've mastered logic paths and bug-hunting. You now understand the basic rules that make every digital world work.";
  };

  if (isAssessmentView && activeQuiz === 'INITIAL_ASSESSMENT') {
    return (
      <div className="min-h-screen bg-[#FDFEFA] p-0">
        <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-black/5 px-10 py-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8DB339] rounded-xl flex items-center justify-center text-xl shadow-lg text-white font-serif font-black">V</div>
            <h1 className="text-lg font-black tracking-tighter text-[#2D434E] font-serif uppercase">Starting Quiz</h1>
          </div>
          <button onClick={() => setIsAssessmentView(false)} className="text-sm font-bold text-stone-400">Back</button>
        </nav>
        <div className="pt-24 min-h-screen flex items-center justify-center">
           <Quiz 
             questions={assessmentQuestions} 
             onComplete={handleAssessmentComplete} 
             onClose={() => setIsAssessmentView(false)} 
             onShowDefinition={setActiveDefinition}
             isFullPage={true}
           />
        </div>
        {activeDefinition && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm" onClick={() => setActiveDefinition(null)}>
            <div className="bg-white max-w-sm w-full rounded-3xl p-8 shadow-2xl border-2 border-[#8DB339]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-[#8DB339] uppercase text-xs tracking-[0.2em]">{activeDefinition.term}</h4>
                <button onClick={() => setActiveDefinition(null)} className="text-stone-300 hover:text-stone-500">✕</button>
              </div>
              <p className="text-sm text-[#2D434E] font-medium leading-relaxed">{activeDefinition.definition}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!hasTakenAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFEFA]">
        <div className="max-w-4xl w-full bg-white rounded-[4rem] p-12 md:p-20 text-center shadow-2xl border-[12px] border-[#F8F9F2]">
          <div className="mb-6 inline-block bg-[#8DB339]/10 px-6 py-2 rounded-full">
            <span className="text-xs font-black text-[#2D6A4F] uppercase tracking-[0.3em]">Hello, Future Builder!</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black font-serif text-[#2D434E] mb-4">The Vibe <span className="text-[#8DB339]">Cultivator</span></h1>
          <p className="text-xl md:text-2xl font-medium text-[#4A4A4A] max-w-2xl mx-auto mb-12 leading-relaxed">
            Turn your imagination into real projects. Learn how to plan, talk to AI, and understand how apps think.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {MODULES.map(m => (
              <div key={m.id} className="p-8 rounded-[2.5rem] bg-white border-b-8 shadow-sm text-left flex flex-col" style={{ borderColor: m.color }}>
                <h3 className="font-black text-[#2D434E] mb-2 uppercase text-[10px] tracking-widest">{m.title}</h3>
                <p className="text-xs text-stone-500 font-medium">{m.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={startInitialAssessment} className="px-20 py-8 btn-vibe rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl mx-auto">
              Start Your Journey 🧭
            </button>
            <button onClick={() => handleAssessmentComplete(10)} className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors">
              I'm ready to dream, go straight to Design Studio →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-48">
      {activeDefinition && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm" onClick={() => setActiveDefinition(null)}>
          <div className="bg-white max-w-sm w-full rounded-3xl p-8 shadow-2xl border-2 border-[#8DB339]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-[#8DB339] uppercase text-xs tracking-[0.2em]">{activeDefinition.term}</h4>
              <button onClick={() => setActiveDefinition(null)} className="text-stone-300 hover:text-stone-500">✕</button>
            </div>
            <p className="text-sm text-[#2D434E] font-medium leading-relaxed">{activeDefinition.definition}</p>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-black/5 px-10 py-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#8DB339] rounded-xl flex items-center justify-center text-xl shadow-lg text-white font-serif font-black">V</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-[#2D434E] font-serif uppercase">The Vibe Cultivator</h1>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => setShowGlossary(true)} className="text-[10px] font-black uppercase tracking-widest text-[#2D434E] bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg transition-colors">
            Words to Know 📖
          </button>
          <button onClick={startInitialAssessment} className="text-[10px] font-black uppercase tracking-widest text-[#2D6A4F] hover:bg-[#8DB339]/10 px-4 py-2 rounded-lg transition-colors">
            Restart Quiz 🧭
          </button>
          <div className="flex flex-col gap-1 w-32">
            {MODULES.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-1000" style={{ width: `${(stats.bucketXP[m.id] / 50) * 100}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Level {stats.level}</span>
            <span className="text-[10px] text-[#8DB339] font-black tracking-widest">{stats.points} XP</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 pt-40">
        {stats.allBucketsComplete ? (
          <div className="mb-20 p-16 bg-[#8DB339]/10 rounded-[4rem] border-4 border-[#8DB339]/20 text-center animate-in zoom-in duration-500">
             <h2 className="text-5xl font-black font-serif text-[#2D434E] mb-6">Master Builder! 🎉</h2>
             <p className="text-xl text-[#2D434E]/80 mb-12 max-w-2xl mx-auto leading-relaxed">
               You filled all 3 buckets! You have the vision, the words, and the logic. Take the final test to show off your vibe-coding skills.
             </p>
             <button onClick={() => setActiveQuiz('FINAL')} className="px-12 py-6 btn-vibe rounded-3xl font-black text-xl uppercase tracking-widest shadow-xl">
               Final Big Quiz 🏆
             </button>
          </div>
        ) : (
          <div className="mb-20 p-12 bg-[#FFD97D]/10 rounded-[4rem] border-2 border-[#FFD97D]/20">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-32 h-32 rounded-full bg-white border-8 border-[#FFD97D] flex items-center justify-center text-5xl shadow-xl">🌱</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-black font-serif text-[#2D434E] mb-2">Build Your World</h2>
                <p className="text-lg text-[#2D434E]/80 leading-relaxed font-medium">
                  Finish tasks in each studio to grow your skills.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          {MODULES.map((m) => {
            const isUnlocked = unlockedStudios.includes(m.id);
            const isCompleted = stats.bucketXP[m.id] >= 50;
            const isActive = activePlayground === m.id;
            return (
              <ModuleCard 
                key={m.id} module={m} isLocked={!isUnlocked} isCompleted={isCompleted} isActive={isActive} 
                onClick={() => handleModuleClick(m.id)} 
              />
            );
          })}
        </div>

        <div ref={labRef} className={`transition-all duration-1000 ${activePlayground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          {activePlayground && (
            <div className="bg-white rounded-[4rem] p-16 shadow-2xl border-4 relative overflow-hidden mb-24" style={{ borderColor: getCategoryColor(activePlayground), borderBottomWidth: '16px' }}>
              <div className="flex flex-col lg:flex-row gap-20">
                <div className="flex-1">
                  <h3 className="text-5xl font-black font-serif text-[#2D434E] mb-4">{currentModuleData?.title}</h3>
                  <div className="p-8 bg-stone-50 rounded-3xl mb-10 text-stone-600 font-medium italic border-l-8" style={{ borderLeftColor: getCategoryColor(activePlayground) }}>
                    {currentModuleData?.intro}
                  </div>

                  <div className="p-12 rounded-[3rem] border-4 border-dashed mb-12 bg-white" style={{ borderColor: `${getCategoryColor(activePlayground)}40` }}>
                    {challengeLoading ? (
                      <div className="flex items-center gap-4 py-10 justify-center">
                        <div className="w-4 h-4 rounded-full animate-bounce" style={{backgroundColor: getCategoryColor(activePlayground)}} />
                        <div className="w-4 h-4 rounded-full animate-bounce [animation-delay:0.2s]" style={{backgroundColor: getCategoryColor(activePlayground)}} />
                        <div className="w-4 h-4 rounded-full animate-bounce [animation-delay:0.4s]" style={{backgroundColor: getCategoryColor(activePlayground)}} />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-black text-[10px] uppercase tracking-widest opacity-60 mb-6">Your Task</h4>
                        <div className="text-2xl font-bold text-[#2D434E] mb-10 leading-snug">
                          {renderRichText(challenge?.challenge)}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {challenge?.hints?.map((h: string, i: number) => (
                            <span key={i} className="text-[10px] bg-stone-50 px-4 py-2 rounded-xl font-black text-[#2D434E] border border-black/5">💡 {renderRichText(h)}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <textarea 
                    value={promptInput}
                    onChange={(e) => { setPromptInput(e.target.value); if (isAnalyzed) setIsAnalyzed(false); }}
                    placeholder="Type your answer here... tell a story, list features, or fix a prompt."
                    className="w-full h-64 bg-white border-2 border-stone-100 rounded-[2.5rem] p-12 text-xl text-[#2D434E] focus:ring-8 outline-none mb-8 transition-all"
                  />
                  {!isAnalyzed ? (
                    <button disabled={loading || !promptInput} onClick={handleVibeCheck} className="w-full py-8 btn-vibe rounded-3xl font-black text-2xl uppercase tracking-widest disabled:opacity-50">
                      {loading ? 'Thinking...' : 'Send to Analysis'}
                    </button>
                  ) : (
                    <button disabled className="w-full py-8 bg-stone-100 text-stone-400 rounded-3xl font-black text-2xl uppercase tracking-widest">Feedback Ready!</button>
                  )}
                </div>

                <div className="w-full lg:w-[450px]">
                  <div className="bg-stone-50 rounded-[3rem] p-12 h-full border border-white shadow-inner flex flex-col">
                    <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-12 text-center">Your Progress</h4>
                    {feedback ? (
                      <div className="space-y-12 flex-1 flex flex-col">
                        <div className="flex items-center justify-center">
                          <div className={`w-40 h-40 rounded-full border-[10px] border-white shadow-xl flex flex-col items-center justify-center ${feedback.score >= 6 ? 'bg-white' : 'bg-red-50'}`}>
                            <span className={`text-5xl font-black font-serif ${feedback.score >= 6 ? 'text-[#2D434E]' : 'text-red-500'}`}>{feedback.score}</span>
                            <span className="text-[10px] font-black uppercase mt-1">Score</span>
                          </div>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 flex-1 custom-scrollbar">
                          {feedback.suggestions.map((s: string, i: number) => {
                            const isAlarming = s.includes('🚩');
                            const isPraise = s.includes('⭐');
                            return (
                              <div key={i} className={`p-6 rounded-[2rem] border border-black/5 text-xs font-bold leading-relaxed ${isAlarming ? 'bg-red-50 text-red-700' : isPraise ? 'bg-yellow-50 text-yellow-700' : 'bg-white text-[#2D434E]/80'}`}>
                                {renderRichText(s)}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-auto pt-8 border-t border-black/5">
                          <p className="text-xl italic font-serif text-center mb-8 px-4 leading-relaxed">
                            {stats.bucketXP[activePlayground!] >= 50 
                              ? getMasterEncouragement(activePlayground!) 
                              : `"${feedback.encouragement}"`}
                          </p>
                          {feedback.score >= 6 ? (
                            <button onClick={() => fetchNewChallenge(activePlayground!)} className="w-full py-6 btn-vibe rounded-2xl font-black text-xl uppercase tracking-widest">
                              {stats.bucketXP[activePlayground] >= 50 ? "Refine Your Skills" : "Try Next Step ⚡"}
                            </button>
                          ) : (
                            <button onClick={() => { setIsAnalyzed(false); setFeedback(null); }} className="w-full py-6 bg-[#F07167] text-white rounded-2xl font-black text-xl uppercase tracking-widest">
                              Try Again 🔄
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className="text-7xl mb-6">✨</div>
                        <p className="text-xl font-bold italic font-serif">Awaiting Result...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showGlossary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D434E]/60 backdrop-blur-xl" onClick={() => setShowGlossary(false)}>
          <div className="bg-white max-w-2xl w-full rounded-[3rem] p-12 shadow-2xl flex flex-col max-h-[85vh] border-4 border-[#8DB339]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black font-serif text-[#2D434E]">Builder Dictionary</h2>
              <button onClick={() => setShowGlossary(false)} className="text-stone-400 font-bold p-2">✕ Close</button>
            </div>
            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
              {GLOSSARY.map(entry => (
                <div key={entry.term} className="border-b border-stone-100 pb-4">
                  <h4 className="font-black text-[#8DB339] uppercase text-xs tracking-widest mb-1">{entry.term}</h4>
                  <p className="text-sm text-stone-600 font-medium leading-relaxed">{entry.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/90 backdrop-blur-3xl px-12 py-6 rounded-[3rem] border border-black/5 shadow-2xl z-50">
        <button className="text-xs font-black text-[#2D434E] uppercase tracking-[0.2em]" onClick={resetToHome}>Map</button>
        {activePlayground && (
          <button onClick={() => setActiveQuiz(activePlayground)} className="px-6 py-3 bg-[#2D434E] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
            Check Knowledge
          </button>
        )}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#2D434E] uppercase tracking-widest">
              {Object.values(stats.bucketXP).filter(xp => xp >= 50).length} / 3 Buckets Full
            </span>
          </div>
        </div>
      </div>

      {activeQuiz && activeQuiz !== 'INITIAL_ASSESSMENT' && (
        <Quiz 
          questions={activeQuiz === 'FINAL' ? [...QUIZZES[ModuleType.CREATIVITY], ...QUIZZES[ModuleType.PROMPTING], ...QUIZZES[ModuleType.CODE_ONRAMP]] : QUIZZES[activeQuiz] || []} 
          onComplete={(p) => {
            setStats(s => {
              const gain = Math.min(20, Math.floor(p / 2)); 
              const currentXP = s.bucketXP[activeQuiz as ModuleType] || 0;
              return { ...s, points: s.points + p, bucketXP: { ...s.bucketXP, [activeQuiz as ModuleType]: Math.min(50, currentXP + gain) } };
            });
            setActiveQuiz(null);
          }}
          onClose={() => setActiveQuiz(null)}
          onShowDefinition={setActiveDefinition}
        />
      )}
    </div>
  );
};

export default App;
