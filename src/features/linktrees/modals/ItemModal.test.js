import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import ItemModal from "./ItemModal.svelte";
import { createItem, getLinkTree, updateItem } from "../api/linkTreeApi.js";
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

const item = { id: "i1", title: "GitHub", url: "https://github.com/budi" };

async function submitWith(title, url) {
  await fireEvent.input(screen.getByLabelText("Judul Tautan"), { target: { value: title } });
  await fireEvent.input(screen.getByLabelText("URL"), { target: { value: url } });
  await fireEvent.submit(screen.getByTestId("item-form"));
}

describe("ItemModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getLinkTree.mockResolvedValue({ id: "7", items: [] });
  });

  it("mode tambah dimulai dengan formulir kosong", () => {
    renderWithProviders(ItemModal, { props: { linkTreeId: "7", item: null, onClose: vi.fn() } });
    expect(screen.getByRole("dialog", { name: "Tambah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul Tautan")).toHaveValue("");
    expect(screen.getByLabelText("URL")).toHaveValue("");
  });

  it("menolak judul kosong dan URL tidak valid", async () => {
    renderWithProviders(ItemModal, { props: { linkTreeId: "7", item: null, onClose: vi.fn() } });

    await submitWith("", "https://a.com");
    expect(showErrorDialog).toHaveBeenLastCalledWith("Judul tautan wajib diisi");

    await submitWith("GH", "github.com");
    expect(showErrorDialog).toHaveBeenLastCalledWith("URL harus diawali http:// atau https://");
    expect(createItem).not.toHaveBeenCalled();
  });

  it("menambah tautan baru", async () => {
    createItem.mockResolvedValue("ok");
    const onClose = vi.fn();
    renderWithProviders(ItemModal, { props: { linkTreeId: "7", item: null, onClose } });
    await submitWith(" GH ", " https://github.com ");

    await waitFor(() => expect(createItem).toHaveBeenCalledWith("7", { title: "GH", url: "https://github.com" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil ditambahkan");
  });

  it("mode ubah terisi data item dan menyimpan perubahan", async () => {
    updateItem.mockResolvedValue("ok");
    const onClose = vi.fn();
    renderWithProviders(ItemModal, { props: { linkTreeId: "7", item, onClose } });
    expect(screen.getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul Tautan")).toHaveValue("GitHub");

    await submitWith("GitHub Baru", "https://github.com/baru");
    await waitFor(() =>
      expect(updateItem).toHaveBeenCalledWith("7", "i1", { title: "GitHub Baru", url: "https://github.com/baru" })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil diperbarui");
  });

  it("menampilkan error saat gagal dan status menyimpan", async () => {
    createItem.mockRejectedValue(new Error("ditolak"));
    const onClose = vi.fn();
    renderWithProviders(ItemModal, {
      props: { linkTreeId: "7", item: null, onClose },
      linkTrees: { itemMutating: true },
    });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    await submitWith("GH", "https://github.com");
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("ditolak"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", async () => {
    const onClose = vi.fn();
    renderWithProviders(ItemModal, { props: { linkTreeId: "7", item: null, onClose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
  });
});
