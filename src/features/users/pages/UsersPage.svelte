<script>
  import { onMount } from "svelte";
  import { Search } from "lucide-svelte";
  import { userStore } from "../states/userStore.js";

  let query = $state("");

  const filtered = $derived(
    $userStore.users.filter((user) => {
      const keyword = query.trim().toLowerCase();
      return !keyword || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword);
    })
  );

  onMount(() => {
    userStore.fetchUsers();
  });
</script>

<section data-testid="users-page">
  <h1 class="text-2xl font-extrabold">Pengguna</h1>
  <p class="text-slate-500">Daftar pengguna yang terdaftar di Delcom.</p>

  <div class="relative mt-4 max-w-md">
    <Search size={16} class="absolute left-3 top-3 text-slate-400" />
    <input
      type="search"
      placeholder="Cari nama atau email..."
      aria-label="Cari pengguna"
      bind:value={query}
      class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-none focus:border-indigo-500" />
  </div>

  {#if $userStore.loading}
    <p class="mt-6 text-slate-500" data-testid="users-loading">Memuat pengguna...</p>
  {:else if filtered.length === 0}
    <p class="mt-6 text-slate-500" data-testid="users-empty">Tidak ada pengguna ditemukan.</p>
  {:else}
    <ul class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each filtered as user (user.id)}
        <li class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" data-testid="user-item">
          {#if user.photo}
            <img src={user.photo} alt={user.name} class="h-12 w-12 rounded-full object-cover" />
          {:else}
            <span class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          {/if}
          <div class="min-w-0">
            <p class="truncate font-semibold">{user.name}</p>
            <p class="truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
