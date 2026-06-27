# Attract — Project Brief

## Deskripsi Sistem

Attract adalah platform SaaS multi-tenant untuk manajemen leads dan penjualan, dirancang khusus untuk UMKM Indonesia yang menjalankan iklan digital di Meta Ads dan TikTok Ads. Sistem ini menghubungkan seluruh alur dari klik iklan pertama hingga order selesai dalam satu platform terpadu.

---

## Entitas Utama

### Business (Tenant)

Setiap pengguna Attract adalah sebuah bisnis (tenant). Satu bisnis bisa memiliki banyak produk, banyak agen CS, banyak leads, dan banyak integrasi channel.

### Lead

Setiap calon pelanggan yang masuk dari channel manapun (WhatsApp, Instagram DM, TikTok, Form Web) dicatat sebagai satu entitas Lead. Lead menyimpan:

- Informasi kontak (nama, nomor HP, email)
- Sumber masuk (channel dan iklan mana yang membawa mereka)
- Click ID dari platform iklan (fbclid, ttclid, gclid)
- Status pipeline saat ini
- Agen CS yang menangani
- Riwayat percakapan

### Order

Order dibuat dari Lead yang sudah closing. Order menyimpan:

- Produk yang dibeli beserta varian dan jumlah
- Total harga
- Data pengiriman (alamat, ekspedisi, nomor resi)
- Status pengiriman

### Agent (CS)

Pengguna internal dalam satu bisnis yang menangani leads. Satu bisnis bisa punya banyak agen.

### Channel

Sumber pesan masuk yang terhubung ke sistem. Setiap bisnis bisa menghubungkan satu atau lebih channel:

- WhatsApp Business API
- Instagram (via Meta Graph API)
- TikTok Messaging
- Form Web (embed di landing page)

### Ad Account

Akun iklan yang dihubungkan bisnis ke sistem. Mendukung:

- Meta Ads (Facebook & Instagram)
- TikTok Ads
- Google Ads

---

## Alur Sistem Utama

### 1. Lead Masuk

1. User klik iklan di Meta/TikTok/Google
2. Sistem mencatat metadata klik: click_id (fbclid/ttclid/gclid), UTM parameters, IP, user agent, timestamp
3. User berinteraksi — mengisi form atau mengirim pesan WhatsApp
4. Sistem membuat entitas Lead baru secara otomatis
5. Lead masuk ke pipeline dengan status `new_lead`
6. Sistem mendistribusikan lead ke agen CS berdasarkan rules yang dikonfigurasi bisnis (round-robin, by produk, dll)

### 2. Penanganan Lead oleh CS

1. Agen CS menerima notifikasi lead baru di Unified Inbox
2. CS membalas pesan langsung dari dalam sistem — semua channel terpusat di satu inbox
3. CS mengubah status lead sesuai perkembangan
4. Sistem mencatat semua aktivitas dan timestamp perubahan status

### 3. Konversi ke Order

1. CS membuat order dari halaman lead
2. Sistem menghitung total harga berdasarkan produk dan varian yang dipilih
3. Sistem mengintegrasikan ekspedisi untuk mendapatkan ongkos kirim dan generate nomor resi
4. Notifikasi otomatis dikirim ke pelanggan via WhatsApp

### 4. Pengiriman Data Konversi ke Platform Iklan (CAPI)

Setiap kali ada event penting (lead masuk, order dibuat, order selesai), sistem mengirim data ke platform iklan melalui server-to-server API:

- Data personal (email, nomor HP) di-hash dengan SHA-256 sebelum dikirim
- Click ID yang tersimpan saat klik iklan digunakan untuk mencocokkan event dengan iklan yang tepat
- Mendukung Meta Conversions API, TikTok Events API, dan Google Enhanced Conversions

### 5. Automation

Sistem memiliki rule engine berbasis IF-THEN yang bisa dikonfigurasi per bisnis:

- Jika lead belum direspons dalam X menit → kirim pesan follow-up otomatis
- Jika status lead berubah ke Y → kirim notifikasi ke CS tertentu
- Jika order dibuat → kirim pesan konfirmasi ke pelanggan
- Jika lead dari sumber iklan Z → assign ke agen A

---

## Pipeline Lead

Status pipeline yang digunakan dalam sistem:

| Status       | Deskripsi                                      |
| ------------ | ---------------------------------------------- |
| `new_lead`   | Lead baru masuk, belum ada respons dari CS     |
| `contacted`  | CS sudah menghubungi lead                      |
| `interested` | Lead menunjukkan minat, dalam proses negosiasi |
| `order`      | Lead sudah melakukan order                     |
| `delivered`  | Order sudah dikirim dan diterima               |
| `lost`       | Lead tidak jadi membeli                        |

---

## Unified Inbox

Sistem inbox terpusat yang:

- Menampilkan semua pesan masuk dari semua channel dalam satu tampilan
- Memungkinkan CS membalas pesan dari channel manapun tanpa keluar dari sistem
- Menampilkan konteks lead di samping percakapan (status, riwayat, data iklan sumber)
- Mendukung template pesan yang bisa dipilih CS saat membalas
- Menandai percakapan berdasarkan status lead

---

## Dashboard dan Reporting

Sistem menyediakan data agregat yang bisa difilter per periode (hari, minggu, bulan):

**Metrik Iklan**

- Jumlah lead per campaign/ad set
- Cost per lead (dihitung dari data iklan yang dihubungkan)
- ROAS berdasarkan data order yang masuk

**Metrik Sales**

- Total leads masuk
- Closing rate (order / leads)
- Revenue total dan per produk
- Drop-off di setiap stage pipeline

**Metrik CS**

- Rata-rata waktu respons pertama per agen
- Jumlah leads yang ditangani per agen
- Closing rate per agen

---

## Multi-Tenant

Setiap bisnis memiliki data yang sepenuhnya terisolasi satu sama lain. Satu akun bisnis bisa memiliki:

- Banyak produk
- Banyak agen CS dengan level akses berbeda (Owner, Admin, Agent)
- Banyak channel yang terhubung
- Banyak ad account yang terhubung
- Konfigurasi automation rules sendiri

---

## Integrasi Eksternal

| Integrasi                         | Tujuan                                                    |
| --------------------------------- | --------------------------------------------------------- |
| WhatsApp Business API             | Menerima dan mengirim pesan WhatsApp                      |
| Meta Graph API                    | Menerima DM Instagram, mengirim data konversi ke Meta Ads |
| TikTok API                        | Menerima DM TikTok, mengirim data konversi ke TikTok Ads  |
| Google Ads API                    | Mengirim data konversi ke Google Ads                      |
| API Ekspedisi (JNE, Sicepat, J&T) | Cek ongkir, generate resi, tracking pengiriman            |

---

## Hak Akses Pengguna

| Role  | Akses                                                           |
| ----- | --------------------------------------------------------------- |
| Owner | Akses penuh termasuk pengaturan bisnis, integrasi, dan billing  |
| Admin | Akses ke semua fitur kecuali billing                            |
| Agent | Hanya akses ke inbox, leads yang di-assign, dan pembuatan order |
