<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { type Writable, writable } from 'svelte/store';

  import Adventure from '../../../../../components/ui/Adventure.svelte';
  import type { AdventureSummary } from '@backend/models/Adventure';
  import loginState from '../../../../../store/loginState';
  import TextPreview from '../../../../../components/ui/components/TextPreview.svelte';
  import { updateUser } from '../../../../../utils/api';
  import { toast } from 'svelte-sonner';
  let titleStore: Writable<string> = getContext('titleSuffix');
  export let data: { adventures: AdventureSummary[]; user: string; bio?: string };
  let name = data.user;
  let bio = data.bio ?? `Hey, I'm ${name}!`;
  $: canEdit = $loginState?.user === data.user;
  let editing = false;
  let adventures = writable(data.adventures);

  function handleAdventureDelete(e: CustomEvent<{ name: string }>) {
    const adventureIdx = $adventures.findIndex((a) => a.name === e.detail.name);
    adventures.update((advs) => {
      advs.splice(adventureIdx, 1);
      return advs;
    });
  }

  function handleBioSave(newBio: string) {
    console.log(newBio);
    const promise = updateUser({ name: data.user, bio: newBio }).then((resp) => {
      bio = resp.bio ?? bio;
      editing = false;
    });
    toast.promise(promise, {
      success: 'Successfully saved asset',
      error: 'Failed to save asset',
      loading: 'Saving asset...',
      info: '',
      warning: '',
    });
  }

  onMount(() => {
    $titleStore = name;
  });
</script>

<div id="bio" class="card">
  <h1>{name}</h1>
  {#if canEdit}
    <TextPreview bind:editing bind:value={bio} onSave={handleBioSave} fadeEffect={false} />
  {:else}
    <p>{bio}</p>
  {/if}
</div>
<h2>adventures</h2>
<div id="container">
  {#each $adventures as adventure}
    <Adventure
      name={adventure.name}
      author={name}
      description={adventure.description}
      count={adventure.playCount}
      {canEdit}
      on:delete={handleAdventureDelete}
    />
  {/each}
</div>

<style>
  #container {
    flex-direction: column;
    display: flex;
    gap: 20px;
    padding-bottom: 50px;
  }
</style>
