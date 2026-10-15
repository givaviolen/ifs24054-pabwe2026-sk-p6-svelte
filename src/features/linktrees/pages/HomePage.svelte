<script>
  import { onMount } from "svelte";
  import { EyeOff, Globe, Link2, Lock, Plus, Search, Trash2 } from "lucide-svelte";
  import { authStore } from "../../auth/states/authStore.js";
  import {
    TYPE_LABELS,
    filterLinkTrees,
    getLinkTreeStats,
    linkTreesStore,
  } from "../states/linkTreesStore.js";
  import AddModal from "../modals/AddModal.svelte";
  import { handleLinkClick } from "../../../router.js";
  import {
    formatDate,
    hasImage,
    resolveAssetUrl,
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper.js";

  let query = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const profileId = $derived($authStore.profile.id);
  const filtered = $derived(filterLinkTrees($linkTreesStore.linkTrees, { query, onlyMine, profileId }));
  const stats = $derived(getLinkTreeStats($linkTreesStore.linkTrees, profileId));
  const mineLabel = $derived(`Milik saya (${stats.mine})`);
  const statCards = $derived([
    { label: "Total", value: stats.total, icon: Link2 },
    { label: "Publik", value: stats.public, icon: Globe },
    { label: "Tidak Terdaftar", value: stats.unlisted, icon: EyeOff },
    { label: "Privat", value: stats.private, icon: Lock },
  ]);

  onMount(() => {
    linkTreesStore.fetchLinkTrees();
  });

  function itemMeta(item) {
    return `${TYPE_LABELS[item.type]} · ${formatDate(item.created_at)}`;
  }

  function report(result, successMessage) {
    if (result.success) {
      showSuccessDialog(successMessage);
    } else {
      showErrorDialog(result.message);
    }
  }

  async function handleDelete(item) {
    const confirmed = await showConfirmDialog("Hapus link tree?", `"${item.title}" akan dihapus permanen.`, "Ya, hapus");
    if (!confirmed) {
      return;
    }
    report(await linkTreesStore.deleteLinkTree(item.id), "Link tree berhasil dihapus");
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog("Hapus semua link tree?", "Semua data akan dihapus permanen.", "Ya, hapus semua");
    if (!confirmed) {
      return;
    }
    report(await linkTreesStore.deleteAllLinkTrees(), "Semua link tree berhasil dihapus");
  }
</script>

<section data-testid="home-page">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold">Semua Link Tree</h1>
      <p class="text-slate-500">Kelola kumpulan tautanmu dan jelajahi milik pengguna lain.</p>
    </div>
    <div class="flex gap-2">
      {#if $linkTreesStore.linkTrees.length > 0}
        <button type="button" onclick={handleDeleteAll} disabled={$linkTreesStore.deletingAll}
          class="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
          Hapus Semua
        </button>
      {/if}
      <button type="button" onclick={() => (showAdd = true)}
        class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
        <Plus size={16} /> Tambah
      </button>
    </div>
  </div>

  <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="stats">
    {#each statCards as card (card.label)}
      {@const Icon = card.icon}
      <div class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={18} /></span>
        <div>
          <p class="text-xl font-extrabold">{card.value}</p>
          <p class="text-xs text-slate-500">{card.label}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-5 flex flex-wrap items-center gap-4">
    <div class="relative w-full max-w-md">
      <Search size={16} class="absolute left-3 top-3 text-slate-400" />
      <input type="search" placeholder="Cari link tree..." aria-label="Cari link tree" bind:value={query}
        class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-none focus:border-indigo-500" />
    </div>
    <label class="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" bind:checked={onlyMine} />
      <span>{mineLabel}</span>
    </label>
  </div>

  {#if $linkTreesStore.loading}
    <p class="mt-6 text-slate-500" data-testid="home-loading">Memuat link tree...</p>
  {:else if filtered.length === 0}
    <p class="mt-6 text-slate-500" data-testid="home-empty">Belum ada link tree yang cocok.</p>
  {:else}
    <ul class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as item (item.id)}
        {@const cover = resolveAssetUrl(item.cover)}
        <li class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm" data-testid="linktree-item">
          <a href={`/link-trees/${item.id}`} onclick={(event) => handleLinkClick(event, `/link-trees/${item.id}`)} class="block">
            {#if hasImage(cover)}
              <img src={cover} alt={`Sampul ${item.title}`} class="h-32 w-full object-cover" />
            {:else}
              <div class="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-400 text-white">
                <Link2 size={32} />
              </div>
            {/if}
            <div class="p-4">
              <p class="truncate font-bold">{item.title}</p>
              <p class="mt-1 text-xs text-slate-500">{itemMeta(item)}</p>
            </div>
          </a>
          {#if item.user_id === profileId}
            <div class="flex justify-end border-t border-slate-100 px-3 py-2">
              <button type="button" aria-label={`Hapus ${item.title}`} onclick={() => handleDelete(item)} disabled={$linkTreesStore.deleting}
                class="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-60">
                <Trash2 size={16} />
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if showAdd}
  <AddModal onClose={() => (showAdd = false)} />
{/if}