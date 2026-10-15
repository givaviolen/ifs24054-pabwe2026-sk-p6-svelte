import { get } from "svelte/store";
import { fireEvent, screen } from "@testing-library/svelte";
import Sidebar from "./Sidebar.svelte";
import { currentPath } from "../../../router.js";
import { renderWithProviders } from "../../../test-utils.js";

describe("Sidebar", () => {
  it("menampilkan menu dan menandai menu aktif", () => {
    renderWithProviders(Sidebar, { path: "/users", props: { open: true, onClose: vi.fn() } });

    expect(screen.getByRole("link", { name: "Semua Link Tree" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("sidebar")).toHaveClass("translate-x-0");
  });

  it("menandai Semua Link Tree aktif pada halaman detail", () => {
    renderWithProviders(Sidebar, { path: "/link-trees/1", props: { open: false, onClose: vi.fn() } });
    expect(screen.getByRole("link", { name: "Semua Link Tree" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("sidebar")).toHaveClass("-translate-x-full");
  });

  it("klik menu berpindah halaman dan menutup sidebar", async () => {
    const onClose = vi.fn();
    renderWithProviders(Sidebar, { props: { open: true, onClose } });
    await fireEvent.click(screen.getByRole("link", { name: "Profil" }));

    expect(get(currentPath)).toBe("/profile");
    expect(onClose).toHaveBeenCalled();
  });

  it("tombol tutup memanggil onClose", async () => {
    const onClose = vi.fn();
    renderWithProviders(Sidebar, { props: { open: true, onClose } });
    await fireEvent.click(screen.getByLabelText("Tutup menu"));
    expect(onClose).toHaveBeenCalled();
  });
});
