<script>
    import { page } from '$app/stores';
    console.log($page)
</script>
  
<h1>{$page.status}</h1>
<h2>{$page?.error?.message}</h2>