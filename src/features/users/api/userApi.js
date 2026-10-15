import { apiGet, apiPost, apiPut } from "../../../helpers/apiHelper.js";

export async function getUsers() {
  const response = await apiGet("/users");
  return response.data.users;
}

export async function getMe() {
  const response = await apiGet("/users/me");
  return response.data.user;
}

export async function updateMe({ name, email }) {
  const response = await apiPut("/users/me", { name, email });
  return response.message;
}

export async function updatePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const response = await apiPost("/users/photo", formData);
  return response.message;
}

export async function changePassword({ password, newPassword }) {
  const response = await apiPut("/users/change-password", {
    password,
    new_password: newPassword,
  });
  return response.message;
}
