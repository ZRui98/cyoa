import type { Adventure } from "@backend/Adventure";

export async function getAdventure(
    author: string,
    storyName: string
): Promise<Adventure> {
    // const url: string = await fetch(
    //     `${import.meta.env.BASE_URL}/adventure/${author}/${storyName}`
    // ).then(response => response.json());
    const url = "http://localhost:9000/cyoa-storage/user1/sample-story.json";
    const response: Adventure = await fetch(url).then(
        response => response.json()
    );
    return response;
}