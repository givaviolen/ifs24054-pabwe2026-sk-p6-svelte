<script>
  import { onMount } from "svelte";
  import Editor from "@toast-ui/editor";
  import "@toast-ui/editor/dist/toastui-editor.css";

  let { value } = $props();
  let element;

  onMount(() => {
    const viewer = Editor.factory({ el: element, viewer: true, initialValue: value });
    return () => viewer.destroy();
  });
</script>

<div bind:this={element} data-testid="markdown-viewer"></div>
