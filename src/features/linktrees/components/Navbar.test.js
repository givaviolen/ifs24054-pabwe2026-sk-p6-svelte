import { get } from "svelte/store";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import Navbar from "./Navbar.svelte";
import { authState } from "../../auth/states/authStore.js";
import { currentPath } from "../../../router.js";
import { showConfirmDialog } from "../../../helpers/toolsHelper.js";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan nama dan inisial pengguna", () => {
    renderWithProviders(Navbar, { auth: true, props: { onMenuClick: vi.fn() } });
    expect(screen.getByTestId("navbar-name")).toHaveTextContent("Budi");
    expect(screen.getByTestId("navbar-initial")).toHaveTextContent("B");
  });

  it("menampilkan foto bila tersedia", () => {
    renderWithProviders(Navbar, { auth: { photo: "http://img/p.png" }, props: { onMenuClick: vi.fn() } });
    expect(screen.getByTestId("navbar-photo")).toBeInTheDocument();
  });

  it("tombol menu memanggil onMenuClick dan logo membuka beranda", async () => {
    const onMenuClick = vi.fn();
    renderWithProviders(Navbar, { auth: true, path: "/users", props: { onMenuClick } });

    await fireEvent.click(screen.getByLabelText("Buka menu"));
    expect(onMenuClick).toHaveBeenCalled();

    await fireEvent.click(screen.getByRole("link", { name: /Delcom Link Tree/ }));
    expect(get(currentPath)).toBe("/");
  });

  it("logout dibatalkan bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    renderWithProviders(Navbar, { auth: true, props: { onMenuClick: vi.fn() } });
    await fireEvent.click(screen.getByLabelText("Keluar"));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(get(authState).isAuthenticated).toBe(true);
  });

  it("logout dilakukan bila konfirmasi diterima", async () => {
    showConfirmDialog.mockResolvedValue(true);
    renderWithProviders(Navbar, { auth: true, props: { onMenuClick: vi.fn() } });
    localStorage.setItem("token", "tok");
    await fireEvent.click(screen.getByLabelText("Keluar"));

    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(localStorage.getItem("token")).toBeNull();
  });
});
