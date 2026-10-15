<script>
  import { onMount } from "svelte";
  import { ArrowLeft, Camera, ExternalLink, Pencil, Plus, Trash2 } from "lucide-svelte";
  import { authStore } from "../../auth/states/authStore.js";
  import { TYPE_LABELS, linkTreesStore } from "../states/linkTreesStore.js";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import MarkdownViewer from "../components/MarkdownViewer.svelte";
  import { handleLinkClick, navigate } from "../../../router.js";
  import {
    formatDate,
    hasImage,
    resolveAssetUrl,
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper.js";

  let { params } = $props();

  let modal = $state(null);
  let editingItem = $state(null);

  const tree = $derived($linkTreesStore.linkTree);

  onMount(() => {
    linkTreesStore.clearDetail();
    linkTreesStore.fetchLinkTree(params.linkTreeId);
  });

  function treeMeta(value) {
    return `${TYPE_LABELS[value.type]} · dibuat ${formatDate(value.created_at)}`;
  }

  function closeModal() {
    modal = null;
    editingItem = null;
  }

  function openAddItem() {
    editingItem = null;
    modal = "item";
  }

  function openEditItem(item) {
    editingItem = item;
    modal = "item";
  }

  async function handleDeleteItem(item) {
    const confirmed = await showConfirmDialog("Hapus tautan?", `"${item.title}" akan dihapus.`, "Ya, hapus");
    if (!confirmed) {
      return;
    }
    const result = await linkTreesStore.deleteItem(tree.id, item.id);
    if (result.success) {
      showSuccessDialog("Tautan berhasil dihapus");
    } else {
      showErrorDialog(result.message);
    }
  }

  async function handleDeleteTree() {
    const confirmed = await showConfirmDialog("Hapus link tree?", `"${tree.title}" akan dihapus permanen.`, "Ya, hapus");
    if (!confirmed) {
      return;
    }
    const result = await linkTreesStore.deleteLinkTree(tree.id);
    if (result.success) {
      showSuccessDialog("Link tree berhasil dihapus");
      navigate("/");
    } else {
      showErrorDialog(result.message);
    }
  }
</script>

<section data-testid="detail-page">
  <a href="/" onclick={(event) => handleLinkClick(event, "/")} class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline">
    <ArrowLeft size={16} /> Kembali
  </a>

  {#if tree}
    {@const isOwner = tree.user_id === $authStore.profile.id}
    {@const cover = resolveAssetUrl(tree.cover)}
    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {#if hasImage(cover)}
        <img src={cover} alt={`Sampul ${tree.title}`} class="h-48 w-full object-cover" data-testid="detail-cover" />
      {:else}
        <div class="h-48 bg-gradient-to-br from-indigo-500 to-sky-400" data-testid="detail-cover-placeholder"></div>
      {/if}
      <div class="p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-extrabold">{tree.title}</h1>
            <p class="text-sm text-slate-500">{treeMeta(tree)}</p>
          </div>
          {#if isOwner}
            <div class="flex flex-wrap gap-2" data-testid="owner-actions">
              <button type="button" onclick={() => (modal = "change")} class="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                <Pencil size={14} /> Ubah Data
              </button>
              <button type="button" onclick={() => (modal = "cover")} class="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                <Camera size={14} /> Ubah Sampul
              </button>
              <button type="button" onclick={handleDeleteTree} disabled={$linkTreesStore.deleting} class="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          {/if}
        </div>
        <div class="mt-4">
          <MarkdownViewer value={tree.description} />
        </div>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <h2 class="text-lg font-bold">Tautan</h2>
      {#if isOwner}
        <button type="button" onclick={openAddItem} class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={14} /> Tambah Tautan
        </button>
      {/if}
    </div>

    {#if tree.items.length === 0}
      <p class="mt-3 text-slate-500" data-testid="items-empty">Belum ada tautan.</p>
    {:else}
      <ul class="mt-3 space-y-2">
        {#each tree.items as item (item.id)}
          <li class="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" data-testid="item-row">
            <a href={item.url} target="_blank" rel="noopener noreferrer" class="flex min-w-0 items-center gap-3">
              <ExternalLink size={16} class="shrink-0 text-indigo-600" />
              <span class="min-w-0">
                <span class="block truncate font-semibold">{item.title}</span>
                <span class="block truncate text-xs text-slate-500">{item.url}</span>
              </span>
            </a>
            {#if isOwner}
              <div class="flex shrink-0 gap-1">
                <button type="button" aria-label={`Ubah ${item.title}`} onclick={() => openEditItem(item)} class="rounded-lg p-2 hover:bg-slate-100"><Pencil size={14} /></button>
                <button type="button" aria-label={`Hapus ${item.title}`} onclick={() => handleDeleteItem(item)} class="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if modal === "change"}
      <ChangeModal linkTree={tree} onClose={closeModal} />
    {:else if modal === "cover"}
      <ChangeCoverModal linkTree={tree} onClose={closeModal} />
    {:else if modal === "item"}
      <ItemModal linkTreeId={tree.id} item={editingItem} onClose={closeModal} />
    {/if}
  {:else if $linkTreesStore.detailLoading}
    <p class="text-slate-500" data-testid="detail-loading">Memuat detail...</p>
  {:else}
    <p class="text-slate-500" data-testid="detail-error">{$linkTreesStore.error || "Link tree tidak ditemukan."}</p>
  {/if}
</section>