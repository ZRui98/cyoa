<script lang="ts">
    import { setContext } from "svelte";
    import Header from "../../components/ui/Header.svelte";
    import { writable } from "svelte/store";
    const layoutStyling = writable<string>("");
    setContext('layoutStyling', layoutStyling);

</script>

<div id="content" style={$layoutStyling}>
    <Header/>
    <main>
        <slot />
    </main>
</div>

<style>
    #content {
        height: 100%;
        margin: 0 10%;
        display:flex;
        flex: 1 1 0;
        flex-direction: column;
    }

    main {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
    }
</style>