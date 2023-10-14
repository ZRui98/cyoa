<script lang="ts">
  export let show = false;
  export let onClose: (() => void) | undefined = undefined;
  let dialog: HTMLDialogElement;
  $: {
    if (dialog) {
      if (show) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }

  const handleClose = () => {
    if (onClose) onClose();
    show = false;
  };
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  {...$$restProps}
  bind:this={dialog}
  on:close={handleClose}
  on:click|self={() => dialog.close()}
  on:keydown|self={(e) => e.code === 'Escape' ?? dialog.close()}
>
  <div>
    <div>
      <slot />
    </div>
  </div>
</dialog>

<style>
  dialog {
    border-radius: 0.2em;
    border: 2px solid hsl(var(--main-highlight-high));
    padding: 0;
    background: hsl(var(--main-bg));
    color: hsl(var(--main-fg));
    border-radius: 10px;
  }
  dialog::backdrop {
    backdrop-filter: blur(3px);
  }
  dialog > div {
    width: 100%;
    height: 100%;
    display: flex;
  }
  dialog > div > div {
    width: calc(100% - 2em);
    height: calc(100% - 2em);
    margin: 1em;
  }
</style>
