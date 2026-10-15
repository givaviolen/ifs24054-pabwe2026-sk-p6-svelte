import { get } from "svelte/store";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import RegisterPage from "./RegisterPage.svelte";
import { authState, authStore } from "../states/authStore.js";
import { currentPath } from "../../../router.js";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

async function fillAndSubmit() {
  await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Budi" } });
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "b@b.c" } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), { target: { value: "rahasia" } });
  await fireEvent.submit(screen.getByTestId("register-form"));
}

describe("RegisterPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("registrasi berhasil lalu membuka halaman login", async () => {
    const spy = vi.spyOn(authStore, "register").mockResolvedValue({ success: true });
    showSuccessDialog.mockResolvedValue();
    renderWithProviders(RegisterPage);
    await fillAndSubmit();

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({ name: "Budi", email: "b@b.c", password: "rahasia" })
    );
    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("registrasi gagal menampilkan dialog error", async () => {
    vi.spyOn(authStore, "register").mockResolvedValue({ success: false, message: "Email dipakai" });
    renderWithProviders(RegisterPage);
    await fillAndSubmit();

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai"));
  });

  it("tombol menampilkan status memproses", async () => {
    renderWithProviders(RegisterPage);
    expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled();

    authState.update((state) => ({ ...state, loading: true }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled());
  });

  it("tautan masuk membuka halaman login", async () => {
    renderWithProviders(RegisterPage);
    await fireEvent.click(screen.getByRole("link", { name: "Masuk" }));
    expect(get(currentPath)).toBe("/auth/login");
  });
});
