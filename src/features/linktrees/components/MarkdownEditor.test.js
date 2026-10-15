import { render } from "@testing-library/svelte";
import MarkdownEditor from "./MarkdownEditor.svelte";

describe("MarkdownEditor", () => {
  it("membuat editor, meneruskan perubahan, dan menghancurkannya saat dilepas", () => {
    const onchange = vi.fn();
    const { unmount } = render(MarkdownEditor, { props: { value: "awal", onchange } });

    const editor = globalThis.__toastEditors[0];
    expect(editor.options.initialValue).toBe("awal");

    editor.options.events.change();
    expect(onchange).toHaveBeenCalledWith("# markdown baru");

    unmount();
    expect(editor.destroy).toHaveBeenCalled();
  });
});
