import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  BookOpen,
  Filter,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Layers,
  HelpCircle,
  Sparkles,
  Info,
  Settings
} from 'lucide-react';
import { QUESTIONS_DATA } from '../data/questions';
import { DiagramRenderer, OptionNumberLine, OptionMiniBarChart } from './DiagramRenderer';
import {
  isDevAuthenticated,
  loginDev,
  logoutDev,
  subscribeDevAuth,
  setCustomDevPassword
} from '../services/devAuth';
import { DomainElement, QuestionType } from '../types';

export const PembahasanView: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isDevAuthenticated());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passChangedNotice, setPassChangedNotice] = useState(false);

  useEffect(() => {
    const unsub = subscribeDevAuth((auth) => {
      setIsUnlocked(auth);
    });
    return unsub;
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMessage('Silakan masukkan kata sandi pengembang');
      return;
    }

    const success = loginDev(passwordInput);
    if (success) {
      setIsUnlocked(true);
      setErrorMessage('');
      setPasswordInput('');
    } else {
      setErrorMessage('Kata sandi salah! Akses pembahasan hanya diperuntukkan bagi pengembang/pengawas.');
    }
  };

  const handleLockAgain = () => {
    logoutDev();
    setIsUnlocked(false);
    setPasswordInput('');
    setErrorMessage('');
    setOpenItems({});
  };

  const handleToggleItem = (no: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [no]: !prev[no],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: { [key: number]: boolean } = {};
    QUESTIONS_DATA.forEach((q) => {
      allOpen[q.no] = true;
    });
    setOpenItems(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 4) {
      alert('Kata sandi minimal 4 karakter!');
      return;
    }
    setCustomDevPassword(newPassword.trim());
    setPassChangedNotice(true);
    setTimeout(() => {
      setPassChangedNotice(false);
      setShowChangePassModal(false);
      setNewPassword('');
    }, 1500);
  };

  const filteredQuestions = useMemo(() => {
    return QUESTIONS_DATA.filter((q) => {
      const matchDomain = selectedDomain === 'Semua' || q.element === selectedDomain;
      const matchType = selectedType === 'Semua' || q.type === selectedType;
      const matchQuery =
        !searchQuery ||
        q.no.toString() === searchQuery.trim() ||
        (q.stimulusTitle && q.stimulusTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.indikator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchType && matchQuery;
    });
  }, [selectedDomain, selectedType, searchQuery]);

  // If locked, display high-security mask screen
  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center relative">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              Menu Terproteksi Kata Sandi
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              KUNCI & PEMBAHASAN SOAL
            </h2>
            <p className="text-xs text-indigo-200 mt-2 max-w-sm mx-auto leading-relaxed">
              Kunci jawaban dan pembahasan rinci 30 butir soal Try Out TKA 2026 dilindungi kata sandi khusus pengembang untuk menjaga integritas ujian.
            </p>
          </div>

          <div className="p-8 sm:p-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Kata Sandi Pengembang:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Masukkan sandi (hanya pengembang)..."
                    autoFocus
                    className="w-full px-4 py-3 pl-10 pr-12 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:tracking-normal placeholder:font-sans"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-1">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Buka Pembahasan Soal</span>
              </button>
            </form>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80 text-left text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Informasi Kerahasiaan Kunci Jawaban</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                Sandi hanya diketahui oleh Pengembang dan Guru Penyelenggara. Akses siswa secara sengaja dibatasi agar hasil try out mencerminkan kemampuan murni numerasi siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If unlocked, display full rich pembahasan dashboard
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Banner & Developer Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Akses Pengembang Aktif
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                Resmi TKA SMP 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              KUNCI & PEMBAHASAN LENGKAP 30 SOAL
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
              Memuat uraian konsep matematika, pemecahan bertahap (step-by-step), dan analisis stimulus kontekstual Barito Kuala.
            </p>
          </div>

          {/* Quick Lock & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={() => setShowChangePassModal(true)}
              title="Ubah kata sandi pengembang"
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Ubah Sandi</span>
            </button>

            <button
              onClick={handleLockAgain}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Sembunyikan & Kunci Kembali</span>
            </button>
          </div>
        </div>

        {/* Quick Question Jumper (1 - 30) */}
        <div className="mt-6 pt-5 border-t border-indigo-800/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
              Lompat Cepat ke Nomor Soal:
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleExpandAll}
                className="text-xs text-indigo-300 hover:text-white underline cursor-pointer font-medium"
              >
                Buka Semua
              </button>
              <span className="text-indigo-400">•</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="text-xs text-indigo-300 hover:text-white underline cursor-pointer font-medium"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
            {QUESTIONS_DATA.map((q) => {
              const isOpen = !!openItems[q.no];
              return (
                <button
                  key={q.no}
                  onClick={() => {
                    setOpenItems((prev) => ({ ...prev, [q.no]: true }));
                    const el = document.getElementById(`soal-pembahasan-${q.no}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all text-center border ${
                    isOpen
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                  title={`Soal ${q.no}: ${q.indikator}`}
                >
                  {q.no}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Domain:</span>
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="Semua">Semua Domain (4 Domain)</option>
            <option value="Bilangan">1. Bilangan (5 Soal)</option>
            <option value="Aljabar">2. Aljabar (10 Soal)</option>
            <option value="Geometri dan Pengukuran">3. Geometri & Pengukuran (9 Soal)</option>
            <option value="Data dan Peluang">4. Data & Peluang (6 Soal)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold ml-1">
            <span>Bentuk:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="Semua">Semua Bentuk (30 Soal)</option>
            <option value="pg">Pilihan Ganda (PG)</option>
            <option value="mcma">Pilihan Ganda Kompleks MCMA</option>
            <option value="pgk">Pilihan Ganda Kompleks Benar/Salah</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor / kata kunci..."
            className="w-full px-3.5 py-1.5 pl-9 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Questions and Detailed Solutions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Tidak ada soal yang cocok dengan filter atau kata kunci.</p>
            <p className="text-xs mt-1">Coba atur ulang filter domain atau bersihkan kolom pencarian.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isOpen = openItems[q.no] ?? false;

            return (
              <div
                id={`soal-pembahasan-${q.no}`}
                key={q.no}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all scroll-mt-20"
              >
                {/* Header Bar */}
                <button
                  type="button"
                  onClick={() => handleToggleItem(q.no)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {q.no}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                          {q.element}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          {q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'mcma' ? 'MCMA' : 'PGK (B/S)'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {q.level}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                        {q.stimulusTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Indikator: {q.indikator}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Kunci Resmi</span>
                      <span className="text-xs font-mono font-black text-emerald-700">
                        {q.type === 'pg' && `Opsi [${q.correctKey}]`}
                        {q.type === 'mcma' && `Multi-Opsi (${q.mcmaOptions?.filter((o) => o.isCorrect).map((o) => o.id).join(', ')})`}
                        {q.type === 'pgk' && 'Tabel B/S'}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/50 space-y-6">
                    {/* Stimulus Section */}
                    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                          Stimulus Soal No {q.no}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Konteks Lokal Barito Kuala
                        </span>
                      </div>

                      <h5 className="text-xs sm:text-sm font-black text-slate-900">
                        {q.stimulusTitle}
                      </h5>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {q.stimulusText}
                      </p>

                      {/* Chart or Diagram if any */}
                      {q.stimulusChartType && (
                        <div className="pt-2">
                          <DiagramRenderer
                            type={q.stimulusChartType}
                            data={q.stimulusChartData}
                          />
                        </div>
                      )}
                    </div>

                    {/* Question and Official Key */}
                    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Pertanyaan / Butir Soal:
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>

                      {/* Options rendering */}
                      {q.type === 'pg' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {q.options.map((opt) => {
                            const isKey = opt.id === q.correctKey;
                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                                  isKey
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                    isKey
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                                {isKey && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase">
                                    Kunci
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'mcma' && q.mcmaOptions && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold text-slate-500">Pilihan Opsi (Jawaban Benar Ditandai):</span>
                          {q.mcmaOptions.map((opt) => {
                            const isKey = opt.isCorrect;
                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                                  isKey
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                      isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {isKey ? '✓' : '•'}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>
                                {isKey && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase shrink-0">
                                    Kunci Benar
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'pgk' && q.pgkStatements && (
                        <div className="pt-2 overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="px-3 py-2 rounded-l-lg">Pernyataan Analisis</th>
                                <th className="px-3 py-2 text-center w-28 rounded-r-lg">Kunci Resmi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {q.pgkStatements.map((st) => (
                                <tr key={st.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2.5 text-slate-800">{st.text}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${
                                        st.correct === 'Benar'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {st.correct.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Pembahasan & Langkah Penyelesaian */}
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/70 to-slate-50 rounded-xl border border-indigo-200 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 border-b border-indigo-200/80 pb-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                          Uraian & Pembahasan Langkah Matematika
                        </h5>
                      </div>

                      {/* Concept */}
                      {q.explanation?.concept && (
                        <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs text-indigo-950">
                          <span className="font-bold text-indigo-800 block mb-0.5 text-[11px] uppercase tracking-wider">
                            Konsep Dasar / Rumus Inti:
                          </span>
                          <p className="leading-relaxed font-medium">
                            {q.explanation.concept}
                          </p>
                        </div>
                      )}

                      {/* Steps */}
                      {q.explanation?.steps && q.explanation.steps.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            Langkah Penyelesaian Sistematis:
                          </span>
                          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed font-mono">
                            {q.explanation.steps.map((st, i) => (
                              <li key={i} className="pl-1 text-slate-700">
                                <span className="font-sans text-slate-800">{st}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Conclusion */}
                      {q.explanation?.conclusion && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold uppercase text-[10px] text-emerald-800 block">
                              Kesimpulan Jawaban Resmi:
                            </span>
                            <p className="font-bold">{q.explanation.conclusion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Change Password */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Ubah Sandi Pengembang</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kata Sandi Baru:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {passChangedNotice && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sandi pengembang berhasil diperbarui!</span>
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
