/**
 * DAFTAR RESMI SMP NEGERI DAN SWASTA KABUPATEN BARITO KUALA - KALIMANTAN SELATAN
 * Data direktori sekolah tahun 2026 (62 SMP: 57 Negeri dan 5 Swasta di 17 Kecamatan)
 * SUMBER: File direktori resmi yang diunggah - TIDAK DIUBAH ejaan ataupun namanya.
 */

export interface SchoolItem {
  no: number;
  kecamatan: string;
  nama: string;
  status: 'Negeri' | 'Swasta';
}

export const DAFTAR_SMP_BARITO_KUALA: SchoolItem[] = [
  { no: 1, kecamatan: 'Alalak', nama: 'SMP NEGERI 1 ALALAK', status: 'Negeri' },
  { no: 2, kecamatan: 'Alalak', nama: 'SMP NEGERI 2 ALALAK', status: 'Negeri' },
  { no: 3, kecamatan: 'Alalak', nama: 'SMP NEGERI 3 ALALAK', status: 'Negeri' },
  { no: 4, kecamatan: 'Alalak', nama: 'SMP NEGERI 4 ALALAK', status: 'Negeri' },
  { no: 5, kecamatan: 'Alalak', nama: 'SMP NEGERI 5 ALALAK', status: 'Negeri' },
  { no: 6, kecamatan: 'Alalak', nama: 'SMP NEGERI 6 ALALAK', status: 'Negeri' },
  { no: 7, kecamatan: 'Alalak', nama: 'SMP GIBS', status: 'Swasta' },
  { no: 8, kecamatan: 'Alalak', nama: 'SMP TAHFIZH TERPADU EL QUDWAH', status: 'Swasta' },
  { no: 9, kecamatan: 'Alalak', nama: 'SMP TAHFIDZ PLUS ISTANA AL QURAN', status: 'Swasta' },
  { no: 10, kecamatan: 'Alalak', nama: 'SMP TAHFIZH QURAN TAMAN CINTA AL-QURAN', status: 'Swasta' },
  { no: 11, kecamatan: 'Tamban', nama: 'SMP NEGERI 1 TAMBAN', status: 'Negeri' },
  { no: 12, kecamatan: 'Tamban', nama: 'SMP NEGERI 2 TAMBAN', status: 'Negeri' },
  { no: 13, kecamatan: 'Tamban', nama: 'SMP NEGERI 3 TAMBAN', status: 'Negeri' },
  { no: 14, kecamatan: 'Tamban', nama: 'SMP NEGERI 4 TAMBAN', status: 'Negeri' },
  { no: 15, kecamatan: 'Tamban', nama: 'SMP NEGERI 5 TAMBAN', status: 'Negeri' },
  { no: 16, kecamatan: 'Tamban', nama: 'SMP NEGERI 6 TAMBAN', status: 'Negeri' },
  { no: 17, kecamatan: 'Tamban', nama: 'SMP NEGERI 7 TAMBAN', status: 'Negeri' },
  { no: 18, kecamatan: 'Tamban', nama: 'SMP NEGERI 8 TAMBAN', status: 'Negeri' },
  { no: 19, kecamatan: 'Rantau Badauh', nama: 'SMP NEGERI 1 RANTAU BADAUH', status: 'Negeri' },
  { no: 20, kecamatan: 'Rantau Badauh', nama: 'SMP NEGERI 2 RANTAU BADAUH', status: 'Negeri' },
  { no: 21, kecamatan: 'Rantau Badauh', nama: 'SMP NEGERI 3 SATU ATAP RANTAU BADAUH', status: 'Negeri' },
  { no: 22, kecamatan: 'Rantau Badauh', nama: 'SMP NEGERI SATAP 4 RANTAU BADAUH', status: 'Negeri' },
  { no: 23, kecamatan: 'Wanaraya', nama: 'SMP NEGERI 1 WANARAYA', status: 'Negeri' },
  { no: 24, kecamatan: 'Wanaraya', nama: 'SMP NEGERI 2 BELAWANG', status: 'Negeri' },
  { no: 25, kecamatan: 'Wanaraya', nama: 'SMP NEGERI 3 BELAWANG', status: 'Negeri' },
  { no: 26, kecamatan: 'Wanaraya', nama: 'SMP NEGERI 5 BELAWANG', status: 'Negeri' },
  { no: 27, kecamatan: 'Mandastana', nama: 'SMP NEGERI 1 MANDASTANA', status: 'Negeri' },
  { no: 28, kecamatan: 'Mandastana', nama: 'SMP NEGERI 3 MANDASTANA', status: 'Negeri' },
  { no: 29, kecamatan: 'Mandastana', nama: 'SMP NEGERI 5 MANDASTANA', status: 'Negeri' },
  { no: 30, kecamatan: 'Mandastana', nama: 'SMP INTAN ILMU', status: 'Swasta' },
  { no: 31, kecamatan: 'Tabunganen', nama: 'SMP NEGERI 1 TABUNGANEN', status: 'Negeri' },
  { no: 32, kecamatan: 'Tabunganen', nama: 'SMP NEGERI 2 TABUNGANEN', status: 'Negeri' },
  { no: 33, kecamatan: 'Tabunganen', nama: 'SMP NEGERI 3 TABUNGANEN SATAP', status: 'Negeri' },
  { no: 34, kecamatan: 'Tabunganen', nama: 'SMP NEGERI 4 TABUNGANEN SATAP', status: 'Negeri' },
  { no: 35, kecamatan: 'Marabahan', nama: 'SMP NEGERI 1 MARABAHAN', status: 'Negeri' },
  { no: 36, kecamatan: 'Marabahan', nama: 'SMP NEGERI 3 MARABAHAN', status: 'Negeri' },
  { no: 37, kecamatan: 'Marabahan', nama: 'SMP NEGERI 4 MARABAHAN', status: 'Negeri' },
  { no: 38, kecamatan: 'Marabahan', nama: 'SMP NEGERI 5 MARABAHAN', status: 'Negeri' },
  { no: 39, kecamatan: 'Barambai', nama: 'SMP NEGERI 1 BARAMBAI', status: 'Negeri' },
  { no: 40, kecamatan: 'Barambai', nama: 'SMP NEGERI 2 BARAMBAI', status: 'Negeri' },
  { no: 41, kecamatan: 'Barambai', nama: 'SMP NEGERI 3 SATU ATAP BARAMBAI', status: 'Negeri' },
  { no: 42, kecamatan: 'Bakumpai', nama: 'SMP NEGERI 2 BAKUMPAI', status: 'Negeri' },
  { no: 43, kecamatan: 'Bakumpai', nama: 'SMP NEGERI 2 MARABAHAN', status: 'Negeri' },
  { no: 44, kecamatan: 'Bakumpai', nama: 'SMP NEGERI 3 BAKUMPAI', status: 'Negeri' },
  { no: 45, kecamatan: 'Anjir Muara', nama: 'SMP NEGERI 1 ANJIR MUARA', status: 'Negeri' },
  { no: 46, kecamatan: 'Anjir Muara', nama: 'SMP NEGERI 2 ANJIR MUARA', status: 'Negeri' },
  { no: 47, kecamatan: 'Anjir Muara', nama: 'SMP NEGERI 3 ANJIR MUARA', status: 'Negeri' },
  { no: 48, kecamatan: 'Kuripan', nama: 'SMP NEGERI 1 KURIPAN', status: 'Negeri' },
  { no: 49, kecamatan: 'Kuripan', nama: 'SMP NEGERI 2 KURIPAN', status: 'Negeri' },
  { no: 50, kecamatan: 'Kuripan', nama: 'SMP NEGERI 3 KURIPAN', status: 'Negeri' },
  { no: 51, kecamatan: 'Belawang', nama: 'SMP NEGERI 1 BELAWANG', status: 'Negeri' },
  { no: 52, kecamatan: 'Belawang', nama: 'SMP NEGERI 4 BELAWANG', status: 'Negeri' },
  { no: 53, kecamatan: 'Anjir Pasar', nama: 'SMP NEGERI 1 ANJIR PASAR', status: 'Negeri' },
  { no: 54, kecamatan: 'Anjir Pasar', nama: 'SMP NEGERI 2 ANJIR PASAR', status: 'Negeri' },
  { no: 55, kecamatan: 'Jejangkit', nama: 'SMP NEGERI 2 MANDASTANA', status: 'Negeri' },
  { no: 56, kecamatan: 'Jejangkit', nama: 'SMP NEGERI 4 MANDASTANA', status: 'Negeri' },
  { no: 57, kecamatan: 'Tabukan', nama: 'SMP NEGERI 1 TABUKAN', status: 'Negeri' },
  { no: 58, kecamatan: 'Tabukan', nama: 'SMP NEGERI 2 TABUKAN', status: 'Negeri' },
  { no: 59, kecamatan: 'Mekarsari', nama: 'SMP NEGERI 1 MEKARSARI', status: 'Negeri' },
  { no: 60, kecamatan: 'Mekarsari', nama: 'SMP NEGERI 2 SATU ATAP MEKARSARI', status: 'Negeri' },
  { no: 61, kecamatan: 'Cerbon', nama: 'SMP NEGERI 1 CERBON', status: 'Negeri' },
  { no: 62, kecamatan: 'Cerbon', nama: 'SMP NEGERI 2 CERBON', status: 'Negeri' },
];

export const NAMA_SEKOLAH_LIST: string[] = DAFTAR_SMP_BARITO_KUALA.map((s) => s.nama);
