<script>
  import { X } from "lucide-svelte";

  let { title, onClose, children } = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label={title} data-testid="modal">
  <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
    <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h2 class="text-lg font-bold">{title}</h2>
      <button type="button" aria-label="Tutup" onclick={onClose} data-testid="modal-close" class="rounded-lg p-1.5 hover:bg-slate-100">
        <X size={18} />
      </button>
    </div>
    <div class="p-5">
      {@render children()}
    </div>
  </div>
</div>
