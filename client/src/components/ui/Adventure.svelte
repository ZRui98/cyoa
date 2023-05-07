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
            <a class="play-button" href={`/user/${author}/${name}`}>Play <ArrowRight /></a>
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
    }
    .title {
        font-size: 32px;
        padding-bottom: 18px;
        font-weight: bold;
        display: flex;
        gap: 10px;
    }

    .play-button {
        text-decoration: none;
        color: var(--main-fg);
        font-size: 16px;
        padding: 8px 30px;
        background-color: var(--main-highlight-med);
        border-radius: 25px;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .play-button:hover {
        background-color: var(--main-highlight-high);
    }

    .count {
        color: var(--main-foam);
    }
</style>