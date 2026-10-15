<script>
  import { onMount } from "svelte";

  let { value } = $props();
  let element;

  onMount(() => {
    let viewer;
    let active = true;

    (async () => {
      const [{ default: Editor }] = await Promise.all([
        import("@toast-ui/editor"),
        import("@toast-ui/editor/dist/toastui-editor.css"),
      ]);
      viewer = Editor.factory({ el: element, viewer: true, initialValue: value });
      if (!active) viewer.destroy();
    })();

    return () => {
      active = false;
      viewer?.destroy();
    };
  });
</script>

<div bind:this={element} data-testid="markdown-viewer"></div>
