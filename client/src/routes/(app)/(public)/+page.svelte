<script lang="ts">
  import type { Graph } from "../../../store/adventure";
  import { createLayeredGraph } from "../../../utils/createGraph";

const graph: Graph = {
    start: '0',
    nodes: {
      '0': {
        name: '0',
        links: [{next: '1'}]
      },
      '1': {
        name: '1',
        links: [{next: '2'}]
      },
      '2': {
        name: '2',
        links: [{next: '0'}]
      },
    }
  };
  console.log(graph.nodes);
  createLayeredGraph(graph);
</script>

<h1>Create your own adventure.</h1>
<h2>Play for fun. </h2>
<pre class="zork">
You are standing in an open field west of a white house, with a boarded front door.    
There is a small mailbox here.
</pre>
<h2>Build for fun.</h2>


<style>
    .zork {
        color: hsl(var(--main-gold))
    }
</style>