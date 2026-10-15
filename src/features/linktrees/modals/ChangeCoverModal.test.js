import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { getLinkTree, updateCover } from "../api/linkTreeApi.js";
import {
  showErrorDialog, showSuccessDialog, showWarningDialog,
} from "../../../helpers/toolsHelper.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../api/linkTreeApi.js");
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const linkTree = { id: "7", title: "T" };
const file = new File(["x"], "cover.png", { type: "image/png" });

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getLinkTree.mockResolvedValue({ ...linkTree, items: [] });
  });

  it("meminta gambar dipilih terlebih dahulu", async () => {
    renderWithProviders(ChangeCoverModal, { props: { linkTree, onClose: vi.fn() } });
    await fireEvent.submit(screen.getByTestId("cover-form"));
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih gambar sampul terlebih dahulu");
    expect(updateCover).not.toHaveBeenCalled();
  });

  it("mengunggah sampul dan menutup modal", async () => {
    updateCover.mockResolvedValue("ok");
    const onClose = vi.fn();
    renderWithProviders(ChangeCoverModal, { props: { linkTree, onClose } });
    await fireEvent.change(screen.getByLabelText("Gambar Sampul"), { target: { files: [file] } });
    await fireEvent.submit(screen.getByTestId("cover-form"));

    await waitFor(() => expect(updateCover).toHaveBeenCalledWith("7", file));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(showSuccessDialog).toHaveBeenCalledWith("Sampul berhasil diperbarui");
  });

  it("menampilkan error saat unggah gagal dan status mengunggah", async () => {
    updateCover.mockRejectedValue(new Error("terlalu besar"));
    const onClose = vi.fn();
    renderWithProviders(ChangeCoverModal, { props: { linkTree, onClose }, linkTrees: { changingCover: true } });
    expect(screen.getByRole("button", { name: "Mengunggah..." })).toBeDisabled();

    await fireEvent.change(screen.getByLabelText("Gambar Sampul"), { target: { files: [file] } });
    await fireEvent.submit(screen.getByTestId("cover-form"));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("terlalu besar"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", async () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeCoverModal, { props: { linkTree, onClose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
  });
});
