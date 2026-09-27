import React, { useState, useMemo } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  BookOpen,
  X,
  Database,
  RefreshCw,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { DAFTAR_SMP_BARITO_KUALA } from '../data/schools';
import {
  getAllParticipants,
  getAllResults,
  computeSchoolRecap,
  SchoolRecapItem,
  getGasUrl,
  setGasUrl,
  testGasConnection,
  resyncAllResultsToGAS
} from '../services/storage';
import { StudentSession, ExamResult } from '../types';

export const AdminView: React.FC = () => {
  const [searchName, setSearchName] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'rekap' | 'peserta' | 'grafik'>('rekap');
  const [inspectResult, setInspectResult] = useState<ExamResult | null>(null);

  // Spreadsheet integration states in Admin
  const [gasUrl, setGasUrlState] = useState(() => getGasUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [batchSyncResult, setBatchSyncResult] = useState<string | null>(null);
  const [showGasSettings, setShowGasSettings] = useState(false);
  const [gasInput, setGasInput] = useState(gasUrl);
  const [syncingParticipantId, setSyncingParticipantId] = useState<string | null>(null);

  const participants = useMemo(() => getAllParticipants(), []);
  const results = useMemo(() => getAllResults(), []);
  const schoolRecap = useMemo(() => computeSchoolRecap(), []);

  // Map of results by idPeserta for quick lookup
  const resultMap = useMemo(() => {
    const map = new Map<string, ExamResult>();
    results.forEach((r) => map.set(r.idPeserta, r));
    return map;
  }, [results]);

  // Overall metrics
  const totalPeserta = participants.length;
  const totalSelesai = participants.filter((p) => p.status === 'Selesai').length;
  const totalSedang = participants.filter((p) => p.status === 'Mengerjakan').length;

  const validScores = results.map((r) => r.nilai).filter((n) => typeof n === 'number' && !isNaN(n));
  const avgScore = validScores.length > 0
    ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
    : 0;
  const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

  // Filtered participants list
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchName = !searchName || p.nama.toLowerCase().includes(searchName.toLowerCase());
      const matchSchool = !selectedSchoolFilter || p.asalSekolah === selectedSchoolFilter;
      return matchName && matchSchool;
    });
  }, [participants, searchName, selectedSchoolFilter]);

  // Filtered school recap
  const filteredSchoolRecap = useMemo(() => {
    return schoolRecap.filter((s) => {
      const matchSchool = !selectedSchoolFilter || s.namaSekolah === selectedSchoolFilter;
      return matchSchool;
    });
  }, [schoolRecap, selectedSchoolFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID Peserta', 'Waktu Login', 'Nama Siswa', 'Asal Sekolah', 'Status', 'Waktu Selesai', 'Nilai', 'Benar', 'Salah', 'Kosong'];
    const rows = participants.map((p) => {
      const res = resultMap.get(p.idPeserta);
      return [
        p.idPeserta,
        `"${p.waktuLogin}"`,
        `"${p.nama}"`,
        `"${p.asalSekolah}"`,
        p.status,
        `"${p.waktuSelesai || '-'}"`,
        res ? res.nilai : '-',
        res ? res.jumlahBenar : '-',
        res ? res.jumlahSalah : '-',
        res ? res.jumlahKosong : '-',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_TryOut_TKA_Matematika_Batola_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestConnection = async () => {
    if (!gasUrl) {
      setTestStatus({ success: false, message: 'URL Google Apps Script belum diisi.' });
      return;
    }
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await testGasConnection(gasUrl);
      setTestStatus(res);
    } catch (err: any) {
      setTestStatus({ success: false, message: err.message || 'Gagal menghubungi server Apps Script.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveGasUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGasUrl(gasInput.trim());
    setGasUrlState(gasInput.trim());
    setShowGasSettings(false);
    setTestStatus({ success: true, message: 'URL Web App Google Apps Script berhasil disimpan.' });
  };

  const handleBatchSync = async () => {
    if (!gasUrl) {
      setShowGasSettings(true);
      return;
    }
    setIsBatchSyncing(true);
    setBatchSyncResult(null);
    try {
      const res = await resyncAllResultsToGAS();
      setBatchSyncResult(`Berhasil sinkronisasi ${res.successCount} dari ${res.total} data nilai peserta ke Google Spreadsheet (Sheet HASIL & PESERTA).`);
    } catch (err: any) {
      setBatchSyncResult(`Gagal sinkronisasi batch: ${err.message || 'Network issue'}`);
    } finally {
      setIsBatchSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
            Portal Administrator & Pengawas CBT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
            DASHBOARD HASIL & REKAPITULASI SEKOLAH
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Pemantauan Peserta & Analisis Try Out TKA Matematika SMP se-Kabupaten Barito Kuala 2026
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleBatchSync}
            disabled={isBatchSyncing}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-700/30 flex items-center gap-2 cursor-pointer"
            title="Kirim seluruh nilai siswa lokal ke Google Spreadsheet"
          >
            <RefreshCw className={`w-4 h-4 ${isBatchSyncing ? 'animate-spin' : ''}`} />
            <span>{isBatchSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Spreadsheet'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/30 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Google Spreadsheet Integration Control Card */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Integrasi Google Spreadsheet (Database Nilai CBT)
                </span>
                {gasUrl ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 Web App Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    ⚠️ Belum Terhubung
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-lg">
                {gasUrl || 'URL Web App Apps Script belum dikonfigurasi. Klik "Atur URL" untuk menghubungkan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {gasUrl && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowGasSettings(!showGasSettings)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              {gasUrl ? 'Ubah URL' : 'Atur URL Spreadsheet'}
            </button>
          </div>
        </div>

        {testStatus && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            testStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {testStatus.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{testStatus.message}</span>
          </div>
        )}

        {batchSyncResult && (
          <div className="p-3 rounded-xl text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{batchSyncResult}</span>
          </div>
        )}

        {showGasSettings && (
          <form onSubmit={handleSaveGasUrl} className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={gasInput}
                onChange={(e) => setGasInput(e.target.value)}
                placeholder="Tempel URL Web App: https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan URL</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              URL ini digunakan oleh sistem CBT untuk menyimpan otomatis data peserta, jawaban real-time, dan nilai akhir try out ke Google Spreadsheet (Sheet HASIL & PESERTA).
            </p>
          </form>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
            <span>Total Peserta</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalPeserta}</div>
          <span className="text-[10px] text-slate-500">Siswa terdaftar</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
            <span>Selesai Ujian</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{totalSelesai}</div>
          <span className="text-[10px] text-emerald-600">Nilai sudah keluar</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
            <span>Sedang Ujian</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{totalSedang}</div>
          <span className="text-[10px] text-amber-600">Proses pengerjaan</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
            <span>Rata-Rata Nilai</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono">{avgScore}</div>
          <span className="text-[10px] text-teal-600">Skala 100</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
            <span>Sekolah Terdaftar</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">62</div>
          <span className="text-[10px] text-purple-600">17 Kecamatan</span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          {/* Subtabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rekap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Rekap Per Sekolah (62 SMP)
            </button>

            <button
              onClick={() => setActiveTab('peserta')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'peserta'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daftar Peserta & Nilai
            </button>

            <button
              onClick={() => setActiveTab('grafik')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'grafik'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Grafik & Distribusi
            </button>
          </div>

          {/* Search & School Filter Inputs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Cari nama siswa..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-52"
              />
            </div>

            <select
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-xs cursor-pointer"
            >
              <option value="">-- Semua Sekolah ({DAFTAR_SMP_BARITO_KUALA.length}) --</option>
              {DAFTAR_SMP_BARITO_KUALA.map((s) => (
                <option key={s.no} value={s.nama}>
                  {s.no}. {s.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: REKAP SEKOLAH */}
        {activeTab === 'rekap' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nama Satuan Pendidikan</th>
                  <th className="px-4 py-3">Kecamatan</th>
                  <th className="px-3 py-3 text-center">Jumlah Peserta</th>
                  <th className="px-3 py-3 text-center">Selesai</th>
                  <th className="px-3 py-3 text-center">Sedang Mengerjakan</th>
                  <th className="px-3 py-3 text-center bg-indigo-50 text-indigo-900">Rata-rata Nilai</th>
                  <th className="px-3 py-3 text-center bg-emerald-50 text-emerald-900">Nilai Tertinggi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSchoolRecap.map((item, idx) => (
                  <tr key={item.namaSekolah} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.namaSekolah}</td>
                    <td className="px-4 py-3 text-slate-600">{item.kecamatan}</td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-800">{item.totalPeserta}</td>
                    <td className="px-3 py-3 text-center font-mono text-emerald-700 font-bold">{item.selesai}</td>
                    <td className="px-3 py-3 text-center font-mono text-amber-600 font-bold">{item.sedangMengerjakan}</td>
                    <td className="px-3 py-3 text-center font-mono font-extrabold text-indigo-800 bg-indigo-50/50">
                      {item.rataRataNilai > 0 ? item.rataRataNilai : '-'}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-emerald-800 bg-emerald-50/50">
                      {item.nilaiTertinggi > 0 ? item.nilaiTertinggi : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: DAFTAR PESERTA */}
        {activeTab === 'peserta' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID Peserta</th>
                  <th className="px-4 py-3">Waktu Login</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Asal Sekolah</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center">Nilai</th>
                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ditemukan peserta dengan kata kunci pencarian tersebut.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const res = resultMap.get(p.idPeserta);
                    return (
                      <tr key={p.idPeserta} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.idPeserta}</td>
                        <td className="px-4 py-3 text-slate-500">{p.waktuLogin}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{p.nama}</td>
                        <td className="px-4 py-3 text-slate-600">{p.asalSekolah}</td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Mengerjakan'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-black text-sm text-slate-900">
                          {res ? res.nilai : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {res ? (
                            <button
                              type="button"
                              onClick={() => setInspectResult(res)}
                              className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Belum Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: GRAFIK & DISTRIBUSI */}
        {activeTab === 'grafik' && (
          <div className="space-y-6 pt-2">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Distribusi Kategori Capaian Siswa (Standar Pusmendik/TKA)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Mahir (Nilai ≥ 85)</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {results.filter((r) => r.nilai >= 85).length}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-teal-600 block">Cakap (70 - 84)</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {results.filter((r) => r.nilai >= 70 && r.nilai < 85).length}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Dasar (55 - 69)</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {results.filter((r) => r.nilai >= 55 && r.nilai < 70).length}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">Perlu Intervensi (&lt; 55)</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {results.filter((r) => r.nilai < 55).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                Peringkat Rata-rata Nilai Sekolah Tertinggi
              </h4>

              <div className="space-y-3">
                {schoolRecap
                  .filter((s) => s.rataRataNilai > 0)
                  .sort((a, b) => b.rataRataNilai - a.rataRataNilai)
                  .slice(0, 8)
                  .map((sch, rank) => (
                    <div key={sch.namaSekolah} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">
                          #{rank + 1} {sch.namaSekolah}
                        </span>
                        <span className="font-mono font-extrabold text-indigo-700">
                          {sch.rataRataNilai} ({sch.selesai} peserta)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${sch.rataRataNilai}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Student Result Modal */}
      {inspectResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Rincian Hasil Lembar Ujian Siswa</h3>
              </div>
              <button
                onClick={() => setInspectResult(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ID Peserta:</span>
                <span className="font-mono font-bold text-slate-800">{inspectResult.idPeserta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-slate-800">{inspectResult.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Asal Sekolah:</span>
                <span className="font-semibold text-slate-800">{inspectResult.asalSekolah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Ujian:</span>
                <span className="text-slate-700">{inspectResult.waktuMulai} - {inspectResult.waktuSelesai}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Benar</span>
                <span className="text-xl font-mono font-black text-emerald-800">{inspectResult.jumlahBenar}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Salah</span>
                <span className="text-xl font-mono font-black text-rose-800">{inspectResult.jumlahSalah}</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Kosong</span>
                <span className="text-xl font-mono font-black text-slate-800">{inspectResult.jumlahKosong}</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Nilai</span>
                <span className="text-xl font-mono font-black text-indigo-800">{inspectResult.nilai}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectResult(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
