# Website Keripik Tempe Almira

Website katalog UMKM. Halaman publik hanya bisa dilihat. Pengubahan produk, harga, dan foto dilakukan lewat `/admin`, dan hanya akun GitHub yang punya akses ke repository yang bisa login.

## Struktur

```
index.html            halaman publik
assets/               style.css dan app.js
content/site.json     semua isi website (nama, produk, harga, link)
images/               logo, background, foto produk
admin/                panel admin (Decap CMS)
netlify.toml          pengaturan Netlify
```

## Menjalankan di VS Code

1. Buka folder ini di VS Code.
2. Pasang ekstensi **Live Server**, klik kanan `index.html`, pilih **Open with Live Server**.
3. Jangan klik dua kali `index.html`. Data dibaca lewat fetch, jadi butuh server.

Panel `/admin` tidak berfungsi di Live Server. Ia hanya aktif di situs Netlify.

## Deploy (sekali saja)

### 1. Upload ke GitHub
Di VS Code: **Source Control → Publish to GitHub**. Catat nama repository, misalnya `felicio/website-almira`.

### 2. Isi `admin/config.yml`
Ganti 3 hal:
- `repo: USERNAME/NAMA-REPOSITORY` menjadi repository kamu
- `site_url` dan `display_url` menjadi alamat Netlify kamu

Commit dan push.

### 3. Hubungkan ke Netlify
Netlify → **Add new project → Import from Git** → pilih repository.
Build command kosongkan. Publish directory isi `.` (titik).
Jangan deploy dengan drag-and-drop, karena panel admin butuh repository.

### 4. Aktifkan login admin (GitHub OAuth)
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
   - Homepage URL: alamat situs Netlify kamu
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Salin **Client ID**, lalu buat dan salin **Client Secret**.
3. Netlify → **Project configuration → Access & security → OAuth → Install provider → GitHub**, lalu tempel Client ID dan Secret.

### 5. Beri akses ke pemilik usaha
Pemilik (Pak Bambang) perlu akun GitHub. Di GitHub: repository → **Settings → Collaborators → Add people**, masukkan username GitHub-nya. Setelah ia menerima undangan, ia bisa login di `https://NAMA-SITUS.netlify.app/admin/` dengan tombol **Login with GitHub**.

Orang lain, termasuk pengunjung, tidak punya akses. Pastikan repository tidak diberi collaborator selain orang yang dipercaya.

## Cara pemilik mengubah isi

1. Buka `/admin/` dan login.
2. Klik **Pengaturan Website & Produk**.
3. Ubah harga, nama, foto, atau tambah produk, lalu klik **Publish**.
4. Tunggu sekitar 1 menit, website otomatis terbarui.

## Alternatif tanpa akun GitHub untuk pemilik

Kalau pemilik tidak mau memakai GitHub, ganti blok `backend` di `admin/config.yml` dengan:

```yaml
backend:
  name: git-gateway
  branch: main
```

Lalu tambahkan di `admin/index.html` sebelum script Decap:
`<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>`

Di Netlify: aktifkan Identity, set registrasi ke **Invite only**, aktifkan Git Gateway, lalu undang email pemilik. Catatan: Git Gateway sudah berstatus deprecated di Netlify dan tidak diperbaiki lagi, jadi cara GitHub di atas lebih aman untuk jangka panjang.
