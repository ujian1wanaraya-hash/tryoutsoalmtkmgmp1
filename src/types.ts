export type QuestionType = 'pg' | 'mcma' | 'pgk';
export type CognitiveLevel = 'Memahami' | 'Mengaplikasikan' | 'Menalar';
export type DomainElement = 'Bilangan' | 'Aljabar' | 'Geometri dan Pengukuran' | 'Data dan Peluang';

export interface PgkStatement {
  id: string;
  text: string;
  correct: 'Benar' | 'Salah';
}

export interface McmaOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
}

export interface PgOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  chartType?: 'number_line' | 'bar_mini' | 'none';
  chartData?: any;
}

export interface Question {
  no: number;
  type: QuestionType;
  element: DomainElement;
  subelement: string;
  kompetensi: string;
  indikator: string;
  level: CognitiveLevel;
  stimulusTitle?: string;
  stimulusText: string;
  stimulusTable?: { headers: string[]; rows: (string | number)[][] };
  stimulusChartType?: 
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
  stimulusChartData?: any;
  questionText: string;
  // For PG:
  options?: PgOption[];
  correctKey?: 'A' | 'B' | 'C' | 'D';
  // For MCMA:
  mcmaOptions?: McmaOption[];
  // For PGK (Benar / Salah):
  pgkStatements?: PgkStatement[];
  scoreWeight: number; // default 1 (or 3 for complex)
  explanation: {
    steps: string[];
    concept: string;
    conclusion: string;
  };
}

export type StudentAnswer = 
  | { type: 'pg'; value: 'A' | 'B' | 'C' | 'D' }
  | { type: 'mcma'; selectedIds: string[] }
  | { type: 'pgk'; statements: { [statementId: string]: 'Benar' | 'Salah' } };

export interface StudentAnswersMap {
  [noSoal: number]: StudentAnswer;
}

export interface StudentSession {
  idPeserta: string;
  nama: string;
  asalSekolah: string;
  waktuLogin: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  status: 'Login' | 'Mengerjakan' | 'Selesai';
  durasiSisaDetik?: number;
  isFlagged?: { [noSoal: number]: boolean };
}

export interface ExamResult {
  idPeserta: string;
  nama: string;
  asalSekolah: string;
  totalSoal: number;
  jumlahBenar: number;
  jumlahSalah: number;
  jumlahKosong: number;
  skorPerolehan: number;
  skorMaksimal: number;
  nilai: number; // 0 - 100
  kategoriCapaian: 'Mahir' | 'Cakap' | 'Dasar' | 'Perlu Intervensi Khusus';
  waktuMulai: string;
  waktuSelesai: string;
  durasiDetik: number;
  syncedToSpreadsheet?: boolean;
  spreadsheetSyncTime?: string;
  breakdownPerElement: {
    [key in DomainElement]: {
      total: number;
      benar: number;
      skorPerolehan: number;
      skorMaksimal: number;
    };
  };
}

export interface AppConfig {
  NAMA_APLIKASI: string;
  WILAYAH: string;
  TAHUN: string;
  JUMLAH_SOAL: number;
  DURASI_MENIT: number;
  NAMA_SHEET_PESERTA: string;
  NAMA_SHEET_JAWABAN: string;
  NAMA_SHEET_SOAL: string;
  NAMA_SHEET_HASIL: string;
  NAMA_SHEET_SEKOLAH: string;
}
