import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction, Updateable } from "kysely";
import db, { Database } from ".";
import { AdventureAssetTable, AssetResponse, AssetTable } from "../../models/Asset";
import { getAssetFilePath, getFileURLFromAsset } from "../storage/asset";

export async function getAllAdventuresUsingAsset(assetId: number): Promise<{id: number, fileName: string}[]> {
    const adventures = await db.selectFrom('adventure_asset')
        .innerJoin('adventure', 'adventure.id', 'adventureId')
        .where('assetId', '=', assetId)
        .select(['adventure.id', 'adventure.fileName'])
        .execute();
    return adventures;
}

export async function getAllAssetsByUser(user: string): Promise<Selectable<AssetResponse>[]> {
    const assets = await db.selectFrom('asset')
        .where('author', '=', user)
        .selectAll()
        .execute();
    const response = assets.map(asset => ({...asset, path: getFileURLFromAsset(user, asset.fileName).href}));
    return response;
}

export async function getAssetFromDb(
    values: Partial<Selectable<AssetTable>>,
    trx: Transaction<Database> | Kysely<Database> = db
): Promise<Selectable<AssetTable> | undefined> {
    let transaction = trx.selectFrom('asset')
    Object.entries(values).forEach(([key, val]) => {
      transaction = transaction.where(key as ReferenceExpression<Database, 'asset'>, '=', val)
    })
    return await transaction.selectAll()
      .executeTakeFirst()
};

export async function updateAssetDiff(
    author: string,
    adventureId: number,
    { namesToRemove, namesToAdd }: {namesToRemove?: string[], namesToAdd?: string[]},
    trx: Transaction<Database> | Kysely<Database> = db
) {
    if (namesToAdd?.length) {
        const assets = await Promise.all(namesToAdd.map(async (assetName) => getAssetFromDb({author, name: assetName}, trx)));
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
            await Promise.all(namesToRemove.map(async (assetName) => getAssetFromDb({author, name: assetName}, trx))))
            .filter((asset): asset is Selectable<AssetTable> => asset !== undefined);
        await trx.deleteFrom('adventure_asset').where(({and , or, cmpr}) => or(
            assets.map(asset => and([
                cmpr('assetId', '=', asset.id),
                cmpr('adventureId', '=', adventureId)
            ]))
        )).execute();
    }
}

export async function insertAssetDb(
    asset: Insertable<AssetTable>,
    trx: Transaction<Database> | Kysely<Database> = db,
) {
    return trx.insertInto('asset').values(asset).returningAll().execute();
}

export async function updateAssetDb(
    asset: Insertable<AssetTable> | Updateable<AssetTable>,
    trx: Transaction<Database> | Kysely<Database> = db,
    id: number,
) {
    const response = await trx.updateTable('asset').set(asset)
        .where('id', '=', id)
        .returningAll()
        .execute();
    return response[0];
}