<script lang="ts">
  export let onFileChange: (files: File[]) => void
  export let multiple = false;
  let input: HTMLInputElement;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()

    if (!e?.dataTransfer?.items) {
      return
    }
    let items = Array.from(e.dataTransfer.files);
    if (!multiple) items = [items[0]];
    onFileChange(items);
  }

  const handleChange = (e: Event) => {
    e.preventDefault()
    const files: FileList = <FileList>(<HTMLInputElement>e.target).files
    onFileChange(Array.from(files))
  }
</script>

<div
  id="filedrop"
  on:drop={handleDrop}
  on:dragover={(e)=>e.preventDefault()}
  on:click={(e) => {e.preventDefault();input.click()}}
  on:keydown|self={(e) => e.code === 'Enter' ?? input.click()}
  {...$$restProps}
>
    <slot>
        <div id="default">
            <span>Drop a file here</span>
        </div>
      </slot>
</div>
<input
  type="file"
  bind:this={input}
  on:change={handleChange}
  {multiple}
/>
<style>
  #filedrop {
    width: 100%;
    cursor: pointer;
  }

  input {
    display: none;
  }

  #default {
    display: flex;
    align-items: center;
    width: 100%;
    height:90%;
    border: black solid 1px;
    border-radius: 10px;
    border-style: dashed;
    border-color: inherit;
    justify-content: center;
  }

  #default > span {
    margin: 20px;
  }

</style>