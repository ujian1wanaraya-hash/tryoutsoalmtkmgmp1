import React, { useState } from 'react';
import { BLUEPRINT_TKA_2026 } from '../data/blueprint';
import { CheckCircle2, Layers, BookOpen, Target, Sparkles } from 'lucide-react';
import { DomainElement } from '../types';

export const BlueprintView: React.FC = () => {
  const [filterElement, setFilterElement] = useState<string>('');

  const elements: DomainElement[] = [
    'Bilangan',
    'Aljabar',
    'Geometri dan Pengukuran',
    'Data dan Peluang',
  ];

  const filtered = filterElement
    ? BLUEPRINT_TKA_2026.filter((b) => b.elemen === filterElement)
    : BLUEPRINT_TKA_2026;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
          Keputusan Resmi No 047/H/AN/2025
        </span>
        <h2 className="text-xl sm:text-2xl font-black mt-2">
          KISI-KISI TEST KOMPETENSI AKADEMIK (TKA) MATEMATIKA SMP 2026
        </h2>
        <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-2xl">
          Matriks 30 butir soal asesmen numerasi jenjang SMP meliputi 4 Domain Pokok, Taksonomi Bloom C2–C4, dan ragam bentuk soal (Pilihan Ganda, MCMA, dan PGK).
        </p>

        {/* Summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-center text-xs">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-[10px] text-teal-200 block uppercase font-bold">1. Bilangan</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">5 Soal (16%)</span>
            <span className="text-[10px] text-teal-300">PG: 3 | MCMA: 1 | PGK: 1</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-[10px] text-teal-200 block uppercase font-bold">2. Aljabar</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">10 Soal (34%)</span>
            <span className="text-[10px] text-teal-300">PG: 5 | PGK: 5</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-[10px] text-teal-200 block uppercase font-bold">3. Geometri & Pengukuran</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">9 Soal (30%)</span>
            <span className="text-[10px] text-teal-300">PG: 7 | MCMA: 1 | PGK: 1</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-[10px] text-teal-200 block uppercase font-bold">4. Data & Peluang</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">6 Soal (20%)</span>
            <span className="text-[10px] text-teal-300">PG: 4 | MCMA: 2</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Tabel Distribusi Blueprint Soal (Total 30 Butir)
            </h3>
          </div>

          {/* Filter Element */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold">Filter Domain:</label>
            <select
              value={filterElement}
              onChange={(e) => setFilterElement(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="">-- Semua Domain ({BLUEPRINT_TKA_2026.length} Soal) --</option>
              {elements.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3 w-36">Elemen & Subelemen</th>
                <th className="px-4 py-3">Kompetensi yang Diukur</th>
                <th className="px-4 py-3">Indikator Soal</th>
                <th className="px-3 py-3 text-center w-28">Bentuk Soal</th>
                <th className="px-3 py-3 text-center w-28">Level Kognitif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.no} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {item.no}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">{item.elemen}</span>
                    <span className="text-[11px] text-slate-500">{item.subelemen}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 leading-relaxed font-normal">
                    {item.kompetensi}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900 leading-relaxed">
                    {item.indikator}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        item.bentukSoal === 'pg'
                          ? 'bg-blue-100 text-blue-800'
                          : item.bentukSoal === 'mcma'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.bentukSoal === 'pg' && 'Pilihan Ganda'}
                      {item.bentukSoal === 'mcma' && 'MCMA'}
                      {item.bentukSoal === 'pgk' && 'PGK (Kategori)'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        item.level === 'Menalar'
                          ? 'bg-rose-100 text-rose-800'
                          : item.level === 'Mengaplikasikan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {item.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
