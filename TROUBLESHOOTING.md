# 🔧 Troubleshooting: Agent Tidak Menangkap Pesan

## Kemungkinan Penyebab

### 1. **Database Belum Diupdate** ❌

Session string belum masuk ke Vercel Postgres.

**Solusi:**

- Buka Vercel Dashboard → Storage → Postgres
- Jalankan SQL dari file `SETUP_AGENT_DB.sql`
- Verify dengan query terakhir di file tersebut

### 2. **lastMessageId Terlalu Tinggi** ❌

Agent sudah pernah jalan dan `lastMessageId` tersimpan. Pesan baru ID-nya lebih rendah.

**Solusi:**

- Reset `lastMessageId` ke NULL (sudah ada di SQL script)
- Agent akan ambil 30 pesan terbaru pada run berikutnya

### 3. **Agent Belum Dijalan di Production** ❌

Perubahan code sudah deploy tapi agent belum di-trigger.

**Solusi:**

- Buka Admin Panel production
- Tab "AI Agent"
- Klik "Force Run Now"
- Lihat log realtime

### 4. **LLM Classify sebagai IRRELEVANT** ⚠️

Pesan dianggap bukan airdrop announcement oleh LLM.

**Cara Check:**

- Lihat log setelah Force Run
- Cari: `[LLM] Classified as: IRRELEVANT`
- Jika banyak IRRELEVANT, mungkin prompt LLM perlu diperbaiki

### 5. **Nama Airdrop Sudah Ada** ⚠️

Deduplication mendeteksi nama sudah ada di database.

**Cara Check:**

- Lihat log: `[SKIP] Airdrop "X" already exists`
- Check database apakah memang sudah ada

## Langkah Debug

### Step 1: Verify Database

```sql
SELECT
    "telegramPhone",
    "isActive",
    "lastMessageId",
    "sessionString" IS NOT NULL as has_session
FROM agent_config;
```

**Expected:**

- `telegramPhone`: +62895335022376
- `isActive`: true
- `lastMessageId`: NULL (untuk fresh start)
- `has_session`: true

### Step 2: Test Koneksi Lokal

```bash
node test_telegram.js
```

**Expected Output:**

- ✅ Connected successfully!
- ✅ Found group: ...
- 📬 Last 5 messages dengan ID dan text

### Step 3: Force Run di Production

1. Buka: https://foxuse-8xbktjsf6-0xavriyyy-projects.vercel.app/admin
2. Login dengan wallet DEVELOPER
3. Tab "AI Agent"
4. Klik "Force Run Now"
5. Tunggu 10-30 detik
6. Lihat log yang muncul

### Step 4: Analyze Log

Cari pattern ini di log:

✅ **Good Signs:**

```
[timestamp] Connected with existing session
[timestamp] Starting monitoring of @airdropfind
[timestamp] Found 30 new message(s)
[timestamp] Analyzing: ...
[timestamp] [LLM] Classified as: NEW_AIRDROP
[timestamp] [CHECK] Looking for existing: "Project Name"
[timestamp] [NEW AIRDROP] ✅ Created: Project Name
```

❌ **Problem Signs:**

```
[timestamp] No new messages to process
→ lastMessageId terlalu tinggi, reset ke NULL

[timestamp] [SKIP] Message classified as IRRELEVANT
→ LLM tidak mengenali sebagai airdrop

[timestamp] [SKIP] Airdrop "X" already exists
→ Sudah ada di database (ini normal)

[timestamp] Error: ...
→ Ada error, baca detail errornya
```

## Quick Fix Checklist

- [ ] Jalankan `SETUP_AGENT_DB.sql` di Vercel Postgres
- [ ] Verify database dengan query SELECT
- [ ] Test lokal dengan `node test_telegram.js`
- [ ] Force Run di production
- [ ] Check log untuk pattern di atas
- [ ] Jika masih gagal, screenshot log dan share

## Contact Info

Jika masih bermasalah setelah semua step di atas, share:

1. Screenshot hasil query database
2. Screenshot log setelah Force Run
3. Contoh pesan yang seharusnya ditangkap
