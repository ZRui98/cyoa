import { Insertable, Kysely, Selectable, Transaction } from "kysely";
import db, { Database } from ".";
import { AdventureAssetTable, AssetMetaData, AssetTable } from "../models/Asset";

export async function getAllAdventuresUsingAsset(assetId: number): Promise<{id: number, fileName: string}[]> {
    const adventures = await db.selectFrom('adventure_asset')
        .innerJoin('adventure', 'adventure.id', 'adventureId')
        .where('assetId', '=', assetId)
        .select(['adventure.id', 'adventure.fileName'])
        .execute();
    return adventures;
}

export async function getAssetFromDb(
    {user, name}: {user: string, name: string},
    trx: Transaction<Database> | Kysely<Database> = db
): Promise<Selectable<AssetTable> | undefined> {
    const asset = await trx.selectFrom('asset')
        .where('author', '=', user)
        .where('name', '=', name)
        .selectAll()
        .executeTakeFirst();
    return asset;
};

export async function updateAssetDiff(
    user: string,
    adventureId: number,
    { namesToRemove, namesToAdd }: {namesToRemove?: string[], namesToAdd?: string[]},
    trx: Transaction<Database> | Kysely<Database> = db
) {
    if (namesToAdd?.length) {
        const assets = await Promise.all(namesToAdd.map(async (assetName) => getAssetFromDb({user, name: assetName}, trx)));
        const insertingRows = assets.reduce((acc, asset) => {
            if (asset === undefined) return acc;
            const row: Insertable<AdventureAssetTable> = {
              assetId: asset.id,
              adventureId,
            }
            return [...acc, row];
          }, []);
        if (insertingRows.length > 0)
            await trx.insertInto('adventure_asset').values(insertingRows).onConflict(oc => oc.columns(['assetId', 'adventureId']).doNothing()).execute();
    }

    if (namesToRemove?.length) {
        const assets = (
            await Promise.all(namesToRemove.map(async (assetName) => getAssetFromDb({user, name: assetName}, trx))))
            .filter((asset): asset is Selectable<AssetTable> => asset !== undefined);
        await trx.deleteFrom('adventure_asset').where(({and , or, cmpr}) => or(
            assets.map(asset => and([
                cmpr('assetId', '=', asset.id),
                cmpr('adventureId', '=', adventureId)
            ]))
        )).execute();
    }
}

export async function upsertAsset(
    asset: Insertable<AssetTable>,
    trx: Transaction<Database> | Kysely<Database> = db
) {
    let response = await trx.updateTable('asset').set(asset)
        .where('asset.author', '=', asset.author)
        .where('name', '=', asset.name)
        .returningAll()
        .execute();
    if (!response.length) {
        response = await trx.insertInto('asset').values(asset).returningAll().execute();
    }
    return response[0];
}