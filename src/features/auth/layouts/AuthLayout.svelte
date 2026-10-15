<script>
  import { Link2 } from "lucide-svelte";

  let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4">
  <div class="w-full max-w-md">
    <div class="mb-6 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
        <Link2 size={28} />
      </div>
      <h1 class="mt-4 text-2xl font-extrabold">Delcom Link Tree</h1>
      <p class="mt-1 text-sm text-slate-500">
        Kumpulkan semua tautan pentingmu dalam satu halaman yang rapi dan mudah dibagikan.
      </p>
    </div>
    <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm" data-testid="auth-card">
      {@render children()}
    </div>
  </div>
</div>
