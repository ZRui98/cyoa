import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction, Updateable } from "kysely";
import db, { Database } from ".";
import { AdventureAssetTable, ManagedAssetResponse, ManagedAssetTable } from "../../models/Asset";
import { ApiError } from "../../util/error";
import { getAssetFilePath } from "../storage/asset";

export async function getAllAssetsByUser(
    user: string,
    trx: Transaction<Database> | Kysely<Database> = db,
): Promise<Selectable<ManagedAssetTable>[]> {
    const assets = await trx.selectFrom('asset')
        .where('author', '=', user)
        .orderBy('id')
        .selectAll()
        .execute();
    return assets;
}

export async function getAllAssetsByUserAndNames(
    user: string,
    names: string[] = [],
    trx: Transaction<Database> | Kysely<Database> = db
): Promise<Selectable<ManagedAssetTable>[]> {
    const assets = await trx.selectFrom('asset')
        .where('author', '=', user)
        .where('name', 'in', names)
        .orderBy('id')
        .selectAll()
        .execute();
    return assets;
}

export function getManagedAssetResponse(
    user: string,
    assets: Selectable<ManagedAssetTable>[]
): ManagedAssetResponse[] {
    const response = assets.map(asset => ({...asset, path: `${process.env.STORAGE_URL}/${process.env.ASSET_BUCKET_NAME}/${getAssetFilePath(user, asset.fileName)}`}));
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

export async function updateAdventureAssetDiff(
    author: string,
    adventureId: number,
    { assetsToAdd, assetsToRemove }: {assetsToRemove?: string[], assetsToAdd?: string[]},
    trx: Transaction<Database> | Kysely<Database> = db
) {
    if (assetsToAdd?.length) {
        const assets = await getAllAssetsByUserAndNames(author, assetsToAdd, trx);
        const insertingRows = assets.reduce((acc, asset) => {
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
        const assets = await getAllAssetsByUserAndNames(author, assetsToRemove);
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