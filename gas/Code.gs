/**
 * CBT ONLINE LATIHAN TRY OUT MATEMATIKA SMP SE-KABUPATEN BARITO KUALA TAHUN 2026
 * Backend Google Apps Script (Code.gs / Kode.gs)
 * Menghubungkan Google Spreadsheet sebagai Database dengan Antarmuka CBT Web
 *
 * STRUKTUR DATABASE 5 SHEET RESMI:
 * 1. PESERTA : ID Peserta | Timestamp | Nama Peserta | Asal Sekolah | Status | Waktu Mulai | Waktu Selesai | Nilai
 * 2. JAWABAN : ID Peserta | Nama Peserta | Asal Sekolah | No Soal | Jawaban Siswa | Status Kunci | Skor | Timestamp
 * 3. HASIL   : ID Peserta | Nama Peserta | Asal Sekolah | Benar | Salah | Kosong | Nilai | Kategori Capaian | Waktu Mulai | Waktu Selesai
 * 4. SOAL    : No | Jenis | Stimulus | Soal | Opsi A | Opsi B | Opsi C | Opsi D | Kunci | Skor | Materi | Level (30 Soal Terisi Otomatis)
 * 5. SEKOLAH : No | Nama Sekolah | Kecamatan | Status (62 SMP Barito Kuala Terisi Otomatis)
 */

// SPREADSHEET_ID (Opsional): Isi HANYA jika script dibuat terpisah (Standalone di script.google.com).
// Jika script dibuka melalui menu Ekstensi -> Apps Script pada Google Spreadsheet, biarkan string kosong "".
const SPREADSHEET_ID = "";

const CONFIG = {
  NAMA_APLIKASI: "CBT Online Try Out Matematika SMP",
  WILAYAH: "Kabupaten Barito Kuala",
  TAHUN: "2026",
  JUMLAH_SOAL: 30,
  SKOR_MAKSIMAL: 52,
  DURASI_MENIT: 90,
  NAMA_SHEET_PESERTA: "PESERTA",
  NAMA_SHEET_JAWABAN: "JAWABAN",
  NAMA_SHEET_SOAL: "SOAL",
  NAMA_SHEET_HASIL: "HASIL",
  NAMA_SHEET_SEKOLAH: "SEKOLAH"
};

/**
 * 1. Web App Entrypoint (GET Request)
 * Menangani HTTP GET dari web app atau pembukaan URL di browser.
 * Dilengkapi penanganan 'e' aman agar TIDAK ERROR saat di-klik "Jalankan" (Run) di editor Apps Script!
 */
function doGet(e) {
  if (!e) {
    e = { parameter: {} };
  }
  const params = e.parameter || {};
  const action = params.action;
  
  if (action === 'getSekolah') {
    return jsonResponse(getDaftarSekolah());
  }
  
  if (action === 'getRekap') {
    return jsonResponse(getRekapSekolah());
  }

  if (action === 'getHasil') {
    return jsonResponse(getHasilSiswa(params.idPeserta));
  }

  if (action === 'ping') {
    const ss = getDb();
    return jsonResponse({
      status: 'success',
      appName: CONFIG.NAMA_APLIKASI,
      wilayah: CONFIG.WILAYAH,
      tahun: CONFIG.TAHUN,
      spreadsheetName: ss ? ss.getName() : 'Spreadsheet belum terhubung',
      connected: !!ss,
      timestamp: Utilities.formatDate(new Date(), "GMT+8", "dd/MM/yyyy HH:mm:ss")
    });
  }

  // Tampilan status saat Web App dibuka langsung di browser
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle(CONFIG.NAMA_APLIKASI + " - " + CONFIG.WILAYAH)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    const ss = getDb();
    const sheetName = ss ? ss.getName() : "Spreadsheet belum terhubung";
    return HtmlService.createHtmlOutput(
      "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:640px;margin:40px auto;padding:28px;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);background:#ffffff;'>" +
      "<div style='display:inline-block;padding:6px 12px;background:#dcfce7;color:#15803d;font-weight:700;font-size:12px;border-radius:9999px;margin-bottom:12px;'>SERVER CBT AKTIF</div>" +
      "<h2 style='color:#0f172a;margin:0 0 8px 0;font-size:22px;'>Backend CBT Google Apps Script Berhasil Aktif!</h2>" +
      "<p style='color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px 0;'>Web App Apps Script untuk <b>CBT Try Out Matematika SMP Kab. Barito Kuala 2026</b> telah siap menerima koneksi API.</p>" +
      "<div style='background:#f8fafc;border-left:4px solid #4f46e5;padding:14px 16px;border-radius:8px;font-size:13px;color:#334155;line-height:1.6;margin-bottom:20px;'>" +
      "<strong>Petunjuk Database (5 Sheet Resmi):</strong><br/>" +
      "1. Untuk membuat & mengisi ke-5 Sheet secara otomatis (termasuk 30 butir soal dan 62 sekolah), pilih fungsi <code>inisialisasiDatabase</code> pada toolbar editor Apps Script, lalu klik <strong>Jalankan (Run)</strong>.<br/>" +
      "2. Salin URL Web App ini dan tempelkan pada menu <strong>Integrasi Google Sheets</strong> di aplikasi CBT Anda.<br/>" +
      "3. <em>Catatan:</em> Fungsi <code>doGet</code> dan <code>doPost</code> berjalan otomatis saat ada aksi dari aplikasi web CBT." +
      "</div>" +
      "<div style='color:#64748b;font-size:12px;'>Koneksi Spreadsheet: <b>" + sheetName + "</b></div>" +
      "</div>"
    ).setTitle(CONFIG.NAMA_APLIKASI + " - Backend API")
     .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
}

/**
 * 2. Web App Entrypoint (POST Request - Autosave & API)
 */
function doPost(e) {
  try {
    if (!e) {
      e = { parameter: {}, postData: null };
    }
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (pErr) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Gabungkan parameter jika dikirim via URL query
    if (e.parameter) {
      data = Object.assign({}, e.parameter, data);
    }

    const action = data.action;

    if (action === 'loginPeserta') {
      const res = loginPeserta(data.idPeserta, data.nama, data.asalSekolah, data.waktuLogin);
      return jsonResponse(res);
    }

    if (action === 'simpanJawaban') {
      const res = simpanJawaban(data.idPeserta, data.nama, data.sekolah, data.noSoal, data.jawaban);
      return jsonResponse(res);
    }

    if (action === 'selesaiUjian') {
      const res = prosesSelesaiUjian(data.idPeserta, data);
      return jsonResponse(res);
    }

    return jsonResponse({ status: 'error', message: 'Action tidak dikenali: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Helper JSON response with CORS header
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mengambil Spreadsheet aktif / terhubung
 */
function getDb() {
  if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Normalisasi jawaban siswa dari format JSON CBT (StudentAnswer)
 * menjadi teks jawaban yang mudah dibaca dan dapat dicocokkan dengan kunci
 */
function parseStudentAnswer(raw) {
  if (raw === undefined || raw === null || raw === "") {
    return { answered: false, type: 'empty', displayText: "", matchValue: "" };
  }
  
  let val = raw;
  if (typeof val === 'string') {
    val = val.trim();
    if (val.startsWith('{') && val.endsWith('}')) {
      try {
        val = JSON.parse(val);
      } catch (e) {}
    }
  }

  if (typeof val === 'object' && val !== null) {
    if (val.type === 'pg') {
      const v = (val.value || '').toString().trim().toUpperCase();
      return { answered: !!v, type: 'pg', displayText: v, matchValue: v };
    }
    if (val.type === 'mcma') {
      const ids = Array.isArray(val.selectedIds) ? val.selectedIds.map(x => String(x).trim().toUpperCase()).sort() : [];
      const joined = ids.join(', ');
      return { answered: ids.length > 0, type: 'mcma', displayText: joined, matchValue: joined, selectedIds: ids };
    }
    if (val.type === 'pgk') {
      const stmts = val.statements || {};
      const keys = Object.keys(stmts).sort();
      const parts = [];
      for (let k = 0; k < keys.length; k++) {
        parts.push((k + 1) + ':' + stmts[keys[k]]);
      }
      const joined = parts.join('; ');
      return { answered: parts.length > 0, type: 'pgk', displayText: joined, matchValue: joined, statements: stmts };
    }
  }

  const str = String(val).trim();
  return { answered: str !== "", type: 'plain', displayText: str, matchValue: str.toUpperCase() };
}

/**
 * 3. Ambil Daftar 62 Sekolah Resmi Barito Kuala dari Sheet SEKOLAH
 */
function getDaftarSekolah() {
  const ss = getDb();
  if (!ss) return [];
  
  let sheet = ss.getSheetByName(CONFIG.NAMA_SHEET_SEKOLAH);
  if (!sheet) {
    inisialisasiDatabase();
    sheet = ss.getSheetByName(CONFIG.NAMA_SHEET_SEKOLAH);
  }
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1]) {
      list.push({
        no: rows[i][0],
        nama: rows[i][1],
        kecamatan: rows[i][2] || '',
        status: rows[i][3] || ''
      });
    }
  }
  return list;
}

/**
 * 4. Simpan Data Peserta saat Login
 * SHEET 1: PESERTA
 * Kolom: ID Peserta | Timestamp | Nama Peserta | Asal Sekolah | Status | Waktu Mulai | Waktu Selesai | Nilai
 */
function loginPeserta(idPeserta, nama, asalSekolah, waktuLogin) {
  const ss = getDb();
  if (!ss) throw new Error("Spreadsheet tidak terhubung. Buka script dari Google Spreadsheet atau isi SPREADSHEET_ID di Kode.gs");
  
  let sheet = ss.getSheetByName(CONFIG.NAMA_SHEET_PESERTA);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.NAMA_SHEET_PESERTA);
    sheet.appendRow(["ID Peserta", "Timestamp", "Nama Peserta", "Asal Sekolah", "Status", "Waktu Mulai", "Waktu Selesai", "Nilai"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#d1fae5").setHorizontalAlignment("center");
    sheet.setRowHeight(1, 32);
    sheet.setFrozenRows(1);
  }

  const cleanNama = (nama || '').trim().replace(/s+/g, ' ');
  const waktu = waktuLogin || Utilities.formatDate(new Date(), "GMT+8", "dd/MM/yyyy HH:mm:ss");
  const waktuMulai = Utilities.formatDate(new Date(), "GMT+8", "HH:mm:ss");

  // Cari apakah peserta sudah pernah login sebelumnya (Upsert per idPeserta)
  const pRows = sheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < pRows.length; i++) {
    if (pRows[i][0] == idPeserta) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 2).setValue(waktu);
    sheet.getRange(foundRow, 3).setValue(cleanNama);
    sheet.getRange(foundRow, 4).setValue(asalSekolah);
    sheet.getRange(foundRow, 5).setValue("Mengerjakan");
  } else {
    sheet.appendRow([
      idPeserta,
      waktu,
      cleanNama,
      asalSekolah,
      "Mengerjakan",
      waktuMulai,
      "", // Waktu selesai
      ""  // Nilai
    ]);
  }
  
  return { status: 'success', idPeserta: idPeserta };
}

