<script lang="ts">
    export let show = false;
	export let onClose: (() => void) | undefined = undefined;
    let dialog: HTMLDialogElement;
    $: {
		if (dialog) {
			if (show) {
				dialog.showModal()
			} else {
				dialog.close();
			}
		}
	};

	const handleClose = () => {
		if (onClose) onClose();
		show = false;
	}
</script>

<dialog
	{...$$restProps}
    bind:this={dialog}
    on:close={handleClose}
    on:click|self={() => dialog.close()}
    on:keydown|self={(e) => e.code === 'Escape' ?? dialog.close()}
>
    <div>
        <slot/>
    </div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: 2px solid var(--main-highlight-high);
		padding: 0;
        background: var(--main-bg);
		color: var(--main-fg);
		border-radius: 10px;
	}
	dialog::backdrop {
		backdrop-filter: blur(2px);
	}
	dialog > div {
		padding: 1em;
	}
</style>