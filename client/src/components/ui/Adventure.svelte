<script lang="ts">
  import { ArrowRight, Edit, Trash2 } from 'lucide-svelte';
  import { deleteAdventure } from '../../utils/api';
  import { createEventDispatcher } from 'svelte';
  import { toast } from 'svelte-sonner';
  export let name: string;
  export let author: string;
  export let description: string | undefined;
  export let count: number;
  export let canEdit = false;
  const linkRegex = /(\[([^\]]+)])\(([^)]+)\)/g;
  let formattedDescription = description?.replace(linkRegex, '<a href="$3"> $2 </a>') ?? '';
  const dispatch = createEventDispatcher();

  function handleDeleteAdventure() {
    const promise = deleteAdventure(name).then((v) => {
      dispatch('delete', { name });
    });
    toast.promise(promise, {
      success: 'Successfully deleted adventure',
      error: 'Failed to delete adventure',
      loading: 'Deleting adventure...',
      info: '',
      warning: '',
    });
  }
</script>

<div class="card">
  <div class="title">
    <div>
      <a class="button-round" href={`/user/${author}/${name}`}><span>Play <ArrowRight display="block" /></span></a>
      {name}
    </div>
    {#if canEdit}
      <div>
        <a class="button" href={`/editor?adventure_name=${name}`}><span><Edit display="block" /></span></a>
        <button class="button" on:click={handleDeleteAdventure}><span><Trash2 display="block" /></span></button>
      </div>
    {/if}
  </div>
  <div>
    <span>{@html formattedDescription}</span>
  </div>
  <span class="count">Play count: {count}</span>
</div>

<style>
  .card {
    flex-direction: column;
    display: flex;
    justify-content: space-between;
    gap: 10%;
    border: 1px solid hsl(var(--main-highlight-high));
  }

  .title {
    justify-content: space-between;
    display: flex;
    width: 100%;
    align-items: center;
  }

  .title > div {
    font-size: 32px;
    padding-bottom: 18px;
    font-weight: bold;
    display: flex;
    gap: 10px;
  }

  .button-round {
    padding: 10px 20px;
    font-size: 16px;
  }

  .button-round > span {
    gap: 10px;
    display: flex;
    justify-content: center;
  }

  .count {
    color: hsl(var(--main-foam));
  }
</style>
