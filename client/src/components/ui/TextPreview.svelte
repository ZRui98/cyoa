<script lang="ts">
  import { Edit, Save } from 'lucide-svelte';
  import Popup from './Popup.svelte';

  export let editing = false;
  export let value: string;
  export let limit = 120;
  export let style: string;
  const formSubmit = (e: Event) => {
    const target = e.target as HTMLFormElement;
    if (!target) return;
    const formData = new FormData(target);
    for (const field of formData) {
      const [key, v] = field;
      if (key === 'content') {
        value = v.toString();
      }
    }
    editing = false;
  };
</script>

<Popup show={editing} style={`position:relative;width:50%;height:70%;`}>
  <form on:submit={formSubmit}>
    <textarea name="content" id="editor" {value} />
    <button type="submit" id="save" class="button"><Save /></button>
  </form>
</Popup>
<div id="preview" {style}>
  <pre>{value.slice(0, limit)}</pre>
  <button id="edit-button" class="button" on:click={() => (editing = !editing)}><Edit /></button>
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
    border: 2px solid var(--main-fg);
    border-radius: 4px;
    background-color: var(--main-bg);
    color: var(--main-fg);
    position: relative;
  }

  #edit-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  pre {
    -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
    margin: 0 auto;
    padding: 12px 20px;
  }

  textarea {
    width: 100%;
    padding: 12px 20px;
    box-sizing: border-box;
    border: 2px solid var(--main-fg);
    border-radius: 4px;
    background-color: var(--main-bg);
    color: var(--main-fg);
    font-size: 10px;
    resize: none;
  }
</style>
