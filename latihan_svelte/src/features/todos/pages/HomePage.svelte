<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import { todosStore } from "../states/todosStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    Plus,
    SquareCheckBig,
    CircleCheck,
    Clock,
    Eye,
    Pencil,
    Trash2,
    Funnel,
    Search,
    LoaderCircle,
  } from "lucide-svelte";

  let loadingTodos = false;
  let filter = "";
  let searchQuery = "";
  let showAddModal = false;
  let showChangeModal = false;
  let selectedTodoId = null;

  $: profile = $usersStore.profile;
  $: todos = $todosStore.todos || [];

  onMount(() => {
    loadTodos();
  });

  function loadTodos() {
    loadingTodos = true;
    Promise.resolve(todosStore.asyncSetTodos(filter)).finally(() => {
      loadingTodos = false;
    });
  }

  let prevFilter = filter;
  $: if (filter !== prevFilter) {
    prevFilter = filter;
    loadTodos();
  }

  $: if ($todosStore.isTodoDeleted) {
    todosStore.setIsTodoDeleted(false);
    loadTodos();
  }

  function handleEditTodo(todoId) {
    selectedTodoId = todoId;
    showChangeModal = true;
  }

  async function handleDeleteTodo(todoId) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus todo ini?");
    if (result.isConfirmed) {
      todosStore.asyncSetIsTodoDelete(todoId);
    }
  }

  $: filteredTodos = todos.filter((todo) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = todo.title ? todo.title.toLowerCase() : "";
    const description = todo.description ? todo.description.toLowerCase() : "";
    return title.includes(q) || description.includes(q);
  });

  $: totalCount = todos.length;
  $: finishedCount = todos.filter((t) => t.is_finished).length;
  $: pendingCount = totalCount - finishedCount;
</script>

{#if profile}
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Todos
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kelola dan pantau semua tugas harian Anda secara terorganisir.
        </p>
      </div>
      <button
        type="button"
        data-testid="add-todo-btn"
        on:click={() => (showAddModal = true)}
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>Tambah Todo</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Todo
          </p>
          <h3 class="text-3xl font-black text-slate-800 mt-1">{totalCount}</h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <SquareCheckBig size={26} strokeWidth={2} />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Todo Selesai
          </p>
          <h3 class="text-3xl font-black text-emerald-600 mt-1">
            {finishedCount}
          </h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CircleCheck size={26} strokeWidth={2} />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sedang Proses
          </p>
          <h3 class="text-3xl font-black text-amber-600 mt-1">{pendingCount}</h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock size={26} strokeWidth={2} />
        </div>
      </div>
    </div>

    <!-- Table & Controls Section -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Filter bar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search
            size={18}
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            data-testid="search-todo-input"
            bind:value={searchQuery}
            placeholder="Cari judul atau rincian todo..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Funnel size={16} /> Filter:
          </span>
          <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              data-testid="filter-all-btn"
              on:click={() => (filter = "")}
              class="px-3 py-1.5 rounded-lg transition-all {filter === '' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}"
            >
              Semua
            </button>
            <button
              type="button"
              data-testid="filter-pending-btn"
              on:click={() => (filter = "0")}
              class="px-3 py-1.5 rounded-lg transition-all {filter === '0' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'}"
            >
              Proses
            </button>
            <button
              type="button"
              data-testid="filter-finished-btn"
              on:click={() => (filter = "1")}
              class="px-3 py-1.5 rounded-lg transition-all {filter === '1' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>

      <!-- Responsive Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3.5 text-center w-16">ID</th>
              <th class="px-5 py-3.5">Judul</th>
              <th class="px-5 py-3.5 hidden md:table-cell">Dibuat</th>
              <th class="px-5 py-3.5 hidden lg:table-cell">Diperbarui</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#if loadingTodos && filteredTodos.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
                  <p class="font-medium text-slate-600">Memuat daftar todo...</p>
                </td>
              </tr>
            {:else if filteredTodos.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <SquareCheckBig size={40} class="mx-auto text-slate-300 mb-2" />
                  <p class="font-medium">Belum ada data todo yang cocok.</p>
                </td>
              </tr>
            {:else}
              {#each filteredTodos as todo (todo.id)}
                <tr
                  data-testid={`todo-row-${todo.id}`}
                  class="hover:bg-slate-50/70 transition-colors group"
                >
                  <td class="px-5 py-4 text-center font-mono text-xs font-bold text-slate-400">
                    {"#" + todo.id}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      {#if todo.cover}
                        <img
                          src={todo.cover}
                          alt={todo.title}
                          class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      {/if}
                      <div>
                        <p class="font-semibold text-slate-800 leading-snug">
                          {todo.title}
                        </p>
                        {#if todo.description}
                          <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {todo.description}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell text-xs text-slate-500">
                    {formatDate(todo.created_at)}
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell text-xs text-slate-500">
                    {formatDate(todo.updated_at)}
                  </td>
                  <td class="px-5 py-4">
                    {#if todo.is_finished}
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Selesai
                      </span>
                    {:else}
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Proses
                      </span>
                    {/if}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`view-todo-${todo.id}`}
                        on:click={() => navigate(`/todos/${todo.id}`)}
                        class="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        data-testid={`edit-todo-${todo.id}`}
                        on:click={() => handleEditTodo(todo.id)}
                        class="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Ubah Todo"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-todo-${todo.id}`}
                        on:click={() => handleDeleteTodo(todo.id)}
                        class="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Todo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <AddModal show={showAddModal} on:close={() => (showAddModal = false)} />
    <ChangeModal
      show={showChangeModal}
      todoId={selectedTodoId}
      on:close={() => (showChangeModal = false)}
    />
  </div>
{/if}
