<script lang="ts">
  import { setContext } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { Toaster } from 'svelte-sonner';
  import Header from '../../components/ui/Header.svelte';
  import { writable } from 'svelte/store';
  const layoutStyling = writable<string>('');
  setContext('layoutStyling', layoutStyling);
  const titleSuffix = writable<string>('');
  setContext('titleSuffix', titleSuffix);

  beforeNavigate(() => {
    $titleSuffix = '';
  });

  const sonnerStyle = `
    --normal-bg: hsl(var(--main-surface));
    --normal-border: hsl(var(--main-highlight-high));
    --normal-text: hsl(var(--main-fg));
    --success-bg: hsl(var(--main-surface));
    --success-border: hsl(var(--main-highlight-high));
    --success-text: hsl(var(--main-foam));
    --error-bg: hsl(var(--main-surface));
    --error-border: hsl(var(--main-highlight-high));
    --error-text: hsl(var(--main-love));
    --info-bg: hsl(var(--main-surface));
    --info-border: hsl(var(--main-highlight-high));
    --info-text: hsl(210, 100%, 27%);
    --warning-bg: hsl(60, 85%, 96%);
    --warning-border: hsl(var(--main-highlight-high));
    --warning-text: hsl(var(--main-gold));
  `;
</script>

<svelte:head>
  <title>CYOA{$titleSuffix ? ` - ${$titleSuffix}` : ''}</title>
</svelte:head>

<div id="content" style={$layoutStyling}>
  <Toaster position="top-center" duration={3000} closeButton richColors toastOptions={{ style: sonnerStyle }} />
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
