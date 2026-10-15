# ifs24054-pabwe2026-sk-p6-svelte

Studi Kasus 1 (Praktikum 6): **Delcom Link Tree** — Svelte 5 + Vite + JavaScript, router kustom (History API),
Tailwind CSS v4, lucide-svelte, SweetAlert2, Toast UI Editor. API: https://open-api.delcom.org/api/v1

## Menjalankan

```bash
bun install
bun run dev          # http://localhost:3004
bun run test         # jalankan pengujian (jangan pakai `bun test`)
bun run test:coverage  # threshold 100%
bun run build && bun run preview
```

File `.env` sudah berisi `VITE_DELCOM_BASEURL` dan `APP_PORT=3004`.

## Struktur

```
src/
├── App.svelte, router.js, main.js, index.css, setupTests.js, test-utils.js
├── helpers/   apiHelper.js, toolsHelper.js
├── hooks/     useInput.js
└── features/
    ├── auth/      api, layouts (AuthLayout), pages (Login, Register), states (authStore)
    ├── common/    pages (NotFoundPage)
    ├── users/     api, pages (Users, Profile), states (userStore)
    └── linktrees/ api, components (Navbar, Sidebar, Modal, MarkdownEditor/Viewer),
                   layouts (LinkTreeLayout), modals (Add, Change, ChangeCover, Item),
                   pages (Home, Detail), states (linkTreesStore)
```

## Rute

| Path | Layout | Halaman |
| --- | --- | --- |
| `/auth/login`, `/auth/register` | Auth | Login, Register |
| `/` | Aplikasi | Semua Link Tree |
| `/link-trees/:linkTreeId` | Aplikasi | Detail |
| `/users`, `/profile` | Aplikasi | Pengguna, Profil |
| lainnya | Aplikasi | NotFoundPage |

## Asumsi kontrak API (cek dengan dokumentasi Delcom)

Bagian modul hanya menyebut sebagian endpoint, jadi nama field/path berikut adalah asumsi dan
semuanya terpusat di dua file agar mudah disesuaikan:

- `src/features/linktrees/api/linkTreeApi.js`: item tautan memakai field `title` dan `url`;
  cover diunggah lewat field `cover`; item detail dibaca dari `data.link_tree.items` atau `data.items`.
- `src/features/users/api/userApi.js`: foto `POST /users/photo` (field `photo`),
  kata sandi `PUT /users/change-password` (`password`, `new_password`).
