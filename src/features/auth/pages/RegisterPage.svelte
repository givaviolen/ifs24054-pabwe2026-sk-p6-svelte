<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { authStore } from "../states/authStore.js";
  import { handleLinkClick, navigate } from "../../../router.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";

  const { value: name } = useInput("");
  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await authStore.register({ name: $name, email: $email, password: $password });
    if (result.success) {
      await showSuccessDialog("Akun berhasil dibuat, silakan masuk");
      navigate("/auth/login");
    } else {
      showErrorDialog(result.message);
    }
  }
</script>

<h2 class="mb-4 text-xl font-bold">Daftar</h2>
<form onsubmit={handleSubmit} class="space-y-4" data-testid="register-form">
  <div>
    <label for="register-name-input" class="mb-1 block text-sm font-medium">Nama</label>
    <input id="register-name-input" type="text" required placeholder="Nama lengkap" bind:value={$name}
      class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
  </div>
  <div>
    <label for="register-email-input" class="mb-1 block text-sm font-medium">Email</label>
    <input id="register-email-input" type="email" required placeholder="nama@email.com" bind:value={$email}
      class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
  </div>
  <div>
    <label for="register-password-input" class="mb-1 block text-sm font-medium">Kata Sandi</label>
    <input id="register-password-input" type="password" required placeholder="Kata sandi" bind:value={$password}
      class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
  </div>
  <button
    id="register-submit-button"
    type="submit"
    disabled={$authStore.loading}
    class="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
    {$authStore.loading ? "Memproses..." : "Daftar"}
  </button>
</form>
<p class="mt-4 text-center text-sm text-slate-500">
  Sudah punya akun?
  <a
    href="/auth/login"
    onclick={(event) => handleLinkClick(event, "/auth/login")}
    class="font-semibold text-indigo-600 hover:underline">Masuk</a>
</p>
