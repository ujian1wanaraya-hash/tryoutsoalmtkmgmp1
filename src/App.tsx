import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { InstructionsView } from './components/InstructionsView';
import { ExamView } from './components/ExamView';
import { ResultView } from './components/ResultView';
import { AdminView } from './components/AdminView';
import { PembahasanView } from './components/PembahasanView';
import { GasGuideView } from './components/GasGuideView';
import { BlueprintView } from './components/BlueprintView';
import { StudentSession, ExamResult } from './types';
import { loadSession, saveSession, clearSession, loadCurrentResult, syncFinalScoreToGAS } from './services/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'cbt' | 'admin' | 'pembahasan' | 'gas_guide' | 'blueprint'>('cbt');
  const [session, setSession] = useState<StudentSession | null>(() => loadSession());
  const [examResult, setExamResult] = useState<ExamResult | null>(() => {
    const s = loadSession();
    return s ? loadCurrentResult(s.idPeserta) : null;
  });
  const [step, setStep] = useState<'login' | 'instructions' | 'exam' | 'result'>('login');

  // Synchronize step with existing session on load or recovery
  useEffect(() => {
    if (!session) {
      setStep('login');
      setExamResult(null);
    } else if (session.status === 'Selesai') {
      const res = loadCurrentResult(session.idPeserta);
      if (res) {
        setExamResult(res);
        setStep('result');
      } else {
        setStep('instructions');
      }
    } else if (session.status === 'Mengerjakan') {
      setStep('exam');
    } else {
      setStep('instructions');
    }
  }, [session]);

  const handleLoginSuccess = (newSession: StudentSession) => {
    setSession(newSession);
    setStep('instructions');
  };

  const handleStartExam = () => {
    if (!session) return;
    const startedSession: StudentSession = {
      ...session,
      status: 'Mengerjakan',
      waktuMulai: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    saveSession(startedSession);
    setSession(startedSession);
    setStep('exam');
  };

  const handleFinishExam = (result: ExamResult) => {
    setExamResult(result);
    if (session) {
      const finishedSession: StudentSession = {
        ...session,
        status: 'Selesai',
        waktuSelesai: result.waktuSelesai,
      };
      saveSession(finishedSession);
      setSession(finishedSession);
      // Sinkronisasi nilai akhir ke Google Spreadsheet (Sheet HASIL & PESERTA)
      syncFinalScoreToGAS(finishedSession, result).catch((err) => {
        console.warn('Background sync check:', err);
      });
    }
    setStep('result');
  };

  const handleResetSession = () => {
    clearSession();
    setSession(null);
    setExamResult(null);
    setStep('login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeSession={session}
        onLogout={handleResetSession}
      />

      {/* Main Content Area Based on Active Tab */}
      <main className="flex-1 w-full">
        {currentTab === 'cbt' && (
          <>
            {step === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} />}

            {step === 'instructions' && session && (
              <InstructionsView
                session={session}
                onStartExam={handleStartExam}
                onBackToLogin={handleResetSession}
              />
            )}

            {step === 'exam' && session && (
              <ExamView session={session} onFinishExam={handleFinishExam} />
            )}

            {step === 'result' && examResult && (
              <ResultView result={examResult} onReset={handleResetSession} />
            )}
          </>
        )}

        {currentTab === 'admin' && <AdminView />}

        {currentTab === 'pembahasan' && <PembahasanView />}

        {currentTab === 'gas_guide' && <GasGuideView />}

        {currentTab === 'blueprint' && <BlueprintView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-300">
            Aplikasi CBT Online Latihan Try Out TKA Matematika SMP Tingkat Kabupaten Barito Kuala Tahun 2026
          </p>
          <p className="text-[11px] text-slate-500">
            Berdasarkan Kisi-Kisi Resmi No 047/H/AN/2025 • Mengakomodasi 62 SMP Negeri & Swasta di 17 Kecamatan
          </p>
        </div>
      </footer>
    </div>
  );
}
