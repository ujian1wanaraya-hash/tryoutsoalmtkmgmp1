import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Printer,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  School,
  User,
  Sparkles,
  BarChart2,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Table,
  RefreshCw,
  AlertCircle,
  Database,
  Save,
  Link2
} from 'lucide-react';
import { ExamResult } from '../types';
import { QUESTIONS_DATA } from '../data/questions';
import { DiagramRenderer, OptionNumberLine, OptionMiniBarChart } from './DiagramRenderer';
import { isDevAuthenticated, loginDev, logoutDev, subscribeDevAuth } from '../services/devAuth';
import { getGasUrl, setGasUrl, syncFinalScoreToGAS } from '../services/storage';

interface ResultViewProps {
  result: ExamResult;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const [showPembahasan, setShowPembahasan] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [isDev, setIsDev] = useState<boolean>(() => isDevAuthenticated());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Google Spreadsheet connection states
  const [gasUrl, setGasUrlState] = useState<string>(() => getGasUrl());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local_only' | 'error'>(() => {
    if (result.syncedToSpreadsheet) return 'synced';
    const url = getGasUrl();
    return url ? 'syncing' : 'local_only';
  });
  const [syncMessage, setSyncMessage] = useState<string>(() => {
    if (result.syncedToSpreadsheet) {
      return `Nilai akhir (${result.nilai}) telah tersimpan di Google Spreadsheet (Sheet HASIL & PESERTA).`;
    }
    const url = getGasUrl();
    return url ? 'Menghubungkan nilai ke Spreadsheet...' : 'URL Spreadsheet belum diatur. Nilai tersimpan aman di penyimpanan lokal.';
  });
  const [syncTime, setSyncTime] = useState<string>(result.spreadsheetSyncTime || '');
  const [isUrlEditing, setIsUrlEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to Spreadsheet on mount if URL exists and not synced
  useEffect(() => {
    const currentUrl = getGasUrl();
    if (currentUrl && !result.syncedToSpreadsheet) {
      handleSyncToGAS(currentUrl);
    }
  }, [result]);

  const handleSyncToGAS = async (customUrl?: string) => {
    const targetUrl = customUrl !== undefined ? customUrl : getGasUrl();
    if (!targetUrl || targetUrl.trim() === '') {
      setSyncStatus('local_only');
      setSyncMessage('URL Spreadsheet belum disetel. Nilai tetap aman di penyimpanan lokal.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Menghubungkan nilai akhir ke database Google Spreadsheet...');

    try {
      const sessionData = {
        idPeserta: result.idPeserta,
        nama: result.nama,
        asalSekolah: result.asalSekolah,
        waktuLogin: result.waktuMulai,
        waktuMulai: result.waktuMulai,
        waktuSelesai: result.waktuSelesai,
        status: 'Selesai' as const,
      };

      const res = await syncFinalScoreToGAS(sessionData, result);
      setSyncStatus(res.status);
      setSyncMessage(res.message);
      if (res.timestamp) setSyncTime(res.timestamp);
    } catch (e: any) {
      setSyncStatus('error');
      setSyncMessage('Gagal menghubungi Spreadsheet. Nilai tetap aman di penyimpanan browser.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveUrlAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setGasUrl(urlInput.trim());
    setGasUrlState(urlInput.trim());
    setIsUrlEditing(false);
    await handleSyncToGAS(urlInput.trim());
  };

  useEffect(() => {
    const unsub = subscribeDevAuth((auth) => {
      setIsDev(auth);
      if (!auth) {
        setShowPembahasan(false);
      }
    });
    return unsub;
  }, []);

  const handlePembahasanClick = () => {
    if (isDev) {
      setShowPembahasan(!showPembahasan);
    } else {
      setShowPasswordModal(true);
      setPasswordError('');
      setPasswordInput('');
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Silakan masukkan kata sandi pengembang');
      return;
    }

    const success = loginDev(passwordInput);
    if (success) {
      setIsDev(true);
      setShowPembahasan(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Kata sandi salah. Hanya pengembang/pengawas yang diizinkan mengakses.');
    }
  };

  const handleLockAgain = () => {
    logoutDev();
    setIsDev(false);
    setShowPembahasan(false);
  };

  const toggleAccordion = (num: number) => {
    setActiveAccordion(activeAccordion === num ? null : num);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Result Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-300" />
              Hasil Resmi Try Out TKA 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              HASIL TRY OUT MATEMATIKA SMP
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200">
              SE-KABUPATEN BARITO KUALA TAHUN 2026
            </p>
          </div>
        </div>

        {/* Identity & Main Score Card */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Identity Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Nama Siswa</span>
                <span className="font-extrabold text-slate-900 text-sm">{result.nama}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Asal Sekolah</span>
                <span className="font-extrabold text-slate-900 text-sm truncate block" title={result.asalSekolah}>
                  {result.asalSekolah}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Waktu Selesai</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {result.waktuSelesai || 'Tersimpan'} ({result.idPeserta})
                </span>
              </div>
            </div>
          </div>

          {/* Status Koneksi Nilai Akhir ke Google Spreadsheet */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            syncStatus === 'synced'
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/30 border-emerald-300 shadow-sm'
              : syncStatus === 'syncing'
              ? 'bg-gradient-to-r from-amber-50 to-indigo-50 border-amber-300 animate-pulse'
              : syncStatus === 'error'
              ? 'bg-rose-50 border-rose-300'
              : 'bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 border-sky-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-600 text-white'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-500 text-white'
                    : syncStatus === 'error'
                    ? 'bg-rose-600 text-white'
                    : 'bg-sky-600 text-white'
                }`}>
                  {syncStatus === 'synced' && <CheckCircle2 className="w-5 h-5" />}
                  {syncStatus === 'syncing' && <RefreshCw className="w-5 h-5 animate-spin" />}
                  {syncStatus === 'error' && <AlertCircle className="w-5 h-5" />}
                  {syncStatus === 'local_only' && <Database className="w-5 h-5" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Koneksi Nilai Akhir ke Google Spreadsheet
                    </span>
                    {syncStatus === 'synced' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        🟢 Terhubung & Tersimpan
                      </span>
                    )}
                    {syncStatus === 'syncing' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        🟡 Mengirim Data...
                      </span>
                    )}
                    {syncStatus === 'error' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        🔴 Gagal Terkoneksi
                      </span>
                    )}
                    {syncStatus === 'local_only' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        ℹ️ Tersimpan di Browser Lokal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {syncMessage}
                  </p>
                  {syncTime && syncStatus === 'synced' && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      ✓ Waktu Sinkronisasi: {syncTime} WITA • Target Sheet: <b>HASIL</b> & <b>PESERTA</b>
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {syncStatus !== 'syncing' && (
                  <button
                    type="button"
                    onClick={() => handleSyncToGAS()}
                    disabled={isSyncing}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 shadow-sm text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Kirim ulang nilai ke Google Spreadsheet"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                    <span>{syncStatus === 'synced' ? 'Kirim Ulang ke Sheet' : 'Hubungkan Sekarang'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsUrlEditing(!isUrlEditing)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{gasUrl ? 'Ganti URL' : 'Atur URL'}</span>
                </button>
              </div>
            </div>

            {/* Expandable URL Config Form */}
            {(isUrlEditing || syncStatus === 'local_only') && (
              <form onSubmit={handleSaveUrlAndSync} className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Tempel URL Web App Google Apps Script (https://script.google.com/macros/s/.../exec)"
                      className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Database className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSyncing || !urlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan & Sinkronkan Nilai</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Script web app menerima data nilai akhir try out dan menuliskannya langsung ke Spreadsheet pada sheet <b>HASIL</b> dan <b>PESERTA</b>.
                </p>
              </form>
            )}
          </div>

          {/* Big Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
            {/* Main Score Banner */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                NILAI AKHIR TRY OUT
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mb-2">
                {result.nilai}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Kategori: {result.kategoriCapaian}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-3">
                Skor: {result.skorPerolehan} dari {result.skorMaksimal} poin
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
                  <span>Jawaban Benar</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black text-emerald-800 font-mono mt-2">
                  {result.jumlahBenar}
                </div>
                <span className="text-[10px] text-emerald-600">dari 30 soal</span>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase">
                  <span>Jawaban Salah</span>
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black text-rose-800 font-mono mt-2">
                  {result.jumlahSalah}
                </div>
                <span className="text-[10px] text-rose-600">soal perlu evaluasi</span>
              </div>

              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase">
                  <span>Tidak Dijawab</span>
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black text-slate-800 font-mono mt-2">
                  {result.jumlahKosong}
                </div>
                <span className="text-[10px] text-slate-500">soal terlewat</span>
              </div>

              {/* Formula details */}
              <div className="col-span-2 sm:col-span-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <span>Rumus Penilaian Resmi:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300">
                  Nilai = (Skor Perolehan ÷ Skor Maksimal) × 100
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown per Domain Elements */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>Capaian Berdasarkan Domain Materi TKA 2026</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {Object.entries(result.breakdownPerElement).map(([elemen, data]) => {
                const pct = data.skorMaksimal > 0 ? Math.round((data.skorPerolehan / data.skorMaksimal) * 100) : 0;
                return (
                  <div key={elemen} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 truncate" title={elemen}>
                        {elemen}
                      </span>
                      <span className="font-mono font-extrabold text-emerald-700">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Benar: {data.benar}/{data.total} soal</span>
                      <span>Skor: {data.skorPerolehan}/{data.skorMaksimal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Hasil</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePembahasanClick}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                showPembahasan
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : isDev
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-purple-700 hover:bg-purple-600 text-white shadow-purple-900/30'
              }`}
            >
              {isDev ? (
                showPembahasan ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Sembunyikan Pembahasan</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Buka Pembahasan (Mode Pengembang)</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Lihat Pembahasan (Terproteksi Sandi)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Password Verification Modal for Pembahasan */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mx-auto mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300">
                Terproteksi Sandi Pengembang
              </span>
              <h3 className="text-lg font-black mt-2">Buka Kunci Pembahasan Soal</h3>
              <p className="text-xs text-indigo-200 mt-1 max-w-xs mx-auto">
                Kunci & pembahasan soal sengaja disembunyikan untuk menjaga objektivitas try out. Hanya pengembang/pengawas yang memiliki akses.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="p-6 space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 block">
                  Kata Sandi Pengembang:
                </label>
                <div className="relative">
                  <input
                    type={showPassText ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Masukkan sandi..."
                    autoFocus
                    className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal / Sembunyikan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Buka Kunci</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Step-by-Step Solutions Section (Accordion) */}
      {showPembahasan && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Akses Pengembang Terbuka
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                  30 Butir Soal
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Pembahasan Menyeluruh 30 Butir Soal Try Out
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Disusun lengkap dengan konsep dasar matematika, langkah per langkah pengerjaan, dan analisis opsi jawaban.
              </p>
            </div>

            {/* Quick Lock & Hide Button */}
            <button
              type="button"
              onClick={handleLockAgain}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-all cursor-pointer shrink-0"
              title="Kunci kembali agar siswa tidak dapat melihat kunci jawaban"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sembunyikan & Kunci Kembali</span>
            </button>
          </div>

          <div className="space-y-3">
            {QUESTIONS_DATA.map((q) => {
              const isOpen = activeAccordion === q.no;
              return (
                <div
                  key={q.no}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(q.no)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {q.no}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">
                          {q.stimulusTitle || q.indikator}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{q.element}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            {q.type === 'pg' && `Kunci: [${q.correctKey}]`}
                            {q.type === 'mcma' && 'Kunci: Multi-Opsi'}
                            {q.type === 'pgk' && 'Kunci: Benar / Salah'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {isOpen && (
                    <div className="p-5 bg-white border-t border-slate-200 space-y-4 text-xs leading-relaxed">
                      {/* Stimulus recap */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                        <span className="font-bold text-slate-800 block mb-1">Konteks Stimulus:</span>
                        <p className="whitespace-pre-line text-[11px]">{q.stimulusText}</p>
                        {q.stimulusChartType && (
                          <div className="max-w-md mx-auto my-2">
                            <DiagramRenderer type={q.stimulusChartType} data={q.stimulusChartData} />
                          </div>
                        )}
                      </div>

                      {/* Question */}
                      <div>
                        <span className="font-bold text-slate-900 block mb-1">Pertanyaan:</span>
                        <p className="text-slate-800">{q.questionText}</p>

                        {/* Options preview */}
                        {q.options && (
                          <div className="mt-2 space-y-2">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border text-xs flex flex-col ${
                                  opt.id === q.correctKey
                                    ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                                    opt.id === q.correctKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {opt.id}
                                  </span>
                                  <span>{opt.text}</span>
                                  {opt.id === q.correctKey && (
                                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">
                                      Kunci Jawaban
                                    </span>
                                  )}
                                </div>
                                {opt.chartType === 'number_line' && opt.chartData && (
                                  <div className="mt-1">
                                    <OptionNumberLine data={opt.chartData} />
                                  </div>
                                )}
                                {opt.chartType === 'bar_mini' && opt.chartData && (
                                  <div className="mt-1">
                                    <OptionMiniBarChart data={opt.chartData} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Concept */}
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                        <span className="font-bold text-indigo-900 block mb-1">Konsep & Teorema:</span>
                        <p className="text-indigo-800">{q.explanation.concept}</p>
                      </div>

                      {/* Step by step */}
                      <div>
                        <span className="font-bold text-slate-900 block mb-1.5">Langkah Penyelesaian:</span>
                        <ol className="list-decimal list-inside space-y-1 text-slate-700">
                          {q.explanation.steps.map((step, idx) => (
                            <li key={idx} className="pl-1">{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Conclusion */}
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold">
                        {q.explanation.conclusion}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
