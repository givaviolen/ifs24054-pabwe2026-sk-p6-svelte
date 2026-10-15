const CONFIRM_COLOR = "#4f46e5";
const DANGER_COLOR = "#dc2626";

async function fire(options) {
  const { default: Swal } = await import("sweetalert2");
  return Swal.fire(options);
}

export function showSuccessDialog(text) {
  return fire({
    icon: "success",
    title: "Berhasil",
    text,
    confirmButtonColor: CONFIRM_COLOR,
  });
}

export function showErrorDialog(text) {
  return fire({
    icon: "error",
    title: "Gagal",
    text,
    confirmButtonColor: CONFIRM_COLOR,
  });
}

export function showWarningDialog(text) {
  return fire({
    icon: "warning",
    title: "Perhatian",
    text,
    confirmButtonColor: CONFIRM_COLOR,
  });
}

export async function showConfirmDialog(title, text, confirmText) {
  const result = await fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: DANGER_COLOR,
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Ubah path relatif dari API (mis. img/profile/1.png) menjadi URL absolut. */
export function resolveAssetUrl(path) {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, "")}`;
}

/** API mengembalikan URL root saat gambar kosong, jadi dianggap tidak ada gambar. */
export function hasImage(url) {
  return Boolean(url) && !url.endsWith("/");
}