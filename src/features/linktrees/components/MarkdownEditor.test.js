import { render, waitFor } from "@testing-library/svelte";
import MarkdownEditor from "./MarkdownEditor.svelte";

describe("MarkdownEditor", () => {
  it("membuat editor, meneruskan perubahan, dan menghancurkannya saat dilepas", async () => {
    const onchange = vi.fn();
    const { unmount } = render(MarkdownEditor, { props: { value: "awal", onchange } });

    await waitFor(() => expect(globalThis.__toastEditors).toHaveLength(1));
    const editor = globalThis.__toastEditors[0];
    expect(editor.options.initialValue).toBe("awal");

    editor.options.events.change();
    expect(onchange).toHaveBeenCalledWith("# markdown baru");

    unmount();
    expect(editor.destroy).toHaveBeenCalled();
  });

  it("langsung menghancurkan editor bila dilepas sebelum selesai dimuat", async () => {
    const { unmount } = render(MarkdownEditor, { props: { value: "awal", onchange: vi.fn() } });
    unmount();

    await waitFor(() => expect(globalThis.__toastEditors).toHaveLength(1));
    expect(globalThis.__toastEditors[0].destroy).toHaveBeenCalled();
  });
});