/**
 * 5. SIMPAN JAWABAN REAL-TIME DENGAN MEKANISME UPSERT
 * SHEET 2: JAWABAN
 * Kolom: ID Peserta | Nama Peserta | Asal Sekolah | No Soal | Jawaban Siswa | Status Kunci | Skor | Timestamp
 */
function simpanJawaban(idPeserta, nama, sekolah, noSoal, jawabanStr) {
  const ss = getDb();
  if (!ss) throw new Error("Spreadsheet tidak terhubung. Buka script dari Google Spreadsheet atau isi SPREADSHEET_ID di Kode.gs");
  
  let sheet = ss.getSheetByName(CONFIG.NAMA_SHEET_JAWABAN);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.NAMA_SHEET_JAWABAN);
    sheet.appendRow(["ID Peserta", "Nama Peserta", "Asal Sekolah", "No Soal", "Jawaban Siswa", "Status Kunci", "Skor", "Timestamp"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e0e7ff").setHorizontalAlignment("center");
    sheet.setRowHeight(1, 32);
    sheet.setFrozenRows(1);
  }

  const timestamp = Utilities.formatDate(new Date(), "GMT+8", "HH:mm:ss");
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;
  
  // Cari apakah jawaban noSoal untuk idPeserta ini sudah ada (Upsert)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == idPeserta && data[i][3] == noSoal) {
      foundRow = i + 1; // 1-indexed row
      break;
    }
  }

  // Parse jawaban menjadi teks bersih yang mudah dibaca di Spreadsheet
  const parsed = parseStudentAnswer(jawabanStr);
  const cleanJawaban = parsed.displayText;

  // Evaluasi otomatis kunci & skor jika Sheet SOAL tersedia
  let statusKunci = "";
  let skor = "";
  const sheetSoal = ss.getSheetByName(CONFIG.NAMA_SHEET_SOAL);
  if (sheetSoal && parsed.answered) {
    const sData = sheetSoal.getDataRange().getValues();
    for (let s = 1; s < sData.length; s++) {
      if (sData[s][0] == noSoal) {
        const jenis = String(sData[s][1] || '').trim().toUpperCase();
        const kunci = String(sData[s][8] || '').trim();
        const bobot = Number(sData[s][9] || 1);

        if (kunci) {
          if (jenis === 'PG') {
            if (parsed.matchValue === kunci.toUpperCase()) {
              statusKunci = "Benar";
              skor = bobot;
            } else {
              statusKunci = "Salah";
              skor = 0;
            }
          } else if (jenis === 'MCMA') {
            const kunciItems = kunci.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
            const userItems = parsed.selectedIds || cleanJawaban.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
            const isMatch = kunciItems.length === userItems.length && kunciItems.every(x => userItems.indexOf(x) !== -1);
            if (isMatch) {
              statusKunci = "Benar";
              skor = bobot;
            } else {
              // Parsial jika ada yang benar tanpa pilihan yang salah
              let wrongCount = 0;
              let correctCount = 0;
              userItems.forEach(u => {
                if (kunciItems.indexOf(u) !== -1) correctCount++;
                else wrongCount++;
              });
              if (wrongCount === 0 && correctCount > 0) {
                statusKunci = "Salah (Sebagian)";
                skor = Math.round((correctCount / kunciItems.length) * bobot);
              } else {
                statusKunci = "Salah";
                skor = 0;
              }
            }
          } else {
            // PGK atau jenis lainnya
            if (parsed.matchValue === kunci.toUpperCase()) {
              statusKunci = "Benar";
              skor = bobot;
            } else {
              statusKunci = "Salah";
              skor = 0;
            }
          }
        }
        break;
      }
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 5).setValue(cleanJawaban);
    if (statusKunci) sheet.getRange(foundRow, 6).setValue(statusKunci);
    if (skor !== "") sheet.getRange(foundRow, 7).setValue(skor);
    sheet.getRange(foundRow, 8).setValue(timestamp);
  } else {
    sheet.appendRow([
      idPeserta,
      nama,
      sekolah,
      noSoal,
      cleanJawaban,
      statusKunci,
      skor,
      timestamp
    ]);
  }
  
  return { status: 'success', idPeserta: idPeserta, noSoal: noSoal, cleanJawaban: cleanJawaban, statusKunci: statusKunci, skor: skor };
}

/**
 * 6. KOREKSI JAWABAN & PENYIMPANAN NILAI AKHIR KE GOOGLE SPREADSHEET
 * SHEET 3: HASIL
 * Kolom: ID Peserta | Nama Peserta | Asal Sekolah | Benar | Salah | Kosong | Nilai | Kategori Capaian | Waktu Mulai | Waktu Selesai
 * Menghubungkan secara 100% konsisten dengan data dashboard aplikasi CBT.
 */
