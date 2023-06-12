<script lang="ts">
    import {createEventDispatcher} from 'svelte';

    import Spinner from "./Spinner.svelte";
    type T = $$Generic;
    export let promise: Promise<T> | undefined;
    const dispatch = createEventDispatcher();
    $: {
        if (promise !== undefined) {
            promise.then((data) => {
                dispatch('load', {data})
            }).catch((e) => {
                dispatch('error', {error: e})
            });
        }
    }
</script>

<div>
{#if promise}
    {#await promise}
        <slot name="loading"><Spinner /></slot>
    {:then data}
        <slot data={data} name="on-load" />
    {:catch e}
        <slot error={e} name="on-error" />
    {/await}
{:else}
    <slot />
{/if}
</div>