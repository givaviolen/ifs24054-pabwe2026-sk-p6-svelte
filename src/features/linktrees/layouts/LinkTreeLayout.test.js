import { fireEvent, screen } from "@testing-library/svelte";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders, textSnippet } from "../../../test-utils.js";

describe("LinkTreeLayout", () => {
  it("membungkus navbar, sidebar, dan isi halaman", () => {
    renderWithProviders(LinkTreeLayout, { auth: true, props: { children: textSnippet("konten") } });
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByText("konten")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Semua Link Tree" })).toBeInTheDocument();
  });

  it("tombol menu membuka dan menutup sidebar", async () => {
    renderWithProviders(LinkTreeLayout, { auth: true, props: { children: textSnippet("konten") } });
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveClass("-translate-x-full");

    await fireEvent.click(screen.getByLabelText("Buka menu"));
    expect(sidebar).toHaveClass("translate-x-0");

    await fireEvent.click(screen.getByLabelText("Tutup menu"));
    expect(sidebar).toHaveClass("-translate-x-full");
  });
});