function prosesSelesaiUjian(idPeserta, clientData) {
  const ss = getDb();
  if (!ss) throw new Error("Spreadsheet tidak terhubung. Buka script dari Google Spreadsheet atau isi SPREADSHEET_ID di Kode.gs");
  
  let sheetHasil = ss.getSheetByName(CONFIG.NAMA_SHEET_HASIL);
  let sheetPeserta = ss.getSheetByName(CONFIG.NAMA_SHEET_PESERTA);
  let sheetJawaban = ss.getSheetByName(CONFIG.NAMA_SHEET_JAWABAN);
  let sheetSoal = ss.getSheetByName(CONFIG.NAMA_SHEET_SOAL);

  if (!sheetHasil) {
    sheetHasil = ss.insertSheet(CONFIG.NAMA_SHEET_HASIL);
  }

  // Pastikan Header Sheet HASIL sesuai format resmi 10 Kolom
  const lastCol = Math.max(sheetHasil.getLastColumn(), 10);
  const existingHeaders = sheetHasil.getLastRow() >= 1 ? sheetHasil.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (!existingHeaders || existingHeaders.length < 10 || existingHeaders[7] !== "Kategori Capaian" || existingHeaders[3] !== "Benar") {
    sheetHasil.getRange(1, 1, 1, 10).setValues([[
      "ID Peserta", "Nama Peserta", "Asal Sekolah", "Benar", "Salah", "Kosong", "Nilai", "Kategori Capaian", "Waktu Mulai", "Waktu Selesai"
    ]]);
    sheetHasil.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#fef3c7").setHorizontalAlignment("center");
    sheetHasil.setRowHeight(1, 32);
    sheetHasil.setFrozenRows(1);
    sheetHasil.setColumnWidth(1, 140);
    sheetHasil.setColumnWidth(2, 200);
    sheetHasil.setColumnWidth(3, 240);
    sheetHasil.setColumnWidth(4, 80);
    sheetHasil.setColumnWidth(5, 80);
    sheetHasil.setColumnWidth(6, 80);
    sheetHasil.setColumnWidth(7, 90);
    sheetHasil.setColumnWidth(8, 160);
    sheetHasil.setColumnWidth(9, 120);
    sheetHasil.setColumnWidth(10, 120);
  }

  // 1. Ekstrak data yang dikirim langsung dari dashboard CBT Web
  let namaSiswa = (clientData && (clientData.nama || clientData.namaSiswa || clientData.namaPeserta)) || "";
  let sekolahSiswa = (clientData && (clientData.asalSekolah || clientData.sekolah || clientData.sekolahSiswa)) || "";

  let benar = null;
  if (clientData) {
    if (clientData.benar !== undefined && clientData.benar !== null && clientData.benar !== '') {
      benar = Number(clientData.benar);
    } else if (clientData.jumlahBenar !== undefined && clientData.jumlahBenar !== null && clientData.jumlahBenar !== '') {
      benar = Number(clientData.jumlahBenar);
    }
  }

  let salah = null;
  if (clientData) {
    if (clientData.salah !== undefined && clientData.salah !== null && clientData.salah !== '') {
      salah = Number(clientData.salah);
    } else if (clientData.jumlahSalah !== undefined && clientData.jumlahSalah !== null && clientData.jumlahSalah !== '') {
      salah = Number(clientData.jumlahSalah);
    }
  }

  let kosong = null;
  if (clientData) {
    if (clientData.kosong !== undefined && clientData.kosong !== null && clientData.kosong !== '') {
      kosong = Number(clientData.kosong);
    } else if (clientData.jumlahKosong !== undefined && clientData.jumlahKosong !== null && clientData.jumlahKosong !== '') {
      kosong = Number(clientData.jumlahKosong);
    }
  }

  let nilai = null;
  if (clientData && clientData.nilai !== undefined && clientData.nilai !== null && clientData.nilai !== '') {
    nilai = Number(clientData.nilai);
  }

  let kategoriCapaian = (clientData && (clientData.kategoriCapaian || clientData.kategori)) || "";
  let waktuMulai = (clientData && clientData.waktuMulai) || "";
  let waktuSelesai = (clientData && clientData.waktuSelesai) || Utilities.formatDate(new Date(), "GMT+8", "HH:mm:ss");

  // Jika nama, sekolah, atau waktu mulai belum terisi, cari di sheet PESERTA atau JAWABAN
  if (!namaSiswa || !sekolahSiswa || !waktuMulai) {
    if (sheetPeserta) {
      const pRows = sheetPeserta.getDataRange().getValues();
      for (let p = 1; p < pRows.length; p++) {
        if (pRows[p][0] == idPeserta) {
          if (!namaSiswa) namaSiswa = pRows[p][2];
          if (!sekolahSiswa) sekolahSiswa = pRows[p][3];
          if (!waktuMulai) waktuMulai = pRows[p][5];
          break;
        }
      }
    }
    if ((!namaSiswa || !sekolahSiswa) && sheetJawaban) {
      const jRows = sheetJawaban.getDataRange().getValues();
      for (let j = 1; j < jRows.length; j++) {
        if (jRows[j][0] == idPeserta) {
          if (!namaSiswa) namaSiswa = jRows[j][1];
          if (!sekolahSiswa) sekolahSiswa = jRows[j][2];
          break;
        }
      }
    }
  }

  // 2. Jika nilai atau benar belum dikirim dari dashboard CBT, lakukan kalkulasi fallback yang 100% identik dengan dashboard CBT
  if (nilai === null || benar === null || salah === null || kosong === null) {
    const soalData = sheetSoal ? sheetSoal.getDataRange().getValues() : [];
    const soalMap = {};
    for (let i = 1; i < soalData.length; i++) {
      const no = soalData[i][0];
      soalMap[no] = {
        jenis: String(soalData[i][1] || 'PG').trim().toUpperCase(),
        kunci: String(soalData[i][8] || '').trim(),
        bobot: Number(soalData[i][9]) || 1
      };
    }

    const jawabanRows = sheetJawaban ? sheetJawaban.getDataRange().getValues() : [];
    const jawabanSiswa = {};
    for (let i = 1; i < jawabanRows.length; i++) {
      if (jawabanRows[i][0] == idPeserta) {
        jawabanSiswa[jawabanRows[i][3]] = jawabanRows[i][4];
      }
    }

    benar = 0;
    salah = 0;
    kosong = 0;
    let skorTotal = 0;
    let maxSkor = 0;
    const totalSoal = CONFIG.JUMLAH_SOAL || 30;

    for (let n = 1; n <= totalSoal; n++) {
      const rawAns = jawabanSiswa[n];
      const parsed = parseStudentAnswer(rawAns);
      const sInfo = soalMap[n] || { jenis: 'PG', kunci: '', bobot: 1 };
      const weight = sInfo.bobot;
      maxSkor += weight;

      if (!parsed.answered || !parsed.displayText) {
        kosong++;
      } else {
        const jenis = sInfo.jenis;
        const kunci = sInfo.kunci;

        if (jenis === 'PG') {
          if (parsed.matchValue === kunci.toUpperCase()) {
            benar++;
            skorTotal += weight;
          } else {
            salah++;
          }
        } else if (jenis === 'MCMA') {
          const kunciItems = kunci.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
          const userItems = parsed.selectedIds || parsed.displayText.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
          const isMatch = kunciItems.length === userItems.length && kunciItems.every(x => userItems.indexOf(x) !== -1);
          if (isMatch) {
            benar++;
            skorTotal += weight;
          } else {
            let wrongCount = 0;
            let correctCount = 0;
            userItems.forEach(u => {
              if (kunciItems.indexOf(u) !== -1) correctCount++;
              else wrongCount++;
            });
            if (wrongCount === 0 && correctCount > 0) {
              const partial = Math.round((correctCount / kunciItems.length) * weight);
              skorTotal += partial;
            }
            salah++;
          }
        } else {
          // PGK
          if (parsed.matchValue === kunci.toUpperCase()) {
            benar++;
            skorTotal += weight;
          } else {
            salah++;
          }
        }
      }
    }

    const effectiveMax = maxSkor > 0 ? maxSkor : (CONFIG.SKOR_MAKSIMAL || 52);
    nilai = Math.round((skorTotal / effectiveMax) * 100 * 10) / 10;
  }

  // 3. Tentukan Kategori Capaian sesuai standar asesmen dashboard CBT
  if (!kategoriCapaian) {
    if (nilai >= 85) {
      kategoriCapaian = 'Mahir';
    } else if (nilai >= 70) {
      kategoriCapaian = 'Cakap';
    } else if (nilai >= 55) {
      kategoriCapaian = 'Dasar';
    } else {
      kategoriCapaian = 'Perlu Intervensi Khusus';
    }
  }

  // 4. Simpan / Perbarui (UPSERT) ke Sheet HASIL
  const hasilRows = sheetHasil.getDataRange().getValues();
  let foundHasilRow = -1;
  for (let h = 1; h < hasilRows.length; h++) {
    if (hasilRows[h][0] == idPeserta) {
      foundHasilRow = h + 1; // 1-indexed row
      break;
    }
  }

  const rowValues = [
    idPeserta,
    namaSiswa,
    sekolahSiswa,
    benar,
    salah,
    kosong,
    nilai,
    kategoriCapaian,
    waktuMulai,
    waktuSelesai
  ];

  if (foundHasilRow > 0) {
    sheetHasil.getRange(foundHasilRow, 1, 1, 10).setValues([rowValues]);
  } else {
    sheetHasil.appendRow(rowValues);
    foundHasilRow = sheetHasil.getLastRow();
  }

  // Terapkan format rapi pada sel di Sheet HASIL
  sheetHasil.getRange(foundHasilRow, 1).setHorizontalAlignment("center"); // ID Peserta
  sheetHasil.getRange(foundHasilRow, 4, 1, 3).setHorizontalAlignment("center"); // Benar, Salah, Kosong
  sheetHasil.getRange(foundHasilRow, 7).setHorizontalAlignment("center").setNumberFormat("0.0"); // Nilai
  sheetHasil.getRange(foundHasilRow, 8).setHorizontalAlignment("center").setFontWeight("bold"); // Kategori Capaian
  sheetHasil.getRange(foundHasilRow, 9, 1, 2).setHorizontalAlignment("center"); // Waktu

  // 5. Update Status & Nilai di Sheet PESERTA
  if (sheetPeserta) {
    const pesertaRows = sheetPeserta.getDataRange().getValues();
    let foundPeserta = false;
    for (let p = 1; p < pesertaRows.length; p++) {
      if (pesertaRows[p][0] == idPeserta) {
        foundPeserta = true;
        sheetPeserta.getRange(p + 1, 5).setValue("Selesai");
        sheetPeserta.getRange(p + 1, 7).setValue(waktuSelesai);
        sheetPeserta.getRange(p + 1, 8).setValue(nilai);
        break;
      }
    }
    if (!foundPeserta) {
      sheetPeserta.appendRow([
        idPeserta,
        Utilities.formatDate(new Date(), "GMT+8", "dd/MM/yyyy HH:mm:ss"),
        namaSiswa,
        sekolahSiswa,
        "Selesai",
        waktuMulai,
        waktuSelesai,
        nilai
      ]);
    }
  }

  return {
    status: 'success',
    idPeserta: idPeserta,
    nama: namaSiswa,
    sekolah: sekolahSiswa,
    benar: benar,
    salah: salah,
    kosong: kosong,
    nilai: nilai,
    kategoriCapaian: kategoriCapaian,
    waktuMulai: waktuMulai,
    waktuSelesai: waktuSelesai,
    message: 'Data nilai berhasil terhubung & tersimpan di Sheet HASIL (Benar: ' + benar + ', Salah: ' + salah + ', Kosong: ' + kosong + ', Nilai: ' + nilai + ', Kategori: ' + kategoriCapaian + ').'
  };
}

/**
 * 7. Mengambil data hasil peserta tertentu
 */
function getHasilSiswa(idPeserta) {
  const ss = getDb();
  if (!ss) return null;
  const sheetHasil = ss.getSheetByName(CONFIG.NAMA_SHEET_HASIL);
  if (!sheetHasil) return null;
  
  const data = sheetHasil.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == idPeserta) {
      return {
        idPeserta: data[i][0],
        nama: data[i][1],
        sekolah: data[i][2],
        benar: data[i][3],
        salah: data[i][4],
        kosong: data[i][5],
        nilai: data[i][6],
        kategoriCapaian: data[i][7],
        waktuMulai: data[i][8],
        waktuSelesai: data[i][9]
      };
    }
  }
  return null;
}

/**
 * 8. Rekap Nilai per Sekolah untuk Dashboard Admin
 */
function getRekapSekolah() {
  const ss = getDb();
  if (!ss) return [];
  const sheetHasil = ss.getSheetByName(CONFIG.NAMA_SHEET_HASIL);
  if (!sheetHasil) return [];

  const data = sheetHasil.getDataRange().getValues();
  const rekap = {};

  for (let i = 1; i < data.length; i++) {
    const sekolah = data[i][2];
    const nilai = Number(data[i][6]) || 0;
    if (!sekolah) continue;

    if (!rekap[sekolah]) {
      rekap[sekolah] = { sekolah: sekolah, jumlahPeserta: 0, totalNilai: 0, tertinggi: 0, terendah: 100 };
    }
    rekap[sekolah].jumlahPeserta++;
    rekap[sekolah].totalNilai += nilai;
    if (nilai > rekap[sekolah].tertinggi) rekap[sekolah].tertinggi = nilai;
    if (nilai < rekap[sekolah].terendah) rekap[sekolah].terendah = nilai;
  }

  const result = [];
  for (const key in rekap) {
    const r = rekap[key];
    result.push({
      sekolah: r.sekolah,
      jumlahPeserta: r.jumlahPeserta,
      rataRata: Math.round((r.totalNilai / r.jumlahPeserta) * 10) / 10,
      tertinggi: r.tertinggi,
      terendah: r.terendah === 100 && r.jumlahPeserta === 0 ? 0 : r.terendah
    });
  }
  return result;
}

