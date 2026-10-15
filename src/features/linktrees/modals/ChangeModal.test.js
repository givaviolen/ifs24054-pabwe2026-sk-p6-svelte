import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import { getLinkTree, updateLinkTree } from "../api/linkTreeApi.js";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../api/linkTreeApi.js");
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const linkTree = { id: "7", title: "Lama", type: "unlisted", description: "isi lama" };

async function submitWith(title) {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: title } });
  await fireEvent.submit(screen.getByTestId("change-form"));
}

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getLinkTree.mockResolvedValue({ ...linkTree, items: [] });
  });

  it("terisi data link tree yang dipilih", () => {
    renderWithProviders(ChangeModal, { props: { linkTree, onClose: vi.fn() } });
    expect(screen.getByLabelText("Judul")).toHaveValue("Lama");
    expect(screen.getByLabelText("Tipe")).toHaveValue("unlisted");
    expect(globalThis.__toastEditors[0].options.initialValue).toBe("isi lama");
  });

  it("menolak judul kosong", async () => {
    renderWithProviders(ChangeModal, { props: { linkTree, onClose: vi.fn() } });
    await submitWith("");
    expect(showErrorDialog).toHaveBeenCalledWith("Judul wajib diisi");
    expect(updateLinkTree).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan dan menutup modal", async () => {
    updateLinkTree.mockResolvedValue("ok");
    const onClose = vi.fn();
    renderWithProviders(ChangeModal, { props: { linkTree, onClose } });
    globalThis.__toastEditors[0].options.events.change();
    await submitWith("Baru");

    await waitFor(() =>
      expect(updateLinkTree).toHaveBeenCalledWith("7", {
        title: "Baru",
        type: "unlisted",
        description: "# markdown baru",
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil diperbarui");
  });

  it("menampilkan error saat gagal dan status menyimpan", async () => {
    updateLinkTree.mockRejectedValue(new Error("ditolak"));
    renderWithProviders(ChangeModal, { props: { linkTree, onClose: vi.fn() }, linkTrees: { changing: true } });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    await fireEvent.submit(screen.getByTestId("change-form"));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("ditolak"));
  });

  it("tombol Batal menutup modal", async () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeModal, { props: { linkTree, onClose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
  });
});
