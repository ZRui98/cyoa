<script lang="ts">
  import type { Edge } from "@backend/Node";

  const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ultrices velit, sed varius odio luctus et. Vestibulum congue turpis vel dignissim cursus. Morbi ultricies semper magna, sed tincidunt augue porttitor non. Sed augue enim, convallis eu scelerisque sed, auctor bibendum odio. Donec lobortis pharetra massa ac ultricies. Nulla nec risus ut enim euismod faucibus sed vel ex. Praesent fermentum massa vitae lacus accumsan efficitur at a velit. Donec placerat, libero et placerat eleifend, urna urna tristique lorem, vel tristique felis massa vitae sem. Duis rutrum porttitor magna, dictum condimentum enim ornare ut.
Curabitur sollicitudin, est et bibendum luctus, felis arcu egestas tellus, quis varius ligula dolor in sapien. Morbi sit amet efficitur libero. Duis malesuada neque quis enim semper, vitae scelerisque nisi imperdiet. Suspendisse posuere nibh mi. Vestibulum sagittis vitae massa quis sodales. Aenean lectus enim, lacinia eget diam vitae, fringilla tempor dolor. Sed sed dui sed mi congue accumsan.
Vestibulum suscipit augue in turpis sodales egestas. Fusce non leo eget mauris malesuada aliquam eu nec sem. Integer malesuada dui sit amet aliquam finibus. Fusce tempor volutpat ex, sit amet laoreet erat. Nam eget lectus dolor. Nunc hendrerit tempor luctus. Curabitur ut augue nec leo pulvinar sodales dictum eget nulla. In hac habitasse platea dictumst.
Morbi tempor quis sem ut varius. Praesent eget dapibus orci. Sed dictum tellus nisl, in dignissim nisi rhoncus id. Duis viverra dictum enim, non tempus elit finibus ac. Praesent eleifend sed metus non elementum. Aenean luctus vehicula velit, id fermentum urna tincidunt vitae. Quisque mollis nisl erat, sit amet imperdiet tortor suscipit sit amet. Ut ac mattis nisl. Quisque sollicitudin porta arcu et elementum. Etiam non ligula tincidunt, hendrerit ante quis, gravida ligula. Quisque pellentesque elit egestas, lobortis lectus et, sollicitudin lacus. Donec elit magna, faucibus at dapibus sit amet, rhoncus quis ante. Phasellus eu magna id risus vestibulum consectetur. Maecenas tincidunt venenatis nisi, at mollis ipsum laoreet vitae. In ac ornare lacus. Cras eu sapien et neque euismod aliquam.`;
  const options: Edge[] = [{prompt: "Decision 1", next: "1"}, {prompt: "Decision 2", next: "1"}, {prompt: "Decision 3", next: "1"}]
</script>
<div id="node-wrapper">
  <span>{text}</span>
  <footer>
    <div class="options">
    {#each options as option}
      <a href="#" class="option">{option.prompt}</a>
    {/each}
    </div>
  </footer>
</div>

<style>
  .options {
    align-items: center;
    flex-direction: column;
    display: flex;
  }
  a {
    text-decoration: none;
    color: var(--main-love);
  }

  a:active {
    text-decoration: underline;
  }

  a:hover {
    color: var(--main-gold);
  }

  a::before {
    visibility: hidden;
    content: "\002666";
    display: inline-block;
    align-content: left;
    text-decoration: none;
  }

  a:hover::before {
    visibility: visible;
  }

  footer {
    display: block;
  }

  span {
    font-size: 20;
  }

  #node-wrapper {
    height:100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 50px 0;
  }
</style>