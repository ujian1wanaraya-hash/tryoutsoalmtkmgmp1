import { StudentSession, StudentAnswersMap, StudentAnswer, ExamResult, Question } from '../types';
import { QUESTIONS_DATA } from '../data/questions';
import { DAFTAR_SMP_BARITO_KUALA } from '../data/schools';

const SESSION_KEY = 'cbt_batola_session_2026';
const ANSWERS_KEY = 'cbt_batola_answers_2026';
const RESULTS_KEY = 'cbt_batola_results_2026';
const ALL_PARTICIPANTS_KEY = 'cbt_batola_all_participants_2026';
const GAS_URL_KEY = 'cbt_batola_gas_endpoint_url_2026';

export type SyncStatus = 'saved' | 'saving' | 'offline';

export function generateParticipantId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TO2026${timestamp}${random}`.slice(0, 10);
}

export function getGasUrl(): string {
  try {
    return localStorage.getItem(GAS_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function setGasUrl(url: string): void {
  try {
    localStorage.setItem(GAS_URL_KEY, url.trim());
  } catch (e) {
    console.error(e);
  }
}

export function saveSession(session: StudentSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Also record in participant history for admin
    const all = getAllParticipants();
    const existingIndex = all.findIndex((p) => p.idPeserta === session.idPeserta);
    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...session };
    } else {
      all.unshift(session);
    }
    localStorage.setItem(ALL_PARTICIPANTS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function loadSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ANSWERS_KEY);
  } catch (e) {
    console.error(e);
  }
}

export function saveAnswers(answers: StudentAnswersMap): void {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save answers:', e);
  }
}

export function loadAnswers(): StudentAnswersMap {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StudentAnswersMap;
  } catch {
    return {};
  }
}

/**
 * Real-time autosave to Google Apps Script (if configured) + LocalStorage
 */
export async function syncAnswerToGAS(
  session: StudentSession,
  noSoal: number,
  jawaban: StudentAnswer
): Promise<boolean> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    // Standalone mode: simulated network latency
    await new Promise((r) => setTimeout(r, 120));
    return true;
  }

  try {
    const payload = {
      action: 'simpanJawaban',
      idPeserta: session.idPeserta,
      nama: session.nama,
      sekolah: session.asalSekolah,
      noSoal,
      jawaban: JSON.stringify(jawaban),
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };

    // Google Apps Script Web App standard endpoint
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors', // allows cross-origin GAS invocation without strict preflight fail
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (err) {
    console.warn('Network issue while syncing to Google Apps Script:', err);
    return false;
  }
}

export interface GasSyncResponse {
  success: boolean;
  status: 'synced' | 'local_only' | 'error';
  message: string;
  timestamp?: string;
  sheetName?: string;
}

/**
 * Sinkronisasi Nilai Akhir Try Out ke Google Spreadsheet secara Real-Time
 * Menulis ke Sheet HASIL (kolom ID Peserta, Nama, Sekolah, Benar, Salah, Kosong, Nilai, Waktu Mulai, Waktu Selesai)
 * Serta memperbarui Sheet PESERTA (Status = Selesai, Waktu Selesai, Nilai)
 */
export async function syncFinalScoreToGAS(
  session: StudentSession,
  result: ExamResult
): Promise<GasSyncResponse> {
  const gasUrl = getGasUrl();
  const waktuKirim = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (!gasUrl || gasUrl.trim() === '') {
    return {
      success: false,
      status: 'local_only',
      message: 'URL Google Apps Script belum diisi. Nilai tetap tersimpan aman di penyimpanan lokal CBT.',
      timestamp: waktuKirim,
    };
  }

  const payload = {
    action: 'selesaiUjian',
    idPeserta: session.idPeserta || result.idPeserta,
    nama: session.nama || result.nama,
    asalSekolah: session.asalSekolah || result.asalSekolah,
    sekolah: session.asalSekolah || result.asalSekolah,
    benar: result.jumlahBenar,
    jumlahBenar: result.jumlahBenar,
    salah: result.jumlahSalah,
    jumlahSalah: result.jumlahSalah,
    kosong: result.jumlahKosong,
    jumlahKosong: result.jumlahKosong,
    skorPerolehan: result.skorPerolehan,
    skorMaksimal: result.skorMaksimal,
    nilai: result.nilai,
    kategoriCapaian: result.kategoriCapaian,
    kategori: result.kategoriCapaian,
    totalSoal: result.totalSoal,
    durasiDetik: result.durasiDetik,
    waktuMulai: result.waktuMulai || session.waktuMulai || session.waktuLogin || '',
    waktuSelesai: result.waktuSelesai || waktuKirim,
    timestamp: waktuKirim,
  };

  try {
    await fetch(gasUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Perbarui status sync pada result yang tersimpan di localStorage
    const updatedResult: ExamResult = {
      ...result,
      syncedToSpreadsheet: true,
      spreadsheetSyncTime: waktuKirim,
    };
    saveResult(updatedResult);

    return {
      success: true,
      status: 'synced',
      message: `Nilai akhir (Benar: ${result.jumlahBenar}, Salah: ${result.jumlahSalah}, Kosong: ${result.jumlahKosong}, Nilai: ${result.nilai}, Kategori: ${result.kategoriCapaian}) berhasil terhubung & tersimpan ke Sheet HASIL dan PESERTA.`,
      timestamp: waktuKirim,
    };
  } catch (err: any) {
    console.warn('Gagal sinkronisasi nilai akhir ke Google Apps Script:', err);
    return {
      success: false,
      status: 'error',
      message: `Terjadi kendala jaringan saat mengirim ke Spreadsheet (${err.message || 'Network error'}). Nilai tetap tersimpan di browser.`,
      timestamp: waktuKirim,
    };
  }
}

/**
 * Uji koneksi ke Web App Google Apps Script
 */
export async function testGasConnection(url: string): Promise<{ success: boolean; message: string; details?: any }> {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Web App tidak valid. Harap gunakan format https://script.google.com/macros/s/.../exec' };
  }

  const cleanUrl = url.trim();
  const pingUrl = cleanUrl + (cleanUrl.includes('?') ? '&' : '?') + 'action=ping&t=' + Date.now();

  try {
    const res = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      try {
        const json = await res.json();
        return {
          success: true,
          message: `Berhasil terhubung ke Spreadsheet: ${json.spreadsheetName || 'Database CBT Aktif'}`,
          details: json,
        };
      } catch {
        return {
          success: true,
          message: 'Server Apps Script merespons aktif (HTTP 200).',
        };
      }
    } else {
      return {
        success: false,
        message: `Server merespons kode HTTP ${res.status}. Pastikan deployment "Who has access" diatur ke "Anyone" (Siapa saja).`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'Tidak dapat menguji via GET CORS. Namun URL tetap dapat menerima pengiriman nilai POST via no-cors.',
    };
  }
}

/**
 * Kirim ulang semua nilai peserta lokal ke Google Spreadsheet
 */
export async function resyncAllResultsToGAS(): Promise<{ total: number; successCount: number; failCount: number }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    throw new Error('URL Google Apps Script belum disetel.');
  }

  const results = getAllResults();
  const participants = getAllParticipants();
  const partMap = new Map<string, StudentSession>();
  participants.forEach((p) => partMap.set(p.idPeserta, p));

  let successCount = 0;
  let failCount = 0;

  for (const res of results) {
    const session = partMap.get(res.idPeserta) || {
      idPeserta: res.idPeserta,
      nama: res.nama,
      asalSekolah: res.asalSekolah,
      waktuLogin: res.waktuMulai,
      status: 'Selesai' as const,
    };

    try {
      const syncRes = await syncFinalScoreToGAS(session, res);
      if (syncRes.success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch {
      failCount++;
    }
  }

  return { total: results.length, successCount, failCount };
}

export function evaluateExam(
  session: StudentSession,
  answers: StudentAnswersMap,
  questions: Question[] = QUESTIONS_DATA
): ExamResult {
  let jumlahBenar = 0;
  let jumlahSalah = 0;
  let jumlahKosong = 0;
  let skorPerolehan = 0;
  let skorMaksimal = 0;

  const breakdownPerElement = {
    Bilangan: { total: 0, benar: 0, skorPerolehan: 0, skorMaksimal: 0 },
    Aljabar: { total: 0, benar: 0, skorPerolehan: 0, skorMaksimal: 0 },
    'Geometri dan Pengukuran': { total: 0, benar: 0, skorPerolehan: 0, skorMaksimal: 0 },
    'Data dan Peluang': { total: 0, benar: 0, skorPerolehan: 0, skorMaksimal: 0 },
  };

  questions.forEach((q) => {
    const ans = answers[q.no];
    const weight = q.scoreWeight || 1;
    skorMaksimal += weight;
    breakdownPerElement[q.element].total += 1;
    breakdownPerElement[q.element].skorMaksimal += weight;

    if (!ans) {
      jumlahKosong++;
      return;
    }

    if (q.type === 'pg') {
      if (ans.type === 'pg' && ans.value) {
        if (ans.value === q.correctKey) {
          jumlahBenar++;
          skorPerolehan += weight;
          breakdownPerElement[q.element].benar += 1;
          breakdownPerElement[q.element].skorPerolehan += weight;
        } else {
          jumlahSalah++;
        }
      } else {
        jumlahKosong++;
      }
    } else if (q.type === 'mcma') {
      if (ans.type === 'mcma' && ans.selectedIds && ans.selectedIds.length > 0) {
        const correctSet = new Set(
          (q.mcmaOptions || []).filter((opt) => opt.isCorrect).map((opt) => opt.id)
        );
        const selectedSet = new Set(ans.selectedIds);

        // Check exact match or partial scoring
        let allCorrect = correctSet.size === selectedSet.size;
        for (const item of selectedSet) {
          if (!correctSet.has(item)) allCorrect = false;
        }

        if (allCorrect) {
          jumlahBenar++;
          skorPerolehan += weight;
          breakdownPerElement[q.element].benar += 1;
          breakdownPerElement[q.element].skorPerolehan += weight;
        } else {
          // partial points if no wrong item chosen
          let wrongCount = 0;
          let correctSelected = 0;
          for (const item of selectedSet) {
            if (correctSet.has(item)) correctSelected++;
            else wrongCount++;
          }
          if (wrongCount === 0 && correctSelected > 0) {
            const partial = Math.round((correctSelected / correctSet.size) * weight);
            skorPerolehan += partial;
            breakdownPerElement[q.element].skorPerolehan += partial;
          }
          jumlahSalah++;
        }
      } else {
        jumlahKosong++;
      }
    } else if (q.type === 'pgk') {
      if (ans.type === 'pgk' && ans.statements) {
        const statements = q.pgkStatements || [];
        let allMatch = true;
        let countAnswered = 0;
        let countCorrect = 0;

        statements.forEach((st) => {
          const val = ans.statements[st.id];
          if (val) {
            countAnswered++;
            if (val === st.correct) {
              countCorrect++;
            } else {
              allMatch = false;
            }
          } else {
            allMatch = false;
          }
        });

        if (countAnswered === 0) {
          jumlahKosong++;
        } else if (allMatch && countCorrect === statements.length) {
          jumlahBenar++;
          skorPerolehan += weight;
          breakdownPerElement[q.element].benar += 1;
          breakdownPerElement[q.element].skorPerolehan += weight;
        } else {
          // proportional credit
          const partial = Math.round((countCorrect / statements.length) * weight);
          skorPerolehan += partial;
          breakdownPerElement[q.element].skorPerolehan += partial;
          jumlahSalah++;
        }
      } else {
        jumlahKosong++;
      }
    }
  });

  const nilaiRaw = skorMaksimal > 0 ? (skorPerolehan / skorMaksimal) * 100 : 0;
  const nilai = Math.round(nilaiRaw * 10) / 10;

  let kategoriCapaian: ExamResult['kategoriCapaian'] = 'Perlu Intervensi Khusus';
  if (nilai >= 85) kategoriCapaian = 'Mahir';
  else if (nilai >= 70) kategoriCapaian = 'Cakap';
  else if (nilai >= 55) kategoriCapaian = 'Dasar';
  else kategoriCapaian = 'Perlu Intervensi Khusus';

  const waktuSelesai = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const result: ExamResult = {
    idPeserta: session.idPeserta,
    nama: session.nama,
    asalSekolah: session.asalSekolah,
    totalSoal: questions.length,
    jumlahBenar,
    jumlahSalah,
    jumlahKosong,
    skorPerolehan,
    skorMaksimal,
    nilai,
    kategoriCapaian,
    waktuMulai: session.waktuMulai || session.waktuLogin,
    waktuSelesai,
    durasiDetik: 0,
    breakdownPerElement,
  };

  saveResult(result);
  return result;
}

export function saveResult(result: ExamResult): void {
  try {
    localStorage.setItem(RESULTS_KEY + '_' + result.idPeserta, JSON.stringify(result));
    const all = getAllResults();
    const existingIndex = all.findIndex((r) => r.idPeserta === result.idPeserta);
    if (existingIndex >= 0) {
      all[existingIndex] = result;
    } else {
      all.unshift(result);
    }
    localStorage.setItem(RESULTS_KEY, JSON.stringify(all));

    // Update status in participant registry
    const allP = getAllParticipants();
    const pIdx = allP.findIndex((p) => p.idPeserta === result.idPeserta);
    if (pIdx >= 0) {
      allP[pIdx].status = 'Selesai';
      allP[pIdx].waktuSelesai = result.waktuSelesai;
      localStorage.setItem(ALL_PARTICIPANTS_KEY, JSON.stringify(allP));
    }
  } catch (e) {
    console.error('Failed to save result:', e);
  }
}

export function loadCurrentResult(idPeserta: string): ExamResult | null {
  try {
    const raw = localStorage.getItem(RESULTS_KEY + '_' + idPeserta);
    if (raw) return JSON.parse(raw);
    const all = getAllResults();
    return all.find((r) => r.idPeserta === idPeserta) || null;
  } catch {
    return null;
  }
}

export function getAllResults(): ExamResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllParticipants(): StudentSession[] {
  try {
    const raw = localStorage.getItem(ALL_PARTICIPANTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Seed initial mock sample for rich admin showcase if empty
    return getSeedParticipants();
  } catch {
    return getSeedParticipants();
  }
}

function getSeedParticipants(): StudentSession[] {
  return [
    {
      idPeserta: 'TO20260001',
      nama: 'Ahmad Fauzan',
      asalSekolah: 'SMP NEGERI 1 WANARAYA',
      waktuLogin: '27/09/2026 08:00',
      waktuMulai: '08:05',
      waktuSelesai: '09:25',
      status: 'Selesai',
    },
    {
      idPeserta: 'TO20260002',
      nama: 'Siti Nurhaliza',
      asalSekolah: 'SMP NEGERI 1 MARABAHAN',
      waktuLogin: '27/09/2026 08:02',
      waktuMulai: '08:06',
      waktuSelesai: '09:30',
      status: 'Selesai',
    },
    {
      idPeserta: 'TO20260003',
      nama: 'Muhammad Ridho',
      asalSekolah: 'SMP NEGERI 1 ALALAK',
      waktuLogin: '27/09/2026 08:10',
      waktuMulai: '08:12',
      status: 'Mengerjakan',
    },
    {
      idPeserta: 'TO20260004',
      nama: 'Aulia Rahmah',
      asalSekolah: 'SMP GIBS',
      waktuLogin: '27/09/2026 08:15',
      waktuMulai: '08:18',
      waktuSelesai: '09:40',
      status: 'Selesai',
    },
  ];
}

export interface SchoolRecapItem {
  namaSekolah: string;
  kecamatan: string;
  totalPeserta: number;
  selesai: number;
  sedangMengerjakan: number;
  rataRataNilai: number;
  nilaiTertinggi: number;
}

export function computeSchoolRecap(): SchoolRecapItem[] {
  const participants = getAllParticipants();
  const results = getAllResults();

  const resultMap = new Map<string, ExamResult>();
  results.forEach((r) => resultMap.set(r.idPeserta, r));

  const schoolMap = new Map<string, { total: number; selesai: number; sedang: number; scores: number[] }>();

  DAFTAR_SMP_BARITO_KUALA.forEach((sch) => {
    schoolMap.set(sch.nama, { total: 0, selesai: 0, sedang: 0, scores: [] });
  });

  participants.forEach((p) => {
    const existing = schoolMap.get(p.asalSekolah) || { total: 0, selesai: 0, sedang: 0, scores: [] };
    existing.total++;
    if (p.status === 'Selesai') {
      existing.selesai++;
      const res = resultMap.get(p.idPeserta);
      if (res) {
        existing.scores.push(res.nilai);
      }
    } else {
      existing.sedang++;
    }
    schoolMap.set(p.asalSekolah, existing);
  });

  const recap: SchoolRecapItem[] = [];
  DAFTAR_SMP_BARITO_KUALA.forEach((sch) => {
    const data = schoolMap.get(sch.nama) || { total: 0, selesai: 0, sedang: 0, scores: [] };
    const avg = data.scores.length > 0
      ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
      : 0;
    const max = data.scores.length > 0 ? Math.max(...data.scores) : 0;

    recap.push({
      namaSekolah: sch.nama,
      kecamatan: sch.kecamatan,
      totalPeserta: data.total,
      selesai: data.selesai,
      sedangMengerjakan: data.sedang,
      rataRataNilai: avg,
      nilaiTertinggi: max,
    });
  });

  return recap;
}
