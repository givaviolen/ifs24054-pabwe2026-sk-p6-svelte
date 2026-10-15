import { writable } from "svelte/store";
import * as api from "../api/linkTreeApi.js";
import { safeCall } from "../../../helpers/apiHelper.js";

export const TYPE_LABELS = {
  public: "Publik",
  unlisted: "Tidak Terdaftar",
  private: "Privat",
};

export function initialLinkTreesState() {
  return {
    linkTrees: [],
    linkTree: null,
    error: null,
    loading: false,
    detailLoading: false,
    adding: false,
    changing: false,
    changingCover: false,
    deleting: false,
    deletingAll: false,
    itemMutating: false,
  };
}

export const linkTreesState = writable(initialLinkTreesState());

function setFlag(key, value) {
  linkTreesState.update((state) => ({ ...state, [key]: value }));
}

export function filterLinkTrees(list, { query, onlyMine, profileId }) {
  const keyword = query.trim().toLowerCase();
  return list.filter(
    (item) =>
      (!onlyMine || item.user_id === profileId) &&
      (!keyword || item.title.toLowerCase().includes(keyword))
  );
}

export function getLinkTreeStats(list, profileId) {
  const countType = (type) => list.filter((item) => item.type === type).length;
  return {
    total: list.length,
    public: countType("public"),
    unlisted: countType("unlisted"),
    private: countType("private"),
    mine: list.filter((item) => item.user_id === profileId).length,
  };
}

async function fetchLinkTrees() {
  setFlag("loading", true);
  const result = await safeCall(api.getLinkTrees);
  linkTreesState.update((state) => ({
    ...state,
    loading: false,
    linkTrees: result.success ? result.data : state.linkTrees,
    error: result.success ? null : result.message,
  }));
  return result;
}

async function fetchLinkTree(id) {
  setFlag("detailLoading", true);
  const result = await safeCall(() => api.getLinkTree(id));
  linkTreesState.update((state) => ({
    ...state,
    detailLoading: false,
    linkTree: result.success ? result.data : null,
    error: result.success ? null : result.message,
  }));
  return result;
}

function clearDetail() {
  linkTreesState.update((state) => ({ ...state, linkTree: null, error: null }));
}

// Menjalankan mutasi dengan bendera, lalu memuat ulang data bila berhasil.
async function mutate(flag, action, refresh) {
  setFlag(flag, true);
  const result = await safeCall(action);
  if (result.success) {
    await refresh();
  }
  setFlag(flag, false);
  return result;
}

export const linkTreesStore = {
  subscribe: linkTreesState.subscribe,
  fetchLinkTrees,
  fetchLinkTree,
  clearDetail,
  addLinkTree: (payload) => mutate("adding", () => api.createLinkTree(payload), fetchLinkTrees),
  changeLinkTree: (id, payload) =>
    mutate("changing", () => api.updateLinkTree(id, payload), () => fetchLinkTree(id)),
  changeCover: (id, file) =>
    mutate("changingCover", () => api.updateCover(id, file), () => fetchLinkTree(id)),
  deleteLinkTree: (id) => mutate("deleting", () => api.deleteLinkTree(id), fetchLinkTrees),
  deleteAllLinkTrees: () => mutate("deletingAll", () => api.deleteAllLinkTrees(), fetchLinkTrees),
  addItem: (id, payload) =>
    mutate("itemMutating", () => api.createItem(id, payload), () => fetchLinkTree(id)),
  changeItem: (id, itemId, payload) =>
    mutate("itemMutating", () => api.updateItem(id, itemId, payload), () => fetchLinkTree(id)),
  deleteItem: (id, itemId) =>
    mutate("itemMutating", () => api.deleteItem(id, itemId), () => fetchLinkTree(id)),
};
