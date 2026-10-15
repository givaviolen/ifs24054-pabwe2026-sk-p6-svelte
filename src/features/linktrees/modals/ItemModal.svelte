<script>
  import Modal from "../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { linkTreesStore } from "../states/linkTreesStore.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";

  // item bernilai null saat menambah tautan baru, dan objek item saat mengubah.
  let { linkTreeId, item, onClose } = $props();

  const { value: title } = useInput(item ? item.title : "");
  const { value: url } = useInput(item ? item.url : "");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!$title.trim()) {
      showErrorDialog("Judul tautan wajib diisi");
      return;
    }
    if (!/^https?:\/\/\S+$/.test($url.trim())) {
      showErrorDialog("URL harus diawali http:// atau https://");
      return;
    }
    const payload = { title: $title.trim(), url: $url.trim() };
    const result = item
      ? await linkTreesStore.changeItem(linkTreeId, item.id, payload)
      : await linkTreesStore.addItem(linkTreeId, payload);
    if (!result.success) {
      showErrorDialog(result.message);
      return;
    }
    showSuccessDialog(item ? "Tautan berhasil diperbarui" : "Tautan berhasil ditambahkan");
    onClose();
  }
</script>

<Modal title={item ? "Ubah Tautan" : "Tambah Tautan"} {onClose}>
  <form onsubmit={handleSubmit} class="space-y-4" data-testid="item-form">
    <div>
      <label for="item-title" class="mb-1 block text-sm font-medium">Judul Tautan</label>
      <input id="item-title" type="text" placeholder="Contoh: Portofolio" bind:value={$title}
        class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
    </div>
    <div>
      <label for="item-url" class="mb-1 block text-sm font-medium">URL</label>
      <input id="item-url" type="text" placeholder="https://contoh.com" bind:value={$url}
        class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
    </div>
    <div class="flex justify-end gap-2">
      <button type="button" onclick={onClose} class="rounded-xl px-4 py-2 font-medium hover:bg-slate-100">Batal</button>
      <button type="submit" disabled={$linkTreesStore.itemMutating}
        class="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {$linkTreesStore.itemMutating ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>
