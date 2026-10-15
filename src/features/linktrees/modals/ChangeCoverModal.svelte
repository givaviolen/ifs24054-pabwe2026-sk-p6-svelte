<script>
  import Modal from "../components/Modal.svelte";
  import { linkTreesStore } from "../states/linkTreesStore.js";
  import { showErrorDialog, showSuccessDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";

  let { linkTree, onClose } = $props();

  let file = $state(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      showWarningDialog("Pilih gambar sampul terlebih dahulu");
      return;
    }
    const result = await linkTreesStore.changeCover(linkTree.id, file);
    if (!result.success) {
      showErrorDialog(result.message);
      return;
    }
    showSuccessDialog("Sampul berhasil diperbarui");
    onClose();
  }
</script>

<Modal title="Ubah Sampul" {onClose}>
  <form onsubmit={handleSubmit} class="space-y-4" data-testid="cover-form">
    <div>
      <label for="cover-file" class="mb-1 block text-sm font-medium">Gambar Sampul</label>
      <input id="cover-file" type="file" accept="image/*"
        onchange={(event) => (file = event.currentTarget.files[0])}
        class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
    </div>
    <div class="flex justify-end gap-2">
      <button type="button" onclick={onClose} class="rounded-xl px-4 py-2 font-medium hover:bg-slate-100">Batal</button>
      <button type="submit" disabled={$linkTreesStore.changingCover}
        class="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {$linkTreesStore.changingCover ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  </form>
</Modal>
