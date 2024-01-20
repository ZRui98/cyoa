<script lang="ts">
  export let toggled = false;
  export let label: string;
</script>

<div class="toggle">
  <div class="label">{label}:</div>
  <label class="switch">
    <input bind:checked={toggled} type="checkbox" />
    <span class="slider round" />
  </label>
</div>

<style>
  .toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .label {
    padding-right: 5px;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: hsl(var(--main-surface));
    outline: 1px solid hsl(var(--main-highlight-high));
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: hsl(var(--main-fg));
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: hsl(var(--main-muted));
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
