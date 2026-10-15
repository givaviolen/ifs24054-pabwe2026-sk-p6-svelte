<script>
  import Modal from "../components/Modal.svelte";
  import MarkdownEditor from "../components/MarkdownEditor.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { linkTreesStore } from "../states/linkTreesStore.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";

  let { onClose } = $props();

  const { value: title } = useInput("");
  const { value: type } = useInput("public");
  let description = $state("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!$title.trim()) {
      showErrorDialog("Judul wajib diisi");
      return;
    }
    const result = await linkTreesStore.addLinkTree({ title: $title.trim(), type: $type, description });
    if (!result.success) {
      showErrorDialog(result.message);
      return;
    }
    showSuccessDialog("Link tree berhasil ditambahkan");
    onClose();
  }
</script>

<Modal title="Tambah Link Tree" {onClose}>
  <form onsubmit={handleSubmit} class="space-y-4" data-testid="add-form">
    <div>
      <label for="add-title" class="mb-1 block text-sm font-medium">Judul</label>
      <input id="add-title" type="text" placeholder="Judul link tree" bind:value={$title}
        class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
    </div>
    <div>
      <label for="add-type" class="mb-1 block text-sm font-medium">Tipe</label>
      <select id="add-type" bind:value={$type} class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
        <option value="public">Publik</option>
        <option value="unlisted">Tidak Terdaftar</option>
        <option value="private">Privat</option>
      </select>
    </div>
    <div>
      <span class="mb-1 block text-sm font-medium">Deskripsi</span>
      <MarkdownEditor value={description} onchange={(markdown) => (description = markdown)} />
    </div>
    <div class="flex justify-end gap-2">
      <button type="button" onclick={onClose} class="rounded-xl px-4 py-2 font-medium hover:bg-slate-100">Batal</button>
      <button type="submit" disabled={$linkTreesStore.adding}
        class="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {$linkTreesStore.adding ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>
