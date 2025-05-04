<script lang="ts">
  import { Moon, User, Lightbulb, LogIn, LogOut } from 'lucide-svelte';
  import loginState from '../../../store/loginState';
  import { theme } from '../../../store/settings';
  import { onDestroy, onMount } from 'svelte';
  import { derived, type Unsubscriber } from 'svelte/store';
  import { logout } from '../../../utils/api';
  import { goto } from '$app/navigation';

  let isLoggedIn = derived(loginState, (state) => state?.user !== undefined);
  let unsub: Unsubscriber | undefined;
  onMount(() => {
    unsub = theme.subscribe((theme) => {
      if (theme.darkMode) {
        window.document.querySelector('html')?.setAttribute('dark-mode', '');
      } else {
        window.document.querySelector('html')?.removeAttribute('dark-mode');
      }
    });
  });

  async function onLogout() {
    await logout();
    loginState.set(undefined);
    await goto('/');
  }

  onDestroy(() => {
    if (unsub) unsub();
  });
</script>

<header>
  <div>
    <a href="/" class="button static-padding">Home</a>
    <a href="/editor" class="button static-padding">Editor</a>
    {#if $isLoggedIn}
      <a href="/assets" class="button static-padding">Assets</a>
    {/if}
  </div>
  <div class="left-panel">
    <button
      class="button"
      on:click={() => {
        $theme.darkMode = !$theme.darkMode;
      }}
    >
      {#if $theme.darkMode}
        <Lightbulb display="block" size={21} />
      {:else}
        <Moon display="block" size={21} />
      {/if}
    </button>
    {#if $isLoggedIn}
      <a class="left-panel button" href={`/user/${$loginState?.user}`}><User display="block" size={21} /></a>
      <a class="left-panel button" href={'#'} on:click={onLogout}><LogOut display="block" size={21} /></a>
    {:else}
      <a href="/login" class="button static-padding"><LogIn display="block" size={21} /></a>
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

  .left-panel {
    display: flex;
  }

  .left-panel,
  .left-panel .button {
    color: hsl(var(--main-fg));
  }
</style>
