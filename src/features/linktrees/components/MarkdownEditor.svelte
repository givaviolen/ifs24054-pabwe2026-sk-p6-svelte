<script>
  import { onMount } from "svelte";

  let { value, onchange } = $props();
  let element;

  onMount(() => {
    let editor;
    let active = true;

    (async () => {
      const [{ default: Editor }] = await Promise.all([
        import("@toast-ui/editor"),
        import("@toast-ui/editor/dist/toastui-editor.css"),
      ]);
      editor = new Editor({
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
      if (!active) editor.destroy();
    })();

    return () => {
      active = false;
      editor?.destroy();
    };
  });
</script>

<div bind:this={element} data-testid="markdown-editor"></div>
