<script lang="ts">
  import { settings } from "../../../store/settings";
  import Popup from "../Popup.svelte";
  import Toggle from "../Toggle.svelte";

  export let settingsVisible: boolean;
  export let showEditorSettings: boolean = false;
</script>

<Popup bind:show={settingsVisible} style="width: 32em;">
    <div class="wrapper">
        {#if !showEditorSettings}
            <h3>Settings</h3>
            <Toggle label="Typewriter effect" bind:toggled={$settings.reader.typeAnimation}/>
        {:else}
            <h3>Editor Settings</h3>
            <Toggle label="Focus on current node" bind:toggled={$settings.editor.autoFocus}/>
            <Toggle label="Auto-collapse all but current node" bind:toggled={$settings.editor.autoCollapse}/>
        {/if}
    </div>
</Popup>

<style>
    .wrapper {
        display: flex;
        flex-direction:column;
        gap: 10px;
    }
</style>