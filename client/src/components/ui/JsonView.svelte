<script lang="ts">
  export let json: any;
  let collapsed = false;
  let symbol = ['{', '}'];
  if (Array.isArray(json)) symbol = ['[', ']'];

  function isCollapsible(key: string): boolean {
    if (typeof json[key] === 'number' || typeof json[key] === 'string') return false;
    return true;
  }
</script>

<span>{symbol[0]}</span>
{#if Object.keys(json).length > 0}
  <br />
{/if}
{#each Object.keys(json) as key}
  <span class="indent">
    {#if isCollapsible(key)}
      <span>{key}&nbsp:&nbsp<svelte:self json={json[key]} /></span>
    {:else}
      <span>{key}&nbsp:&nbsp</span><span class="value">{json[key]}</span><br />
    {/if}
  </span>
{/each}
<span>{symbol[1]}</span>

<style>
  .indent {
    padding-left: 20px;
    display: block;
  }

  span {
    display: inline-block;
  }

  .value {
    color: hsl(var(--main-gold));
  }
</style>
