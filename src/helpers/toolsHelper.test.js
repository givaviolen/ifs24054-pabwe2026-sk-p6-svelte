import Swal from "sweetalert2";
import {
  formatDate,
  hasImage,
  resolveAssetUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper.js";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan dialog sukses, error, dan peringatan", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("gagal");
    await showWarningDialog("hati-hati");
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "success", text: "ok" });
    expect(Swal.fire.mock.calls[1][0]).toMatchObject({ icon: "error", text: "gagal" });
    expect(Swal.fire.mock.calls[2][0]).toMatchObject({ icon: "warning", text: "hati-hati" });
  });

  it("dialog konfirmasi mengembalikan isConfirmed", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("Judul", "Teks", "Ya")).toBe(true);
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ title: "Judul", confirmButtonText: "Ya" });

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("Judul", "Teks", "Ya")).toBe(false);
  });

  it("memformat tanggal dan menangani nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("2026-03-05T12:00:00Z")).toMatch(/2026/);
  });

  it("resolveAssetUrl mengubah path relatif menjadi URL absolut", () => {
    const origin = new URL(DELCOM_BASEURL).origin;
    expect(resolveAssetUrl("")).toBe("");
    expect(resolveAssetUrl(null)).toBe("");
    expect(resolveAssetUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(resolveAssetUrl("img/a.png")).toBe(`${origin}/img/a.png`);
    expect(resolveAssetUrl("/img/a.png")).toBe(`${origin}/img/a.png`);
  });

  it("hasImage menganggap URL kosong atau URL root sebagai tidak ada gambar", () => {
    expect(hasImage(undefined)).toBe(false);
    expect(hasImage("")).toBe(false);
    expect(hasImage("http://localhost:8000/")).toBe(false);
    expect(hasImage("http://localhost:8000/img/a.png")).toBe(true);
  });
});