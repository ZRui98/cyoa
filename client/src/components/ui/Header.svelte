<script lang="ts">
  import { Moon, User } from 'lucide-svelte';
  import { Lightbulb } from 'lucide-svelte';
  import loginState from '../../store/loginState';
  import { theme } from '../../store/theme';
  import { onDestroy, onMount } from 'svelte';
  import { derived, type Unsubscriber } from 'svelte/store';

  let isLoggedIn = derived(loginState, (state) => state?.user !== undefined);
  let unsub: Unsubscriber | undefined;
  onMount(() => {
    unsub = theme.subscribe((theme) => {
      if (theme === 'dark') {
        window.document.querySelector('html')?.setAttribute('dark-mode', '');
      } else if (theme === 'light') {
        window.document.querySelector('html')?.removeAttribute('dark-mode');
      }
    });
  });

  onDestroy(() => {
    if (unsub) unsub();
  });
</script>

<header>
  <div>
    <a href="/" class="button static-padding">Home</a>
    <a href="/" class="button static-padding">About</a>
    <a href="/editor" class="button static-padding">Editor</a>
    {#if $isLoggedIn}
      <a href="/assets" class="button static-padding">Assets</a>
    {/if}
  </div>
  <div class="left-panel">
    <button
      class="button"
      on:click={() => {
        $theme = $theme === 'dark' ? 'light' : 'dark';
      }}
    >
      {#if $theme === 'dark'}
        <Lightbulb size={21} />
      {:else if $theme === 'light'}
        <Moon size={21} />
      {/if}
    </button>
    {#if $isLoggedIn}
      <a class="left-panel button" href={`/user/${$loginState?.user}`}><User size={21} /></a>
    {:else}
      <a href="/login" class="button static-padding">Log in</a>
    {/if}
  </div>
</header>

<style>
  header {
    display: flex;
    flex-direction: row;
    padding-top: 20px;
    padding-bottom: 20px;
    justify-content: space-between;
  }

  a {
    height: auto;
    font-size: 20px;
  }

  .left-panel,
  .left-panel .button {
    color: var(--main-fg);
  }
</style>
