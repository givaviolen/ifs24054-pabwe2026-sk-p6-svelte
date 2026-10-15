import { get } from "svelte/store";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import LoginPage from "./LoginPage.svelte";
import { authState, authStore } from "../states/authStore.js";
import { currentPath } from "../../../router.js";
import { showErrorDialog } from "../../../helpers/toolsHelper.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

async function fillAndSubmit() {
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), { target: { value: "rahasia" } });
  await fireEvent.submit(screen.getByTestId("login-form"));
}

describe("LoginPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("login berhasil mengarahkan ke beranda", async () => {
    const spy = vi.spyOn(authStore, "login").mockResolvedValue({ success: true });
    renderWithProviders(LoginPage, { path: "/auth/login" });
    await fillAndSubmit();

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ email: "a@b.c", password: "rahasia" }));
    await waitFor(() => expect(get(currentPath)).toBe("/"));
  });

  it("login gagal menampilkan dialog error", async () => {
    vi.spyOn(authStore, "login").mockResolvedValue({ success: false, message: "Email salah" });
    renderWithProviders(LoginPage);
    await fillAndSubmit();

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email salah"));
  });

  it("tombol menampilkan status memproses", () => {
    renderWithProviders(LoginPage);
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();

    authState.update((state) => ({ ...state, loading: true }));
    return waitFor(() => expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled());
  });

  it("tautan daftar membuka halaman register", async () => {
    renderWithProviders(LoginPage);
    await fireEvent.click(screen.getByRole("link", { name: "Daftar" }));
    expect(get(currentPath)).toBe("/auth/register");
  });
});