/**
 * 9. INISIALISASI STRUKTUR SPREADSHEET (5 SHEET RESMI OTOMATIS)
 * Jalankan fungsi ini dari tombol 'Jalankan' (Run) di editor Apps Script untuk membuat:
 * - 5 Sheet Resmi (PESERTA, JAWABAN, HASIL, SOAL, SEKOLAH)
 * - Header warna dengan Freeze row 1
 * - Pengisian otomatis 30 butir soal lengkap Asesmen TKA 2026
 * - Pengisian otomatis 62 nama SMP Resmi se-Kabupaten Barito Kuala
 */
function inisialisasiDatabase() {
  const ss = getDb();
  if (!ss) {
    throw new Error("Gagal mengakses Spreadsheet. Pastikan script dibuka dari menu Ekstensi -> Apps Script di Spreadsheet, atau isi SPREADSHEET_ID di Kode.gs.");
  }

  // 1. Sheet PESERTA
  let sPeserta = ss.getSheetByName(CONFIG.NAMA_SHEET_PESERTA);
  if (!sPeserta) sPeserta = ss.insertSheet(CONFIG.NAMA_SHEET_PESERTA);
  sPeserta.clear();
  sPeserta.appendRow([
    "ID Peserta", "Timestamp", "Nama Peserta", "Asal Sekolah", "Status", "Waktu Mulai", "Waktu Selesai", "Nilai"
  ]);
  sPeserta.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#d1fae5").setHorizontalAlignment("center");
  sPeserta.setRowHeight(1, 32);
  sPeserta.setFrozenRows(1);
  sPeserta.setColumnWidth(1, 140);
  sPeserta.setColumnWidth(2, 160);
  sPeserta.setColumnWidth(3, 200);
  sPeserta.setColumnWidth(4, 240);
  sPeserta.setColumnWidth(5, 120);
  sPeserta.setColumnWidth(6, 120);
  sPeserta.setColumnWidth(7, 120);
  sPeserta.setColumnWidth(8, 100);

  // 2. Sheet JAWABAN
  let sJawaban = ss.getSheetByName(CONFIG.NAMA_SHEET_JAWABAN);
  if (!sJawaban) sJawaban = ss.insertSheet(CONFIG.NAMA_SHEET_JAWABAN);
  sJawaban.clear();
  sJawaban.appendRow([
    "ID Peserta", "Nama Peserta", "Asal Sekolah", "No Soal", "Jawaban Siswa", "Status Kunci", "Skor", "Timestamp"
  ]);
  sJawaban.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e0e7ff").setHorizontalAlignment("center");
  sJawaban.setRowHeight(1, 32);
  sJawaban.setFrozenRows(1);
  sJawaban.setColumnWidth(1, 140);
  sJawaban.setColumnWidth(2, 200);
  sJawaban.setColumnWidth(3, 240);
  sJawaban.setColumnWidth(4, 80);
  sJawaban.setColumnWidth(5, 180);
  sJawaban.setColumnWidth(6, 110);
  sJawaban.setColumnWidth(7, 80);
  sJawaban.setColumnWidth(8, 120);

  // 3. Sheet HASIL
  let sHasil = ss.getSheetByName(CONFIG.NAMA_SHEET_HASIL);
  if (!sHasil) sHasil = ss.insertSheet(CONFIG.NAMA_SHEET_HASIL);
  sHasil.clear();
  sHasil.appendRow([
    "ID Peserta", "Nama Peserta", "Asal Sekolah", "Benar", "Salah", "Kosong", "Nilai", "Kategori Capaian", "Waktu Mulai", "Waktu Selesai"
  ]);
  sHasil.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#fef3c7").setHorizontalAlignment("center");
  sHasil.setRowHeight(1, 32);
  sHasil.setFrozenRows(1);
  sHasil.setColumnWidth(1, 140);
  sHasil.setColumnWidth(2, 200);
  sHasil.setColumnWidth(3, 240);
  sHasil.setColumnWidth(4, 80);
  sHasil.setColumnWidth(5, 80);
  sHasil.setColumnWidth(6, 80);
  sHasil.setColumnWidth(7, 90);
  sHasil.setColumnWidth(8, 160);
  sHasil.setColumnWidth(9, 120);
  sHasil.setColumnWidth(10, 120);

  // 4. Sheet SOAL (Bank Soal 30 Butir Resmi)
  let sSoal = ss.getSheetByName(CONFIG.NAMA_SHEET_SOAL);
  if (!sSoal) sSoal = ss.insertSheet(CONFIG.NAMA_SHEET_SOAL);
  sSoal.clear();
  sSoal.appendRow([
    "No", "Jenis", "Stimulus", "Soal", "Opsi A", "Opsi B", "Opsi C", "Opsi D", "Kunci", "Skor", "Materi", "Level"
  ]);
  sSoal.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#f3e8ff").setHorizontalAlignment("center");
  sSoal.setRowHeight(1, 32);
  sSoal.setFrozenRows(1);
  sSoal.setColumnWidth(1, 60);
  sSoal.setColumnWidth(2, 80);
  sSoal.setColumnWidth(3, 300);
  sSoal.setColumnWidth(4, 300);
  sSoal.setColumnWidth(5, 180);
  sSoal.setColumnWidth(6, 180);
  sSoal.setColumnWidth(7, 180);
  sSoal.setColumnWidth(8, 180);
  sSoal.setColumnWidth(9, 120);
  sSoal.setColumnWidth(10, 70);
  sSoal.setColumnWidth(11, 180);
  sSoal.setColumnWidth(12, 130);

  // Masukkan 30 Butir Soal Resmi
  if (typeof BANK_SOAL_30 !== 'undefined' && BANK_SOAL_30.length > 0) {
    sSoal.getRange(2, 1, BANK_SOAL_30.length, 12).setValues(BANK_SOAL_30);
    sSoal.getRange(2, 1, BANK_SOAL_30.length, 2).setHorizontalAlignment("center");
    sSoal.getRange(2, 9, BANK_SOAL_30.length, 2).setHorizontalAlignment("center");
    sSoal.getRange(2, 12, BANK_SOAL_30.length, 1).setHorizontalAlignment("center");
  }

  // 5. Sheet SEKOLAH (Daftar 62 SMP Resmi Barito Kuala)
  let sSekolah = ss.getSheetByName(CONFIG.NAMA_SHEET_SEKOLAH);
  if (!sSekolah) sSekolah = ss.insertSheet(CONFIG.NAMA_SHEET_SEKOLAH);
  sSekolah.clear();
  sSekolah.appendRow(["No", "Nama Sekolah", "Kecamatan", "Status"]);
  sSekolah.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#ccfbf1").setHorizontalAlignment("center");
  sSekolah.setRowHeight(1, 32);
  sSekolah.setFrozenRows(1);
  sSekolah.setColumnWidth(1, 60);
  sSekolah.setColumnWidth(2, 320);
  sSekolah.setColumnWidth(3, 160);
  sSekolah.setColumnWidth(4, 100);

  if (typeof DAFTAR_62_SEKOLAH !== 'undefined' && DAFTAR_62_SEKOLAH.length > 0) {
    sSekolah.getRange(2, 1, DAFTAR_62_SEKOLAH.length, 4).setValues(DAFTAR_62_SEKOLAH);
    sSekolah.getRange(2, 1, DAFTAR_62_SEKOLAH.length, 1).setHorizontalAlignment("center");
    sSekolah.getRange(2, 3, DAFTAR_62_SEKOLAH.length, 2).setHorizontalAlignment("center");
  }

  return "Berhasil inisialisasi 5 Sheet Resmi: PESERTA, JAWABAN, HASIL, SOAL (30 butir soal lengkap), dan SEKOLAH (62 SMP Barito Kuala).";
}

/**
 * 10. SINKRONISASI ULANG SHEET HASIL DARI JAWABAN SISWA
 * Fungsi ini dapat dijalankan kapan saja dari editor Apps Script untuk
 * menghitung ulang dan memastikan kolom Benar, Salah, Kosong, Nilai,
 * dan Kategori Capaian pada Sheet HASIL 100% konsisten dengan data soal & jawaban.
 */
function sinkronkanUlangSheetHasil() {
  const ss = getDb();
  if (!ss) throw new Error("Spreadsheet tidak terhubung.");

  const sheetJawaban = ss.getSheetByName(CONFIG.NAMA_SHEET_JAWABAN);
  if (!sheetJawaban) throw new Error("Sheet JAWABAN belum ada.");

  const jData = sheetJawaban.getDataRange().getValues();
  const studentMap = {};

  for (let i = 1; i < jData.length; i++) {
    const id = jData[i][0];
    if (!id) continue;
    if (!studentMap[id]) {
      studentMap[id] = {
        idPeserta: id,
        nama: jData[i][1],
        sekolah: jData[i][2]
      };
    }
  }

  const ids = Object.keys(studentMap);
  let updatedCount = 0;
  for (let s = 0; s < ids.length; s++) {
    const stu = studentMap[ids[s]];
    prosesSelesaiUjian(stu.idPeserta, stu);
    updatedCount++;
  }

  return "Berhasil menyinkronkan ulang " + updatedCount + " peserta pada Sheet HASIL.";
}

/**
 * 11. DATA RESMI 62 SEKOLAH SMP SE-KABUPATEN BARITO KUALA
 */
