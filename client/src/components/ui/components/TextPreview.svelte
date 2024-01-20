<script lang="ts">
  import { Edit, Save } from 'lucide-svelte';
  import Popup from './Popup.svelte';

  export let editing = false;
  export let value: string;
  export let limit = 120;
  export let style: string = '';
  export let fadeEffect = true;
  export let onSave: (val: string) => void = (val) => {
    editing = false;
    value = val;
  };

  const fadeStyle = `
    -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
  `;
  const formSubmit = (e: Event) => {
    const target = e.target as HTMLFormElement;
    if (!target) return;
    const formData = new FormData(target);
    let newVal;
    for (const field of formData) {
      const [key, v] = field;
      if (key === 'content') {
        newVal = v.toString();
        break;
      }
    }
    if (newVal != undefined) onSave(newVal);
    e.preventDefault();
  };
</script>

<Popup bind:show={editing} style={`position:relative;width:50em;height:50em;`}>
  <form on:submit={formSubmit}>
    <textarea name="content" id="editor" {value} />
    <button type="submit" id="save" class="button"><Save display="block" /></button>
  </form>
</Popup>
<div id="preview" {style}>
  <pre style={fadeEffect ? fadeStyle : ''}>{value.slice(0, limit)}</pre>
  <button id="edit-button" class="button" on:click={() => (editing = !editing)}><Edit display="block" /></button>
</div>

<style>
  form {
    height: 100%;
    width: 100%;
  }
  #editor {
    height: 100%;
    width: 100%;
  }
  #save {
    position: absolute;
    bottom: 25px;
    right: 25px;
  }
  #preview {
    outline: 2px solid hsl(var(--main-highlight-high));
    border-radius: 4px;
    background-color: hsl(var(--main-bg));
    color: hsl(var(--main-fg));
    position: relative;
  }

  #edit-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  .button {
    outline: 2px solid hsl(var(--main-highlight-high));
  }

  pre {
    margin: 0 auto;
    padding: 12px 20px;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    font-size: 16px;
    border: none !important;
    outline: none;
  }
</style>
