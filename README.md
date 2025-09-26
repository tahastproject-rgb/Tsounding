# T‑Sounding (Manajemen Data Tangki)

Proyek ini adalah PWA sederhana untuk mengelola tabel sounding tangki.
File penting:
- `index.html`, `data.html`, `manual_calculator.html`
- `script.js`, `helpers-addons.js`
- `style.css`, `manifest.json`, `service-worker.js`
- `icons/icon-192x192.png`, `icons/icon-512x512.png`
- `background-landscape.jpg`, `background-portrait.jpg`

## Cara upload ke GitHub
1. Buat repository baru di GitHub (Public disarankan).
2. Klik **Add file → Upload files** dan drag-drop semua file/folder di repo ini.
3. Commit.

## Mengaktifkan GitHub Pages
- Buka **Settings → Pages** → Source: **main / (root)** → Save.
- Akses di `https://USERNAME.github.io/NAMA-REPO/`.

> Catatan: `service-worker.js` dalam paket ini memakai jalur relatif (`./`) agar kompatibel dengan GitHub Pages.