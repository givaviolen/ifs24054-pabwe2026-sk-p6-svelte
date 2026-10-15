<script>
  import { handleLinkClick } from "../../../router.js";
</script>

<section class="flex flex-col items-center py-24 text-center" data-testid="not-found-page">
  <p class="text-7xl font-extrabold text-indigo-600">404</p>
  <h1 class="mt-4 text-2xl font-bold">Halaman tidak ditemukan</h1>
  <p class="mt-2 text-slate-500">Alamat yang kamu tuju tidak tersedia atau sudah dipindahkan.</p>
  <a
    href="/"
    onclick={(event) => handleLinkClick(event, "/")}
    class="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
    Kembali ke Beranda
  </a>
</section>
