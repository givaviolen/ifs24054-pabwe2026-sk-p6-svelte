import { render, waitFor } from "@testing-library/svelte";
import MarkdownViewer from "./MarkdownViewer.svelte";

describe("MarkdownViewer", () => {
  it("membuat viewer dan menghancurkannya saat dilepas", async () => {
    const { unmount } = render(MarkdownViewer, { props: { value: "# judul" } });

    await waitFor(() => expect(globalThis.__toastEditors).toHaveLength(1));
    const viewer = globalThis.__toastEditors[0];
    expect(viewer.options).toMatchObject({ viewer: true, initialValue: "# judul" });

    unmount();
    expect(viewer.destroy).toHaveBeenCalled();
  });

  it("langsung menghancurkan viewer bila dilepas sebelum selesai dimuat", async () => {
    const { unmount } = render(MarkdownViewer, { props: { value: "# judul" } });
    unmount();

    await waitFor(() => expect(globalThis.__toastEditors).toHaveLength(1));
    expect(globalThis.__toastEditors[0].destroy).toHaveBeenCalled();
  });
});