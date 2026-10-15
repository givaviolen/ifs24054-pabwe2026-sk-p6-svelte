<script>
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  let { children } = $props();
  let sidebarOpen = $state(false);
</script>

<div class="min-h-screen" data-testid="linktree-layout">
  <Navbar onMenuClick={() => (sidebarOpen = !sidebarOpen)} />
  <div class="lg:flex">
    <Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />
    <main class="min-w-0 flex-1 p-4 sm:p-6">
      {@render children()}
    </main>
  </div>
</div>
