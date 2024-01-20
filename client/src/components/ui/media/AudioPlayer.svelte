<script lang="ts">
  import { Howl } from 'howler';
  import { Pause, Play } from 'lucide-svelte';
  import { onDestroy, onMount } from 'svelte';
  import { derived, writable } from 'svelte/store';

  export let src: string;
  export let autoplay: boolean = false;
  export let html5: boolean = true;
  const maxTime = 1000;

  let bar: HTMLElement;
  let howl: Howl | undefined;
  let playing = writable(false);
  let progress = writable(0);
  progress.subscribe((val) => {
    if (!bar) return;
    const value = Math.ceil((val / maxTime) * 1000) / 10;
    bar.style.background =
      'linear-gradient(to right, hsl(var(--main-rose)) 0%, hsl(var(--main-rose)) ' +
      value +
      '%, hsl(var(--main-surface)) ' +
      value +
      '%, hsl(var(--main-surface)) 100%)';
  });
  let time = derived(progress, (val) => {
    if (!howl) return '0:00';
    const newTime = Math.round(((val / maxTime) * howl.duration() + Number.EPSILON) * 100);
    const numSec = Math.floor(newTime / 100).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    const numMin = Math.floor(newTime / (100 * 60)).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    return `${numMin}:${numSec}`;
  });

  let interval: NodeJS.Timeout;

  function step() {
    if (!howl) return;
    const time = howl.seek();
    const val = Math.ceil((howl.seek() / howl.duration()) * maxTime);
    progress.set(val);
  }

  function seek(e: Event) {
    if (!howl) return;
    const val = +(e.target as HTMLInputElement).value;
    progress.set(val);
    if ($playing) {
      howl.pause();
    }
    howl.seek((val / maxTime) * howl.duration());
  }

  function togglePlay() {
    if (!howl) return;
    if (howl.playing()) {
      howl.pause();
    } else {
      howl.play();
    }
  }

  function onPlay() {
    playing.set(true);
    interval = setInterval(step, 15);
  }

  function onPause() {
    playing.set(false);
    clearInterval(interval);
  }

  function onEnd() {
    progress.set(maxTime);
    onPause();
  }

  onMount(() => {
    howl = new Howl({
      src: [src],
      autoplay,
      onplay: onPlay,
      onpause: onPause,
      onstop: onPause,
      onend: onEnd,
      html5,
    });
  });

  onDestroy(() => {
    howl?.stop();
  });
</script>

<div class="audio-player">
  <button class="play-button" disabled={!howl} on:click={togglePlay}>
    {#if $playing}
      <Pause display="block" />
    {:else}
      <Play display="block" />
    {/if}
  </button>
  <input bind:this={bar} type="range" max={maxTime} value={$progress} on:input={seek} on:change={() => howl?.play()} />
  <div class="time">{$time}</div>
</div>

<style>
  .audio-player {
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    width: 100%;
  }

  .audio-player .play-button {
    margin-right: 10px;
  }
  .audio-player .time {
    margin-left: 10px;
  }

  .audio-player input {
    flex-grow: 1;
    border: solid 1px hsl(var(--main-love));
    background-color: hsl(var(--main-bg));
    border-radius: 8px;
    height: 5px;
    outline: none;
    transition: background 450ms ease-in;
    appearance: none;
    -webkit-appearance: none;
  }

  .audio-player input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    margin-top: 0px;
    background-color: hsl(var(--main-rose));
    height: 5px;
    width: 5px;
    border-radius: 0 90px 90px 0;
  }
</style>
