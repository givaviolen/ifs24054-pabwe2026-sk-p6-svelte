import { get } from "svelte/store";
import { fireEvent, render, screen } from "@testing-library/svelte";
import NotFoundPage from "./NotFoundPage.svelte";
import { currentPath } from "../../../router.js";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404 dan tautan kembali", async () => {
    render(NotFoundPage);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman tidak ditemukan")).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("link", { name: "Kembali ke Beranda" }));
    expect(get(currentPath)).toBe("/");
  });
});
