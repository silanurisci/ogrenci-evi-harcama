const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. AYARLAR ---
const dbConfig = {
  user: "proje_user", // <-- Yeni oluşturduğumuz kullanıcı adı
  password: "12345", // <-- Belirlediğimiz şifre
  server: "localhost",
  database: "OgrenciEviDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
// --- 2. BAĞLANTIYI TEST ET ---
sql
  .connect(dbConfig)
  .then(() => {
    console.log("✅ SQL Server Bağlantısı Başarılı!");
  })
  .catch((err) => {
    console.log("❌ Bağlantı Hatası!");
    console.log(err);
  });

// --- 3. LİSTELEME (GET) ---
app.get("/api/harcamalar", async (req, res) => {
  try {
    const result =
      await sql.query`SELECT * FROM Harcamalar ORDER BY Tarih DESC`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- 4. EKLEME (POST) ---
app.post("/api/harcamalar", async (req, res) => {
  try {
    console.log("📥 Gelen veri:", req.body);

    const { ad, tutar, kisi } = req.body;

    const request = new sql.Request();
    request.input("p1", sql.NVarChar, ad);
    request.input("p2", sql.Decimal(10, 2), parseFloat(tutar));
    request.input("p3", sql.NVarChar, kisi);

    await request.query(`
      INSERT INTO Harcamalar (HarcamaAdi, Tutar, HarcayanKisi)
      VALUES (@p1, @p2, @p3)
    `);

    res.json({ message: "Kaydedildi" });
  } catch (err) {
    console.error("❌ SQL HATASI:", err);
    res.status(500).send("Veritabanı hatası");
  }
});

// --- 5. ÖZET (GET) ---
app.get("/api/ozet", async (req, res) => {
  try {
    const result = await sql.query`SELECT SUM(Tutar) AS Toplam FROM Harcamalar`;
    let toplam = result.recordset[0].Toplam || 0;
    let kisiBasi = toplam / 3;
    res.json({ toplam: toplam, kisiBasi: kisiBasi });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log("🚀 Sunucu çalışıyor: http://localhost:3000");
});
