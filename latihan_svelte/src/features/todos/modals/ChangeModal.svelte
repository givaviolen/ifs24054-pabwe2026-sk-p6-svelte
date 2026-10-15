<script>
  import { createEventDispatcher } from "svelte";
  import { PenLine, X, LoaderCircle } from "lucide-svelte";
  import { todosStore } from "../states/todosStore";
  import todoApi from "../api/todoApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import MarkdownEditor from "../components/MarkdownEditor.svelte";

  export let show = false;
  export let todoId = null;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let fetchingTodo = false;
  let title = "";
  let isFinished = "0";
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

  $: if (show && todoId) {
    loadTodoData(todoId);
  }

  async function loadTodoData(id) {
    fetchingTodo = true;
    try {
      const todo = await todoApi.getTodoById(id);
      if (todo) {
        title = todo.title || "";
        description = todo.description || "";
        isFinished = todo.is_finished ? "1" : "0";
      }
    } catch {
      showErrorDialog("Gagal mengambil data todo");
      handleClose();
    } finally {
      fetchingTodo = false;
    }
  }

  $: if ($todosStore.isTodoChange) {
    loading = false;
    todosStore.setIsTodoChange(false);
    if ($todosStore.isTodoChanged) {
      todosStore.setIsTodoChanged(false);
      todosStore.asyncSetTodos();
      todosStore.asyncSetTodo(todoId);
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
    todosStore.asyncSetIsTodoChange(
      todoId,
      title.trim(),
      description.trim(),
      isFinished === "1"
    );
  }
</script>

{#if show}
  <div
    data-testid="edit-todo-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <PenLine size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Ubah Data Todo</h3>
          <p class="text-xs text-slate-500">Perbarui judul, status penyelesaian, dan detail deskripsi Markdown</p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-edit-modal-btn"
        on:click={handleClose}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    <!-- Modal Form Body -->
    <form on:submit|preventDefault={handleSave} class="flex-1 flex flex-col min-h-0 bg-white">
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-4 w-full">
        {#if fetchingTodo}
          <div class="flex-1 flex items-center justify-center">
            <LoaderCircle size={32} class="animate-spin text-amber-600" />
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <div class="md:col-span-2">
              <label for="edit-todo-title-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
                Judul Todo <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-todo-title-input"
                type="text"
                data-testid="edit-todo-title-input"
                bind:value={title}
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
                required
              />
            </div>

            <div>
              <label for="edit-todo-status-select" class="block text-sm font-semibold text-slate-700 mb-1.5">
                Status Penyelesaian
              </label>
              <select
                id="edit-todo-status-select"
                data-testid="edit-todo-status-select"
                bind:value={isFinished}
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              >
                <option value="0">Sedang Proses</option>
                <option value="1">Sudah Selesai</option>
              </select>
            </div>
          </div>

          <div class="flex-1 flex flex-col min-h-0">
            <span class="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0">
              Deskripsi (Markdown) <span class="text-red-500">*</span>
            </span>
            <div class="flex-1 min-h-[300px]">
              <MarkdownEditor
                bind:value={description}
                placeholder="Tuliskan rincian tugas yang perlu diselesaikan dalam format Markdown..."
                height="100%"
                textareaTestId="edit-todo-description-input"
              />
            </div>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
        <button
          type="button"
          data-testid="cancel-edit-modal-btn"
          on:click={handleClose}
          disabled={loading}
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-edit-modal-btn"
          disabled={loading || fetchingTodo}
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-600/25 transition-all disabled:opacity-60"
        >
          {#if loading}
            <LoaderCircle size={18} class="animate-spin" />
            <span>Menyimpan...</span>
          {:else}
            <PenLine size={18} strokeWidth={2.5} />
            <span>Perbarui Todo</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
{/if}
