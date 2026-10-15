import { apiPost } from "../../../helpers/apiHelper.js";

export async function login({ email, password }) {
  const response = await apiPost("/auth/login", { email, password });
  return response.data.token;
}

export async function register({ name, email, password }) {
  const response = await apiPost("/auth/register", { name, email, password });
  return response.message;
}