const DAFTAR_62_SEKOLAH = [
  [
    1,
    "SMP NEGERI 1 ALALAK",
    "Alalak",
    "Negeri"
  ],
  [
    2,
    "SMP NEGERI 2 ALALAK",
    "Alalak",
    "Negeri"
  ],
  [
    3,
    "SMP NEGERI 3 ALALAK",
    "Alalak",
    "Negeri"
  ],
  [
    4,
    "SMP NEGERI 4 ALALAK",
    "Alalak",
    "Negeri"
  ],
  [
    5,
    "SMP NEGERI 5 ALALAK",
    "Alalak",
    "Negeri"
  ],
  [
    6,
    "SMP NEGERI 6 ALALAK",
    "Alalak",
    "Negeri"
  ],
  [
    7,
    "SMP GIBS",
    "Alalak",
    "Swasta"
  ],
  [
    8,
    "SMP TAHFIZH TERPADU EL QUDWAH",
    "Alalak",
    "Swasta"
  ],
  [
    9,
    "SMP TAHFIDZ PLUS ISTANA AL QURAN",
    "Alalak",
    "Swasta"
  ],
  [
    10,
    "SMP TAHFIZH QURAN TAMAN CINTA AL-QURAN",
    "Alalak",
    "Swasta"
  ],
  [
    11,
    "SMP NEGERI 1 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    12,
    "SMP NEGERI 2 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    13,
    "SMP NEGERI 3 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    14,
    "SMP NEGERI 4 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    15,
    "SMP NEGERI 5 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    16,
    "SMP NEGERI 6 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    17,
    "SMP NEGERI 7 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    18,
    "SMP NEGERI 8 TAMBAN",
    "Tamban",
    "Negeri"
  ],
  [
    19,
    "SMP NEGERI 1 RANTAU BADAUH",
    "Rantau Badauh",
    "Negeri"
  ],
  [
    20,
    "SMP NEGERI 2 RANTAU BADAUH",
    "Rantau Badauh",
    "Negeri"
  ],
  [
    21,
    "SMP NEGERI 3 SATU ATAP RANTAU BADAUH",
    "Rantau Badauh",
    "Negeri"
  ],
  [
    22,
    "SMP NEGERI SATAP 4 RANTAU BADAUH",
    "Rantau Badauh",
    "Negeri"
  ],
  [
    23,
    "SMP NEGERI 1 WANARAYA",
    "Wanaraya",
    "Negeri"
  ],
  [
    24,
    "SMP NEGERI 2 BELAWANG",
    "Wanaraya",
    "Negeri"
  ],
  [
    25,
    "SMP NEGERI 3 BELAWANG",
    "Wanaraya",
    "Negeri"
  ],
  [
    26,
    "SMP NEGERI 5 BELAWANG",
    "Wanaraya",
    "Negeri"
  ],
  [
    27,
    "SMP NEGERI 1 MANDASTANA",
    "Mandastana",
    "Negeri"
  ],
  [
    28,
    "SMP NEGERI 3 MANDASTANA",
    "Mandastana",
    "Negeri"
  ],
  [
    29,
    "SMP NEGERI 5 MANDASTANA",
    "Mandastana",
    "Negeri"
  ],
  [
    30,
    "SMP INTAN ILMU",
    "Mandastana",
    "Swasta"
  ],
  [
    31,
    "SMP NEGERI 1 TABUNGANEN",
    "Tabunganen",
    "Negeri"
  ],
  [
    32,
    "SMP NEGERI 2 TABUNGANEN",
    "Tabunganen",
    "Negeri"
  ],
  [
    33,
    "SMP NEGERI 3 TABUNGANEN SATAP",
    "Tabunganen",
    "Negeri"
  ],
  [
    34,
    "SMP NEGERI 4 TABUNGANEN SATAP",
    "Tabunganen",
    "Negeri"
  ],
  [
    35,
    "SMP NEGERI 1 MARABAHAN",
    "Marabahan",
    "Negeri"
  ],
  [
    36,
    "SMP NEGERI 3 MARABAHAN",
    "Marabahan",
    "Negeri"
  ],
  [
    37,
    "SMP NEGERI 4 MARABAHAN",
    "Marabahan",
    "Negeri"
  ],
  [
    38,
    "SMP NEGERI 5 MARABAHAN",
    "Marabahan",
    "Negeri"
  ],
  [
    39,
    "SMP NEGERI 1 BARAMBAI",
    "Barambai",
    "Negeri"
  ],
  [
    40,
    "SMP NEGERI 2 BARAMBAI",
    "Barambai",
    "Negeri"
  ],
  [
    41,
    "SMP NEGERI 3 SATU ATAP BARAMBAI",
    "Barambai",
    "Negeri"
  ],
  [
    42,
    "SMP NEGERI 2 BAKUMPAI",
    "Bakumpai",
    "Negeri"
  ],
  [
    43,
    "SMP NEGERI 2 MARABAHAN",
    "Bakumpai",
    "Negeri"
  ],
  [
    44,
    "SMP NEGERI 3 BAKUMPAI",
    "Bakumpai",
    "Negeri"
  ],
  [
    45,
    "SMP NEGERI 1 ANJIR MUARA",
    "Anjir Muara",
    "Negeri"
  ],
  [
    46,
    "SMP NEGERI 2 ANJIR MUARA",
    "Anjir Muara",
    "Negeri"
  ],
  [
    47,
    "SMP NEGERI 3 ANJIR MUARA",
    "Anjir Muara",
    "Negeri"
  ],
  [
    48,
    "SMP NEGERI 1 KURIPAN",
    "Kuripan",
    "Negeri"
  ],
  [
    49,
    "SMP NEGERI 2 KURIPAN",
    "Kuripan",
    "Negeri"
  ],
  [
    50,
    "SMP NEGERI 3 KURIPAN",
    "Kuripan",
    "Negeri"
  ],
  [
    51,
    "SMP NEGERI 1 BELAWANG",
    "Belawang",
    "Negeri"
  ],
  [
    52,
    "SMP NEGERI 4 BELAWANG",
    "Belawang",
    "Negeri"
  ],
  [
    53,
    "SMP NEGERI 1 ANJIR PASAR",
    "Anjir Pasar",
    "Negeri"
  ],
  [
    54,
    "SMP NEGERI 2 ANJIR PASAR",
    "Anjir Pasar",
    "Negeri"
  ],
  [
    55,
    "SMP NEGERI 2 MANDASTANA",
    "Jejangkit",
    "Negeri"
  ],
  [
    56,
    "SMP NEGERI 4 MANDASTANA",
    "Jejangkit",
    "Negeri"
  ],
  [
    57,
    "SMP NEGERI 1 TABUKAN",
    "Tabukan",
    "Negeri"
  ],
  [
    58,
    "SMP NEGERI 2 TABUKAN",
    "Tabukan",
    "Negeri"
  ],
  [
    59,
    "SMP NEGERI 1 MEKARSARI",
    "Mekarsari",
    "Negeri"
  ],
  [
    60,
    "SMP NEGERI 2 SATU ATAP MEKARSARI",
    "Mekarsari",
    "Negeri"
  ],
  [
    61,
    "SMP NEGERI 1 CERBON",
    "Cerbon",
    "Negeri"
  ],
  [
    62,
    "SMP NEGERI 2 CERBON",
    "Cerbon",
    "Negeri"
  ]
];

/**
 * 12. DATA BANK SOAL 30 BUTIR ASESMEN MATEMATIKA SMP 2026
 */
