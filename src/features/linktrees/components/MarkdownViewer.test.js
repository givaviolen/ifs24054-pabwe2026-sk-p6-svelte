import { render } from "@testing-library/svelte";
import MarkdownViewer from "./MarkdownViewer.svelte";

describe("MarkdownViewer", () => {
  it("membuat viewer dan menghancurkannya saat dilepas", () => {
    const { unmount } = render(MarkdownViewer, { props: { value: "# judul" } });

    const viewer = globalThis.__toastEditors[0];
    expect(viewer.options).toMatchObject({ viewer: true, initialValue: "# judul" });

    unmount();
    expect(viewer.destroy).toHaveBeenCalled();
  });
});
