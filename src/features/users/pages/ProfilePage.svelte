<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { authStore } from "../../auth/states/authStore.js";
  import { userStore } from "../states/userStore.js";
  import {
    hasImage,
    resolveAssetUrl,
    showErrorDialog,
    showSuccessDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper.js";

  const { value: name } = useInput($authStore.profile.name);
  const { value: email } = useInput($authStore.profile.email);
  const { value: password, reset: resetPassword } = useInput("");
  const { value: newPassword, reset: resetNewPassword } = useInput("");
  const { value: confirmPassword, reset: resetConfirmPassword } = useInput("");
  let photo = $state(null);

  const profile = $derived($authStore.profile);
  const photoUrl = $derived(resolveAssetUrl(profile.photo));

  function report(result, successMessage) {
    if (result.success) {
      showSuccessDialog(successMessage);
    } else {
      showErrorDialog(result.message);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    const result = await userStore.updateProfile({ name: $name, email: $email });
    report(result, "Profil berhasil diperbarui");
  }

  async function handlePhoto(event) {
    event.preventDefault();
    if (!photo) {
      showWarningDialog("Pilih foto terlebih dahulu");
      return;
    }
    const result = await userStore.uploadPhoto(photo);
    report(result, "Foto profil berhasil diperbarui");
  }

  async function handlePassword(event) {
    event.preventDefault();
    if ($newPassword !== $confirmPassword) {
      showWarningDialog("Konfirmasi kata sandi tidak sama");
      return;
    }
    const result = await userStore.changePassword({ password: $password, newPassword: $newPassword });
    if (result.success) {
      resetPassword();
      resetNewPassword();
      resetConfirmPassword();
    }
    report(result, "Kata sandi berhasil diubah");
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  const buttonClass =
    "rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60";
  const cardClass = "space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm";
</script>

<section class="max-w-2xl space-y-6" data-testid="profile-page">
  <div>
    <h1 class="text-2xl font-extrabold">Profil</h1>
    <p class="text-slate-500">Kelola data akun, foto, dan kata sandimu.</p>
  </div>

  <div class="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    {#if hasImage(photoUrl)}
      <img src={photoUrl} alt="" class="h-16 w-16 rounded-full object-cover" data-testid="profile-photo" />
    {:else}
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700" data-testid="profile-initial">
        {profile.name.charAt(0).toUpperCase()}
      </span>
    {/if}
    <div>
      <p class="text-lg font-bold">{profile.name}</p>
      <p class="text-slate-500">{profile.email}</p>
    </div>
  </div>

  <form onsubmit={handleUpdate} class={cardClass} data-testid="profile-form">
    <h2 class="font-bold">Ubah Data</h2>
    <div>
      <label for="profile-name" class="mb-1 block text-sm font-medium">Nama</label>
      <input id="profile-name" type="text" required bind:value={$name} class={inputClass} />
    </div>
    <div>
      <label for="profile-email" class="mb-1 block text-sm font-medium">Email</label>
      <input id="profile-email" type="email" required bind:value={$email} class={inputClass} />
    </div>
    <button type="submit" disabled={$userStore.saving} class={buttonClass}>Simpan</button>
  </form>

  <form onsubmit={handlePhoto} class={cardClass} data-testid="photo-form">
    <h2 class="font-bold">Ubah Foto</h2>
    <input
      id="profile-photo"
      type="file"
      accept="image/*"
      aria-label="Foto profil"
      onchange={(event) => (photo = event.currentTarget.files[0])}
      class={inputClass} />
    <button type="submit" disabled={$userStore.saving} class={buttonClass}>Unggah Foto</button>
  </form>

  <form onsubmit={handlePassword} class={cardClass} data-testid="password-form">
    <h2 class="font-bold">Ubah Kata Sandi</h2>
    <div>
      <label for="current-password" class="mb-1 block text-sm font-medium">Kata Sandi Saat Ini</label>
      <input id="current-password" type="password" required bind:value={$password} class={inputClass} />
    </div>
    <div>
      <label for="new-password" class="mb-1 block text-sm font-medium">Kata Sandi Baru</label>
      <input id="new-password" type="password" required bind:value={$newPassword} class={inputClass} />
    </div>
    <div>
      <label for="confirm-password" class="mb-1 block text-sm font-medium">Konfirmasi Kata Sandi Baru</label>
      <input id="confirm-password" type="password" required bind:value={$confirmPassword} class={inputClass} />
    </div>
    <button type="submit" disabled={$userStore.saving} class={buttonClass}>Ubah Kata Sandi</button>
  </form>
</section>