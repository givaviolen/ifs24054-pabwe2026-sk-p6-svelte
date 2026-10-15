import { fireEvent, render, screen } from "@testing-library/svelte";
import Modal from "./Modal.svelte";
import { textSnippet } from "../../../test-utils.js";

describe("Modal", () => {
  it("menampilkan judul dan isi, serta menutup lewat tombol tutup", async () => {
    const onClose = vi.fn();
    render(Modal, { props: { title: "Judul Modal", onClose, children: textSnippet("isi modal") } });

    expect(screen.getByRole("dialog", { name: "Judul Modal" })).toBeInTheDocument();
    expect(screen.getByText("isi modal")).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId("modal-close"));
    expect(onClose).toHaveBeenCalled();
  });
});
