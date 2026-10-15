import { writable } from "svelte/store";
import { login as loginApi, register as registerApi } from "../api/authApi.js";
import { getMe } from "../../users/api/userApi.js";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  safeCall,
} from "../../../helpers/apiHelper.js";

export function initialAuthState() {
  return { isAuthenticated: false, initialized: false, loading: false, profile: null };
}

export const authState = writable(initialAuthState());

function setLoading(loading) {
  authState.update((state) => ({ ...state, loading }));
}

async function fetchProfile() {
  const result = await safeCall(getMe);
  if (!result.success) {
    removeAccessToken();
  }
  authState.update((state) => ({
    ...state,
    profile: result.success ? result.data : null,
    isAuthenticated: result.success,
  }));
  return result;
}

async function init() {
  if (getAccessToken()) {
    await fetchProfile();
  }
  authState.update((state) => ({ ...state, initialized: true }));
}

async function login(credentials) {
  setLoading(true);
  const result = await safeCall(() => loginApi(credentials));
  if (!result.success) {
    setLoading(false);
    return result;
  }

  putAccessToken(result.data);
  const profile = await fetchProfile();
  setLoading(false);
  return profile.success ? result : profile;
}

async function register(payload) {
  setLoading(true);
  const result = await safeCall(() => registerApi(payload));
  setLoading(false);
  return result;
}

function logout() {
  removeAccessToken();
  authState.set({ ...initialAuthState(), initialized: true });
}

export const authStore = {
  subscribe: authState.subscribe,
  init,
  login,
  register,
  logout,
  fetchProfile,
};