const BANK_SOAL_30 = [
  [
    1,
    "PG",
    "Stimulus 1: Pengolahan Pupuk Organik Lahan Pasang Surut Barito Kuala - Kelompok tani di Kecamatan Wanaraya, Kabupaten Barito Kuala memanfaatkan mikroorganisme pengurai untuk fermentasi pupuk organik. Populasi awal bakteri adalah 2³ × 10³ sel. Dalam proses pengujian bertingkat di laboratorium sekolah, formula pengurai baru mampu meningkatkan laju reaksi biokimia sehingga hasil perkalian populasi bakteri dinyatakan dengan operasi:  (2⁴ × 3² × 5) × (2³ × 3⁻¹ × 5²) : (2⁵ × 3 × 5²).",
    "Berdasarkan sifat-sifat operasi bilangan berpangkat, hasil penyederhanaan dari operasi bilangan tersebut adalah ...",
    "10",
    "20",
    "40",
    "60",
    "B",
    1,
    "Bilangan - Bilangan Real",
    "Mengaplikasikan"
  ],
  [
    2,
    "MCMA",
    "Stimulus 2: Distribusi Bibit Jeruk Siam Banjar di Marabahan - Dinas Pertanian dan Koperasi Sekolah di Marabahan menyiapkan 2.400 bibit jeruk siam Banjar untuk disalurkan ke petani mitra dan kebun praktik sekolah. Alokasi distribusi bibit diatur sebagai berikut: • 35% dibagikan kepada kelompok tani tahap pertama. • 3/8 bagian dari total bibit disalurkan pada tahap kedua. • 0,15 bagian dari total bibit dialokasikan untuk kebun praktik sekolah siswa SMP. • Sisanya disimpan di tempat penangkaran bibit cadangan.",
    "Pilihlah DUA atau LEBIH pernyataan berikut yang bernilai BENAR berdasarkan data alokasi bibit tersebut! (Pilihlah semua yang benar)",
    "Jumlah bibit yang dibagikan pada tahap pertama adalah 840 batang bibit.",
    "Jumlah bibit yang disalurkan pada tahap kedua adalah 900 batang bibit.",
    "Bibit untuk kebun praktik sekolah sebanyak 360 batang bibit.",
    "Sisa bibit yang disimpan di penangkaran cadangan adalah 420 batang bibit.",
    "A, B, C",
    3,
    "Bilangan - Bilangan Real",
    "Menalar"
  ],
  [
    3,
    "PGK",
    "Stimulus 3: Pengadaan Bahan Kerajinan Anyaman Purun Barambai - Siswa SMP di Barambai sedang mengelola usaha kerajinan ramah lingkungan berbahan purun dan eceng gondok. Dalam pembukuan mingguan: • Modal awal kas kelompok adalah Rp1.200.000,00. • Membeli bahan baku purun mentah sebanyak 45 ikat dengan harga Rp12.000,00 per ikat dan mendapat potongan harga (diskon) 10%. • Menjual 25 tas purun motif sasirangan dengan harga Rp48.000,00 per buah. • Biaya pewarnaan dan aksesoris menghabiskan 25% dari total penerimaan penjualan tas.",
    "Tentukan kebenaran dari setiap pernyataan berikut berdasarkan data keuangan kelompok pengrajin purun! Pilih \"Benar\" atau \"Salah\" pada setiap pernyataan.",
    "P1: Uang yang dikeluarkan untuk membeli 45 ikat purun setelah diskon adalah Rp486.000,00.",
    "P2: Biaya pewarnaan dan aksesoris yang dikeluarkan adalah Rp320.000,00.",
    "P3: Keuntungan bersih dari penjualan 25 tas purun setelah dikurangi biaya purun dan biaya pewarnaan adalah Rp414.000,00.",
    "",
    "1:Benar; 2:Salah; 3:Benar",
    3,
    "Bilangan - Bilangan Real",
    "Menalar"
  ],
  [
    4,
    "PG",
    "Stimulus 4: Pencatatan Suhu Penyimpanan Ikan Patin dan Haruan - Petugas cold storage perikanan di Alalak mencatat perubahan suhu pada 4 ruang pendingin ikan air tawar selama uji kelayakan: • Ruang A: -3,4 °C • Ruang B: -3 1/2 °C • Ruang C: -3,65 °C • Ruang D: -3 1/4 °C",
    "Urutan ruang pendingin dari suhu yang PALING DINGIN (nilai suhu terkecil) hingga yang paling hangat adalah ...",
    "Ruang C, Ruang B, Ruang A, Ruang D",
    "Ruang D, Ruang A, Ruang B, Ruang C",
    "Ruang C, Ruang A, Ruang B, Ruang D",
    "Ruang B, Ruang C, Ruang D, Ruang A",
    "A",
    1,
    "Bilangan - Bilangan Real",
    "Mengaplikasikan"
  ],
  [
    5,
    "PG",
    "Stimulus 5: Notasi Ilmiah dan Bentuk Sederhana Akar - Dalam studi hidrologi Sungai Barito di sekitar Jembatan Barito, volume debit air sungai pada saat puncak pasang diperkirakan mencapai 34.560.000 m³. Selain itu, kecepatan rambat gelombang dihitung menggunakan konstanta bentuk akar √192 m/detik.",
    "Bentuk notasi ilmiah baku dari volume air dan bentuk paling sederhana dari konstanta kecepatan rambat gelombang tersebut berturut-turut adalah ...",
    "3,456 × 10⁷ dan 8√3",
    "34,56 × 10⁶ dan 6√3",
    "3,456 × 10⁶ dan 8√2",
    "3,456 × 10⁸ dan 12√3",
    "A",
    1,
    "Bilangan - Bilangan Real",
    "Memahami"
  ],
  [
    6,
    "PGK",
    "Stimulus 6: Formulasi Biaya Distribusi Perahu Klotok Tamban - Seorang pengusaha jasa angkutan perahu klotok di Tamban menyusun model biaya operasional bulanan (dalam ribuan rupiah) yang dinyatakan dengan bentuk aljabar:  B(x, y) = 5x² - 12xy + 8y - 150 dengan x menyatakan jam kerja motor perahu dan y menyatakan frekuensi penyeberangan sungai.",
    "Berdasarkan bentuk aljabar 5x² - 12xy + 8y - 150, tentukan kebenaran setiap pernyataan berikut mengenai unsur-unsur aljabarnya!",
    "P1: Bentuk aljabar tersebut memiliki 4 suku dengan variabel yang terlibat adalah x², xy, dan y.",
    "P2: Koefisien dari suku xy adalah 12.",
    "P3: Konstanta pada bentuk aljabar tersebut adalah -150.",
    "",
    "1:Benar; 2:Salah; 3:Benar",
    3,
    "Aljabar - Bentuk Aljabar",
    "Memahami"
  ],
  [
    7,
    "PGK",
    "Stimulus 7: Pemetaan Ekstrakurikuler Siswa SMP Mandastana - Himpunan siswa A = {Budi, Citra, Dani, Eka} dipetakan ke himpunan kegiatan ekstrakurikuler B = {Pramuka, PMR, Robotik, Seni Sasirangan}. Guru pembina mencatat tiga relasi pasangan berurutan sebagai berikut: • R₁ = {(Budi, Pramuka), (Citra, PMR), (Dani, Robotik), (Eka, Robotik)} • R₂ = {(Budi, Pramuka), (Budi, PMR), (Citra, Robotik), (Dani, PMR), (Eka, Seni Sasirangan)} • R₃ = {(Budi, Seni Sasirangan), (Citra, PMR), (Dani, Pramuka)}",
    "Tentukan apakah setiap relasi berikut merupakan FUNGSI atau BUKAN FUNGSI dari himpunan A ke himpunan B! (Pilih \"Benar\" jika merupakan FUNGSI, dan pilih \"Salah\" jika BUKAN FUNGSI)",
    "P1: Relasi R₁ merupakan FUNGSI karena setiap anggota himpunan A berpasangan tepat satu kali dengan anggota himpunan B.",
    "P2: Relasi R₂ merupakan FUNGSI karena semua anggota himpunan B memiliki pasangan dari A.",
    "P3: Relasi R₃ BUKAN FUNGSI karena ada anggota himpunan A (yaitu Eka) yang tidak memiliki pasangan di himpunan B.",
    "",
    "1:Benar; 2:Salah; 3:Benar",
    3,
    "Aljabar - Fungsi",
    "Memahami"
  ],
  [
    8,
    "PGK",
    "Stimulus 8: Grafik Tarif Sewa Kelotok Wisata Susur Sungai Rantau Badauh - Sebuah koperasi wisata susur sungai di Rantau Badauh menetapkan tarif sewa perahu kelotok mengikuti fungsi linear y = f(x) = mx + c, dengan x adalah lama sewa (dalam jam) dan y adalah total biaya sewa (dalam ribuan rupiah). Pada grafik garis lurus yang terbentuk: • Garis memotong sumbu Y di titik (0, 60), yang merupakan biaya dasar perawatan perahu. • Untuk pemakaian selama 3 jam, total tarif sewa adalah Rp195.000,00 (titik (3, 195)). • Garis melalui titik-titik (0, 60), (3, 195), dan (5, 285).",
    "Berdasarkan grafik dan persamaan garis lurus tersebut, analisis kebenaran dari tiga pernyataan berikut:",
    "P1: Gradien garis (tarif biaya sewa per jam) adalah 45 (atau Rp45.000,00 per jam).",
    "P2: Persamaan fungsi tarif sewa tersebut dapat dinyatakan dengan f(x) = 50x + 60.",
    "P3: Jika wisatawan menyewa perahu selama 4,5 jam, total biaya yang harus dibayar adalah Rp262.500,00.",
    "",
    "1:Benar; 2:Salah; 3:Benar",
    3,
    "Aljabar - Fungsi",
    "Menalar"
  ],
  [
    9,
    "PGK",
    "Stimulus 9: Pemetaan Pos Pantau Banjir Pasang di Sungai Tabunganen - Peta pemantauan pasang surut air muara di Tabunganen dibuat menggunakan bidang koordinat Kartesius dengan satuan skala dalam kilometer: • Pos Induk berada di titik asal O(0, 0). • Pos Pantau A berada di koordinat (-4, 3). • Pos Pantau B berada di koordinat (4, 3). • Pos Pantau C berada di koordinat (0, -5).",
    "Tentukan kebenaran setiap pernyataan berikut berdasarkan posisi titik-titik pada bidang Kartesius tersebut:",
    "P1: Jarak lurus antara Pos Pantau A dan Pos Induk O(0, 0) adalah 5 km.",
    "P2: Titik Pos Pantau A dan Pos Pantau B terletak pada kuadran yang sama.",
    "P3: Luas daerah segitiga yang dibentuk oleh ketiga Pos Pantau A, B, dan C adalah 32 km².",
    "",
    "1:Benar; 2:Salah; 3:Benar",
    3,
    "Aljabar - Fungsi",
    "Mengaplikasikan"
  ],
  [
    10,
    "PG",
    "Stimulus 10: Batas Muatan Aman Dermaga Feri Cerbon - Petugas keamanan dermaga penyeberangan di Kecamatan Cerbon menguji batas beban tali penahan jangkar. Pertidaksamaan batas tegangan aman dinyatakan dalam variabel x sebagai berikut: 3(2x - 5) ≤ 4x + 1, dengan x adalah bilangan real.",
    "Himpunan penyelesaian dari pertidaksamaan tersebut dan representasi grafiknya pada garis bilangan yang benar adalah ...",
    "x ≤ 8 (Titik batas 8 dengan bulatan penuh dan panah mengarah ke kiri)",
    "x < 8 (Titik batas 8 dengan bulatan kosong dan panah mengarah ke kiri)",
    "x ≥ 8 (Titik batas 8 dengan bulatan penuh dan panah mengarah ke kanan)",
    "x ≤ -7 (Titik batas -7 dengan bulatan penuh dan panah mengarah ke kiri)",
    "A",
    1,
    "Aljabar - Persamaan & Pertidaksamaan",
    "Mengaplikasikan"
  ],
  [
    11,
    "PG",
    "Stimulus 11: Koperasi Kejujuran SMP Negeri di Barito Kuala - Koperasi siswa SMP di Barito Kuala menjual buku tulis bergaris dan pulpen bertinta gel.  • Ahmad membeli 3 buku tulis dan 2 pulpen dengan membayar Rp21.000,00. • Fatimah membeli 2 buku tulis dan 4 pulpen dengan merk yang persis sama dengan membayar Rp22.000,00. • Guru pembina ingin membeli 5 buku tulis dan 3 pulpen untuk hadiah siswa berprestasi lomba matematika.",
    "Berapakah uang yang harus dibayarkan guru pembina untuk membeli 5 buku tulis dan 3 pulpen tersebut?",
    "Rp31.500,00",
    "Rp34.000,00",
    "Rp36.500,00",
    "Rp38.000,00",
    "B",
    1,
    "Aljabar - Persamaan & Pertidaksamaan",
    "Menalar"
  ],
  [
    12,
    "PG",
    "Stimulus 12: Pembuatan Petak Kebun Sayur Hidroponik SMP Bakumpai - Siswa SMP di Bakumpai mendesain bedeng kebun hidroponik sayur sawi berbentuk persegi panjang. Panjang bedeng tersebut dibuat 4 meter lebih panjang dari lebarnya. Di sekeliling sisi luar bedeng dipasang jalur paving jalan inspeksi selebar 1 meter. Jika lebar bedeng dinyatakan dengan x meter, maka total luas seluruh area (bedeng ditambah jalan paving di sekelilingnya) dapat dimodelkan dalam bentuk aljabar.",
    "Bentuk aljabar yang menyatakan total luas seluruh area kebun beserta jalur paving sekelilingnya adalah ...",
    "x² + 8x + 12",
    "x² + 6x + 8",
    "x² + 4x + 4",
    "x² + 10x + 16",
    "A",
    1,
    "Aljabar - Bentuk Aljabar",
    "Mengaplikasikan"
  ],
  [
    13,
    "PG",
    "Stimulus 13: Konsumsi Bahan Bakar Mesin Pompa Air Anjir Muara - Petugas irigasi persawahan di Anjir Muara mengamati hubungan antara lama waktu pengoperasian pompa air (t dalam jam) dengan volume sisa bahan bakar di tangki mesin (V dalam liter). Data pengamatan menghasilkan pasangan berurutan (t, V):  {(1, 14), (2, 11), (3, 8), (4, 5)}.",
    "Rumus fungsi linear V(t) yang menyatakan hubungan antara sisa bahan bakar dengan lama waktu pengoperasian adalah ...",
    "V(t) = -3t + 17",
    "V(t) = 3t + 11",
    "V(t) = -3t + 14",
    "V(t) = -4t + 18",
    "A",
    1,
    "Aljabar - Fungsi",
    "Mengaplikasikan"
  ],
  [
    14,
    "PG",
    "Stimulus 14: Susunan Tiang Bambu Keramba Apung Marabahan - Peternak ikan patin di Sungai Barito menyusun tiang bambu penyangga keramba apung berbentuk pola bertingkat: • Kerangka 1 membutuhkan 6 batang bambu. • Kerangka 2 membutuhkan 11 batang bambu. • Kerangka 3 membutuhkan 16 batang bambu. • Kerangka 4 membutuhkan 21 batang bambu. Pola penambahan batang bambu tersebut konsisten untuk setiap tahapan berikutnya.",
    "Berdasarkan pola konfigurasi tersebut, banyak batang bambu yang dibutuhkan untuk membuat kerangka ke-15 adalah ...",
    "71 batang",
    "76 batang",
    "81 batang",
    "86 batang",
    "B",
    1,
    "Aljabar - Barisan & Deret",
    "Menalar"
  ],
  [
    15,
    "PGK",
    "Stimulus 15: Penataan Kursi Panggung Pentas Seni SMP Kuripan - Panitia pentas seni budaya di SMP Kuripan menyusun kursi penonton di aula dengan formasi melengkung teratur: • Baris pertama paling depan terdiri atas 14 kursi. • Baris kedua terdiri atas 18 kursi. • Baris ketiga terdiri atas 22 kursi, dan seterusnya bertambah 4 kursi pada setiap baris berikutnya. • Aula tersebut mampu menampung tepat 10 baris kursi.",
    "Analisis kebenaran setiap pernyataan berikut terkait susunan kursi di aula pentas seni!",
    "P1: Banyak kursi pada baris terakhir (baris ke-10) adalah 50 kursi.",
    "P2: Kapasitas total kursi penonton yang tersedia di seluruh aula adalah 320 kursi.",
    "P3: Jika harga tiket baris ke-1 sampai ke-3 adalah Rp25.000,00 per kursi dan seluruhnya terisi penuh, pendapatan tiket dari 3 baris tersebut adalah Rp1.500.000,00.",
    "",
    "1:Benar; 2:Benar; 3:Salah",
    3,
    "Aljabar - Barisan & Deret",
    "Menalar"
  ],
  [
    16,
    "PG",
    "Stimulus 16: Rangka Silang Penyangga Jembatan Rumpiang - Rangka besi penyangga silang pada konstruksi dermaga pendukung Jembatan Rumpiang di Marabahan membentuk dua garis lurus yang saling berpotongan di satu titik. Dua sudut yang saling bertolak belakang diberi label (5x - 10)° dan (3x + 30)°, sedangkan sudut yang berpelurus dengan kedua sudut tersebut diberi label (2y + 10)°.",
    "Berdasarkan sifat hubungan antar sudut yang saling bertolak belakang dan berpelurus, nilai x dan y berturut-turut adalah ...",
    "x = 20 dan y = 40",
    "x = 20 dan y = 35",
    "x = 15 dan y = 45",
    "x = 25 dan y = 30",
    "A",
    1,
    "Geometri dan Pengukuran - Objek Geometri",
    "Mengaplikasikan"
  ],
  [
    17,
    "PG",
    "Stimulus 17: Kotak Kemasan Souvenir Dodol Kandangan & Sirup Jeruk Batola - Siswa kelas IX membuat kotak kemasan kerajinan berbentuk prisma segitiga siku-siku. Pada lembaran karton pola jaring-jaring prisma terdapat 5 bidang datar bernomor 1, 2, 3, 4, dan 5: • Bidang 1 dan 5 berbentuk bangun segitiga siku-siku kongruen. • Bidang 2, 3, dan 4 berbentuk persegi panjang yang berjejer menyatu pada rusuk tegaknya. Jika bidang 1 dijadikan alas prisma di bagian bawah dan bidang 3 menjadi sisi tegak bagian belakang,",
    "Sisi manakah yang akan berhadapan sejajar sebagai bidang penutup atas prisma, dan sisi manakah yang menjadi bidang sisi miring terpanjang?",
    "Bidang penutup atas adalah 5, dan sisi miring terpanjang adalah bidang 4",
    "Bidang penutup atas adalah 3, dan sisi miring terpanjang adalah bidang 2",
    "Bidang penutup atas adalah 2, dan sisi miring terpanjang adalah bidang 5",
    "Bidang penutup atas adalah 4, dan sisi miring terpanjang adalah bidang 1",
    "A",
    1,
    "Geometri dan Pengukuran - Objek Geometri",
    "Menalar"
  ],
  [
    18,
    "PG",
    "Stimulus 18: Rancang Bangun Atap Gazebo Wisata Pulau Kembang Barito Kuala - Dua balok kayu penyangga atap dibuat sejajar horizontal (garis g // garis h). Sebuah rangka segitiga ABC dipasang di antara kedua garis sejajar tersebut, dengan titik A terletak pada garis g dan titik B serta C terletak pada garis h.  • Sudut luar di titik A yang sepihak dengan garis miring AC besarnya 125°. • Sudut di titik B pada kaki segitiga besarnya 40°.",
    "Berdasarkan prinsip hubungan sudut-sudut dalam berseberangan dan jumlah sudut dalam segitiga, berapakah besar sudut puncak segitiga (sudut BAC)?",
    "75°",
    "85°",
    "95°",
    "105°",
    "B",
    1,
    "Geometri dan Pengukuran - Objek Geometri",
    "Menalar"
  ],
  [
    19,
    "PG",
    "Stimulus 19: Jalur Penyeberangan Sungai Barito saat Arus Deras - Sebuah perahu bermotor berangkat tegak lurus dari dermaga di Belawang menuju dermaga seberang sungai yang berjarak 360 meter ke arah timur. Namun karena kecepatan arus sungai ke arah selatan yang cukup kuat, perahu terdorong sejauh 150 meter ke arah selatan saat tiba di tepi seberang sungai.",
    "Berapakah jarak lurus tempuh sebenarnya (lintasan miring) yang dilalui perahu motor tersebut dari titik berangkat hingga tiba di tepi seberang?",
    "390 meter",
    "410 meter",
    "450 meter",
    "510 meter",
    "A",
    1,
    "Geometri dan Pengukuran - Objek Geometri",
    "Mengaplikasikan"
  ],
  [
    20,
    "PG",
    "Stimulus 20: Pergeseran Posisi Ponton Angkut Pupuk Pasang Surut - Sebuah ponton kargo pengangkut pupuk di Muara Anjir Pasar direpresentasikan sebagai persegi panjang ABCD pada peta GPS berkoordinat: A(1, 2), B(7, 2), C(7, 5), dan D(1, 5). Ponton tersebut dipindahkan melalui operasi translasi T = (-3, 4) menjadi bangun bayangan A'B'C'D'. Petugas SAR memantau apakah ada bagian dari bangun awal ABCD yang masih beririsan/tumpang-tindih (overlap) dengan bangun bayangan A'B'C'D'.",
    "Berdasarkan analisis koordinat bayangan hasil translasi, kesimpulan posisi bangun bayangan A'B'C'D' terhadap bangun asal ABCD yang paling tepat adalah ...",
    "Bangun bayangan beririsan dengan bangun asal membentuk daerah persegi panjang berukuran panjang 3 satuan dan lebar 1 satuan",
    "Bangun bayangan saling lepas (tidak berpotongan) karena jarak pergeseran vertikal melebihi tinggi bangun asal",
    "Bangun bayangan saling berhimpit penuh dengan bangun asal",
    "Kedua bangun hanya berpotongan pada tepat satu titik sudut saja",
    "B",
    1,
    "Geometri dan Pengukuran - Transformasi Geometri",
    "Menalar"
  ],
  [
    21,
    "PG",
    "Stimulus 21: Desain Taman Bundaran Tugu Marabahan - Taman kota di dekat Tugu Marabahan didesain berbentuk lingkaran dengan jari-jari 21 meter (gunakan π = 22/7). Area taman dibagi menjadi beberapa zona juring: • Zona Bunga Sasirangan memiliki sudut pusat 60°. • Zona Rumput Olahraga memiliki sudut pusat 140°. • Sisa sudut dialokasikan untuk zona jalur pejalan kaki dan kolam air mancur.",
    "Berapakah perbandingan luas Zona Bunga Sasirangan terhadap Zona Rumput Olahraga, serta berapa selisih luas kedua juring tersebut?",
    "Perbandingan 3 : 7, dan selisih luasnya adalah 308 m²",
    "Perbandingan 3 : 7, dan selisih luasnya adalah 280 m²",
    "Perbandingan 2 : 5, dan selisih luasnya adalah 316 m²",
    "Perbandingan 1 : 2, dan selisih luasnya adalah 308 m²",
    "A",
    1,
    "Geometri dan Pengukuran - Pengukuran",
    "Mengaplikasikan"
  ],
  [
    22,
    "PG",
    "Stimulus 22: Cetak Spanduk Lomba HUT Kabupaten Barito Kuala - Panitia lomba mendesain baliho ucapan HUT Kabupaten Barito Kuala berukuran foto miniatur panjang 30 cm dan lebar 20 cm. Miniatur tersebut diperbesar sebangun menjadi baliho raksasa yang dipasang di tepi jalan trans Kalimantan dengan panjang 9 meter (900 cm).",
    "Berdasarkan konsep kesebangunan bangun datar, berapakah keliling dan luas baliho raksasa tersebut?",
    "Keliling = 30 meter dan Luas = 54 m²",
    "Keliling = 28 meter dan Luas = 48 m²",
    "Keliling = 32 meter dan Luas = 60 m²",
    "Keliling = 36 meter dan Luas = 72 m²",
    "A",
    1,
    "Geometri dan Pengukuran - Pengukuran",
    "Mengaplikasikan"
  ],
  [
    23,
    "MCMA",
    "Stimulus 23: Tandon Penampungan Air Hujan SMP Wanaraya - Untuk mengantisipasi musim kemarau di lahan gambut, SMP di Wanaraya membangun tandon bak penampung air hujan berbentuk balok dengan ukuran bagian dalam: • Panjang = 2,5 meter • Lebar = 1,6 meter • Kedalaman (tinggi) = 1,2 meter Bak penampung tersebut diplester kedap air pada seluruh dinding dalam dan dasarnya (tanpa tutup atas). Air dialirkan ke bak penampung menggunakan pipa dengan debit 40 liter per menit.",
    "Pilihlah DUA atau LEBIH pernyataan berikut yang bernilai BENAR terkait bak penampungan air tersebut! (Pilihlah semua yang benar)",
    "Kapasitas daya tampung maksimum bak penampung air tersebut adalah 4.800 liter.",
    "Luas permukaan bagian dalam bak yang diplester (dasar dan 4 dinding samping) adalah 13,84 m².",
    "Waktu yang dibutuhkan untuk mengisi bak kosong hingga terisi penuh adalah tepat 2 jam.",
    "Jika air diisi setinggi 80 cm, volume air yang tersimpan di dalam bak adalah 3.600 liter.",
    "A, B, C",
    3,
    "Geometri dan Pengukuran - Pengukuran",
    "Menalar"
  ],
  [
    24,
    "PGK",
    "Stimulus 24: Kemasan Kotak Kardus Distribusi Buku Pelajaran - Koperasi pendidikan mendistribusikan buku ke sekolah-sekolah di Barito Kuala menggunakan kardus besar berbentuk kubus dengan panjang rusuk 60 cm. Di dalam kardus besar tersebut akan dimasukkan kotak-kotak kecil berisi paket modul matematika berbentuk balok dengan ukuran panjang 20 cm, lebar 15 cm, dan tinggi 10 cm.",
    "Evaluasi kebenaran setiap pernyataan berikut terkait volume dan susunan kotak kemasan!",
    "P1: Volume kardus besar kubus setara dengan 216 liter.",
    "P2: Volume satu kotak kecil paket modul adalah 3 liter (atau 3.000 cm³).",
    "P3: Banyak kotak kecil paket modul yang dapat dimuat secara maksimal ke dalam kardus kubus tanpa ada rongga kosong adalah 84 kotak.",
    "",
    "1:Benar; 2:Benar; 3:Salah",
    3,
    "Geometri dan Pengukuran - Pengukuran",
    "Menalar"
  ],
  [
    25,
    "PG",
    "Stimulus 25: Data Hasil Panen Jeruk Siam di 5 Desa Barito Kuala - Tabel berikut menunjukkan data acak hasil panen buah jeruk siam (dalam ton) di lima desa sentra hortikultura Kabupaten Barito Kuala selama tahun 2025:",
    "Berdasarkan data tabel hasil panen tersebut, manakah diagram batang berikut yang menyajikan data hasil panen kelima desa secara tepat dan benar?",
    "Diagram Batang 1",
    "Diagram Batang 2",
    "Diagram Batang 3",
    "Diagram Batang 4",
    "A",
    1,
    "Data dan Peluang - Data",
    "Mengaplikasikan"
  ],
  [
    26,
    "PG",
    "Stimulus 26: Nilai Uji Kemampuan Dasar Numerasi Siswa SMP Barambai - Sebanyak 30 siswa kelas IX SMP di Barambai mengikuti uji coba pra-try out numerasi. Data perolehan nilai siswa tercatat sebagai berikut: 70, 75, 80, 85, 75, 90, 80, 75, 70, 85, 80, 75, 90, 80, 75, 70, 85, 80, 75, 95, 80, 85, 75, 80, 75, 90, 85, 80, 75, 70.",
    "Berdasarkan data nilai numerasi tersebut, nilai yang menjadi MODUS (nilai yang paling sering muncul) adalah ...",
    "75 dengan frekuensi muncul sebanyak 9 kali",
    "80 dengan frekuensi muncul sebanyak 8 kali",
    "85 dengan frekuensi muncul sebanyak 6 kali",
    "70 dengan frekuensi muncul sebanyak 5 kali",
    "A",
    1,
    "Data dan Peluang - Data",
    "Memahami"
  ],
  [
    27,
    "MCMA",
    "Stimulus 27: Nilai Rata-rata Gabungan Kelas Try Out Matematika - Di SMP Negeri 1 Wanaraya, nilai rata-rata latihan matematika kelas IX-A yang terdiri atas 32 siswa adalah 74. Sementara nilai rata-rata kelas IX-B yang terdiri atas 28 siswa adalah 79. Sebelum pengumuman, guru menyadari ada 2 siswa kelas IX-A yang nilainya salah ketik: nilai semula 65 dan 70 seharusnya adalah 85 dan 90.",
    "Pilihlah DUA atau LEBIH pernyataan berikut yang bernilai BENAR berdasarkan analisis konsep nilai rata-rata! (Pilihlah semua yang benar)",
    "Total nilai awal seluruh siswa kelas IX-A sebelum koreksi adalah 2.368.",
    "Setelah dilakukan perbaikan nilai kedua siswa, nilai rata-rata baru kelas IX-A meningkat menjadi 75,25.",
    "Nilai rata-rata gabungan kedua kelas (IX-A dan IX-B) sebelum adanya perbaikan data adalah 76,33.",
    "Nilai rata-rata gabungan kedua kelas setelah dilakukan koreksi nilai menjadi 78,50.",
    "A, B, C",
    3,
    "Data dan Peluang - Data",
    "Menalar"
  ],
  [
    28,
    "PG",
    "Stimulus 28: Undian Doorprize Bazar Sekolah Sehat Alalak - Dalam kegiatan bazar amal sekolah sehat di Alalak, panitia menyediakan sebuah kotak undian berisi 50 kupon bernomor 1 sampai 50. Seorang siswa mengambil satu kupon secara acak. Hadiah utama diberikan apabila kupon yang terambil merupakan nomor yang memenuhi dua kondisi: nomor tersebut bernilai kelipatan 4 ATAU kelipatan 6.",
    "Berapakah peluang terambilnya kupon bernomor yang merupakan kelipatan 4 atau kelipatan 6 dari kotak tersebut?",
    "8/25",
    "16/50",
    "9/25",
    "7/25",
    "A",
    1,
    "Data dan Peluang - Peluang",
    "Mengaplikasikan"
  ],
  [
    29,
    "PG",
    "Stimulus 29: Seleksi Duta Lingkungan Lahan Basah Mandastana - Panitia seleksi duta lingkungan hidup lahan basah di Mandastana menerima berkas pendaftaran dari 40 siswa yang terdiri atas: • 15 siswa kelas VII (8 putra dan 7 putri) • 13 siswa kelas VIII (5 putra dan 8 putri) • 12 siswa kelas IX (7 putra dan 5 putri) Satu orang peserta akan dipilih secara acak untuk menyampaikan pidato pembukaan.",
    "Peluang terpilihnya seorang siswa PUTRI dari kelas VIII atau kelas IX sebagai perwakilan pidato pembukaan adalah ...",
    "13/40",
    "1/2",
    "8/40",
    "15/40",
    "A",
    1,
    "Data dan Peluang - Peluang",
    "Mengaplikasikan"
  ],
  [
    30,
    "MCMA",
    "Stimulus 30: Eksperimen Kelereng Tradisional Balogo di Tabukan - Siswa SMP di Tabukan melakukan eksperimen peluang menggunakan sekantong kelereng permainan tradisional Balogo yang hanya berisi dua warna: kelereng hijau sasirangan dan kelereng kuning kunyit.  • Diketahui jumlah kelereng hijau adalah 6 butir lebih banyak daripada kelereng kuning. • Dilakukan percobaan pengambilan 2 butir kelereng satu per satu tanpa pengembalian. • Peluang terambilnya kedua butir kelereng berwarna hijau secara berturut-turut adalah 1/3 (atau 5/15). • Total seluruh kelereng di dalam kantong adalah 16 butir.",
    "Pilihlah DUA atau LEBIH pernyataan berikut yang bernilai BENAR terkait komposisi kelereng di dalam kantong! (Pilihlah semua yang benar)",
    "Jumlah awal kelereng hijau di dalam kantong adalah 10 butir.",
    "Jumlah awal kelereng kuning di dalam kantong adalah 5 butir.",
    "Peluang terambilnya kelereng pertama hijau dan kelereng kedua kuning pada pengambilan tanpa pengembalian adalah 1/4.",
    "Peluang terambilnya kedua kelereng berwarna kuning secara berturut-turut adalah 1/8.",
    "A, C, D",
    3,
    "Data dan Peluang - Peluang",
    "Menalar"
  ]
];
