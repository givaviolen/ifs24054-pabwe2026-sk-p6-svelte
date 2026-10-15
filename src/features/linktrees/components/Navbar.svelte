<script>
  import { LogOut, Link2, Menu } from "lucide-svelte";
  import { authStore } from "../../auth/states/authStore.js";
  import { handleLinkClick, redirect } from "../../../router.js";
  import { hasImage, resolveAssetUrl, showConfirmDialog } from "../../../helpers/toolsHelper.js";

  let { onMenuClick } = $props();

  const profile = $derived($authStore.profile);

  async function handleLogout() {
    const confirmed = await showConfirmDialog("Keluar dari aplikasi?", "Kamu harus masuk lagi untuk melanjutkan.", "Ya, keluar");
    if (!confirmed) {
      return;
    }
    authStore.logout();
    redirect("/auth/login");
  }
</script>

{#if profile}
{@const photo = resolveAssetUrl(profile.photo)}
<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4" data-testid="navbar">
  <div class="flex items-center gap-3">
    <button type="button" aria-label="Buka menu" onclick={onMenuClick} class="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
      <Menu size={20} />
    </button>
    <a href="/" onclick={(event) => handleLinkClick(event, "/")} class="flex items-center gap-2 font-extrabold">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><Link2 size={18} /></span>
      Delcom Link Tree
    </a>
  </div>
  <div class="flex items-center gap-3">
    <span class="hidden text-sm font-medium sm:inline" data-testid="navbar-name">{profile.name}</span>
    {#if hasImage(photo)}
      <img src={photo} alt="" class="h-9 w-9 rounded-full object-cover" data-testid="navbar-photo" />
    {:else}
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700" data-testid="navbar-initial">
        {profile.name.charAt(0).toUpperCase()}
      </span>
    {/if}
    <button type="button" aria-label="Keluar" onclick={handleLogout} class="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
      <LogOut size={18} />
    </button>
  </div>
</header>
{/if}