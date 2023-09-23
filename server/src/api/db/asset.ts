import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction, Updateable } from "kysely";
import db, { Database } from ".";
import { AdventureAssetTable, ManagedAssetResponse, ManagedAssetTable } from "../../models/Asset";
import { ApiError } from "../../util/error";
import { getPresignedUrlForFiles } from "../storage";
import { getAssetFilePath } from "../storage/asset";

export async function getAllAssetsByUser(user: string): Promise<Selectable<ManagedAssetResponse>[]> {
    const assets = await db.selectFrom('asset')
        .where('author', '=', user)
        .orderBy('id')
        .selectAll()
        .execute();
    const signedUrls = await getPresignedUrlForFiles(`${user}`, assets.map(asset => getAssetFilePath(asset.fileName)));
    console.log(signedUrls);
    const response = assets.map(asset => ({...asset, path: signedUrls[getAssetFilePath(asset.fileName)]}));
    return response;
}

export async function getAssetFromDb(
    values: Partial<Selectable<ManagedAssetTable>>,
    trx: Transaction<Database> | Kysely<Database> = db
): Promise<Selectable<ManagedAssetTable> | undefined> {
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
    { assetsToAdd, assetsToRemove }: {assetsToRemove?: number[], assetsToAdd?: number[]},
    trx: Transaction<Database> | Kysely<Database> = db
) {
    if (assetsToAdd?.length) {
        const assets = await Promise.all(assetsToAdd.map(async (assetId) => getAssetFromDb({author, id: assetId}, trx)));
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

    if (assetsToRemove?.length) {
        const assets = (
            await Promise.all(assetsToRemove.map(async (assetId) => getAssetFromDb({author, id: assetId}, trx))))
            .filter((asset): asset is Selectable<ManagedAssetTable> => asset !== undefined);
        await trx.deleteFrom('adventure_asset').where(({eb, and, or}) => or(
            assets.map(asset => and([
                eb('assetId', '=', asset.id),
                eb('adventureId', '=', adventureId)
            ]))
        )).execute();
    }
}

export async function insertAssetDb(
    asset: Insertable<ManagedAssetTable>,
    trx: Transaction<Database> | Kysely<Database> = db,
): Promise<Selectable<ManagedAssetTable>> {
    let v: Selectable<ManagedAssetTable> | undefined;
    try {
        v = await trx.insertInto('asset').values(asset).returningAll().executeTakeFirst();
    } catch(e) {
        if (e.code === "23505") {
            throw new ApiError(400, "Asset with identical filename or name exists");
        }
    }
    if (v === undefined) throw new ApiError(500, "Insert failed, unable to fetch object");
    return v;
}

export async function updateAssetDb(
    asset: Insertable<ManagedAssetTable> | Updateable<ManagedAssetTable>,
    trx: Transaction<Database> | Kysely<Database> = db,
    id: number,
): Promise<Selectable<ManagedAssetTable>> {
    const v = await trx.updateTable('asset').set(asset)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
    if (v === undefined) throw new ApiError(500, "Insert failed, unable to fetch object");
    return v;
}

export async function deleteAssetDb(
    id: number,
    trx: Transaction<Database> | Kysely<Database> = db,
) {
    const response = await trx.deleteFrom('asset').where('id', '=', id).executeTakeFirst();
    return response[0];
}