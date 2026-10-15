import { get } from "svelte/store";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import DetailPage from "./DetailPage.svelte";
import * as api from "../api/linkTreeApi.js";
import { currentPath } from "../../../router.js";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../api/linkTreeApi.js");
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const tree = {
  id: "t1",
  user_id: "u1",
  title: "Portofolio",
  type: "public",
  description: "deskripsi",
  cover: "http://img/c.png",
  created_at: "2026-02-01T12:00:00Z",
  items: [{ id: "i1", title: "GitHub", url: "https://github.com/budi" }],
};

function renderDetail() {
  return renderWithProviders(DetailPage, { auth: true, props: { params: { linkTreeId: "t1" } } });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getLinkTree.mockResolvedValue(tree);
  });

  it("menampilkan detail milik sendiri lengkap dengan aksi pemilik", async () => {
    renderDetail();
    expect(await screen.findByRole("heading", { name: "Portofolio" })).toBeInTheDocument();
    expect(api.getLinkTree).toHaveBeenCalledWith("t1");
    expect(screen.getByTestId("detail-cover")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
    expect(screen.getByTestId("owner-actions")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("Ubah GitHub")).toBeInTheDocument();
  });

  it("menyembunyikan aksi pemilik pada milik orang lain", async () => {
    api.getLinkTree.mockResolvedValue({ ...tree, user_id: "u2", cover: null });
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    expect(screen.getByTestId("detail-cover-placeholder")).toBeInTheDocument();
    expect(screen.queryByTestId("owner-actions")).not.toBeInTheDocument();
    expect(screen.queryByText("Tambah Tautan")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ubah GitHub")).not.toBeInTheDocument();
  });

  it("menampilkan status tidak ada tautan", async () => {
    api.getLinkTree.mockResolvedValue({ ...tree, items: [] });
    renderDetail();
    expect(await screen.findByTestId("items-empty")).toBeInTheDocument();
  });

  it("menampilkan status memuat", async () => {
    api.getLinkTree.mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(await screen.findByTestId("detail-loading")).toBeInTheDocument();
  });

  it("menampilkan pesan error dari server atau pesan bawaan", async () => {
    api.getLinkTree.mockRejectedValueOnce(new Error("Tidak ditemukan di server"));
    const { unmount } = renderDetail();
    expect(await screen.findByTestId("detail-error")).toHaveTextContent("Tidak ditemukan di server");
    unmount();

    api.getLinkTree.mockRejectedValueOnce(new Error(""));
    renderDetail();
    expect(await screen.findByTestId("detail-error")).toHaveTextContent("Link tree tidak ditemukan.");
  });

  it("tautan kembali membuka beranda", async () => {
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    await fireEvent.click(screen.getByRole("link", { name: /Kembali/ }));
    expect(get(currentPath)).toBe("/");
  });

  it("membuka modal ubah data, ubah sampul, dan tambah tautan", async () => {
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });

    await fireEvent.click(screen.getByRole("button", { name: /Ubah Data/ }));
    expect(screen.getByRole("dialog", { name: "Ubah Link Tree" })).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());

    await fireEvent.click(screen.getByRole("button", { name: /Ubah Sampul/ }));
    expect(screen.getByRole("dialog", { name: "Ubah Sampul" })).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());

    await fireEvent.click(screen.getByRole("button", { name: /Tambah Tautan/ }));
    expect(screen.getByRole("dialog", { name: "Tambah Tautan" })).toBeInTheDocument();
  });

  it("membuka modal ubah tautan dengan data item", async () => {
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    await fireEvent.click(screen.getByLabelText("Ubah GitHub"));

    expect(screen.getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul Tautan")).toHaveValue("GitHub");
  });

  it("menghapus tautan setelah konfirmasi", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteItem.mockResolvedValue("ok");
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    await fireEvent.click(screen.getByLabelText("Hapus GitHub"));

    await waitFor(() => expect(api.deleteItem).toHaveBeenCalledWith("t1", "i1"));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil dihapus"));
  });

  it("membatalkan hapus tautan dan menampilkan error bila gagal", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    await fireEvent.click(screen.getByLabelText("Hapus GitHub"));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(api.deleteItem).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValueOnce(true);
    api.deleteItem.mockRejectedValue(new Error("gagal hapus"));
    await fireEvent.click(screen.getByLabelText("Hapus GitHub"));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("gagal hapus"));
  });

  it("menghapus link tree lalu kembali ke beranda", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteLinkTree.mockResolvedValue("ok");
    api.getLinkTrees.mockResolvedValue([]);
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    await fireEvent.click(screen.getByRole("button", { name: /Hapus$/ }));

    await waitFor(() => expect(api.deleteLinkTree).toHaveBeenCalledWith("t1"));
    await waitFor(() => expect(get(currentPath)).toBe("/"));
    expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil dihapus");
  });

  it("tidak menghapus link tree bila dibatalkan atau gagal", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    renderDetail();
    await screen.findByRole("heading", { name: "Portofolio" });
    await fireEvent.click(screen.getByRole("button", { name: /Hapus$/ }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(api.deleteLinkTree).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValueOnce(true);
    api.deleteLinkTree.mockRejectedValue(new Error("ditolak"));
    await fireEvent.click(screen.getByRole("button", { name: /Hapus$/ }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("ditolak"));
  });
});
