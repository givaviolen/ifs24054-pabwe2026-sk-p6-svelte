import { apiDelete, apiGet, apiPost, apiPut } from "../../../helpers/apiHelper.js";

// Detail memakai data.link_tree; item bisa berada di dalam link_tree atau di data.
export function normalizeLinkTree(data) {
  return {
    ...data.link_tree,
    items: data.link_tree.items ?? data.items ?? [],
  };
}

export async function getLinkTrees() {
  const response = await apiGet("/link-trees");
  return response.data.link_trees;
}

export async function getLinkTree(id) {
  const response = await apiGet(`/link-trees/${id}`);
  return normalizeLinkTree(response.data);
}

export async function createLinkTree({ title, type, description }) {
  const response = await apiPost("/link-trees", { title, type, description });
  return response.message;
}

export async function updateLinkTree(id, { title, type, description }) {
  const response = await apiPut(`/link-trees/${id}`, { title, type, description });
  return response.message;
}

export async function updateCover(id, file) {
  const formData = new FormData();
  formData.append("cover", file);
  const response = await apiPost(`/link-trees/${id}/cover`, formData);
  return response.message;
}

export async function deleteLinkTree(id) {
  const response = await apiDelete(`/link-trees/${id}`);
  return response.message;
}

export async function deleteAllLinkTrees() {
  const response = await apiDelete("/link-trees");
  return response.message;
}

// Bentuk item tautan: { title, url }.
export async function createItem(id, { title, url }) {
  const response = await apiPost(`/link-trees/${id}/items`, { title, url });
  return response.message;
}

export async function updateItem(id, itemId, { title, url }) {
  const response = await apiPut(`/link-trees/${id}/items/${itemId}`, { title, url });
  return response.message;
}

export async function deleteItem(id, itemId) {
  const response = await apiDelete(`/link-trees/${id}/items/${itemId}`);
  return response.message;
}
