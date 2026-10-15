import Swal from "sweetalert2";
import {
  formatDate, showConfirmDialog, showErrorDialog, showSuccessDialog, showWarningDialog,
} from "./toolsHelper.js";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan dialog sukses, error, dan peringatan", () => {
    showSuccessDialog("ok");
    showErrorDialog("gagal");
    showWarningDialog("hati-hati");
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "success", text: "ok" });
    expect(Swal.fire.mock.calls[1][0]).toMatchObject({ icon: "error", text: "gagal" });
    expect(Swal.fire.mock.calls[2][0]).toMatchObject({ icon: "warning", text: "hati-hati" });
  });

  it("menampilkan dialog sukses, error, dan peringatan", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("gagal");
    await showWarningDialog("hati-hati");
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "success", text: "ok" });
    expect(Swal.fire.mock.calls[1][0]).toMatchObject({ icon: "error", text: "gagal" });
    expect(Swal.fire.mock.calls[2][0]).toMatchObject({ icon: "warning", text: "hati-hati" });
  });

  it("memformat tanggal dan menangani nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("2026-03-05T12:00:00Z")).toMatch(/2026/);
  });
});
