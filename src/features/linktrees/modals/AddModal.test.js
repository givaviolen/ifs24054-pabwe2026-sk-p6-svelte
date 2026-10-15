import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import AddModal from "./AddModal.svelte";
import { createLinkTree, getLinkTrees } from "../api/linkTreeApi.js";
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

async function submitWith(title) {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: title } });
  await fireEvent.submit(screen.getByTestId("add-form"));
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getLinkTrees.mockResolvedValue([]);
  });

  it("menolak judul kosong", async () => {
    renderWithProviders(AddModal, { props: { onClose: vi.fn() } });
    await submitWith("   ");
    expect(showErrorDialog).toHaveBeenCalledWith("Judul wajib diisi");
    expect(createLinkTree).not.toHaveBeenCalled();
  });

  it("menambah link tree dan menutup modal", async () => {
    createLinkTree.mockResolvedValue("ok");
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onClose } });

    await fireEvent.change(screen.getByLabelText("Tipe"), { target: { value: "private" } });
    globalThis.__toastEditors[0].options.events.change();
    await submitWith("  Portofolio  ");

    await waitFor(() =>
      expect(createLinkTree).toHaveBeenCalledWith({
        title: "Portofolio",
        type: "private",
        description: "# markdown baru",
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil ditambahkan");
  });

  it("menampilkan error saat penyimpanan gagal", async () => {
    createLinkTree.mockRejectedValue(new Error("ditolak"));
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onClose } });
    await submitWith("Judul");

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("ditolak"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal dan tombol simpan menunjukkan status", async () => {
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onClose }, linkTrees: { adding: true } });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
  });
});
