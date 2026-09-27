import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  AlertTriangle,
  Menu,
  X,
  Send,
  CloudCheck,
  CloudOff,
  RefreshCw,
  HelpCircle,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { Question, StudentSession, StudentAnswersMap, StudentAnswer, ExamResult } from '../types';
import { QUESTIONS_DATA } from '../data/questions';
import { CONFIG } from '../data/config';
import { saveAnswers, loadAnswers, saveSession, syncAnswerToGAS, evaluateExam, syncFinalScoreToGAS } from '../services/storage';
import { DiagramRenderer, OptionNumberLine, OptionMiniBarChart } from './DiagramRenderer';

interface ExamViewProps {
  session: StudentSession;
  onFinishExam: (result: ExamResult) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({ session, onFinishExam }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswersMap>(() => loadAnswers());
  const [flagged, setFlagged] = useState<{ [no: number]: boolean }>(() => session.isFlagged || {});
  
  // Timer setup: 90 minutes in seconds (5400 seconds)
  const initialSeconds = session.durasiSisaDetik !== undefined
    ? session.durasiSisaDetik
    : CONFIG.DURASI_MENIT * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const questions = QUESTIONS_DATA;
  const currentQ: Question = questions[currentIdx] || questions[0];

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next % 15 === 0) {
          // Persist remaining time periodically
          saveSession({ ...session, durasiSisaDetik: next, isFlagged: flagged });
        }
        if (next <= 0) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answers, flagged, session]);

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check whether a question has been answered
  const isQuestionAnswered = useCallback((no: number): boolean => {
    const ans = answers[no];
    if (!ans) return false;
    if (ans.type === 'pg') return Boolean(ans.value);
    if (ans.type === 'mcma') return Boolean(ans.selectedIds && ans.selectedIds.length > 0);
    if (ans.type === 'pgk') {
      const q = questions.find((item) => item.no === no);
      const stmts = q?.pgkStatements || [];
      const userStmts = ans.statements || {};
      return stmts.length > 0 && stmts.every((s) => Boolean(userStmts[s.id]));
    }
    return false;
  }, [answers, questions]);

  // Summary counts for palette & confirm modal
  const answeredCount = useMemo(() => {
    return questions.filter((q) => isQuestionAnswered(q.no)).length;
  }, [questions, isQuestionAnswered]);

  const flaggedCount = useMemo(() => {
    return Object.values(flagged).filter(Boolean).length;
  }, [flagged]);

  // Handle PG Single Choice
  const handleSelectPg = async (optId: 'A' | 'B' | 'C' | 'D') => {
    setSyncStatus('saving');
    const newAnswer: StudentAnswer = { type: 'pg', value: optId };
    const updatedAnswers = { ...answers, [currentQ.no]: newAnswer };
    setAnswers(updatedAnswers);
    saveAnswers(updatedAnswers);

    const success = await syncAnswerToGAS(session, currentQ.no, newAnswer);
    setSyncStatus(success ? 'saved' : 'offline');
  };

  // Handle MCMA Multiple Choices
  const handleToggleMcma = async (optId: string) => {
    setSyncStatus('saving');
    const existing = answers[currentQ.no]?.type === 'mcma' ? (answers[currentQ.no] as any).selectedIds || [] : [];
    let updatedIds: string[];
    if (existing.includes(optId)) {
      updatedIds = existing.filter((id: string) => id !== optId);
    } else {
      updatedIds = [...existing, optId];
    }

    const newAnswer: StudentAnswer = { type: 'mcma', selectedIds: updatedIds };
    const updatedAnswers = { ...answers, [currentQ.no]: newAnswer };
    setAnswers(updatedAnswers);
    saveAnswers(updatedAnswers);

    const success = await syncAnswerToGAS(session, currentQ.no, newAnswer);
    setSyncStatus(success ? 'saved' : 'offline');
  };

  // Handle PGK True / False per Statement
  const handleSelectPgk = async (statementId: string, value: 'Benar' | 'Salah') => {
    setSyncStatus('saving');
    const existingStmts = answers[currentQ.no]?.type === 'pgk' ? (answers[currentQ.no] as any).statements || {} : {};
    const updatedStmts = { ...existingStmts, [statementId]: value };

    const newAnswer: StudentAnswer = { type: 'pgk', statements: updatedStmts };
    const updatedAnswers = { ...answers, [currentQ.no]: newAnswer };
    setAnswers(updatedAnswers);
    saveAnswers(updatedAnswers);

    const success = await syncAnswerToGAS(session, currentQ.no, newAnswer);
    setSyncStatus(success ? 'saved' : 'offline');
  };

  // Toggle Flag (Ragu-ragu)
  const toggleFlag = () => {
    const updated = { ...flagged, [currentQ.no]: !flagged[currentQ.no] };
    setFlagged(updated);
    saveSession({ ...session, isFlagged: updated });
  };

  // Submit test and connect final score to Google Spreadsheet
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = evaluateExam(session, answers, questions);
      // Sinkronisasi otomatis nilai akhir ke Google Spreadsheet Sheet HASIL & PESERTA
      await syncFinalScoreToGAS(session, result);
      onFinishExam(result);
    } catch (err) {
      console.warn('Gagal sinkronisasi otomatis, melanjutkan ke lembar hasil:', err);
      const fallback = evaluateExam(session, answers, questions);
      onFinishExam(fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-16">
      {/* Top Test Header Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left Student Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 items-center justify-center font-bold text-emerald-300 text-xs">
              {currentQ.no}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{session.nama}</span>
                <span className="hidden md:inline text-[11px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  {session.idPeserta}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {session.asalSekolah}
              </p>
            </div>
          </div>

          {/* Right Timer & Status & Palette Toggle */}
          <div className="flex items-center gap-3">
            {/* Autosave Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px]">
              {syncStatus === 'saved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">🟢 Tersimpan</span>
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300 font-medium">🟡 Menyimpan...</span>
                </>
              )}
              {syncStatus === 'offline' && (
                <>
                  <CloudOff className="w-3 h-3 text-rose-400" />
                  <span className="text-rose-300 font-medium">🔴 Offline (Lokal Aman)</span>
                </>
              )}
            </div>

            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black border shadow-inner ${
                timeLeft < 300
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-slate-950 text-amber-300 border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Palette Open Button */}
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Daftar Soal</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                {answeredCount}/{questions.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                  Soal {currentQ.no} dari {questions.length}
                </span>

                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-semibold">
                  {currentQ.element}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    currentQ.level === 'Menalar'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : currentQ.level === 'Mengaplikasikan'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  Level {currentQ.level} {currentQ.level === 'Menalar' ? '(C4 HOTS)' : currentQ.level === 'Mengaplikasikan' ? '(C3)' : '(C2)'}
                </span>

                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-300">
                  {currentQ.type === 'pg' && 'Pilihan Ganda'}
                  {currentQ.type === 'mcma' && 'PG Kompleks (Pilihan Ganda Majemuk)'}
                  {currentQ.type === 'pgk' && 'PGK (Kategori Benar/Salah)'}
                </span>
              </div>

              {/* Flag Toggle Button */}
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  flagged[currentQ.no]
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${flagged[currentQ.no] ? 'fill-white' : ''}`} />
                <span>{flagged[currentQ.no] ? 'Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}</span>
              </button>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Stimulus Section */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                {currentQ.stimulusTitle && (
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{currentQ.stimulusTitle}</span>
                  </h4>
                )}

                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                  {currentQ.stimulusText}
                </p>

                {/* Stimulus Table if available */}
                {currentQ.stimulusTable && (
                  <div className="overflow-x-auto my-3 border border-slate-300 rounded-lg shadow-sm">
                    <table className="w-full text-xs text-left text-slate-700 bg-white">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <tr>
                          {currentQ.stimulusTable.headers.map((h, idx) => (
                            <th key={idx} className="px-3 py-2 border-r border-slate-200 last:border-r-0">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentQ.stimulusTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 font-medium border-r border-slate-200 last:border-r-0">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Interactive Diagram / SVG Graphics */}
                <DiagramRenderer type={currentQ.stimulusChartType} data={currentQ.stimulusChartData} />
              </div>

              {/* Question Text */}
              <div className="pt-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {currentQ.questionText}
                </h3>
              </div>

              {/* Options Form: PG (Pilihan Ganda Tunggal) */}
              {currentQ.type === 'pg' && currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const currentAns = answers[currentQ.no];
                    const isSelected = currentAns?.type === 'pg' && currentAns.value === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectPg(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-800 pt-0.5 leading-relaxed flex-1">
                          <div>{opt.text}</div>
                          {opt.chartType === 'number_line' && opt.chartData && (
                            <OptionNumberLine data={opt.chartData} />
                          )}
                          {opt.chartType === 'bar_mini' && opt.chartData && (
                            <OptionMiniBarChart data={opt.chartData} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Options Form: MCMA (Pilihan Ganda Kompleks - Multiple Answers) */}
              {currentQ.type === 'mcma' && currentQ.mcmaOptions && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Perhatian: Anda dapat memilih LEBIH DARI SATU jawaban benar. Centang semua opsi yang menurut Anda benar!</span>
                  </div>

                  {currentQ.mcmaOptions.map((opt) => {
                    const currentAns = answers[currentQ.no];
                    const isSelected =
                      currentAns?.type === 'mcma' && currentAns.selectedIds?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleMcma(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50/90 border-purple-600 shadow-md ring-1 ring-purple-600/40'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border-2 border-slate-300 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                          <span className="font-bold text-slate-900 mr-2">[{opt.id}]</span>
                          {opt.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Options Form: PGK (Kategori Benar-Salah) */}
              {currentQ.type === 'pgk' && currentQ.pgkStatements && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Tentukan pilihan "Benar" atau "Salah" pada setiap baris pernyataan berikut secara tepat:</span>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Pernyataan Analisis</th>
                          <th className="px-3 py-3 text-center w-24 sm:w-28 bg-emerald-50 text-emerald-800 border-l border-slate-200">
                            Benar
                          </th>
                          <th className="px-3 py-3 text-center w-24 sm:w-28 bg-rose-50 text-rose-800 border-l border-slate-200">
                            Salah
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {currentQ.pgkStatements.map((stmt, sIdx) => {
                          const currentAns = answers[currentQ.no];
                          const selectedVal =
                            currentAns?.type === 'pgk' ? currentAns.statements?.[stmt.id] : undefined;

                          return (
                            <tr key={stmt.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3.5 font-medium text-slate-800 leading-relaxed">
                                <span className="font-bold text-slate-500 mr-1.5">{sIdx + 1}.</span>
                                {stmt.text}
                              </td>

                              {/* Benar Radio */}
                              <td
                                onClick={() => handleSelectPgk(stmt.id, 'Benar')}
                                className={`px-3 py-3.5 text-center border-l border-slate-200 cursor-pointer transition-colors ${
                                  selectedVal === 'Benar' ? 'bg-emerald-100/80' : 'hover:bg-emerald-50/50'
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={`pgk_${currentQ.no}_${stmt.id}`}
                                    checked={selectedVal === 'Benar'}
                                    onChange={() => handleSelectPgk(stmt.id, 'Benar')}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </div>
                              </td>

                              {/* Salah Radio */}
                              <td
                                onClick={() => handleSelectPgk(stmt.id, 'Salah')}
                                className={`px-3 py-3.5 text-center border-l border-slate-200 cursor-pointer transition-colors ${
                                  selectedVal === 'Salah' ? 'bg-rose-100/80' : 'hover:bg-rose-50/50'
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={`pgk_${currentQ.no}_${stmt.id}`}
                                    checked={selectedVal === 'Salah'}
                                    onChange={() => handleSelectPgk(stmt.id, 'Salah')}
                                    className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Nomor <span className="font-bold text-slate-800">{currentQ.no}</span> dari {questions.length}
              </div>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Selesai Ujian</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Palette Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 sticky top-16">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Nomor Soal</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Grid 1 to 30 */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = isQuestionAnswered(q.no);
                const isFlag = flagged[q.no];

                let bgClass = 'bg-slate-200 text-slate-700 hover:bg-slate-300';
                if (isFlag) {
                  bgClass = 'bg-amber-400 text-slate-950 font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.no}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md' : ''
                    }`}
                  >
                    <span>{q.no}</span>
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-200 mt-4 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block shrink-0" />
                <span>Sudah dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block shrink-0" />
                <span>Ragu-ragu ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block shrink-0 border border-slate-300" />
                <span>Belum dijawab ({questions.length - answeredCount})</span>
              </div>
            </div>

            {/* Submit Button in Sidebar */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-5 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan Ujian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Responsive Palette Drawer */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-800">Daftar Soal Try Out</h4>
                </div>
                <button
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = isQuestionAnswered(q.no);
                  const isFlag = flagged[q.no];

                  let bgClass = 'bg-slate-200 text-slate-700';
                  if (isFlag) bgClass = 'bg-amber-400 text-slate-950 font-bold';
                  else if (isAnswered) bgClass = 'bg-emerald-600 text-white font-bold';

                  return (
                    <button
                      key={q.no}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setIsPaletteOpen(false);
                      }}
                      className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center relative ${bgClass} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    >
                      <span>{q.no}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  <span>Sudah dijawab ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span>Ragu-ragu ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
                  <span>Belum dijawab ({questions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsPaletteOpen(false);
                setShowConfirmModal(true);
              }}
              className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Selesai & Kumpulkan</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Final Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Selesai Ujian</h3>
                <p className="text-xs text-slate-500">
                  Apakah Anda yakin ingin mengakhiri sesi Try Out ini?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Soal Sudah Dijawab:</span>
                <span className="font-bold text-emerald-700">{answeredCount} dari {questions.length}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Soal Belum Dijawab:</span>
                <span className={`font-bold ${questions.length - answeredCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {questions.length - answeredCount}
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Soal Ditandai Ragu-ragu:</span>
                <span className="font-bold text-amber-600">{flaggedCount}</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                ⚠️ Peringatan: Masih terdapat {questions.length - answeredCount} soal yang belum Anda isi. Soal yang kosong akan dihitung bernilai 0.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-700/30 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan ke Spreadsheet...</span>
                  </>
                ) : (
                  <span>Ya, Kumpulkan Jawaban</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting & Syncing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-4 shadow-lg shadow-emerald-950/50">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <h3 className="text-lg font-black tracking-tight">Menghubungkan Nilai Akhir...</h3>
          <p className="text-xs text-slate-300 mt-1.5 max-w-sm">
            Menyimpan jawaban dan menyinkronkan nilai akhir try out ke Google Spreadsheet (Sheet HASIL & PESERTA).
          </p>
        </div>
      )}
    </div>
  );
};
