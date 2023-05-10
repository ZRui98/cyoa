<script lang="ts">
    import { Howl } from 'howler';
    import { onDestroy, onMount } from 'svelte';

    export let src: string;
    export let html5: boolean = true;

    let howl: Howl | undefined;

    onMount(() => {
        howl = new Howl({
            src: [src],
            autoplay: true,
            html5
        });
    });

    onDestroy(() => {
        howl?.stop();
    })
</script>