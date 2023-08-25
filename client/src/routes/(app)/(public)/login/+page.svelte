<script lang="ts">
  import { env } from '$env/dynamic/public';

  let googleButton: HTMLElement;
  const initGoogleButton = async () => {
    google.accounts.id.initialize({
      client_id: env.PUBLIC_GOOGLE_CLIENT_ID,
      ux_mode: 'redirect',
      login_uri: 'https://api.localtest.me:8080/auth/google/login',
    });
    google.accounts.id.renderButton(googleButton, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'pill',
      width: '250px',
    });
  };
</script>

<svelte:head>
  <script src="https://accounts.google.com/gsi/client" on:load={initGoogleButton}></script>
</svelte:head>

<div id="content">
  <div id="buttonDiv" bind:this={googleButton} />
</div>

<style>
  #content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
