<script lang="ts">
    import { ArrowRight } from "lucide-svelte";
    export let name: string;
    export let author: string;
    export let description: string;
    export let count: number;
    const linkRegex = /(\[([^\]]+)])\(([^)]+)\)/g;
    let formattedDescription = description.replace(linkRegex, '<a href="$3"> $2 </a>');
</script>



<div class="card">
    <div>
        <div class="title">
            <a class="button-round" href={`/user/${author}/${name}`}>Play <ArrowRight /></a>
            {name}
        </div>
        <div>
            <span>{@html formattedDescription}</span>
        </div>
        <span class="count">Play count: {count}</span>
    </div>
</div>

<style>
    .card {
        flex-direction: row;
        display: flex;
        justify-content: space-between;
        gap: 10%;
        border: 1px solid var(--main-highlight-high);
    }
    .title {
        font-size: 32px;
        padding-bottom: 18px;
        font-weight: bold;
        display: flex;
        gap: 10px;
    }

    .button-round {
        padding: 8px 30px;
        gap: 5px;
        font-size: 16px;
    }

    .count {
        color: var(--main-foam);
    }
</style>