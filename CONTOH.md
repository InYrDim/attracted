# Contoh Real: Budi Jualan Skincare

## Skenario

**Budi** punya bisnis skincare. Dia pasang iklan di Instagram. Dia punya landing page
sederhana (pake Webflow / WordPress / Carrd / HTML static — terserah).

Budi pake **Attract** buat ngelola leads & sales-nya.

---

## Step 1: Budi daftar & setup Attract

Budi buka `https://attract.budi.com/login` → daftar → bikin business "Budi Skincare"

Attract kasih dia:

```
Business ID: BUS_abc123
```

Budi bikin **Web Form Channel** di dashboard → Attract generate:

```
Form ID:     ch_form_xyz
API Endpoint: https://attract.budi.com/api/forms/ch_form_xyz/submit
Tracking Script: https://attract.budi.com/api/track?b=BUS_abc123
```

---

## Step 2: Budi tempel 2 baris ke landing page-nya

Landing page Budi (yang udah ada, bikinan bebas):

**Sebelum pake Attract:**
```html
<form action="/send-email.php" method="POST">
  <input name="name" placeholder="Nama">
  <input name="phone" placeholder="HP">
  <button type="submit">Kirim</button>
</form>
```

**Sesudah pake Attract — cuma ganti 2 hal:**
```html
<!-- 1) Tracking pixel (taro di <head>) — nyimpen data klik iklan -->
<script async src="https://attract.budi.com/api/track?b=BUS_abc123"></script>

<!-- 2) Form action diarahin ke Attract — bukan ke email lagi -->
<form action="https://attract.budi.com/api/forms/ch_form_xyz/submit" method="POST">
  <input name="name" placeholder="Nama">
  <input name="phone" placeholder="HP">
  <button type="submit">Kirim</button>
</form>
```

**Selesai. Budi gak perlu nambahin kode lain, gak perlu install library.**

---

## Step 3: Customer lihat iklan → klik → isi form

```
      Instagram Ads
          │
          ▼  Customer "Rina" klik iklan Budi
          │  URL: https://budi.com?utm_source=instagram&fbclid=123
          │
     ┌────┴────┐
     │         │
     ▼         ▼
  [Tracking   [Form biasa]
   Pixel]       Rina isi nama & no HP
     │         lalu klik "Kirim"
     │         │
     │         ▼
     └──► Attract ◄──┘
            │
            ├─ Tracking pixel simpan: IP Rina + "dari Instagram" + fbclid=123
            └─ Form submit simpan: Lead baru + atribusi ke klik tadi
```

---

## Step 4: Di dashboard Attract

Budi buka `https://attract.budi.com/dashboard/leads`

```
┌─────────────────────────────────────────────────────┐
│  Leads                                              │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│  Nama    │  Channel  │  Status   │  Dari    │  Waktu  │
├──────────┼──────────┼──────────┼──────────┼─────────┤
│  Rina    │  Web Form │ new_lead │Instagram │ 2m lalu │
│  ...     │  ...      │ ...      │ ...      │ ...     │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

Budi liat: "Rina baru masuk — dari Instagram, kampanye promo_juni".

---

## Step 5: Budi chat & closing

Budi klik lead Rina → buka Inbox → balas via WhatsApp:

```
┌──────────────────┐
│  Inbox            │
│ ┌──────────────┐ │
│ │ Rina: "Mau    │ │
│ │ beli serum"   │ │
│ │ Budi: "Ada    │ │
│ │ kak, Rp 150rb"│ │
│ └──────────────┘ │
│ [Create Order]   │
└──────────────────┘
```

Rina deal → Budi klik **Create Order**:
- Items: Serum × 1
- Total: Rp 150.000
- Status lead otomatis jadi `order`

---

## Step 6: Feedback ke Meta

Attract otomatis kirim event ke Meta:

```
Meta CAPI: "Ada Purchase dari klik iklan fbclid=123 → Rp 150.000"
```

Meta pake data ini buat:
- Ngasih laporan ROAS (Return on Ad Spend) akurat
- Optimasi iklan: target orang yang mirip Rina (lookalike)

---

## Tanpa Attract?

- Rina chat lewat WA pribadi Budi → campur aduk sama customer lain
- Budi lupa Rina dari iklan mana
- Gak ada dashboard, gak ada status lead, gak ada order tracking
- Meta gak tau ada closing → iklan gak optimal
- Kalo punya 5 agen, gak ada yang tau siapa handle Rina

---

## Pakai Attract?

- Semua lead tercatat otomatis dari iklan
- Tim bisa kolaborasi di satu dashboard
- Tiap lead tau asal-usulnya (Instagram/TikTok/Google/Wa/Web)
- Order tercatat dari lead → track shipping
- Meta dapet feedback → iklan makin tepat sasaran
