<script>
  import { onMount } from "svelte";
  import { currentPath, initRouter, redirect, resolveRoute } from "./router.js";
  import { authStore } from "./features/auth/states/authStore.js";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";

  const route = $derived(resolveRoute($currentPath));
  const isAuth = $derived($authStore.isAuthenticated);
  const allowed = $derived(route.layout === "auth" ? !isAuth : isAuth);
  const Layout = $derived(route.layout === "auth" ? AuthLayout : LinkTreeLayout);
  const Page = $derived(route.component);

  onMount(() => {
    const stopRouter = initRouter();
    authStore.init();
    return stopRouter;
  });

  $effect(() => {
    if (!$authStore.initialized || allowed) {
      return;
    }
    redirect(route.layout === "auth" ? "/" : "/auth/login");
  });
</script>

{#if $authStore.initialized && allowed}
  <Layout>
    <Page params={route.params} />
  </Layout>
{:else}
  <main class="flex min-h-screen items-center justify-center text-slate-500" data-testid="app-loading">
    Memuat aplikasi...
  </main>
{/if}
