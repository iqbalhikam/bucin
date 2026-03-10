# 🌌 Bucin - Our Universe

**"A little universe created just for us. From Iqbal to Delva."**

Proyek ini adalah sebuah pengalaman web interaktif dan romantis yang dirancang khusus dengan teknologi 3D dan pelacakan tangan (*hand tracking*). Pengguna dapat berinteraksi dengan dunia 3D (seperti objek hati dan partikel bercahaya) hanya dengan menggunakan gerakan tangan di depan kamera.

## ✨ Fitur Utama

- **Pelacakan Tangan Real-time (*Hand Tracking*)**: Menggunakan model Machine Learning dari MediaPipe untuk melacak gerakan dan posisi tangan pengguna melalui webcam.
- **Deteksi Gestur Romantis**:
  - **Gestur Hati (*Two-Handed Heart*)**: Mendeteksi ketika pengguna menyatukan kedua tangan untuk membentuk simbol hati.
  - **Gestur Kustom**: Mendeteksi gestur tangan spesifik untuk memunculkan pesan rahasia seperti "I LOVE YOU" atau "I LOVE YOU DELVA GRISHELA".
- **Lingkungan 3D Interaktif**: Render grafis 3D menggunakan React Three Fiber. Kamera di dalam dunia 3D dapat dikendalikan langsung oleh pergerakan tangan pengguna (*Hand Controlled Camera*).
- **Simulasi Fisika 3D**: Objek di dalam *scene* bereaksi terhadap gravitasi dan benturan menggunakan *physics engine* dari Rapier.
- **Efek Visual (*Post-processing*)**: Menampilkan efek visual *Bloom* untuk membuat partikel dan objek hati terlihat menyala (*glowing*) dan magis.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun dengan *stack* teknologi modern web:

- **[Next.js](https://nextjs.org/)** (v16.1.6) - *Framework* React untuk *routing* dan antarmuka utama.
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** & **[Three.js](https://threejs.org/)** - Digunakan untuk membuat dan me-render grafik 3D di dalam *browser*.
- **[@react-three/rapier](https://github.com/pmndrs/react-three-rapier)** - *Physics engine* untuk objek 3D.
- **[@mediapipe/tasks-vision](https://developers.google.com/mediapipe)** - Digunakan untuk mendeteksi *landmark* tangan (Computer Vision).
- **[Zustand](https://github.com/pmndrs/zustand)** - Untuk manajemen *state* aplikasi (seperti melacak status apakah gestur hati sudah terbentuk).
- **[Framer Motion](https://www.framer.com/motion/)** - Digunakan untuk animasi transisi UI yang mulus pada halaman beranda.
- **[Tailwind CSS](https://tailwindcss.com/)** - *Utility-first* CSS untuk *styling* antarmuka.

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** di komputer Anda. Perangkat Anda juga harus memiliki **webcam / kamera** yang berfungsi.

### Instalasi

1. Kloning repositori ini ke dalam komputer Anda.
2. Buka terminal, arahkan ke direktori proyek, lalu instal semua dependensi:
   ```bash
   npm install
