<div align="center"><h2>TikIO - TikTok Downloader</h2></div>

<div align="center">
  <img src="https://files.cloudkuimages.guru/images/aab10be31f7b.jpg" alt="TikIO Logo">

  <h3>🚀 TikTok Downloader Kenceng Banget</h3>
  
  <p>Download video TikTok tanpa watermark, gratis total dan aman banget</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Bun](https://img.shields.io/badge/Bun-1.0+-orange.svg)](https://bun.sh/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
</div>

## ✨ Fitur-Fitur Keren

- 🎯 **Gak Ada Watermark** - Download video TikTok tanpa watermark yang bikin kesel
- ⚡ **Cepet Banget** - Download super kenceng dengan server yang udah dioptimasi
- 🔒 **100% Aman** - Gak perlu daftar, privasi lu aman banget
- 📱 **Universal** - Bisa dipake di semua device dan browser
- 🎨 **UI Modern** - Desain yang cantik dan responsive dengan tema gelap
- 🔍 **Fitur Search** - Cari dan temukan video TikTok yang lu mau
- 📊 **Analytics Video** - Liat likes, komentar, share, dan lain-lain
- 🎵 **Download Audio** - Download audio original dari video
- 🖼️ **Kualitas HD** - Download video dengan kualitas tinggi
- 🌐 **Multi-bahasa** - Interface bahasa Indonesia dengan support bahasa Inggris

## 🛠️ Tech Stack yang Dipake

### Frontend
- **[Astro](https://astro.build/)** - Static site generator yang modern banget
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript yang type-safe
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework yang praktis
- **HTML5 & CSS3** - Standar web yang modern

### Backend
- **[Hono](https://hono.dev/)** - Web framework yang ringan
- **[Bun](https://bun.sh/)** - JavaScript runtime yang cepet banget
- **Node.js** - JavaScript runtime environment

### Infrastructure
- **PM2** - Process manager buat production
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteksi API
- **Environment Configuration** - Deployment yang fleksibel

## 🚀 Langsung Mulai

### Yang Perlu Disiapin

- **Node.js** >= 18.0.0
- **Bun** >= 1.0.0
- **npm** atau **yarn** package manager

### Cara Install

1. **Clone repository**
   ```bash
   git clone https://github.com/lt-syaii/tikio.git
   cd tikio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   bun install
   ```

3. **Setup Environment**
   ```bash
   # Buat file .env
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   ```

4. **Mode Development**
   ```bash
   npm run dev
   ```

5. **Build Production**
   ```bash
   npm run build
   pm2 start ecosystem.config.cjs
   ```

## 📁 Struktur Project

```
tikio/
├── 📁 backend/                 # Backend API server
│   └── server.ts              # File server utama
├── 📁 src/                    # Source code frontend
│   ├── 📁 components/         # Komponen yang bisa dipake ulang
│   │   ├── Notifications.astro
│   │   ├── RateLimitModal.astro
│   │   ├── SearchInput.astro
│   │   └── VideoForm.astro
│   ├── 📁 config/             # File konfigurasi
│   │   └── env.ts
│   ├── 📁 layouts/            # Layout halaman
│   │   └── Layout.astro
│   ├── 📁 pages/              # Halaman aplikasi
│   │   ├── index.astro        # Halaman utama
│   │   ├── search.astro       # Halaman search
│   │   ├── video.astro         # Halaman video
│   │   ├── about.astro        # Halaman about
│   │   └── 📁 api/            # API endpoints
│   └── 📁 utils/              # Fungsi utility
│       ├── api.ts
│       ├── config.ts
│       └── rateLimit.ts
├── 📁 public/                 # Static assets
├── 📁 logs/                   # Log aplikasi
├── 📁 dist/                   # Output build
├── astro.config.mjs           # Konfigurasi Astro
├── tailwind.config.mjs         # Konfigurasi Tailwind
├── ecosystem.config.cjs       # Konfigurasi PM2
├── package.json               # Dependencies dan scripts
└── tsconfig.json              # Konfigurasi TypeScript
```

## 🔧 Konfigurasi

### Environment Variables

Buat file `.env` di root directory:

```env
BE_PORT=3001
FE_PORT=3000
```

### Konfigurasi PM2

Aplikasi ini pake PM2 buat manage process di production:

```javascript
module.exports = {
  apps: [
    {
      name: 'tikio-backend',
      script: 'backend/server.ts',
      interpreter: 'bun',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        BE_PORT: 3002,
        HOST: '0.0.0.0'
      }
    },
    {
      name: 'tikio-frontend',
      script: 'dist/server/entry.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        FE_PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
};
```

## 📡 API Endpoints

### Backend API (Port 3002)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/` | GET | Pesan selamat datang |
| `/health` | GET | Cek kesehatan server |
| `/api/stats` | GET | Statistik server |
| `/api/download` | POST | Download video berdasarkan URL |
| `/api/search` | POST | Cari video TikTok |
| `/api/download/:id` | GET | Download video berdasarkan ID |

### Frontend API (Port 3000)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/` | GET | Halaman utama |
| `/search` | GET | Halaman search |
| `/video` | GET | Halaman video |
| `/about` | GET | Halaman about |
| `/api/download/[id]` | GET | Endpoint download |

## 🤝 Kontribusi

Kita welcome banget sama kontribusi! Ikutin langkah-langkah ini ya:

1. **Fork repository**
2. **Buat feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit perubahan lu**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push ke branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Buka Pull Request**

### Guidelines Development

- Ikutin best practices TypeScript
- Tulis kode yang bersih dan mudah dibaca
- Tambahin error handling yang proper
- Include test buat fitur baru
- Update dokumentasi


## 👨‍💻 Author

**bang_syaii**
- GitHub: [@lt-syaii](https://github.com/lt-syaii)
- Project: [TikIO](https://github.com/lt-syaii/tikio)

## 🙏 Ucapan Terima Kasih

- [TikWM](https://tikwm.com) - TikTok API service
- [Astro](https://astro.build/) - Modern web framework
- [Hono](https://hono.dev/) - Lightweight web framework
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

Kalo lu nemuin masalah atau ada pertanyaan:

1. **Cek Issues** - Cari solusi yang udah ada
2. **Buat Issue** - Laporkan bug atau request fitur
3. **Join Discussions** - Ikut diskusi komunitas
4. **Contact Author** - Hubungi langsung buat support

## 🌐 Social Media & Community

Gabung sama komunitas kita dan stay connected:

- **📱 WhatsApp Group** - Gabung grup diskusi komunitas kita
  - [Join WhatsApp Group](https://chat.whatsapp.com/LIxeP0zjxkwIq8uMhiEFbD)
  

## 🚀 Sponsor - pwcraft cloud

**Terima kasih buat pwcraft cloud yang udah nyediain VPS buat project TikIO ini!**

🔥 **pwcraft cloud** - VPS Provider terbaik buat developer Indonesia!

### Kenapa pilih pwcraft cloud?
- ⚡ **VPS Kenceng Banget** - Performa tinggi dengan uptime 99.9%
- 💰 **Harga Terjangkau** - Paket VPS yang ramah kantong
- 🛡️ **Keamanan Terjamin** - Proteksi maksimal buat server lu
- 🎯 **Support 24/7** - Tim support yang responsif dan helpful
- 🔧 **Full Root Access** - Kontrol penuh atas VPS lu

**Perfect buat:**
- Web development & hosting
- Bot development
- API server

📞 **Hubungi pwcraft cloud sekarang juga!**
- WhatsApp: [Hubungi kami di whatsApp](https://wa.me/c/6282114275683)

---

<div align="center">
  <p>Dibuat dengan ❤️ oleh <a href="https://github.com/lt-syaii">bang_syaii</a></p>
  <p>⭐ Kasih star repository ini kalo lu nemu ini berguna!</p>
</div>