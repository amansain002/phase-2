import React, { useState } from 'react';
import {
  Dumbbell,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Trophy,
  BookOpen,
  Award,
  Zap,
  Target,
  Brain,
  ListOrdered,
  Layers,
} from 'lucide-react';
import {
  PracticeQuestion,
  PracticeDifficulty,
  ExternalPracticeLink,
  MistakeRecord,
} from '../types/learning';
import {
  PRACTICE_QUESTION_BANK,
  EXTERNAL_PRACTICE_LINKS,
  LEARNING_XP_CONFIG,
  buildSearchURL,
} from '../data/learningConfig';
import {
  getLearningStats,
  canClaimLearningXP,
  recordLearningXPClaim,
  saveMistake,
  getMistakes,
  resolveMistake,
} from '../lib/learningService';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';

type PracticeMode = 'daily' | 'quiz' | 'mistakes' | 'boss' | 'platforms';

interface PracticeTabProps {
  initialTopic?: string;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ initialTopic }) => {
  const { character } = useTheme();
  const { addXp, progress } = useApp();

  const [activeMode, setActiveMode] = useState<PracticeMode>('daily');
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialTopic || 'Operating Systems'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty>('medium');

  // Quiz execution state
  const [quizQuestions, setQuizQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

  // Mistakes notebook
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(getMistakes);

  // External platforms completed state
  const [completedLinkIds, setCompletedLinkIds] = useState<string[]>([]);

  // Daily Challenge state
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return localStorage.getItem('uplevel_daily_challenge_done') === today;
    } catch {
      return false;
    }
  });

  // Start Topic Quiz
  const handleStartQuiz = (topic: string, isBoss: boolean = false) => {
    const pool = PRACTICE_QUESTION_BANK.filter(
      (q) => q.topic.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(q.topic.toLowerCase())
    );
    const chosen = pool.length > 0 ? pool : PRACTICE_QUESTION_BANK;
    setQuizQuestions(isBoss ? chosen : chosen.slice(0, 5));
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizComplete(false);
    setActiveMode(isBoss ? 'boss' : 'quiz');
  };

  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIdx === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const q = quizQuestions[currentQuestionIdx];
    const isCorrect = selectedAnswerIdx === q.correctIndex;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      const claim = canClaimLearningXP(q.id);
      if (claim.canClaim) {
        const awarded = recordLearningXPClaim(
          q.id,
          LEARNING_XP_CONFIG.correctPracticeAnswer
        );
        addXp(awarded, `Correct Answer: ${q.topic}`);
      }
    } else {
      // Save to Mistakes Notebook!
      saveMistake(q, selectedAnswerIdx);
      setMistakes(getMistakes());
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedAnswerIdx(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finish Quiz!
      setIsQuizComplete(true);
      if (quizScore >= Math.ceil(quizQuestions.length / 2)) {
        addXp(LEARNING_XP_CONFIG.quizCompleted, `Quiz Bonus Completed!`);
      }
    }
  };

  // Complete Daily Challenge
  const handleCompleteDailyChallenge = () => {
    if (dailyCompleted) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      localStorage.setItem('uplevel_daily_challenge_done', today);
    } catch {}
    setDailyCompleted(true);
    addXp(LEARNING_XP_CONFIG.dailyChallenge, `Daily Skill Challenge Completed`);
  };

  // Resolve Mistake from Notebook
  const handleFixMistake = (mistake: MistakeRecord) => {
    resolveMistake(mistake.id);
    setMistakes(getMistakes());
    addXp(LEARNING_XP_CONFIG.mistakeFixed, `Fixed Mistake: ${mistake.question.topic}`);
  };

  // External Platform Task Done
  const handleMarkLinkDone = (link: ExternalPracticeLink) => {
    if (completedLinkIds.includes(link.id)) return;
    setCompletedLinkIds((prev) => [...prev, link.id]);
    addXp(link.xpReward, `Completed Exercise: ${link.siteName}`);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* 1. TOP HEADER: Practice Hub */}
      <div
        className="p-4 rounded-3xl border bg-surface shadow-xs space-y-3 transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}30` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-bold"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-coffee">Practice & Assessment</h2>
              <p className="text-[11px] text-coffee-muted">
                Interactive tests, coding problems & mistakes review
              </p>
            </div>
          </div>

          {/* Practice Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
            <Flame size={14} className="animate-pulse" />
            <span>Practice Active</span>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-edge">
          {[
            { id: 'daily', label: 'Daily Challenge', icon: Target },
            { id: 'quiz', label: 'Topic Quiz', icon: HelpCircle },
            { id: 'mistakes', label: `Mistakes (${mistakes.filter(m => !m.resolved).length})`, icon: Brain },
            { id: 'boss', label: 'Boss Quiz', icon: Trophy },
            { id: 'platforms', label: 'Coding Platforms', icon: Layers },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (m.id === 'quiz' && quizQuestions.length === 0) {
                    handleStartQuiz(selectedTopic, false);
                  } else if (m.id === 'boss' && quizQuestions.length === 0) {
                    handleStartQuiz(selectedTopic, true);
                  }
                  setActiveMode(m.id as PracticeMode);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white border-transparent shadow-xs'
                    : 'bg-surface2 border-edge text-coffee-muted hover:text-coffee'
                }`}
                style={
                  isActive
                    ? { backgroundColor: character.theme.primary }
                    : undefined
                }
              >
                <Icon size={13} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MODE: DAILY CHALLENGE */}
      {activeMode === 'daily' && (
        <div className="p-5 rounded-3xl border border-edge bg-surface2/70 space-y-4 text-center">
          <div
            className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: character.theme.primary }}
          >
            <Target size={26} />
          </div>

          <div>
            <span
              className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border inline-block mb-1"
              style={{
                backgroundColor: `${character.theme.primary}15`,
                borderColor: `${character.theme.primary}30`,
                color: character.theme.primary,
              }}
            >
              Daily Question
            </span>
            <h3 className="text-base font-black text-coffee">
              Today's Operating Systems Challenge
            </h3>
            <p className="text-xs text-coffee-muted mt-0.5">
              Solve 1 question every 24 hours to preserve your discipline streak!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-edge text-left space-y-2">
            <span className="text-[10px] font-bold text-coffee-muted block uppercase">
              Question of the Day
            </span>
            <p className="text-xs font-bold text-coffee leading-snug">
              "Which of the following conditions is NOT one of Coffman’s four necessary conditions for deadlock?"
            </p>
            <div className="space-y-1.5 pt-1">
              {[
                'Mutual Exclusion',
                'Preemption by higher-priority process (Correct)',
                'Hold and Wait',
                'Circular Wait',
              ].map((opt, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl border border-edge bg-surface2 text-xs text-coffee font-semibold flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-sand/30 flex items-center justify-center text-[11px] font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCompleteDailyChallenge}
            disabled={dailyCompleted}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2 ${
              dailyCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-white'
            }`}
            style={
              !dailyCompleted
                ? { backgroundColor: character.theme.primary }
                : undefined
            }
          >
            <CheckCircle2 size={16} />
            <span>
              {dailyCompleted
                ? 'Daily Challenge Completed for Today (+25 XP)'
                : 'Claim Daily Challenge (+25 XP)'}
            </span>
          </button>
        </div>
      )}

      {/* 3. MODE: TOPIC QUIZ / BOSS QUIZ */}
      {(activeMode === 'quiz' || activeMode === 'boss') && (
        <div className="space-y-3">
          {isQuizComplete ? (
            /* Quiz Completed Summary */
            <div className="p-6 rounded-3xl border border-edge bg-surface2 text-center space-y-4">
              <div
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl animate-bounce"
                style={{ backgroundColor: character.theme.primary }}
              >
                <Trophy size={32} />
              </div>

              <div>
                <span
                  className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border inline-block mb-1"
                  style={{
                    backgroundColor: `${character.theme.primary}15`,
                    borderColor: `${character.theme.primary}30`,
                    color: character.theme.primary,
                  }}
                >
                  Quiz Complete
                </span>
                <h3 className="text-lg font-black text-coffee">
                  Score: {quizScore} / {quizQuestions.length} Correct
                </h3>
                <p className="text-xs text-coffee-muted mt-1">
                  {quizScore >= Math.ceil(quizQuestions.length / 2)
                    ? 'Outstanding performance! Bonus XP awarded.'
                    : 'Good practice run. Check the Mistakes Notebook to review missed concepts.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStartQuiz(selectedTopic, activeMode === 'boss')}
                  className="flex-1 py-3 rounded-2xl border border-edge bg-surface text-coffee text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retry Quiz
                </button>

                <button
                  onClick={() => setActiveMode('mistakes')}
                  className="flex-1 py-3 rounded-2xl text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: character.theme.primary }}
                >
                  <Brain size={14} /> View Mistakes
                </button>
              </div>
            </div>
          ) : quizQuestions.length > 0 ? (
            /* Active Question Card */
            <div className="p-4 rounded-3xl border border-edge bg-surface shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-coffee-muted border-b border-edge pb-2">
                <span className="font-bold text-coffee">
                  Question {currentQuestionIdx + 1} of {quizQuestions.length}
                </span>
                <span
                  className="font-extrabold px-2 py-0.5 rounded-full uppercase text-[10px]"
                  style={{
                    backgroundColor: `${character.theme.primary}15`,
                    color: character.theme.primary,
                  }}
                >
                  {quizQuestions[currentQuestionIdx].difficulty}
                </span>
              </div>

              <h3 className="text-sm font-bold text-coffee leading-snug">
                {quizQuestions[currentQuestionIdx].question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {quizQuestions[currentQuestionIdx].options.map((opt, idx) => {
                  const isSelected = selectedAnswerIdx === idx;
                  const isCorrect = idx === quizQuestions[currentQuestionIdx].correctIndex;

                  let optClass = 'bg-surface2 border-edge text-coffee hover:border-coffee-muted/40';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                    } else if (isSelected) {
                      optClass = 'bg-red-500/20 border-red-500 text-red-400 font-bold';
                    }
                  } else if (isSelected) {
                    optClass = 'border-orange-500 bg-orange-500/10 text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3 rounded-2xl border text-xs text-left transition flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-sand/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {isAnswerSubmitted && (
                <div className="p-3.5 rounded-2xl bg-sand/20 border border-edge text-xs space-y-1 animate-fadeIn">
                  <span className="font-bold text-coffee block flex items-center gap-1">
                    <Sparkles size={13} style={{ color: character.theme.primary }} />
                    Explanation
                  </span>
                  <p className="text-coffee-muted leading-relaxed">
                    {quizQuestions[currentQuestionIdx].explanation}
                  </p>
                </div>
              )}

              {/* Action Button: Check / Next */}
              <div>
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswerIdx === null}
                    className="w-full py-3.5 rounded-2xl text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-40"
                    style={{ backgroundColor: character.theme.primary }}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3.5 rounded-2xl text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: character.theme.primary }}
                  >
                    <span>
                      {currentQuestionIdx === quizQuestions.length - 1
                        ? 'Finish Quiz'
                        : 'Next Question'}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl border border-edge bg-surface text-center space-y-3">
              <BookOpen size={24} className="mx-auto text-coffee-muted/50" />
              <p className="text-xs text-coffee font-semibold">
                Ready to test your knowledge on {selectedTopic}?
              </p>
              <button
                onClick={() => handleStartQuiz(selectedTopic, false)}
                className="py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md"
                style={{ backgroundColor: character.theme.primary }}
              >
                Start 5-Question Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. MODE: MISTAKES NOTEBOOK */}
      {activeMode === 'mistakes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
              Mistakes Notebook ({mistakes.filter((m) => !m.resolved).length} Unresolved)
            </h3>
            <span className="text-[10px] text-coffee-muted">+10 XP per resolved mistake</span>
          </div>

          {mistakes.filter((m) => !m.resolved).length === 0 ? (
            <div className="p-8 rounded-3xl border border-edge bg-surface text-center space-y-2">
              <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
              <h4 className="text-xs font-bold text-coffee">Zero Active Mistakes!</h4>
              <p className="text-[11px] text-coffee-muted max-w-xs mx-auto">
                Any questions answered incorrectly during practice or quizzes will be saved here for focused revision.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {mistakes
                .filter((m) => !m.resolved)
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-500/20 text-red-400">
                        {m.question.topic}
                      </span>
                      <span className="text-[10px] text-coffee-muted">
                        Missed: {new Date(m.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-coffee leading-snug">
                      {m.question.question}
                    </p>

                    <div className="p-2.5 rounded-xl bg-surface border border-edge text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 block">
                        Correct Answer: {m.question.options[m.question.correctIndex]}
                      </span>
                      <p className="text-[11px] text-coffee-muted leading-relaxed">
                        {m.question.explanation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleFixMistake(m)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 size={13} />
                      <span>I Understand This Now (+10 XP)</span>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 5. MODE: EXTERNAL CODING PLATFORMS */}
      {activeMode === 'platforms' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
              Curated Coding & Assessment Platforms
            </h3>
            <span className="text-[10px] text-coffee-muted">Opens official sites</span>
          </div>

          <div className="space-y-2">
            {EXTERNAL_PRACTICE_LINKS.map((link) => {
              const isDone = completedLinkIds.includes(link.id);

              return (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl border border-edge bg-surface2/60 hover:bg-surface2 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-coffee">{link.siteName}</span>
                      <span
                        className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border uppercase"
                        style={{
                          backgroundColor: `${character.theme.primary}15`,
                          borderColor: `${character.theme.primary}30`,
                          color: character.theme.primary,
                        }}
                      >
                        {link.badge}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-coffee-muted capitalize">
                      {link.difficulty}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-coffee">{link.title}</h4>
                    <p className="text-[11px] text-coffee-muted mt-0.5 leading-relaxed">
                      {link.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-edge">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 py-1 px-3 rounded-xl border border-edge bg-surface text-xs font-bold text-coffee hover:text-saddle transition"
                    >
                      <span>Open {link.siteName}</span>
                      <ExternalLink size={12} />
                    </a>

                    <button
                      onClick={() => handleMarkLinkDone(link)}
                      disabled={isDone}
                      className={`py-1 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-white shadow-xs'
                      }`}
                      style={
                        !isDone
                          ? { backgroundColor: character.theme.primary }
                          : undefined
                      }
                    >
                      <CheckCircle2 size={13} />
                      <span>{isDone ? 'Completed' : `Did It? (+${link.xpReward} XP)`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
