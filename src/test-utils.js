import { render, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { authState, initialAuthState } from "./features/auth/states/authStore.js";
import { initialUsersState, usersState } from "./features/users/states/userStore.js";
import {
  initialLinkTreesState,
  linkTreesState,
} from "./features/linktrees/states/linkTreesStore.js";
import { currentPath } from "./router.js";

export const profile = { id: "u1", name: "Budi", email: "budi@mail.com", photo: null };

export function resetStores() {
  authState.set(initialAuthState());
  usersState.set(initialUsersState());
  linkTreesState.set(initialLinkTreesState());
  currentPath.set("/");
}

export function textSnippet(text) {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

/**
 * Render komponen Svelte setelah menyiapkan semua store.
 * - auth: true | objek override profil -> pengguna sudah masuk
 * - users / linkTrees: objek yang digabung ke state awal store
 * - path: path awal router
 */
export function renderWithProviders(Component, options) {
  const { props, auth, users, linkTrees, path } = { props: {}, ...options };
  resetStores();

  if (path) {
    currentPath.set(path);
  }
  if (auth) {
    authState.set({
      ...initialAuthState(),
      initialized: true,
      isAuthenticated: true,
      profile: { ...profile, ...(auth === true ? {} : auth) },
    });
  }
  if (users) {
    usersState.update((state) => ({ ...state, ...users }));
  }
  if (linkTrees) {
    linkTreesState.update((state) => ({ ...state, ...linkTrees }));
  }
  return render(Component, { props });
}

/**
 * Menunggu editor Toast UI yang masih hidup (belum di-destroy) lalu mengembalikannya.
 * Editor dimuat secara lazy, dan editor "sisa" dari test sebelumnya bisa ikut masuk ke
 * daftar, jadi yang diambil adalah editor yang belum dihancurkan.
 */
export async function waitForEditor() {
  let editor;
  await waitFor(() => {
    editor = globalThis.__toastEditors.find((item) => item.destroy.mock.calls.length === 0);
    expect(editor).toBeDefined();
  });
  return editor;
}