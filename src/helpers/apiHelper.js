const TOKEN_KEY = "token";

/**
 * Di Vercel, request API dilewatkan proxy same-origin (/delcom-api, lihat vercel.json)
 * sehingga halaman tidak melakukan request lintas-origin. Di tempat lain (dev, Nginx)
 * request langsung ke Delcom API.
 */
export function resolveApiBase(hostname = globalThis.location.hostname) {
  return hostname.endsWith(".vercel.app") ? "/delcom-api" : DELCOM_BASEURL;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Pembungkus fetch ke Delcom Open API.
 * Respons dianggap berhasil bila `status` bernilai "success".
 */
export async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${resolveApiBase()}${path}`, {
    method,
    headers,
    body: payload,
  });
  const json = await response.json();

  if (json.status !== "success") {
    throw new Error(json.message || "Terjadi kesalahan pada server");
  }
  return json;
}

export function apiGet(path) {
  return request(path);
}

export function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

export function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

export function apiDelete(path) {
  return request(path, { method: "DELETE" });
}

/**
 * Menjalankan fungsi async dan mengubah hasilnya menjadi
 * { success: true, data } atau { success: false, message }.
 */
export async function safeCall(fn) {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    return { success: false, message: error.message };
  }
}