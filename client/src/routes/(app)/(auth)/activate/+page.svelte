<script lang="ts">
  import { goto } from '$app/navigation';
  import Spinner from '../../../../components/ui/Spinner.svelte';
  import loginState from '../../../../store/loginState';
  import { activateUser } from '../../../../utils/api';

  let username: string;
  export let submit: Promise<void>;

  function submitUsername() {
    submit = activateUser(username).then((resp) => {
      if (resp.activated) {
        loginState.update((state) => {
          return { ...state, user: resp.name, activated: true };
        });
      }
      goto('/');
    });
  }
</script>

<div id="content">
  <h3>Pick a username to continue</h3>
  <input bind:value={username} type="text" placeholder="Pick a username" class="static-padding" />

  {#await submit}
    <Spinner />
  {/await}
  <button class="link" on:click={submitUsername}>continue</button>
</div>

<style>
  #content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 25px;
  }

  .link {
    color: hsl(var(--main-gold));
  }
</style>
