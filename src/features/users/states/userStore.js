import { writable } from "svelte/store";
import { changePassword, getUsers, updateMe, updatePhoto } from "../api/userApi.js";
import { authStore } from "../../auth/states/authStore.js";
import { safeCall } from "../../../helpers/apiHelper.js";

export function initialUsersState() {
  return { users: [], loading: false, saving: false };
}

export const usersState = writable(initialUsersState());

async function fetchUsers() {
  usersState.update((state) => ({ ...state, loading: true }));
  const result = await safeCall(getUsers);
  usersState.update((state) => ({
    ...state,
    loading: false,
    users: result.success ? result.data : state.users,
  }));
  return result;
}

async function mutateProfile(fn) {
  usersState.update((state) => ({ ...state, saving: true }));
  const result = await safeCall(fn);
  if (result.success) {
    await authStore.fetchProfile();
  }
  usersState.update((state) => ({ ...state, saving: false }));
  return result;
}

export const userStore = {
  subscribe: usersState.subscribe,
  fetchUsers,
  updateProfile: (values) => mutateProfile(() => updateMe(values)),
  uploadPhoto: (file) => mutateProfile(() => updatePhoto(file)),
  changePassword: (values) => mutateProfile(() => changePassword(values)),
};
