import { get } from "svelte/store";
import { fireEvent, screen, waitFor, within } from "@testing-library/svelte";
import HomePage from "./HomePage.svelte";
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

const trees = [
  { id: "a", user_id: "u1", title: "Alpha", type: "public", cover: "http://img/a.png", created_at: "2026-01-02T12:00:00Z" },
  { id: "b", user_id: "u2", title: "Beta", type: "unlisted", cover: null, created_at: "2026-01-03T12:00:00Z" },
  { id: "c", user_id: "u1", title: "Gamma", type: "private", cover: "http://localhost:8000/", created_at: "2026-01-04T12:00:00Z" },
];

function renderHome() {
  return renderWithProviders(HomePage, { auth: true });
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getLinkTrees.mockResolvedValue(trees);
  });

  it("menampilkan daftar, sampul, placeholder, dan statistik", async () => {
    const { container } = renderHome();
    expect(await screen.findAllByTestId("linktree-item")).toHaveLength(3);
    expect(screen.getByAltText("Sampul Alpha")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(1);

    const stats = screen.getByTestId("stats");
    expect(within(stats).getByText("3")).toBeInTheDocument();
    expect(within(stats).getAllByText("1")).toHaveLength(3);
    expect(screen.getByText(/Milik saya \(2\)/)).toBeInTheDocument();
  });

  it("menampilkan status memuat dan status kosong", async () => {
    api.getLinkTrees.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderHome();
    expect(await screen.findByTestId("home-loading")).toBeInTheDocument();
    unmount();

    api.getLinkTrees.mockResolvedValue([]);
    renderHome();
    expect(await screen.findByTestId("home-empty")).toBeInTheDocument();
    expect(screen.queryByText("Hapus Semua")).not.toBeInTheDocument();
  });

  it("mencari berdasarkan judul dan memfilter milik saya", async () => {
    renderHome();
    await screen.findAllByTestId("linktree-item");

    await fireEvent.input(screen.getByLabelText("Cari link tree"), { target: { value: "bet" } });
    await waitFor(() => expect(screen.getAllByTestId("linktree-item")).toHaveLength(1));
    expect(screen.getByText("Beta")).toBeInTheDocument();

    await fireEvent.input(screen.getByLabelText("Cari link tree"), { target: { value: "" } });
    await fireEvent.click(screen.getByLabelText(/Milik saya/));
    await waitFor(() => expect(screen.getAllByTestId("linktree-item")).toHaveLength(2));
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("tombol hapus hanya muncul pada milik sendiri", async () => {
    renderHome();
    await screen.findAllByTestId("linktree-item");
    expect(screen.getByLabelText("Hapus Alpha")).toBeInTheDocument();
    expect(screen.queryByLabelText("Hapus Beta")).not.toBeInTheDocument();
  });

  it("membuka detail saat kartu diklik", async () => {
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByRole("link", { name: /Beta/ }));
    expect(get(currentPath)).toBe("/link-trees/b");
  });

  it("menghapus satu link tree setelah konfirmasi", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteLinkTree.mockResolvedValue("ok");
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByLabelText("Hapus Alpha"));

    await waitFor(() => expect(api.deleteLinkTree).toHaveBeenCalledWith("a"));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil dihapus"));
  });

  it("membatalkan hapus bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByLabelText("Hapus Alpha"));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteLinkTree).not.toHaveBeenCalled();
  });

  it("menampilkan error bila hapus gagal", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteLinkTree.mockRejectedValue(new Error("tidak bisa"));
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByLabelText("Hapus Alpha"));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("tidak bisa"));
  });

  it("menghapus semua link tree setelah konfirmasi", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.deleteAllLinkTrees.mockResolvedValue("ok");
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByText("Hapus Semua"));

    await waitFor(() => expect(api.deleteAllLinkTrees).toHaveBeenCalled());
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Semua link tree berhasil dihapus"));
  });

  it("membatalkan hapus semua bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByText("Hapus Semua"));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteAllLinkTrees).not.toHaveBeenCalled();
  });

  it("membuka dan menutup modal tambah", async () => {
    renderHome();
    await screen.findAllByTestId("linktree-item");
    await fireEvent.click(screen.getByRole("button", { name: /Tambah/ }));
    expect(screen.getByRole("dialog", { name: "Tambah Link Tree" })).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });
});