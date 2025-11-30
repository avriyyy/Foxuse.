# Agent Setup Instructions

## Session String Sudah Tersedia

Session string untuk akun Telegram **+62895335022376** sudah di-generate:

```
1BQANOTEuMTA4LjU2LjE1OAG7SpzllPCpk3HFcR5YaSg0qhWOY6z5KJVjhFs2MWl0OmRbOQFzKVixcm2i90WaOEZTWQiPOG16UhIEW2sGPmZEwaUfQG244TZ3bPmFbwDeJGIrCfHRoiaxgeaOCUQel2rmPyRTLM+/Ub0b9D93l3DwCvd6j+WixCjSrp0pgi7NNb00sDWQ28SQrPGGkiUILMikHrvz4PCgIAJnVHFCI/aI6md4G60jcK9RlXO7hEgxzgOoF2DC63SoazD0BwgH04iZNUcekAO5mmmhkhNWVeREaa9VyL1b46FhJg3ZZFWVOzmGR/XN8tqUbbLv891FS6qHBOhuorzdeZlmt1gpUJb01A==
```

## Cara Update Database di Vercel

1. Buka **Vercel Dashboard** → Project **foxuse**
2. Pergi ke tab **Storage** → **Postgres**
3. Klik **Query** atau **Data**
4. Jalankan SQL dari file `update_agent_session.sql`

Atau gunakan Vercel CLI:

```bash
vercel env pull
# Edit .env.local dengan POSTGRES_URL
# Lalu jalankan:
node -e "require('dotenv').config({path:'.env.local'}); const {sql} = require('@vercel/postgres'); sql\`[PASTE SQL HERE]\`"
```

## Verifikasi

Setelah update database, test dengan:

1. Buka Admin Panel
2. Tab "AI Agent"
3. Klik "Force Run Now"
4. Lihat log - seharusnya langsung connect tanpa minta OTP

## Agent Configuration

- **API ID:** 30386736
- **API Hash:** b858476b707a3d364630f8ade488133f
- **Phone:** +62895335022376
- **Target Group:** @airdropfind
- **LLM Model:** x-ai/grok-4.1-fast:free
- **Status:** Active (isActive = true)

## Cron Schedule

Agent akan jalan otomatis setiap hari jam **12:00 UTC** (19:00 WIB)

## Manual Trigger

Bisa trigger manual kapan saja via tombol "Force Run Now" di Admin Panel (DEVELOPER only)
