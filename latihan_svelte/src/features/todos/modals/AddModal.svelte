<script>
  import { createEventDispatcher } from "svelte";
  import { Plus, X, LoaderCircle } from "lucide-svelte";
  import { todosStore } from "../states/todosStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import MarkdownEditor from "../components/MarkdownEditor.svelte";

  export let show = false;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let title = "";
  let description = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if ($todosStore.isTodoAdd) {
    loading = false;
    todosStore.setIsTodoAdd(false);
    if ($todosStore.isTodoAdded) {
      todosStore.setIsTodoAdded(false);
      todosStore.asyncSetTodos();
      title = "";
      description = "";
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    loading = true;
    todosStore.asyncSetIsTodoAdd(title.trim(), description.trim());
  }
</script>

{#if show}
  <div
    data-testid="add-todo-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <!-- Modal Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"
        >
          <Plus size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Tambah Todo Baru</h3>
          <p class="text-xs text-slate-500">
            Buat tugas baru dan tuliskan detailnya dengan format Markdown
          </p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-add-modal-btn"
        on:click={handleClose}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    <!-- Modal Form Body -->
    <form
      on:submit|preventDefault={handleSave}
      class="flex-1 flex flex-col min-h-0 bg-white"
    >
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-4 w-full">
        <div class="shrink-0">
          <label
            for="add-todo-title-input"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Judul Todo <span class="text-red-500">*</span>
          </label>
          <input
            id="add-todo-title-input"
            type="text"
            data-testid="add-todo-title-input"
            bind:value={title}
            placeholder="Contoh: Menyelesaikan Laporan Praktikum"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            required
          />
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <span
            class="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0"
          >
            Deskripsi (Markdown) <span class="text-red-500">*</span>
          </span>
          <div class="flex-1 min-h-[300px]">
            <MarkdownEditor
              bind:value={description}
              placeholder="Tuliskan rincian tugas yang perlu diselesaikan dalam format Markdown..."
              height="100%"
              textareaTestId="add-todo-description-input"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0"
      >
        <button
          type="button"
          data-testid="cancel-add-modal-btn"
          on:click={handleClose}
          disabled={loading}
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-add-modal-btn"
          disabled={loading}
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          {#if loading}
            <LoaderCircle size={18} class="animate-spin" />
            <span>Menyimpan...</span>
          {:else}
            <Plus size={18} strokeWidth={2.5} />
            <span>Tambah Todo</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
{/if}
