import React, { useState } from 'react';
import { User, School, ArrowRight, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';
import { DAFTAR_SMP_BARITO_KUALA } from '../data/schools';
import { generateParticipantId, saveSession, getGasUrl } from '../services/storage';
import { StudentSession } from '../types';

interface LoginViewProps {
  onLoginSuccess: (session: StudentSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [nama, setNama] = useState('');
  const [asalSekolah, setAsalSekolah] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rule 3: Bersihkan spasi berlebih
    const cleanNama = nama.trim().replace(/\s+/g, ' ');

    // Rule 1: Nama tidak boleh kosong
    if (!cleanNama) {
      setError('Nama siswa tidak boleh kosong. Silakan masukkan nama lengkap Anda.');
      return;
    }

    if (cleanNama.length < 3) {
      setError('Nama siswa minimal terdiri dari 3 karakter.');
      return;
    }

    // Rule 2: Asal sekolah wajib dipilih dari daftar
    if (!asalSekolah) {
      setError('Asal sekolah wajib dipilih dari daftar SMP se-Kabupaten Barito Kuala.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Rule 5: Hasilkan ID peserta unik
      const idPeserta = generateParticipantId();
      const now = new Date();
      const waktuLogin = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const newSession: StudentSession = {
        idPeserta,
        nama: cleanNama,
        asalSekolah,
        waktuLogin,
        status: 'Login',
      };

      // Rule 4: Simpan ke local storage
      saveSession(newSession);

      // Attempt background push to Google Apps Script if URL is configured
      const gasUrl = getGasUrl();
      if (gasUrl) {
        try {
          fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'loginPeserta',
              idPeserta,
              nama: cleanNama,
              asalSekolah,
              waktuLogin,
            }),
          }).catch((err) => console.log('GAS background sync note:', err));
        } catch (e) {
          console.warn(e);
        }
      }

      onLoginSuccess(newSession);
    } catch (err: any) {
      setError('Terjadi kendala saat memproses login. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top visual banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 p-7 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-sm mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Sistem CBT Terverifikasi
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              LOGIN PESERTA
            </h2>
            <p className="text-emerald-100 text-xs mt-1.5 max-w-sm mx-auto">
              Latihan Try Out TKA Matematika SMP Tingkat Kabupaten Barito Kuala Tahun 2026
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Username / Nama Siswa */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Nama Lengkap Siswa (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                autoComplete="name"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Tuliskan nama lengkap Anda tanpa disingkat agar sertifikat/hasil tercatat akurat.
            </p>
          </div>

          {/* 2. Asal Sekolah Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Asal Sekolah
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <School className="w-5 h-5" />
              </div>
              <select
                value={asalSekolah}
                onChange={(e) => setAsalSekolah(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
                required
              >
                <option value="">-- Pilih Asal Sekolah --</option>
                {DAFTAR_SMP_BARITO_KUALA.map((school) => (
                  <option key={school.no} value={school.nama}>
                    {school.no}. {school.nama} ({school.kecamatan})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500">
              Pilihan mencakup seluruh 62 SMP Negeri & Swasta se-Kabupaten Barito Kuala.
            </p>
          </div>

          {/* Quick Notice Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Tanpa Password & Tanpa Akun:</span> Anda langsung diberikan ID Sesi Ujian resmi saat menekan tombol mulai di bawah.
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transform active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Menyiapkan Lembar Soal...</span>
            ) : (
              <>
                <span>MULAI TRY OUT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 text-center text-[11px] text-slate-500">
          MKKS SMP Kabupaten Barito Kuala • TKA Matematika Tahun 2026
        </div>
      </div>
    </div>
  );
};
