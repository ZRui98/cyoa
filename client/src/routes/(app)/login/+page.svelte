<script lang="ts">
    import {env} from '$env/dynamic/public';

    let googleButton: HTMLElement;
    const initGoogleButton = async () => {
        console.log('ready');
        google.accounts.id.initialize({
            client_id: env.PUBLIC_GOOGLE_CLIENT_ID,
            ux_mode: 'redirect',
            login_uri: 'http://localhost:3000/auth/google/callback'
        });
        google.accounts.id.renderButton(
            googleButton,
            {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                width: '250',
            }
        );
    }
</script>

<svelte:head>
    <script src="https://accounts.google.com/gsi/client" on:load={initGoogleButton}></script>
</svelte:head>

<main>
    <div id=buttonDiv bind:this={googleButton}></div>
</main>

<style global>
</style>
