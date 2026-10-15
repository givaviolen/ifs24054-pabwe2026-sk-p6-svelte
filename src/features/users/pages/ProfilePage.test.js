import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import ProfilePage from "./ProfilePage.svelte";
import { changePassword, getMe, updateMe, updatePhoto } from "../api/userApi.js";
import {
  showErrorDialog, showSuccessDialog, showWarningDialog,
} from "../../../helpers/toolsHelper.js";
import { profile, renderWithProviders } from "../../../test-utils.js";

vi.mock("../api/userApi.js");
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getMe.mockResolvedValue(profile);
  });

  it("menampilkan inisial atau foto profil", () => {
    const { unmount } = renderWithProviders(ProfilePage, { auth: true });
    expect(screen.getByTestId("profile-initial")).toHaveTextContent("B");
    unmount();

    renderWithProviders(ProfilePage, { auth: { photo: "http://img/p.png" } });
    expect(screen.getByTestId("profile-photo")).toBeInTheDocument();
  });

  it("mengubah data profil", async () => {
    updateMe.mockResolvedValue("ok");
    renderWithProviders(ProfilePage, { auth: true });
    await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Budi Baru" } });
    await fireEvent.submit(screen.getByTestId("profile-form"));

    await waitFor(() => expect(updateMe).toHaveBeenCalledWith({ name: "Budi Baru", email: "budi@mail.com" }));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Profil berhasil diperbarui"));
  });

  it("menampilkan error saat ubah data gagal", async () => {
    updateMe.mockRejectedValue(new Error("email dipakai"));
    renderWithProviders(ProfilePage, { auth: true });
    await fireEvent.submit(screen.getByTestId("profile-form"));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("email dipakai"));
  });

  it("meminta foto dipilih sebelum mengunggah", async () => {
    renderWithProviders(ProfilePage, { auth: true });
    await fireEvent.submit(screen.getByTestId("photo-form"));
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu");
    expect(updatePhoto).not.toHaveBeenCalled();
  });

  it("mengunggah foto profil", async () => {
    updatePhoto.mockResolvedValue("ok");
    renderWithProviders(ProfilePage, { auth: true });
    const file = new File(["x"], "a.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Foto profil"), { target: { files: [file] } });
    await fireEvent.submit(screen.getByTestId("photo-form"));

    await waitFor(() => expect(updatePhoto).toHaveBeenCalledWith(file));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Foto profil berhasil diperbarui"));
  });

  it("menolak kata sandi baru yang tidak sama dengan konfirmasi", async () => {
    renderWithProviders(ProfilePage, { auth: true });
    await fireEvent.input(screen.getByLabelText("Kata Sandi Baru"), { target: { value: "satu" } });
    await fireEvent.input(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), { target: { value: "dua" } });
    await fireEvent.submit(screen.getByTestId("password-form"));

    expect(showWarningDialog).toHaveBeenCalledWith("Konfirmasi kata sandi tidak sama");
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("mengubah kata sandi lalu mengosongkan formulir", async () => {
    changePassword.mockResolvedValue("ok");
    renderWithProviders(ProfilePage, { auth: true });
    const current = screen.getByLabelText("Kata Sandi Saat Ini");
    await fireEvent.input(current, { target: { value: "lama" } });
    await fireEvent.input(screen.getByLabelText("Kata Sandi Baru"), { target: { value: "baru" } });
    await fireEvent.input(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), { target: { value: "baru" } });
    await fireEvent.submit(screen.getByTestId("password-form"));

    await waitFor(() => expect(changePassword).toHaveBeenCalledWith({ password: "lama", newPassword: "baru" }));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Kata sandi berhasil diubah"));
    await waitFor(() => expect(current).toHaveValue(""));
  });

  it("menampilkan error saat ubah kata sandi gagal", async () => {
    changePassword.mockRejectedValue(new Error("sandi salah"));
    renderWithProviders(ProfilePage, { auth: true });
    await fireEvent.submit(screen.getByTestId("password-form"));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("sandi salah"));
  });
});
