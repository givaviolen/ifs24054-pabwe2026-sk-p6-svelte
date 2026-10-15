<script>
  import { Link2, User, Users, X } from "lucide-svelte";
  import { currentPath, isMenuActive, navigate } from "../../../router.js";

  let { open, onClose } = $props();

  const menus = [
    { label: "Semua Link Tree", path: "/", icon: Link2 },
    { label: "Pengguna", path: "/users", icon: Users },
    { label: "Profil", path: "/profile", icon: User },
  ];

  function go(event, path) {
    event.preventDefault();
    navigate(path);
    onClose();
  }
</script>

<aside
  data-testid="sidebar"
  class="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-100 bg-white p-4 transition-transform lg:static lg:translate-x-0 {open ? 'translate-x-0' : '-translate-x-full'}">
  <div class="mb-4 flex items-center justify-between lg:hidden">
    <span class="font-extrabold">Menu</span>
    <button type="button" aria-label="Tutup menu" onclick={onClose} class="rounded-lg p-2 hover:bg-slate-100">
      <X size={18} />
    </button>
  </div>
  <nav class="space-y-1">
    {#each menus as menu (menu.path)}
      {@const Icon = menu.icon}
      {@const active = isMenuActive(menu.path, $currentPath)}
      <a
        href={menu.path}
        onclick={(event) => go(event, menu.path)}
        aria-current={active ? "page" : undefined}
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium {active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}">
        <Icon size={18} />
        {menu.label}
      </a>
    {/each}
  </nav>
</aside>
