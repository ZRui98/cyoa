import db from "../db";
import { AdventureTable } from "../models/Adventure";

export async function getAdventureSummaries(user: string): Promise<{name: string, description?: string}[]> {
    const results = await db.selectFrom('adventure')
        .where('author', '=', user)
        .selectAll()
        .execute();
    if (!results) {
        return [];
    }
    return results.map(({name, description}) => ({name, description}));
}