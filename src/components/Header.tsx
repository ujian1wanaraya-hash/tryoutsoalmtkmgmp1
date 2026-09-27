import React, { useState } from 'react';
import { BookOpen, BarChart3, FileCode, CheckCircle2, Award, GraduationCap, ShieldAlert, Lock } from 'lucide-react';
import { LOGO_URL } from '../data/config';
import { StudentSession } from '../types';

interface HeaderProps {
  currentTab: 'cbt' | 'admin' | 'pembahasan' | 'gas_guide' | 'blueprint';
  onSelectTab: (tab: 'cbt' | 'admin' | 'pembahasan' | 'gas_guide' | 'blueprint') => void;
  activeSession: StudentSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeSession,
  onLogout,
}) => {
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border-b border-indigo-800/40 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Titles */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shadow-md backdrop-blur-sm overflow-hidden shrink-0">
              {!logoLoadFailed ? (
                <img
                  src="https://i.postimg.cc/xcv6M3R4/logo.png"
                  alt="Logo Kabupaten Barito Kuala"
                  className="w-full h-full object-contain"
                  onError={() => {
                    // Try direct postimg alternate or fallback badge
                    setLogoLoadFailed(true);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-800 rounded-lg flex flex-col items-center justify-center text-white p-0.5">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                  <span className="text-[7px] font-extrabold uppercase tracking-tighter">BATOLA</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  TKA SMP 2026
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Kurikulum Merdeka
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight mt-0.5">
                CBT ONLINE LATIHAN TRY OUT TKA MATEMATIKA SMP
              </h1>
              <p className="text-xs font-medium text-indigo-200">
                SE-KABUPATEN BARITO KUALA TAHUN 2026
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start md:self-auto">
            <button
              onClick={() => onSelectTab('cbt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'cbt'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/40 ring-1 ring-emerald-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Try Out CBT</span>
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-700/40 ring-1 ring-indigo-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Admin & Rekap</span>
            </button>

            <button
              onClick={() => onSelectTab('pembahasan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'pembahasan'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-700/40 ring-1 ring-purple-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
              title="Kunci & Pembahasan Terproteksi Sandi Pengembang"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Pembahasan</span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-300/30 px-1 py-0.2 rounded font-bold">
                Lock
              </span>
            </button>

            <button
              onClick={() => onSelectTab('blueprint')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'blueprint'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-700/40 ring-1 ring-teal-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kisi-Kisi (30 Soal)</span>
            </button>

            <button
              onClick={() => onSelectTab('gas_guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'gas_guide'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40 ring-1 ring-amber-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Script Apps Script</span>
            </button>

            {activeSession && onLogout && (
              <button
                onClick={onLogout}
                title="Keluar dari sesi ini"
                className="ml-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 border border-rose-500/30 transition-all"
              >
                Ganti Siswa
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
