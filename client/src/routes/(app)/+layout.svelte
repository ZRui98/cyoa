<script lang="ts">
  import { setContext } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import Header from '../../components/ui/Header.svelte';
  import { writable } from 'svelte/store';
  const layoutStyling = writable<string>('');
  setContext('layoutStyling', layoutStyling);
  const titleSuffix = writable<string>('');
  setContext('titleSuffix', titleSuffix);

  beforeNavigate(() => {
    $titleSuffix = '';
  });
</script>

<svelte:head>
  <title>CYOA{$titleSuffix ? ` - ${$titleSuffix}` : ''}</title>
</svelte:head>

<div id="content" style={$layoutStyling}>
  <Header />
  <main>
    <slot />
  </main>
</div>

<style>
  #content {
    height: 100%;
    margin: 0 10%;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
  }

  main {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }
</style>
