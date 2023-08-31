<script lang="ts">
  import { clickOutside } from '../utils/clickOutside';
  import Accordion from './Accordion.svelte';

  export let value: any;
  export let options: {text: string, value?: any}[] = [];
  export let style = '';
  export let contentStyle = `
    margin-top: 10px;
    position: absolute;
    display: block;
    -webkit-box-shadow: 9px 7px 18px -3px rgba(0,0,0,0.1); 
    box-shadow: 9px 7px 18px -3px rgba(0,0,0,0.1);
    outline: 1px solid var(--main-highlight-high);
    padding: 10px;
    z-index: 999;
  `;
  let open = false;
</script>

<Accordion
  bind:open={open}
  id="dropdown"
  buttonStyle="padding:5px;"
  contentStyle={contentStyle}
  style={`font-weight:normal;position:relative;;${style}`}
  {...$$restProps}
  >
  <div slot="toggle-button">{value}</div>
  <div slot="toggle-content" 
    use:clickOutside={'#dropdown'}
    on:click_outside|stopPropagation={() => {open = false;console.log('second')}}
  >
    {#each options as option}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="option" on:click={() => (value = option.value ?? option.text)}>{option.text}</div>
    {/each}
  </div>
</Accordion>

<style>
  .option:hover {
    background-color: var(--main-highlight-med);
  }
</style>
