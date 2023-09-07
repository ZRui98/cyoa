<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { clickOutside } from '../utils/clickOutside';
  import Accordion from './Accordion.svelte';
  export let text: string;
  export let value: any = undefined;
  export let options: { text: string; value?: any }[] = [];
  export let style = '';
  export let contentStyle = `
    margin-top: 10px;
    position: absolute;
    display: block;
    -webkit-box-shadow: 9px 7px 18px -3px rgba(0,0,0,0.1); 
    box-shadow: 9px 7px 18px -3px rgba(0,0,0,0.1);
    border: 1px solid var(--main-highlight-high);
    padding: 10px 5px;
    z-index: 999;
  `;
  let open = false;
  if (!value) value = text;

  const dispatch = createEventDispatcher<{ change: { oldValue: any; value: any } }>();

  function handleValueChange(option: { text: string; value?: any }) {
    open = false;
    const oldValue = value;
    value = option.value ?? option.text;
    dispatch('change', { oldValue, value });
    text = option.text;
  }
</script>

<Accordion
  bind:open
  id="dropdown"
  buttonStyle="padding:5px;"
  {contentStyle}
  chevronSize={16}
  style={`font-weight:normal;position:relative;;${style}`}
  {...$$restProps}
>
  <div slot="toggle-button">{text}</div>
  <div
    slot="toggle-content"
    use:clickOutside={'#dropdown'}
    on:click_outside|stopPropagation={() => {
      open = false;
    }}
  >
    {#each options as option}
      <div
        class="option"
        on:keydown={(e) => e.code === 'Enter' ?? handleValueChange(option)}
        on:click={() => handleValueChange(option)}
      >
        {option.text}
      </div>
    {/each}
  </div>
</Accordion>

<style>
  .option:hover {
    background-color: var(--main-highlight-med);
  }

  .option {
    padding: 5px;
    border-radius: 5px;
  }
</style>
