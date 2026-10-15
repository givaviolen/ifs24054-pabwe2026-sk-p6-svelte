<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { authStore } from "../states/authStore.js";
  import { handleLinkClick, redirect } from "../../../router.js";
  import { showErrorDialog } from "../../../helpers/toolsHelper.js";

  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await authStore.login({ email: $email, password: $password });
    if (result.success) {
      redirect("/");
    } else {
      showErrorDialog(result.message);
    }
  }
</script>

<h2 class="mb-4 text-xl font-bold">Masuk</h2>
<form onsubmit={handleSubmit} class="space-y-4" data-testid="login-form">
  <div>
    <label for="email" class="mb-1 block text-sm font-medium">Email</label>
    <input id="email" type="email" required placeholder="nama@email.com" bind:value={$email}
      class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
  </div>
  <div>
    <label for="password" class="mb-1 block text-sm font-medium">Kata Sandi</label>
    <input id="password" type="password" required placeholder="Kata sandi" bind:value={$password}
      class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
  </div>
  <button
    type="submit"
    disabled={$authStore.loading}
    class="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
    {$authStore.loading ? "Memproses..." : "Masuk"}
  </button>
</form>
<p class="mt-4 text-center text-sm text-slate-500">
  Belum punya akun?
  <a
    href="/auth/register"
    onclick={(event) => handleLinkClick(event, "/auth/register")}
    class="font-semibold text-indigo-600 hover:underline">Daftar</a>
</p>
