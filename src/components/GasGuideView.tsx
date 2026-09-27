import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Table,
  Terminal,
  Database,
  Layers,
  Sparkles,
  Link,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getGasUrl, setGasUrl } from '../services/storage';
import { DAFTAR_SMP_BARITO_KUALA } from '../data/schools';
import { QUESTIONS_DATA } from '../data/questions';
import { CODE_GS } from '../data/gasCode';

export const GasGuideView: React.FC = () => {
  const [gasUrlInput, setGasUrlInput] = useState(getGasUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSaveGasUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGasUrl(gasUrlInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate Bank Soal CSV string (12 Kolom Resmi)
  const soalCsv = [
    'No,Jenis,Stimulus,Soal,Opsi A,Opsi B,Opsi C,Opsi D,Kunci,Skor,Materi,Level',
    ...QUESTIONS_DATA.map((q) => {
      let opsiA = '', opsiB = '', opsiC = '', opsiD = '';
      if (q.options) {
        opsiA = q.options.find((o) => o.id === 'A')?.text || '';
        opsiB = q.options.find((o) => o.id === 'B')?.text || '';
        opsiC = q.options.find((o) => o.id === 'C')?.text || '';
        opsiD = q.options.find((o) => o.id === 'D')?.text || '';
      } else if (q.mcmaOptions) {
        opsiA = q.mcmaOptions.find((o) => o.id === 'A')?.text || '';
        opsiB = q.mcmaOptions.find((o) => o.id === 'B')?.text || '';
        opsiC = q.mcmaOptions.find((o) => o.id === 'C')?.text || '';
        opsiD = q.mcmaOptions.find((o) => o.id === 'D')?.text || '';
      } else if (q.pgkStatements) {
        opsiA = 'P1: ' + (q.pgkStatements[0]?.text || '');
        opsiB = 'P2: ' + (q.pgkStatements[1]?.text || '');
        opsiC = 'P3: ' + (q.pgkStatements[2]?.text || '');
        opsiD = q.pgkStatements[3] ? 'P4: ' + q.pgkStatements[3].text : '';
      }

      let kunci = q.correctKey || '';
      if (q.type === 'mcma' && q.mcmaOptions) {
        kunci = q.mcmaOptions.filter((o) => o.isCorrect).map((o) => o.id).join(', ');
      } else if (q.type === 'pgk' && q.pgkStatements) {
        kunci = q.pgkStatements.map((s, idx) => (idx + 1) + ':' + s.correct).join('; ');
      }

      const stimulus = ((q.stimulusTitle ? q.stimulusTitle + ' - ' : '') + (q.stimulusText || ''))
        .replace(/"/g, '""')
        .replace(/\r?\n/g, ' ');
      const soal = (q.questionText || '').replace(/"/g, '""').replace(/\r?\n/g, ' ');

      return [
        q.no,
        q.type.toUpperCase(),
        `"${stimulus}"`,
        `"${soal}"`,
        `"${opsiA.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${opsiB.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${opsiC.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${opsiD.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${kunci}"`,
        q.scoreWeight,
        `"${q.element + (q.subelement ? ' - ' + q.subelement : '')}"`,
        `"${q.level}"`,
      ].join(',');
    }),
  ].join('\n');

  // Code.gs snippet loaded from verified backend code
  const codeGsSnippet = CODE_GS;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-700 to-amber-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
          Panduan Integrasi Google Spreadsheet & Apps Script
        </span>
        <h2 className="text-xl sm:text-2xl font-black mt-2">
          ARSITEKTUR GOOGLE SPREADSHEET + APPS SCRIPT
        </h2>
        <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-2xl">
          Dokumentasi lengkap struktur database 5 sheet resmi, kode backend <code className="font-mono bg-black/20 px-1.5 py-0.5 rounded">Code.gs</code>, mekanisme autosave upsert, dan langkah deployment Web App.
        </p>
      </div>

      {/* Live Web App URL Connector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Link className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Hubungkan Aplikasi Ini Langsung ke Google Spreadsheet Anda
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Jika Anda telah men-deploy kode Google Apps Script di bawah menjadi Web App, masukkan URL Web App Anda ke kolom di bawah. Setiap kali siswa menjawab soal di aplikasi ini, jawaban dan nilai akhir akan langsung tersimpan secara live ke Google Spreadsheet Anda!
        </p>

        <form onSubmit={handleSaveGasUrl} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={gasUrlInput}
            onChange={(e) => setGasUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            Simpan URL Web App
          </button>
        </form>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>URL Web App berhasil disimpan! CBT sekarang otomatis menyinkronkan data ke Spreadsheet Anda.</span>
          </div>
        )}
      </div>

      {/* Section 1: Struktur Spreadsheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Struktur Tabel Google Spreadsheet (5 Sheet Resmi)
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Sheet 1 */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-900 text-xs">
                SHEET 1: PESERTA (Merekam sesi siswa saat login & status ujian)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-semibold">
                8 Kolom Resmi
              </span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-emerald-300 text-slate-800 overflow-x-auto whitespace-nowrap">
              ID Peserta | Timestamp | Nama Peserta | Asal Sekolah | Status | Waktu Mulai | Waktu Selesai | Nilai
            </div>
            <p className="text-[11px] text-emerald-800 mt-1.5">
              *Terekam saat siswa memasukkan nama & sekolah di halaman Login. Status diperbarui menjadi &quot;Selesai&quot; dan Nilai terisi otomatis saat mengumpulkan ujian.
            </p>
          </div>

          {/* Sheet 2 */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-900 text-xs">
                SHEET 2: JAWABAN (Autosave real-time per nomor soal dengan mekanisme UPSERT)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-semibold">
                8 Kolom Resmi
              </span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-indigo-300 text-slate-800 overflow-x-auto whitespace-nowrap">
              ID Peserta | Nama Peserta | Asal Sekolah | No Soal | Jawaban Siswa | Status Kunci | Skor | Timestamp
            </div>
            <p className="text-[11px] text-indigo-800 mt-1.5">
              *Mekanisme UPSERT: Jika siswa mengubah jawaban (misal B menjadi C), sistem memperbarui baris jawaban yang ada tanpa membuat duplikasi baris. Kunci dan skor terverifikasi otomatis.
            </p>
          </div>

          {/* Sheet 3 */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-900 text-xs">
                SHEET 3: HASIL (Rekap nilai akhir siswa hasil koreksi CBT & Server)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-semibold">
                10 Kolom Resmi
              </span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-amber-300 text-slate-800 overflow-x-auto whitespace-nowrap">
              ID Peserta | Nama Peserta | Asal Sekolah | Benar | Salah | Kosong | Nilai | Kategori Capaian | Waktu Mulai | Waktu Selesai
            </div>
            <p className="text-[11px] text-amber-800 mt-1.5">
              *Otomatis terisi saat siswa mengumpulkan ujian atau waktu 90 menit habis. Menyimpan jumlah benar, salah, kosong, nilai skala 0-100, dan predikat kategori capaian (Mahir / Cakap / Dasar / Perlu Intervensi Khusus).
            </p>
          </div>

          {/* Sheet 4 */}
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-purple-900 text-xs">
                SHEET 4: SOAL (Bank Soal 30 Butir Resmi Asesmen TKA 2026 - Terisi Otomatis)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-semibold">
                12 Kolom • 30 Soal Terisi Otomatis
              </span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-purple-300 text-slate-800 overflow-x-auto whitespace-nowrap">
              No | Jenis | Stimulus | Soal | Opsi A | Opsi B | Opsi C | Opsi D | Kunci | Skor | Materi | Level
            </div>
            <p className="text-[11px] text-purple-800 mt-1.5">
              *Saat fungsi <code className="bg-purple-100 px-1 py-0.5 rounded">inisialisasiDatabase</code> dijalankan di Apps Script, ke-30 butir soal lengkap beserta stimulus, pilihan/pernyataan, kunci, dan bobot skor otomatis diisi ke sheet ini.
            </p>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => copyToClipboard(soalCsv, 'soal_csv')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'soal_csv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'soal_csv' ? 'Tersalin!' : 'Salin CSV Bank Soal (30 Soal)'}</span>
              </button>
            </div>
          </div>

          {/* Sheet 5 */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-teal-900 text-xs">
                SHEET 5: SEKOLAH (Daftar Resmi 62 SMP se-Kabupaten Barito Kuala - Terisi Otomatis)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-200 text-teal-800 font-semibold">
                4 Kolom • 62 Sekolah Terisi Otomatis
              </span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-teal-300 text-slate-800 overflow-x-auto whitespace-nowrap">
              No | Nama Sekolah | Kecamatan | Status
            </div>
            <p className="text-[11px] text-teal-800 mt-1.5">
              *Memuat direktori resmi 62 SMP (57 Negeri dan 5 Swasta di 17 Kecamatan) yang langsung terisi saat inisialisasi dan digunakan sebagai sumber opsi sekolah peserta CBT.
            </p>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    ['No,Nama Sekolah,Kecamatan,Status', ...DAFTAR_SMP_BARITO_KUALA.map((s) => `${s.no},"${s.nama}","${s.kecamatan}","${s.status}"`)].join('\n'),
                    'sekolah_csv'
                  )
                }
                className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'sekolah_csv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sekolah_csv' ? 'Tersalin!' : 'Salin CSV 62 Sekolah'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Kode Lengkap Code.gs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Kode Lengkap Backend (Code.gs)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(codeGsSnippet, 'code_gs')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {copiedKey === 'code_gs' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'code_gs' ? 'Kode Berhasil Disalin!' : 'Salin Seluruh Code.gs'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 border border-slate-800">
            <code>{codeGsSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Section 3: Cara Instalasi Langkah demi Langkah */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            3. Petunjuk Langkah Demi Langkah Pemasangan (Deployment)
          </h3>
        </div>

        <ol className="list-decimal list-inside space-y-3 text-xs text-slate-700 leading-relaxed">
          <li className="pl-1">
            <strong>Membuat Google Spreadsheet Baru:</strong> Buka Google Drive Anda, buat spreadsheet baru dengan nama misalnya: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">CBT_TKA_MATEMATIKA_BATOLA_2026</code>.
          </li>
          <li className="pl-1">
            <strong>Buka Apps Script Editor:</strong> Klik menu <em>Extensions (Ekstensi)</em> → <em>Apps Script</em>.
          </li>
          <li className="pl-1">
            <strong>Menempelkan Kode:</strong> Pada editor <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Code.gs</code>, hapus semua kode bawaan lalu tempelkan seluruh kode <strong>Code.gs</strong> di atas.
          </li>
          <li className="pl-1">
            <strong>Jalankan Fungsi Inisialisasi:</strong> Pilih fungsi <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">inisialisasiDatabase</code> pada dropdown toolbar di atas, lalu klik <strong>Run (Jalankan)</strong>. Berikan izin otorisasi Google jika diminta. Sheet akan otomatis membuat ke-5 Sheet lengkap dengan header warna, freeze baris 1, 30 butir soal lengkap Asesmen Matematika 2026, dan 62 nama SMP Barito Kuala!
          </li>
          <li className="pl-1">
            <strong>Deploy sebagai Web App:</strong>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-600">
              <li>Klik tombol biru <strong>Deploy</strong> di pojok kanan atas → pilih <strong>New deployment</strong>.</li>
              <li>Pilih jenis <strong>Web app</strong> (ikon roda gigi).</li>
              <li>Isi Description: <code className="font-mono bg-slate-100 px-1 rounded">CBT Try Out Barito Kuala 2026</code>.</li>
              <li>Atur <strong>Execute as</strong>: <code className="font-mono font-bold text-slate-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">Me (email Anda)</code>.</li>
              <li>Atur <strong>Who has access</strong>: <code className="font-mono font-bold text-slate-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">Anyone (Siapa saja)</code>.</li>
            </ul>
          </li>
          <li className="pl-1">
            <strong>Dapatkan URL Web App:</strong> Salin URL Web App yang dihasilkan (<code className="font-mono text-slate-800">https://script.google.com/macros/s/.../exec</code>).
          </li>
          <li className="pl-1">
            <strong>Sambungkan & Uji Coba:</strong> Masukkan URL tersebut pada form di bagian atas halaman ini untuk menyinkronkan CBT secara langsung dengan Google Spreadsheet Anda!
          </li>
        </ol>
      </div>

      {/* Troubleshooting Section: Solusi Error doGet parameter */}
      <div className="bg-amber-50/90 rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
          <AlertCircle className="w-5 h-5 text-amber-700" />
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
            Solusi Error: &quot;TypeError: Cannot read properties of undefined (reading &apos;parameter&apos;) at doGet&quot;
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>Penyebab Error:</strong><br />
            Error ini muncul ketika Anda mengklik tombol <strong>&quot;Jalankan&quot; (Run)</strong> pada fungsi <code>doGet</code> atau <code>doPost</code> di dalam editor Google Apps Script. Di Apps Script, tombol &quot;Run&quot; memanggil fungsi tanpa menyertakan objek event <code>e</code> dari browser (sehingga <code>e</code> bernilai <code>undefined</code>).
          </p>

          <div className="bg-white p-4 rounded-xl border border-amber-300 space-y-2.5">
            <p className="font-bold text-slate-900">Solusi & Tindakan:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              <li>
                <strong>Salin Ulang Kode Code.gs Terbaru di Atas:</strong> Kode sudah diperbarui dengan proteksi pengaman:
                <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto">
                  if (!e) &#123; e = &#123; parameter: &#123;&#125; &#125;; &#125;
                </code>
                Dengan proteksi ini, script tidak akan crash lagi jika fungsi <code>doGet</code> terpanggil tanpa event parameter.
              </li>
              <li>
                <strong>Fungsi yang Benar untuk Dijalankan di Editor:</strong>
                <div className="mt-1 pl-2">
                  Pada dropdown fungsi di sebelah tombol &quot;Jalankan&quot;, pilih fungsi <code className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">inisialisasiDatabase</code>, lalu klik <strong>Jalankan (Run)</strong>. Fungsi inilah yang bertugas membuat ke-5 Sheet database secara otomatis dan mengisi 30 soal serta 62 sekolah.
                </div>
              </li>
              <li>
                <strong>Fungsi doGet & doPost Tidak Perlu Diklik &quot;Jalankan&quot;:</strong>
                <div className="mt-1 pl-2">
                  Fungsi <code>doGet</code> dan <code>doPost</code> akan otomatis dipanggil oleh Google ketika browser atau aplikasi CBT mengirim data ujian ke URL Web App.
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
