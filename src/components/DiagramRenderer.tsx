import React from 'react';

interface DiagramProps {
  type?: 
    | 'line' 
    | 'bar' 
    | 'svg_geo' 
    | 'svg_angle' 
    | 'svg_net' 
    | 'svg_coord' 
    | 'svg_pattern' 
    | 'svg_circle' 
    | 'svg_thermometer' 
    | 'svg_mapping' 
    | 'svg_translation' 
    | 'svg_pythagoras'
    | 'svg_packing'
    | 'svg_similar_rect'
    | 'svg_cuboid_3d'
    | 'none';
  data?: any;
}

export const DiagramRenderer: React.FC<DiagramProps> = ({ type, data }) => {
  if (!type || type === 'none') return null;

  // Question 4: Infografis Termometer Cold Storage
  if (type === 'svg_thermometer') {
    const rooms = [
      { name: 'Ruang A', temp: '-3,4 °C', height: 60 },
      { name: 'Ruang B', temp: '-3 1/2 °C', height: 50 },
      { name: 'Ruang C', temp: '-3,65 °C', height: 35 },
      { name: 'Ruang D', temp: '-3 1/4 °C', height: 75 },
    ];

    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
          <span>📊 INFOGRAFIS: PENCATATAN SUHU RUANG COLD STORAGE IKAN</span>
          <span className="text-[11px] text-slate-400">Skala Termometer (°C)</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Perhatikan pembacaan suhu pada keempat ruang pendingin ikan air tawar di bawah ini:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
          {rooms.map((r, idx) => (
            <div key={idx} className="flex flex-col items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
              <span className="text-xs font-bold text-amber-300 mb-1">{r.name}</span>
              {/* Thermometer SVG */}
              <div className="relative w-12 h-36 flex flex-col items-center justify-end py-1">
                <svg viewBox="0 0 40 120" className="w-full h-full">
                  {/* Stem */}
                  <rect x="15" y="10" width="10" height="85" rx="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  {/* Bulb */}
                  <circle cx="20" cy="102" r="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Mercury stem */}
                  <rect x="17" y={95 - r.height * 0.75} width="6" height={r.height * 0.75} fill="#38bdf8" />
                  {/* Marks */}
                  <line x1="26" y1="25" x2="31" y2="25" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="26" y1="45" x2="31" y2="45" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="26" y1="65" x2="31" y2="65" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="26" y1="85" x2="31" y2="85" stroke="#94a3b8" strokeWidth="1" />
                </svg>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-sky-950 border border-sky-600 font-mono font-bold text-[11px] text-sky-200">
                {r.temp}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Question 7: Infografis Diagram Panah Pemetaan Relasi
  if (type === 'svg_mapping') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          📊 INFOGRAFIS PENYAJIAN TIGA RELASI (DIAGRAM PANAH)
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Himpunan A = Siswa &#123;Budi, Citra, Dani, Eka&#125; dipetakan ke Himpunan B = Ekstrakurikuler &#123;Pramuka, PMR, Robotik, Seni Sasirangan&#125;:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Relasi 1 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-sky-400 block text-center mb-2">Relasi R₁</span>
            <div className="bg-slate-900 p-2.5 rounded text-[11px] space-y-1.5 font-mono text-slate-300 border border-slate-800">
              <div className="flex justify-between"><span>• Budi</span><span className="text-sky-300">➔ Pramuka</span></div>
              <div className="flex justify-between"><span>• Citra</span><span className="text-sky-300">➔ PMR</span></div>
              <div className="flex justify-between"><span>• Dani</span><span className="text-sky-300">➔ Robotik</span></div>
              <div className="flex justify-between"><span>• Eka</span><span className="text-sky-300">➔ Robotik</span></div>
            </div>
          </div>

          {/* Relasi 2 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-sky-400 block text-center mb-2">Relasi R₂</span>
            <div className="bg-slate-900 p-2.5 rounded text-[11px] space-y-1.5 font-mono text-slate-300 border border-slate-800">
              <div className="flex justify-between"><span>• Budi</span><span className="text-sky-300">➔ Pramuka</span></div>
              <div className="flex justify-between"><span>• Budi</span><span className="text-sky-300">➔ PMR</span></div>
              <div className="flex justify-between"><span>• Citra</span><span className="text-sky-300">➔ Robotik</span></div>
              <div className="flex justify-between"><span>• Dani</span><span className="text-sky-300">➔ PMR</span></div>
              <div className="flex justify-between"><span>• Eka</span><span className="text-sky-300">➔ Seni Sasirangan</span></div>
            </div>
          </div>

          {/* Relasi 3 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-sky-400 block text-center mb-2">Relasi R₃</span>
            <div className="bg-slate-900 p-2.5 rounded text-[11px] space-y-1.5 font-mono text-slate-300 border border-slate-800">
              <div className="flex justify-between"><span>• Budi</span><span className="text-sky-300">➔ Seni Sasirangan</span></div>
              <div className="flex justify-between"><span>• Citra</span><span className="text-sky-300">➔ PMR</span></div>
              <div className="flex justify-between"><span>• Dani</span><span className="text-sky-300">➔ Pramuka</span></div>
              <div className="flex justify-between"><span>• Eka</span><span className="text-slate-500">➔ (tidak dipetakan)</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question 8: Linear function graph
  if (type === 'line') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
          <span>📊 INFOGRAFIS GRAFIK FUNGSI LINEAR: TARIF SEWA KELOTOK WISATA</span>
          <span className="text-[11px] text-slate-400 font-mono">f(x) = mx + c</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Grafik menunjukkan hubungan antara lama pemakaian (x dalam jam) dan total biaya sewa perahu (y dalam ribuan rupiah):
        </p>
        <div className="relative w-full max-w-lg mx-auto aspect-4/3 bg-slate-950 rounded-lg p-2 border border-slate-800">
          <svg viewBox="0 0 380 270" className="w-full h-full font-mono text-[10px]">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="30" height="25" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="330" height="210" x="45" y="15" fill="url(#grid)" />

            {/* Axes */}
            <line x1="45" y1="225" x2="370" y2="225" stroke="#94a3b8" strokeWidth="2" />
            <line x1="45" y1="225" x2="45" y2="10" stroke="#94a3b8" strokeWidth="2" />

            {/* Labels */}
            <text x="365" y="240" fill="#38bdf8" textAnchor="end" fontWeight="bold">Lama Sewa x (Jam)</text>
            <text x="20" y="20" fill="#38bdf8" textAnchor="start" fontWeight="bold">Biaya y (Ribu Rp)</text>

            {/* X-axis ticks */}
            {[0, 1, 2, 3, 4, 5, 6].map((val, i) => (
              <g key={i}>
                <line x1={45 + i * 50} y1="225" x2={45 + i * 50} y2="230" stroke="#94a3b8" strokeWidth="1.5" />
                <text x={45 + i * 50} y="242" fill="#94a3b8" textAnchor="middle">{val}</text>
              </g>
            ))}

            {/* Y-axis ticks */}
            {[
              { val: '0', y: 225 },
              { val: '60', y: 180 },
              { val: '120', y: 135 },
              { val: '180', y: 90 },
              { val: '240', y: 45 },
            ].map((t, idx) => (
              <g key={idx}>
                <line x1="40" y1={t.y} x2="45" y2={t.y} stroke="#94a3b8" strokeWidth="1.5" />
                <text x="36" y={t.y + 3} fill="#94a3b8" textAnchor="end">{t.val}</text>
              </g>
            ))}

            {/* Line: through (0, 60) and (3, 195) */}
            <line x1="45" y1="180" x2="345" y2="11.25" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

            {/* Point (0, 60) */}
            <circle cx="45" cy="180" r="5" fill="#f59e0b" />
            <rect x="55" y="170" width="55" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="82" y="183" fill="#fef08a" textAnchor="middle" fontWeight="bold">(0, 60)</text>

            {/* Point (3, 195) */}
            <line x1="195" y1="225" x2="195" y2="78.75" stroke="#64748b" strokeDasharray="3 3" />
            <line x1="45" y1="78.75" x2="195" y2="78.75" stroke="#64748b" strokeDasharray="3 3" />
            <circle cx="195" cy="78.75" r="5" fill="#f59e0b" />
            <rect x="205" y="70" width="60" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="235" y="83" fill="#fef08a" textAnchor="middle" fontWeight="bold">(3, 195)</text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 9: Cartesian coordinates
  if (type === 'svg_coord') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          📊 INFOGRAFIS DENAH KOORDINAT KARTESIUS: POS PANTAU BANJIR
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Skala peta koordinat dalam kilometer (km). Titik asal O(0, 0) adalah Pos Induk Komando:
        </p>
        <div className="relative w-full max-w-md mx-auto aspect-square bg-slate-950 rounded-lg p-2 border border-slate-800">
          <svg viewBox="0 0 320 320" className="w-full h-full font-mono text-[10px]">
            {/* Grid */}
            <defs>
              <pattern id="coordGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="320" height="320" fill="url(#coordGrid)" />

            {/* Axes origin at center (160, 160) */}
            <line x1="160" y1="10" x2="160" y2="310" stroke="#64748b" strokeWidth="2" />
            <line x1="10" y1="160" x2="310" y2="160" stroke="#64748b" strokeWidth="2" />
            <text x="305" y="152" fill="#94a3b8" fontWeight="bold">X (km)</text>
            <text x="165" y="20" fill="#94a3b8" fontWeight="bold">Y (km)</text>

            {/* Axis number ticks */}
            {[-6, -4, -2, 2, 4, 6].map((tick) => (
              <g key={`x-${tick}`}>
                <line x1={160 + tick * 20} y1="156" x2={160 + tick * 20} y2="164" stroke="#64748b" strokeWidth="1" />
                <text x={160 + tick * 20} y="174" fill="#64748b" textAnchor="middle" fontSize="8">{tick}</text>
              </g>
            ))}
            {[-6, -4, -2, 2, 4, 6].map((tick) => (
              <g key={`y-${tick}`}>
                <line x1="156" y1={160 - tick * 20} x2="164" y2={160 - tick * 20} stroke="#64748b" strokeWidth="1" />
                <text x="150" y={160 - tick * 20 + 3} fill="#64748b" textAnchor="end" fontSize="8">{tick}</text>
              </g>
            ))}

            {/* Triangle connecting A, B, C */}
            {/* Center = (160, 160). 1 unit = 20px. 
                A(-4, 3) => (80, 100)
                B(4, 3)  => (240, 100)
                C(0, -5) => (160, 260)
            */}
            <polygon points="80,100 240,100 160,260" fill="rgba(16, 185, 129, 0.18)" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />

            {/* Origin Line to Pos A */}
            <line x1="160" y1="160" x2="80" y2="100" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />

            {/* Points */}
            <circle cx="160" cy="160" r="4" fill="#38bdf8" />
            <text x="165" y="152" fill="#38bdf8" fontWeight="bold">O (0, 0)</text>

            <circle cx="80" cy="100" r="5" fill="#f59e0b" />
            <text x="25" y="95" fill="#fef08a" fontWeight="bold">Pos A (-4, 3)</text>

            <circle cx="240" cy="100" r="5" fill="#f59e0b" />
            <text x="245" y="95" fill="#fef08a" fontWeight="bold">Pos B (4, 3)</text>

            <circle cx="160" cy="260" r="5" fill="#ec4899" />
            <text x="165" y="275" fill="#fbcfe8" fontWeight="bold">Pos C (0, -5)</text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 14: Infografis Konfigurasi Objek Pola Bilangan
  if (type === 'svg_pattern') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          📊 INFOGRAFIS KONFIGURASI OBJEK: SUSUNAN TIANG KERAMBA APUNG
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Perhatikan tahapan kerangka bambu yang disusun bertingkat dengan pola teratur:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
          {/* Pola 1 */}
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-amber-300 mb-1">Pola 1</span>
            <svg viewBox="0 0 80 80" className="w-20 h-20">
              <polygon points="40,10 70,25 70,55 40,70 10,55 10,25" fill="none" stroke="#f59e0b" strokeWidth="3" />
              {[
                [40, 10], [70, 25], [70, 55], [40, 70], [10, 55], [10, 25]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3" fill="#38bdf8" />
              ))}
            </svg>
            <span className="mt-1 px-2 py-0.5 rounded bg-amber-950 border border-amber-600 font-bold text-amber-300 text-[10px]">
              6 Batang
            </span>
          </div>

          {/* Pola 2 */}
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-amber-300 mb-1">Pola 2</span>
            <svg viewBox="0 0 120 80" className="w-28 h-20">
              <polygon points="30,10 55,25 55,55 30,70 10,55 10,25" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
              <polygon points="55,25 80,10 105,25 105,55 80,70 55,55" fill="none" stroke="#10b981" strokeWidth="2.5" />
            </svg>
            <span className="mt-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 font-bold text-emerald-300 text-[10px]">
              11 Batang
            </span>
          </div>

          {/* Pola 3 */}
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-amber-300 mb-1">Pola 3</span>
            <svg viewBox="0 0 160 80" className="w-36 h-20">
              <polygon points="25,10 45,25 45,55 25,70 10,55 10,25" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <polygon points="45,25 65,10 85,25 85,55 65,70 45,55" fill="none" stroke="#10b981" strokeWidth="2" />
              <polygon points="85,25 105,10 125,25 125,55 105,70 85,55" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
            <span className="mt-1 px-2 py-0.5 rounded bg-sky-950 border border-sky-600 font-bold text-sky-300 text-[10px]">
              16 Batang
            </span>
          </div>

          {/* Pola 4 */}
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-amber-300 mb-1">Pola 4</span>
            <svg viewBox="0 0 180 80" className="w-40 h-20">
              <polygon points="20,10 38,25 38,55 20,70 8,55 8,25" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
              <polygon points="38,25 56,10 74,25 74,55 56,70 38,55" fill="none" stroke="#10b981" strokeWidth="1.8" />
              <polygon points="74,25 92,10 110,25 110,55 92,70 74,55" fill="none" stroke="#38bdf8" strokeWidth="1.8" />
              <polygon points="110,25 128,10 146,25 146,55 128,70 110,55" fill="none" stroke="#ec4899" strokeWidth="1.8" />
            </svg>
            <span className="mt-1 px-2 py-0.5 rounded bg-purple-950 border border-purple-600 font-bold text-purple-300 text-[10px]">
              21 Batang
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Question 16: Intersecting lines
  if (type === 'svg_angle') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          📊 INFOGRAFIS RANGKA SILANG: DUA GARIS BERPOTONGAN
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Konstruksi penyangga silang membentuk dua garis berpotongan:
        </p>
        <div className="relative w-full max-w-sm mx-auto aspect-4/3 bg-slate-950 rounded-lg p-2 border border-slate-800">
          <svg viewBox="0 0 320 220" className="w-full h-full font-mono text-[11px]">
            {/* Line 1 */}
            <line x1="30" y1="190" x2="290" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Line 2 */}
            <line x1="30" y1="30" x2="290" y2="190" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Angle Top: (5x - 10)° */}
            <path d="M 120 75 A 40 40 0 0 1 200 75" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="160" y="60" fill="#fef08a" textAnchor="middle" fontWeight="bold">(5x - 10)°</text>

            {/* Angle Bottom: (3x + 30)° */}
            <path d="M 120 145 A 40 40 0 0 0 200 145" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="160" y="170" fill="#fef08a" textAnchor="middle" fontWeight="bold">(3x + 30)°</text>

            {/* Angle Right: (2y + 10)° */}
            <path d="M 200 75 A 40 40 0 0 1 200 145" fill="none" stroke="#10b981" strokeWidth="2" />
            <text x="245" y="115" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">(2y + 10)°</text>

            <circle cx="160" cy="110" r="4" fill="#ef4444" />
          </svg>
        </div>
      </div>
    );
  }

  // Question 17: Triangular prism 3D Solid Geometry & 2D Net
  if (type === 'svg_net') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
          <span>📊 GEOMETRI BANGUN RUANG 3D &amp; JARING-JARING: PRISMA SEGITIGA SIKU-SIKU</span>
          <span className="text-[10px] text-slate-400 font-mono">3D Solid &amp; 2D Net</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Perhatikan model bangun ruang prisma tegak segitiga siku-siku (kiri) dan bentangan jaring-jaring bernomor 1 sampai 5 (kanan):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          {/* Panel Kiri: Gambar 3 Dimensi Prisma Segitiga Siku-Siku */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-xs font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Model Bangun Ruang 3 Dimensi
            </span>
            <div className="w-full aspect-4/3 max-w-[240px]">
              <svg viewBox="0 0 240 200" className="w-full h-full font-mono text-[10px]">
                <defs>
                  <linearGradient id="prismFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="prismTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Hidden edges (dashed) */}
                <line x1="70" y1="45" x2="70" y2="150" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="70" y1="150" x2="180" y2="150" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="70" y1="150" x2="35" y2="180" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Bottom Base */}
                <text x="95" y="162" fill="#94a3b8" fontSize="9">Bidang 1</text>

                {/* Left/Back face (Bidang 2) */}
                <polygon points="35,75 70,45 70,150 35,180" fill="#0f172a" stroke="#334155" strokeWidth="1" opacity="0.6" />

                {/* Back face (Bidang 3) */}
                <polygon points="70,45 180,45 180,150 70,150" fill="#1e293b" stroke="#334155" strokeWidth="1" opacity="0.7" />

                {/* Front inclined face */}
                <polygon points="35,75 180,45 180,150 35,180" fill="url(#prismFrontGrad)" stroke="#38bdf8" strokeWidth="2" />
                <text x="110" y="120" fill="#fef08a" fontWeight="bold" textAnchor="middle">
                  Sisi Depan
                </text>

                {/* Top Face */}
                <polygon points="70,45 180,45 35,75" fill="url(#prismTopGrad)" stroke="#7dd3fc" strokeWidth="2" />
                <text x="95" y="58" fill="#0c4a6e" fontWeight="bold" textAnchor="middle">
                  Sisi Atas
                </text>

                {/* Right angle marker on top triangle at A_top (70, 45) */}
                <path d="M 80,45 L 80,51 L 70,51" fill="none" stroke="#0284c7" strokeWidth="1.2" />

                {/* Outer solid edges */}
                <line x1="35" y1="75" x2="35" y2="180" stroke="#38bdf8" strokeWidth="2" />
                <line x1="180" y1="45" x2="180" y2="150" stroke="#38bdf8" strokeWidth="2" />
                <line x1="35" y1="180" x2="180" y2="150" stroke="#38bdf8" strokeWidth="2" />

                {/* Dimension label: Tinggi 15 cm */}
                <line x1="192" y1="45" x2="192" y2="150" stroke="#f59e0b" strokeWidth="1.2" />
                <line x1="188" y1="45" x2="196" y2="45" stroke="#f59e0b" strokeWidth="1.2" />
                <line x1="188" y1="150" x2="196" y2="150" stroke="#f59e0b" strokeWidth="1.2" />
                <text x="214" y="100" fill="#f59e0b" fontWeight="bold" textAnchor="middle">t = 15 cm</text>
              </svg>
            </div>
          </div>

          {/* Panel Kanan: Jaring-jaring 2 Dimensi */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Jaring-Jaring 2 Dimensi (Bentangan Karton)
            </span>
            <div className="w-full aspect-4/3 max-w-[260px]">
              <svg viewBox="0 0 320 200" className="w-full h-full font-mono text-[10px]">
                {/* Rectangle 2 (lebar 6 cm x panjang 15 cm) */}
                <rect x="25" y="65" width="55" height="70" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.8" />
                <text x="52" y="98" fill="#38bdf8" textAnchor="middle" fontWeight="bold">Bidang 2</text>
                <text x="52" y="112" fill="#94a3b8" textAnchor="middle" fontSize="8">Lebar 6 cm</text>

                {/* Rectangle 3 (lebar 8 cm x panjang 15 cm) */}
                <rect x="80" y="65" width="80" height="70" fill="#334155" stroke="#10b981" strokeWidth="2.2" />
                <text x="120" y="98" fill="#10b981" textAnchor="middle" fontWeight="bold">Bidang 3</text>
                <text x="120" y="112" fill="#a7f3d0" textAnchor="middle" fontSize="8">Lebar 8 cm</text>

                {/* Rectangle 4 (lebar 10 cm x panjang 15 cm) */}
                <rect x="160" y="65" width="105" height="70" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <text x="212" y="98" fill="#fef08a" textAnchor="middle" fontWeight="bold">Bidang 4</text>
                <text x="212" y="112" fill="#fed7aa" textAnchor="middle" fontSize="8">Lebar 10 cm</text>

                {/* Triangle 1 */}
                <polygon points="80,135 160,135 80,185" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.8" />
                <text x="105" y="158" fill="#ccfbf1" textAnchor="middle" fontWeight="bold">Bidang 1</text>

                {/* Triangle 5 */}
                <polygon points="80,65 160,65 80,15" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.8" />
                <text x="105" y="48" fill="#ccfbf1" textAnchor="middle" fontWeight="bold">Bidang 5</text>

                {/* Right angle symbols in triangles */}
                <rect x="80" y="135" width="8" height="8" fill="none" stroke="#2dd4bf" strokeWidth="1" />
                <rect x="80" y="57" width="8" height="8" fill="none" stroke="#2dd4bf" strokeWidth="1" />

                {/* Dimension label length 15 cm */}
                <line x1="272" y1="65" x2="272" y2="135" stroke="#f59e0b" strokeWidth="1" />
                <text x="277" y="103" fill="#fef08a" fontSize="8">15 cm</text>

                {/* Fold lines indicators */}
                <line x1="80" y1="65" x2="80" y2="135" stroke="#94a3b8" strokeDasharray="3 2" />
                <line x1="160" y1="65" x2="160" y2="135" stroke="#94a3b8" strokeDasharray="3 2" />
                <line x1="80" y1="65" x2="160" y2="65" stroke="#94a3b8" strokeDasharray="3 2" />
                <line x1="80" y1="135" x2="160" y2="135" stroke="#94a3b8" strokeDasharray="3 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question 18: Parallel lines with transversal & triangle
  if (type === 'svg_geo') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          📊 INFOGRAFIS RANGKA ATAP: DUA GARIS SEJAJAR g // h &amp; SEGITIGA ABC
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Garis g sejajar dengan garis h dipotong oleh rangka segitiga ABC:
        </p>
        <div className="relative w-full max-w-sm mx-auto aspect-4/3 bg-slate-950 rounded-lg p-2 border border-slate-800">
          <svg viewBox="0 0 320 220" className="w-full h-full font-mono text-[11px]">
            {/* Parallel line g */}
            <line x1="20" y1="60" x2="300" y2="60" stroke="#94a3b8" strokeWidth="2" />
            <text x="25" y="50" fill="#94a3b8">Garis g</text>
            <polygon points="280,57 288,60 280,63" fill="#94a3b8" />

            {/* Parallel line h */}
            <line x1="20" y1="170" x2="300" y2="170" stroke="#94a3b8" strokeWidth="2" />
            <text x="25" y="195" fill="#94a3b8">Garis h</text>
            <polygon points="280,167 288,170 280,173" fill="#94a3b8" />

            {/* Triangle ABC: A at (160, 60), B at (60, 170), C at (250, 170) */}
            <polygon points="160,60 60,170 250,170" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="2" />

            <circle cx="160" cy="60" r="4" fill="#38bdf8" />
            <text x="160" y="45" fill="#38bdf8" textAnchor="middle" fontWeight="bold">A</text>

            <circle cx="60" cy="170" r="4" fill="#38bdf8" />
            <text x="45" y="175" fill="#38bdf8" textAnchor="end" fontWeight="bold">B</text>

            <circle cx="250" cy="170" r="4" fill="#38bdf8" />
            <text x="265" y="175" fill="#38bdf8" textAnchor="start" fontWeight="bold">C</text>

            {/* Angle B = 40° */}
            <path d="M 85 170 A 25 25 0 0 0 75 155" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="95" y="160" fill="#fef08a">40°</text>

            {/* Angle exterior at A: 125° */}
            <path d="M 190 60 A 30 30 0 0 1 180 85" fill="none" stroke="#ef4444" strokeWidth="2" />
            <text x="210" y="75" fill="#fca5a5" fontWeight="bold">125°</text>

            {/* Target angle BAC */}
            <text x="160" y="90" fill="#34d399" textAnchor="middle" fontWeight="bold">∠BAC = ?</text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 19: Pythagoras Perahu Arus Sungai
  if (type === 'svg_pythagoras') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
          📊 INFOGRAFIS VEKTOR TEOREMA PYTHAGORAS: PENYEBERANGAN SUNGAI
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Perahu menyeberang tegak lurus ke Timur dan terdorong arus ke Selatan:
        </p>
        <div className="relative w-full max-w-sm mx-auto aspect-4/3 bg-slate-950 rounded-lg p-2 border border-slate-800">
          <svg viewBox="0 0 320 220" className="w-full h-full font-mono text-[11px]">
            {/* Water flow background pattern */}
            <rect width="320" height="220" fill="#031525" />
            {/* East line: 360 m */}
            <line x1="40" y1="40" x2="250" y2="40" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="145" y="30" fill="#38bdf8" textAnchor="middle" fontWeight="bold">Timur: 360 m</text>

            {/* South line: 150 m */}
            <line x1="250" y1="40" x2="250" y2="160" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="260" y="105" fill="#f59e0b" fontWeight="bold">Arus Selatan: 150 m</text>

            {/* Right angle symbol at (250, 40) */}
            <rect x="235" y="40" width="15" height="15" fill="none" stroke="#94a3b8" />

            {/* Hypotenuse line */}
            <line x1="40" y1="40" x2="250" y2="160" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" />
            <rect x="110" y="105" width="85" height="20" rx="4" fill="#064e3b" stroke="#10b981" />
            <text x="152" y="119" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Lintasan c = ?</text>

            {/* Points */}
            <circle cx="40" cy="40" r="5" fill="#38bdf8" />
            <text x="35" y="60" fill="#cbd5e1">Dermaga Awal</text>

            <circle cx="250" cy="160" r="5" fill="#10b981" />
            <text x="250" y="180" fill="#cbd5e1" textAnchor="middle">Tiba di Seberang</text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 20: Translasi Bangun Datar Ponton
  if (type === 'svg_translation') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          📊 INFOGRAFIS KOORDINAT TRANSLASI: PONTON KARGO ABCD
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Posisi awal ponton ABCD pada peta koordinat yang akan ditranslasikan oleh T(-3, 4):
        </p>
        <div className="relative w-full max-w-md mx-auto aspect-square bg-slate-950 rounded-lg p-2 border border-slate-800">
          <svg viewBox="0 0 320 320" className="w-full h-full font-mono text-[10px]">
            {/* Grid */}
            <defs>
              <pattern id="transGrid" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="320" height="320" fill="url(#transGrid)" />

            {/* Axes */}
            <line x1="90" y1="10" x2="90" y2="310" stroke="#64748b" strokeWidth="1.5" />
            <line x1="10" y1="260" x2="310" y2="260" stroke="#64748b" strokeWidth="1.5" />
            <text x="300" y="252" fill="#94a3b8">X</text>
            <text x="96" y="20" fill="#94a3b8">Y</text>

            {/* Asal ABCD: A(1, 2), B(7, 2), C(7, 5), D(1, 5) */}
            <rect x="112" y="150" width="132" height="66" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="2" />
            <text x="178" y="188" fill="#38bdf8" textAnchor="middle" fontWeight="bold">Bangun Asal ABCD</text>

            {/* Points & Coordinates */}
            <circle cx="112" cy="216" r="3.5" fill="#38bdf8" />
            <text x="112" y="228" fill="#94a3b8" fontSize="8" textAnchor="middle">A(1,2)</text>

            <circle cx="244" cy="216" r="3.5" fill="#38bdf8" />
            <text x="244" y="228" fill="#94a3b8" fontSize="8" textAnchor="middle">B(7,2)</text>

            <circle cx="244" cy="150" r="3.5" fill="#38bdf8" />
            <text x="244" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">C(7,5)</text>

            <circle cx="112" cy="150" r="3.5" fill="#38bdf8" />
            <text x="112" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">D(1,5)</text>

            {/* Translation vector arrow starting at A(1, 2) */}
            <line x1="112" y1="216" x2="46" y2="128" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
            <polygon points="46,128 55,133 50,140" fill="#f59e0b" />
            <rect x="52" y="165" width="60" height="18" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="82" y="178" fill="#fef08a" textAnchor="middle" fontWeight="bold">T(-3, 4)</text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 21: Juring Lingkaran Bundaran Marabahan (Bangun Datar 2D)
  if (type === 'svg_circle') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
          <span>📐 GEOMETRI BANGUN DATAR 2D: LINGKARAN &amp; JURING TAMAN KOTA</span>
          <span className="text-[10px] text-slate-400 font-mono">r = 21 m | π = 22/7</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Denah 2 Dimensi tata ruang Bundaran Tugu Marabahan dibagi ke dalam 3 zona juring lingkaran:
        </p>
        <div className="relative w-full max-w-sm mx-auto aspect-square bg-slate-950 rounded-lg p-3 border border-slate-800">
          <svg viewBox="0 0 280 280" className="w-full h-full font-mono text-[10px]">
            {/* Circle boundary */}
            <circle cx="140" cy="140" r="100" fill="#090d16" stroke="#475569" strokeWidth="2" />

            {/* Sector 1: Zona Bunga 60° (0 to 60 deg) */}
            <path d="M 140 140 L 240 140 A 100 100 0 0 1 190 226.6 Z" fill="rgba(245, 158, 11, 0.45)" stroke="#f59e0b" strokeWidth="2" />
            <text x="180" y="178" fill="#fef08a" fontWeight="bold">60°</text>
            <text x="180" y="190" fill="#fde68a" fontSize="8">Zona Bunga</text>

            {/* Sector 2: Zona Rumput 140° (60 to 200 deg) */}
            <path d="M 140 140 L 190 226.6 A 100 100 0 0 1 46 105.8 Z" fill="rgba(16, 185, 129, 0.45)" stroke="#10b981" strokeWidth="2" />
            <text x="105" y="210" fill="#a7f3d0" fontWeight="bold">140°</text>
            <text x="105" y="222" fill="#6ee7b7" fontSize="8">Zona Rumput</text>

            {/* Sector 3: Sisa 160° (200 to 360 deg) */}
            <path d="M 140 140 L 46 105.8 A 100 100 0 0 1 240 140 Z" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="110" y="75" fill="#94a3b8" fontWeight="bold">160°</text>
            <text x="110" y="87" fill="#64748b" fontSize="8">Jalur Pejalan</text>

            {/* Center & Radius Line */}
            <circle cx="140" cy="140" r="4.5" fill="#ffffff" />
            <line x1="140" y1="140" x2="240" y2="140" stroke="#f8fafc" strokeWidth="2" />
            <text x="145" y="133" fill="#ffffff" fontWeight="bold">Pusat O</text>
            <rect x="165" y="125" width="50" height="13" rx="2" fill="#0f172a" />
            <text x="190" y="135" fill="#38bdf8" textAnchor="middle" fontWeight="bold">r = 21 m</text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 22: Kesebangunan Bangun Datar 2D (Persegi Panjang Miniatur & Baliho Raksasa)
  if (type === 'svg_similar_rect') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
          <span>📐 GEOMETRI BANGUN DATAR 2D: KESEBANGUNAN DUA PERSEGI PANJANG (~)</span>
          <span className="text-[10px] text-slate-400 font-mono">Dua Bangun Sebangun</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Perhatikan ukuran foto miniatur spanduk (kiri) dan baliho raksasa yang sebangun dengannya (kanan):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          {/* Bangun 1: Miniatur Spanduk 2D */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex flex-col items-center justify-between">
            <div className="w-full text-center mb-1">
              <span className="text-xs font-bold text-amber-300">1. Miniatur Spanduk (Foto Desain)</span>
            </div>
            <div className="w-full aspect-4/3 max-w-[200px] flex items-center justify-center py-2">
              <svg viewBox="0 0 180 140" className="w-full h-full font-mono text-[10px]">
                {/* Rectangle 1: 30 cm x 20 cm */}
                <rect x="30" y="30" width="120" height="80" rx="4" fill="rgba(245, 158, 11, 0.18)" stroke="#f59e0b" strokeWidth="2.5" />

                {/* Right angles at corners */}
                <rect x="30" y="30" width="8" height="8" fill="none" stroke="#f59e0b" strokeWidth="1" />
                <rect x="142" y="30" width="8" height="8" fill="none" stroke="#f59e0b" strokeWidth="1" />
                <rect x="30" y="102" width="8" height="8" fill="none" stroke="#f59e0b" strokeWidth="1" />
                <rect x="142" y="102" width="8" height="8" fill="none" stroke="#f59e0b" strokeWidth="1" />

                {/* Length dimension: 30 cm */}
                <line x1="30" y1="18" x2="150" y2="18" stroke="#fef08a" strokeWidth="1.2" />
                <text x="90" y="13" fill="#fef08a" textAnchor="middle" fontWeight="bold">p₁ = 30 cm</text>

                {/* Width dimension: 20 cm */}
                <line x1="162" y1="30" x2="162" y2="110" stroke="#fef08a" strokeWidth="1.2" />
                <text x="166" y="74" fill="#fef08a" textAnchor="start" fontWeight="bold">l₁ = 20 cm</text>

                <text x="90" y="75" fill="#fde68a" textAnchor="middle">Miniatur</text>
              </svg>
            </div>
          </div>

          {/* Bangun 2: Baliho Raksasa 2D */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex flex-col items-center justify-between">
            <div className="w-full text-center mb-1">
              <span className="text-xs font-bold text-emerald-400">2. Baliho Raksasa (Jalan Trans Kalimantan)</span>
            </div>
            <div className="w-full aspect-4/3 max-w-[240px] flex items-center justify-center py-2">
              <svg viewBox="0 0 220 150" className="w-full h-full font-mono text-[10px]">
                {/* Rectangle 2: 9 m x l₂ */}
                <rect x="25" y="25" width="150" height="100" rx="4" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2.5" />

                {/* Right angles at corners */}
                <rect x="25" y="25" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="1" />
                <rect x="165" y="25" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="1" />
                <rect x="25" y="115" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="1" />
                <rect x="165" y="115" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="1" />

                {/* Length dimension: 9 m */}
                <line x1="25" y1="14" x2="175" y2="14" stroke="#a7f3d0" strokeWidth="1.2" />
                <text x="100" y="10" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">p₂ = 9 meter (900 cm)</text>

                {/* Width dimension: l₂ = ? */}
                <line x1="188" y1="25" x2="188" y2="125" stroke="#a7f3d0" strokeWidth="1.2" />
                <text x="192" y="78" fill="#fef08a" textAnchor="start" fontWeight="bold">l₂ = ?</text>

                <text x="100" y="75" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">Baliho Raksasa (~)</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question 23: Bangun Ruang 3 Dimensi Balok Tandon Air SMP Wanaraya
  if (type === 'svg_cuboid_3d') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2 flex items-center justify-between">
          <span>🧊 GEOMETRI BANGUN RUANG 3D: TANDON AIR BALOK (SMP WANARAYA)</span>
          <span className="text-[10px] text-slate-400 font-mono">Model Balok Terbuka</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-2">
          Model 3 Dimensi bak penampung air hujan berplester kedap air tanpa tutup atas:
        </p>

        <div className="relative w-full max-w-lg mx-auto aspect-16/9 bg-slate-950 rounded-lg p-3 border border-slate-800">
          <svg viewBox="0 0 380 220" className="w-full h-full font-mono text-[10px]">
            <defs>
              <linearGradient id="waterSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="concreteWall" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="innerWall" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Inflow Pipe on Top Right */}
            <path d="M 285,15 L 285,45 L 255,45" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <polygon points="255,41 245,45 255,49" fill="#38bdf8" />
            <line x1="245" y1="48" x2="225" y2="85" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
            <text x="290" y="22" fill="#38bdf8" fontSize="9" fontWeight="bold">Pipa Debit</text>
            <text x="290" y="34" fill="#7dd3fc" fontSize="8">40 L/menit</text>

            {/* Hidden back wall & base (inside visible because no top cover) */}
            <polygon points="140,50 310,50 310,135 140,135" fill="url(#innerWall)" stroke="#475569" strokeWidth="1" />
            <polygon points="60,95 140,50 140,135 60,180" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <polygon points="60,180 230,180 310,135 140,135" fill="#0f172a" stroke="#334155" strokeWidth="1" />

            {/* Inside Water Body */}
            <polygon points="60,180 230,180 310,135 140,135" fill="#0369a1" opacity="0.4" />
            <polygon points="60,180 230,180 230,115 60,115" fill="#0284c7" opacity="0.4" />
            <polygon points="230,180 310,135 310,70 230,115" fill="#0369a1" opacity="0.45" />
            <polygon points="60,115 230,115 310,70 140,70" fill="url(#waterSurface)" stroke="#7dd3fc" strokeWidth="1" />
            <text x="180" y="98" fill="#e0f2fe" textAnchor="middle" fontWeight="bold">Permukaan Air</text>

            {/* Solid Exterior Walls */}
            <polygon points="60,95 230,95 230,180 60,180" fill="url(#concreteWall)" stroke="#64748b" strokeWidth="2" opacity="0.85" />
            <polygon points="230,95 310,50 310,135 230,180" fill="#334155" stroke="#64748b" strokeWidth="2" opacity="0.9" />

            {/* Labels and Dimensions */}
            {/* Panjang = 2,5 m */}
            <line x1="60" y1="195" x2="230" y2="195" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="60" y1="190" x2="60" y2="200" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="230" y1="190" x2="230" y2="200" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="145" y="210" fill="#fef08a" textAnchor="middle" fontWeight="bold">Panjang p = 2,5 m</text>

            {/* Tinggi = 1,2 m */}
            <line x1="45" y1="95" x2="45" y2="180" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="40" y1="95" x2="50" y2="95" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="40" y1="180" x2="50" y2="180" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="38" y="142" fill="#fef08a" textAnchor="end" fontWeight="bold">t = 1,2 m</text>

            {/* Lebar = 1,6 m */}
            <line x1="240" y1="185" x2="320" y2="140" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="290" y="172" fill="#fef08a" fontWeight="bold">l = 1,6 m</text>

            {/* Open top indicator */}
            <text x="175" y="45" fill="#34d399" textAnchor="middle" fontWeight="bold">
              [ Terbuka / Tanpa Tutup Atas ]
            </text>
          </svg>
        </div>
      </div>
    );
  }

  // Question 24: Model 3 Dimensi Kardus Kubus & Modul Balok
  if (type === 'svg_packing') {
    return (
      <div className="my-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center justify-between">
          <span>🧊 GEOMETRI BANGUN RUANG 3D: KARDUS KUBUS &amp; MODUL BALOK</span>
          <span className="text-[10px] text-slate-400 font-mono">3D Solid Model</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Perhatikan model 3 Dimensi kardus kubus besar (kiri) dan paket modul balok kecil (kanan):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          {/* Panel Kiri: Gambar 3 Dimensi Kardus Kubus Besar (60x60x60 cm) */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Kardus Besar (Kubus 3 Dimensi)
            </span>
            <div className="w-full aspect-4/3 max-w-[240px]">
              <svg viewBox="0 0 240 200" className="w-full h-full font-mono text-[10px]">
                <defs>
                  <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#92400e" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="cubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#b45309" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Isometric Cube */}
                <polygon points="120,35 195,75 120,110 45,75" fill="url(#cubeTop)" stroke="#fde68a" strokeWidth="1.5" />
                <polygon points="45,75 120,110 120,185 45,150" fill="url(#cubeLeft)" stroke="#fde68a" strokeWidth="1.5" />
                <polygon points="120,110 195,75 195,150 120,185" fill="url(#cubeRight)" stroke="#fde68a" strokeWidth="1.5" />

                {/* Dimensions */}
                <text x="120" y="25" fill="#fef08a" textAnchor="middle" fontWeight="bold">rusuk s = 60 cm</text>
                <text x="28" y="115" fill="#fef08a" textAnchor="end" fontWeight="bold">s = 60 cm</text>
                <text x="210" y="115" fill="#fef08a" textAnchor="start" fontWeight="bold">s = 60 cm</text>
              </svg>
            </div>
          </div>

          {/* Panel Kanan: Gambar 3 Dimensi Modul Balok Kecil (20x15x10 cm) */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex flex-col items-center">
            <span className="text-xs font-bold text-sky-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Paket Modul (Balok 3 Dimensi)
            </span>
            <div className="w-full aspect-4/3 max-w-[240px]">
              <svg viewBox="0 0 240 200" className="w-full h-full font-mono text-[10px]">
                <defs>
                  <linearGradient id="brickTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="brickFront" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="brickSide" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#075985" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* 3D Cuboid */}
                <polygon points="90,60 175,45 145,80 60,95" fill="url(#brickTop)" stroke="#7dd3fc" strokeWidth="1.8" />
                <polygon points="60,95 145,80 145,140 60,155" fill="url(#brickFront)" stroke="#7dd3fc" strokeWidth="1.8" />
                <polygon points="145,80 175,45 175,105 145,140" fill="url(#brickSide)" stroke="#7dd3fc" strokeWidth="1.8" />

                {/* Dimensions */}
                {/* Panjang 20 cm */}
                <line x1="60" y1="168" x2="145" y2="153" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="100" y="178" fill="#fef08a" textAnchor="middle" fontWeight="bold">p = 20 cm</text>

                {/* Lebar 15 cm */}
                <line x1="155" y1="145" x2="185" y2="110" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="182" y="135" fill="#fef08a" fontWeight="bold">l = 15 cm</text>

                {/* Tinggi 10 cm */}
                <line x1="48" y1="95" x2="48" y2="155" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="43" y1="95" x2="53" y2="95" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="43" y1="155" x2="53" y2="155" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="42" y="128" fill="#fef08a" textAnchor="end" fontWeight="bold">t = 10 cm</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Component for rendering visual number lines in Question 10 options
export const OptionNumberLine: React.FC<{
  data: { point: number; filled: boolean; direction: 'left' | 'right' };
}> = ({ data }) => {
  const { point, filled, direction } = data;
  const minVal = -8;
  const maxVal = 10;
  const targetX = 20 + ((point - minVal) / (maxVal - minVal)) * 240;

  return (
    <div className="w-full my-1.5 p-2 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      <svg viewBox="0 0 280 46" className="w-full h-11 font-mono text-[9px]">
        {/* Base axis line with arrows at both ends */}
        <line x1="12" y1="24" x2="268" y2="24" stroke="#94a3b8" strokeWidth="1.8" />
        <polygon points="12,24 18,20 18,28" fill="#94a3b8" />
        <polygon points="268,24 262,20 262,28" fill="#94a3b8" />

        {/* Major ticks */}
        {[-8, -6, -4, -2, 0, 2, 4, 6, 8, 10].map((t) => {
          const tx = 20 + ((t - minVal) / (maxVal - minVal)) * 240;
          return (
            <g key={t}>
              <line x1={tx} y1="20" x2={tx} y2="28" stroke="#64748b" strokeWidth="1.2" />
              <text x={tx} y="38" fill={t === point ? '#fef08a' : '#94a3b8'} textAnchor="middle" fontWeight={t === point ? 'bold' : 'normal'}>
                {t}
              </text>
            </g>
          );
        })}

        {/* Shaded Ray / Arrow */}
        {direction === 'left' ? (
          <>
            <line x1={targetX} y1="24" x2="16" y2="24" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="14,24 24,18 24,30" fill="#10b981" />
          </>
        ) : (
          <>
            <line x1={targetX} y1="24" x2="264" y2="24" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="266,24 256,18 256,30" fill="#10b981" />
          </>
        )}

        {/* Boundary Point Circle: Filled or Hollow */}
        {filled ? (
          <circle cx={targetX} cy="24" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        ) : (
          <circle cx={targetX} cy="24" r="5" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
        )}
      </svg>
    </div>
  );
};

// Component for rendering mini bar charts in Question 25 options
export const OptionMiniBarChart: React.FC<{
  data: { values: number[]; labels: string[] };
}> = ({ data }) => {
  const { values, labels } = data;
  const maxVal = 80;

  return (
    <div className="w-full my-1.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
      <div className="flex items-end justify-between gap-1.5 h-24 border-b border-slate-700 px-2 pt-2">
        {values.map((v, i) => {
          const heightPct = (v / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
              <span className="text-[9px] font-mono font-bold text-amber-300 mb-0.5">
                {v}
              </span>
              <div
                style={{ height: `${heightPct}%` }}
                className="w-full rounded-t bg-emerald-600 transition-all"
              />
              <span className="text-[8px] text-slate-400 mt-1 truncate max-w-[45px] text-center" title={labels[i]}>
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
