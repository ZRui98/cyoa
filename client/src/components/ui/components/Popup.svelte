<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  let _show: boolean | undefined = undefined;

  const dispatch = createEventDispatcher();
  $: {
    if (show === false &&  _show === true) {
      dispatch('close');
    }
    _show = show;
  }
  const handleClose = () => {
    show = false;
  };
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
{#if _show}
  <div
    class="backdrop"
    aria-roledescription="click to close div"
    role="dialog"
    on:keydown|self={(e) => e.code === 'Escape' ?? handleClose()}
    on:scroll|stopPropagation
    on:click|self={handleClose}
  >
    <div class="dialog" {...$$restProps}>
      <div class="container">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    backdrop-filter: blur(3px);
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .dialog {
    border-radius: 0.2em;
    border: 2px solid hsl(var(--main-highlight-high));
    padding: 0;
    background: hsl(var(--main-bg));
    color: hsl(var(--main-fg));
    border-radius: 10px;
    display: flex;
  }

  .container {
    width: calc(100% - 2em);
    height: calc(100% - 2em);
    margin: 1em;
  }
</style>
