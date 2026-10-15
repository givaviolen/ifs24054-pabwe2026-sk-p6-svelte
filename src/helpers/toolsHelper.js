import Swal from "sweetalert2";

const CONFIRM_COLOR = "#4f46e5";
const DANGER_COLOR = "#dc2626";

export function showSuccessDialog(text) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text,
    confirmButtonColor: CONFIRM_COLOR,
  });
}

export function showErrorDialog(text) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text,
    confirmButtonColor: CONFIRM_COLOR,
  });
}

export function showWarningDialog(text) {
  return Swal.fire({
    icon: "warning",
    title: "Perhatian",
    text,
    confirmButtonColor: CONFIRM_COLOR,
  });
}

export async function showConfirmDialog(title, text, confirmText) {
  const result = await Swal.fire({
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
