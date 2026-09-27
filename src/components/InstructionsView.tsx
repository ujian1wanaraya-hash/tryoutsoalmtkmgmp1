import React from 'react';
import { Play, Clock, FileText, CheckCircle2, ShieldAlert, Award, User, School, Sparkles } from 'lucide-react';
import { StudentSession } from '../types';
import { CONFIG } from '../data/config';

interface InstructionsViewProps {
  session: StudentSession;
  onStartExam: () => void;
  onBackToLogin: () => void;
}

export const InstructionsView: React.FC<InstructionsViewProps> = ({
  session,
  onStartExam,
  onBackToLogin,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                Petunjuk Pelaksanaan Ujian
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2 leading-tight">
                LATIHAN TRY OUT MATEMATIKA SMP
              </h2>
              <p className="text-indigo-200 text-sm font-semibold">
                SE-KABUPATEN BARITO KUALA TAHUN 2026
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 self-start sm:self-auto">
              <span className="text-[11px] text-slate-300 block uppercase font-mono tracking-wider">ID Peserta Resmi</span>
              <span className="text-base font-extrabold text-amber-300 font-mono tracking-wider">{session.idPeserta}</span>
            </div>
          </div>
        </div>

        {/* Identity & Exam Specs Card */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Nama Siswa</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate">{session.nama}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <School className="w-4 h-4 text-indigo-600" />
                <span>Asal Sekolah</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate" title={session.asalSekolah}>
                {session.asalSekolah}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Jumlah Soal</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">{CONFIG.JUMLAH_SOAL} Soal Numerasi</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Durasi Ujian</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">{CONFIG.DURASI_MENIT} Menit</p>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-b from-white to-slate-50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Petunjuk Teknis Pengerjaan Try Out
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">1</span>
                  <div>
                    <span className="font-semibold text-slate-900">Bentuk Soal Asesmen TKA 2026:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                      <li><strong>Pilihan Ganda (19 soal):</strong> Memilih 1 opsi jawaban yang paling tepat.</li>
                      <li><strong>Pilihan Ganda Kompleks (4 soal):</strong> Memilih lebih dari satu pernyataan benar.</li>
                      <li><strong>Pilihan Ganda Kategorik (7 soal):</strong> Menentukan Benar atau Salah pada setiap pernyataan.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">2</span>
                  <div>
                    <span className="font-semibold text-slate-900">Penyimpanan Jawaban Otomatis (Autosave):</span>
                    <p className="mt-0.5 text-slate-600">
                      Setiap kali Anda mengklik opsi jawaban, sistem secara otomatis merekam jawaban Anda ke server database Google Spreadsheet dan memori browser Anda. Anda bebas berpindah nomor soal kapan saja tanpa takut jawaban hilang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">3</span>
                  <div>
                    <span className="font-semibold text-slate-900">Navigasi dan Kode Warna Soal:</span>
                    <ul className="mt-1 space-y-1 text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-slate-300 inline-block border border-slate-400" />
                        <span><strong>Abu-abu:</strong> Soal belum dijawab.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block text-white" />
                        <span><strong>Hijau:</strong> Soal sudah dijawab.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block text-slate-900" />
                        <span><strong>Kuning:</strong> Ditandai untuk ditinjau ulang (Ragu-ragu).</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">4</span>
                  <div>
                    <span className="font-semibold text-slate-900">Waktu & Pengakhiran Ujian:</span>
                    <p className="mt-0.5 text-slate-600">
                      Timer berjalan mundur selama {CONFIG.DURASI_MENIT} menit. Jika waktu habis, sistem akan secara otomatis mengumpulkan jawaban terakhir Anda dan menampilkan laporan hasil perolehan nilai (kunci dan pembahasan terproteksi sandi pengawas/pengembang).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              ← Koreksi Identitas Siswa
            </button>

            <button
              type="button"
              onClick={onStartExam}
              className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2.5 transform active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>MULAI MENGERJAKAN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
