<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { type Writable, writable } from 'svelte/store';

  import Adventure from '../../../../../components/ui/Adventure.svelte';
  import type { AdventureSummary } from '@backend/models/Adventure';
  import loginState from '../../../../../store/loginState';
  let titleStore: Writable<string> = getContext('titleSuffix');
  let bio =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut commodo felis. Cras fermentum commodo orci et efficitur. Nulla odio mauris, elementum vel purus sed, suscipit lacinia nibh. Maecenas elementum velit metus. Proin elit orci, faucibus nec tellus tempor, dictum vulputate quam. In sed augue euismod, posuere mi sit amet, molestie ipsum. Nullam tortor orci, ultricies et dictum quis, vestibulum eu tellus. Pellentesque efficitur in augue sed eleifend. In hac habitasse platea dictumst. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In consequat id velit nec cursus. Nam at ligula vitae justo malesuada accumsan. Quisque quis lacinia sem. Phasellus commodo enim sed libero condimentum, et condimentum elit bibendum. Fusce ornare elit in elit tristique hendrerit. Nunc lobortis lacinia lacus, eu commodo quam pulvinar at. Etiam euismod in ligula in ultricies. Nam dignissim massa at elementum laoreet. Aenean et enim tortor. Aenean auctor felis vel velit sagittis, id rutrum erat lacinia. Vestibulum sodales in enim sit amet aliquam. In consectetur lacus eros, in rhoncus diam gravida sed. Nam malesuada dictum est vel consequat. Donec a urna eu quam sodales tincidunt in in nisi. Vivamus a ante ligula. Sed pellentesque dui vel pretium tristique. Nunc fermentum lectus quam. Maecenas semper laoreet elit at tincidunt. Duis at tortor varius, dapibus dolor vitae, convallis purus. Fusce facilisis at erat eleifend sollicitudin. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nullam a risus tincidunt, tempus lectus vitae, suscipit nisl. Quisque ac rhoncus quam. Vivamus a augue facilisis lacus malesuada condimentum in id lectus. In eu auctor dui, eu convallis nulla. In gravida pulvinar nisi eget vestibulum. Cras luctus felis non lorem pellentesque aliquet. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut facilisis velit sed massa interdum tristique. Pellentesque imperdiet ullamcorper sapien. Aliquam bibendum rhoncus ex, id tincidunt mauris. Quisque eu facilisis enim, feugiat maximus ante. Donec venenatis lacinia arcu, ac blandit nulla dictum eu. Donec semper urna id mauris finibus, vitae faucibus enim elementum. Proin malesuada maximus lobortis. Nam mauris arcu, condimentum volutpat nisl imperdiet, laoreet ultrices ipsum. Nunc eget tellus maximus dolor venenatis luctus. Donec elit ante, elementum eget vehicula at, ullamcorper ut dui. Vivamus ex nisi, fringilla et placerat auctor, rutrum et odio. Pellentesque ac commodo est. Praesent egestas eu felis et varius. Donec condimentum justo et vulputate commodo. Donec vulputate fermentum turpis nec bibendum. Pellentesque est sem, laoreet ut metus a, laoreet faucibus est. Integer malesuada est eget enim dapibus, vel sagittis turpis fringilla. Nunc ac sem vel arcu dignissim iaculis. Aenean ac eros et tortor dignissim dignissim. Phasellus interdum volutpat blandit. Sed ac faucibus neque. Sed id tellus a tortor volutpat vehicula ac eu libero. Donec ut lobortis dolor, ut faucibus risus.';
  export let data: { adventures: AdventureSummary[]; user: string };
  let name = data.user;
  $: canEdit = $loginState?.user === data.user;
  let adventures = writable(data.adventures);

  function handleAdventureDelete(e: CustomEvent<{name: string}>) {
    const adventureIdx = $adventures.findIndex(a => a.name === e.detail.name);
    adventures.update(advs => {
      advs.splice(adventureIdx, 1);
      return advs;
    });
  }

  onMount(() => {
    $titleStore = name;
  });
</script>

<div id="bio" class="card">
  <h1>{name}</h1>
  <p>{bio}</p>
</div>
<h2>adventures</h2>
<div id="container">
  {#each $adventures as adventure}
    <Adventure
      name={adventure.name}
      author={name}
      description={adventure.description}
      count={adventure.playCount}
      canEdit={canEdit}
      on:delete={handleAdventureDelete}
    />
  {/each}
</div>

<style>
  #container {
    flex-direction: column;
    display: flex;
    gap: 20px;
    padding-bottom: 50px;
  }
</style>
