/**
 * FORM KESEDIAAN PELAKSANA KEGIATAN - API BACKEND (GOOGLE APPS SCRIPT)
 * CDC UNIVERSITAS ISLAM NEGERI MADURA
 * 
 * Petunjuk:
 * 1. Masukkan kode ini ke Google Apps Script (Code.gs).
 * 2. Klik Deploy -> New deployment -> Pilih Web app.
 * 3. Execute as: "Me" (email Anda).
 * 4. Who has access: "Anyone" (Siapa saja).
 * 5. Salin Web App URL dan tempel ke SCRIPT_URL di index.html.
 */

// ==========================================
// KONFIGURASI SPREADSHEET & DRIVE
// ==========================================
const SPREADSHEET_ID = "1dKlA_i9AXZrnAN9Dwkh4xfS5CPkRBuipiRS6Bueiba0";
const FOLDER_ID = "14xFCzJLnA-bPusjHbMuxGCZZ4Lj5GRFs";

const RESPONSE_SHEET = "Form Responses 1";
const EMPLOYEE_SHEET = "MasterPegawai";


// ==========================================
// ENDPOINT GET (PENCARIAN PEGAWAI)
// ==========================================
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "";

    if (action === "cariPegawai") {
      const keyword = (e.parameter.keyword || "").trim();
      const hasil = cariPegawaiFuzzy(keyword);

      return createJsonResponse({
        status: "success",
        data: hasil
      });
    }

    return createJsonResponse({
      status: "success",
      message: "API Form Kesediaan CDC UIN Madura aktif."
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.message
    });
  }
}


// ==========================================
// ENDPOINT POST (SIMPAN FORMULIR)
// ==========================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Payload request kosong.");
    }

    let formData;
    try {
      formData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      throw new Error("Format JSON tidak valid: " + parseErr.message);
    }

    const resultMessage = simpanDataForm(formData);

    return createJsonResponse({
      status: "success",
      message: resultMessage
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.message
    });
  }
}


// Helper Response JSON
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


// ==========================================
// PENCARIAN DATA PEGAWAI
// ==========================================
function cariPegawaiFuzzy(keyword) {
  if (!keyword || keyword.trim().length < 2) {
    return [];
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(EMPLOYEE_SHEET);

  if (!sheet) {
    throw new Error("Sheet '" + EMPLOYEE_SHEET + "' tidak ditemukan.");
  }

  const data = sheet.getDataRange().getDisplayValues();

  if (data.length < 2) {
    return [];
  }

  // Membaca header
  const headers = data[0].map(h => String(h).trim().toUpperCase());

  const kolomNIP = headers.indexOf("NIP");
  const kolomNama = headers.indexOf("NAMA");
  const kolomJabatan = headers.indexOf("JABATAN");

  if (kolomNIP === -1 || kolomNama === -1 || kolomJabatan === -1) {
    throw new Error("Header MasterPegawai harus memiliki kolom NIP, NAMA, dan JABATAN.");
  }

  const kataKunci = keyword.trim().toLowerCase();
  const hasil = [];

  for (let i = 1; i < data.length; i++) {
    const nama = String(data[i][kolomNama] || "").trim();

    if (nama.toLowerCase().includes(kataKunci)) {
      hasil.push({
        nip: String(data[i][kolomNIP] || "").trim(),
        nama: nama,
        jabatan: String(data[i][kolomJabatan] || "").trim()
      });
    }

    // Maksimal 5 saran
    if (hasil.length >= 5) {
      break;
    }
  }

  return hasil;
}


// ==========================================
// MENYIMPAN DATA FORM
// ==========================================
function simpanDataForm(formData) {
  let fileUrl = "Tidak ada file";

  if (!formData) {
    throw new Error("Data formulir kosong.");
  }

  // Validasi data wajib
  const wajib = [
    "nama",
    "nip",
    "jabatan",
    "pangkat",
    "golongan",
    "whatsapp",
    "email",
    "baju",
    "kehadiran"
  ];

  wajib.forEach(field => {
    if (!formData[field] || String(formData[field]).trim() === "") {
      throw new Error("Data " + field + " belum diisi.");
    }
  });

  // Membuka spreadsheet
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RESPONSE_SHEET);

  if (!sheet) {
    throw new Error("Sheet '" + RESPONSE_SHEET + "' tidak ditemukan.");
  }

  // ======================================
  // UPLOAD TANDA TANGAN KE DRIVE
  // ======================================
  if (!formData.fileData || !formData.fileName) {
    throw new Error("File tanda tangan belum diunggah.");
  }

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const splitData = formData.fileData.split(",");

  if (splitData.length < 2) {
    throw new Error("Format file tanda tangan tidak valid.");
  }

  const contentTypeMatch = splitData[0].match(/:(.*?);/);
  if (!contentTypeMatch) {
    throw new Error("Format gambar tidak dapat dikenali.");
  }

  const contentType = contentTypeMatch[1];
  if (!contentType.startsWith("image/")) {
    throw new Error("File tanda tangan harus berupa gambar (JPG/PNG).");
  }

  const decodedBytes = Utilities.base64Decode(splitData[1]);
  const blob = Utilities.newBlob(decodedBytes, contentType, formData.fileName);

  // Bersihkan nama file
  const namaClean = formData.nama
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  blob.setName("TTD_" + namaClean + "_" + Date.now());

  // Simpan file di folder Drive
  const file = folder.createFile(blob);
  fileUrl = file.getUrl();

  // ======================================
  // SIMPAN DATA KE SPREADSHEET
  // ======================================
  sheet.appendRow([
    new Date(),
    formData.nama,
    formData.nip,
    formData.jabatan,
    formData.pangkat,
    formData.golongan,
    formData.whatsapp,
    formData.email,
    formData.baju,
    formData.kehadiran,
    fileUrl
  ]);

  return "Formulir kesediaan berhasil dikirim!";
}
