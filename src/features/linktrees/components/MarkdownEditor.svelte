<script>
  import { onMount } from "svelte";
  import Editor from "@toast-ui/editor";
  import "@toast-ui/editor/dist/toastui-editor.css";

  let { value, onchange } = $props();
  let element;

  onMount(() => {
    const editor = new Editor({
      el: element,
      height: "220px",
      initialEditType: "wysiwyg",
      previewStyle: "vertical",
      usageStatistics: false,
      initialValue: value,
      events: {
        change: () => onchange(editor.getMarkdown()),
      },
    });
    return () => editor.destroy();
  });
</script>

<div bind:this={element} data-testid="markdown-editor"></div>
