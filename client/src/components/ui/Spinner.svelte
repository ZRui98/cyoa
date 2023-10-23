<script>
  import { Loader2 } from 'lucide-svelte';
</script>

<div>
  <Loader2 display="block" size={70} style={'animation: rotation 2s infinite linear;'} />
</div>

<style>
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
