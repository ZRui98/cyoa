import { Insertable } from "kysely";
import path from "path";
import { s3 } from ".";
import db from "../db";
import { getAdventureFromDb, upsertAdventure } from "../db/adventure";
import { updateAssetDiff } from "../db/asset";
import { Adventure, AdventureTable, AdventureMetaData, isAdventure } from "../../models/Adventure";
import { isManagedExportableAsset } from "../../models/Asset";
import { Node } from "../../models/Node";
import { ApiError } from "../../util/error";

export function getAdventureFilePath(fileName: string) {
    return `adventures/${fileName}.json`;
  }
  
export function getFileURLFromAdventure(user: string, adventureName: string): URL {
    const url = new URL(`${process.env.STORAGE_URL}`);
    url.pathname += path.join('/', user, getAdventureFilePath(adventureName));
    return url;
}
export async function saveAdventure(user: string, adventure: Adventure) {
    const row: Insertable<AdventureTable> = {
        author: user,
        name: adventure.name,
        description: adventure.description,
        fileName: adventure.name.replace(/\s+/g, '-'),
        playCount: 0
    };
    let existingAdventure = await getAdventureFromDb({author: user, fileName: row.fileName});
    if (existingAdventure) throw new ApiError(409, "adventure with same name or filename already exists");
    // update adventure and add proper relationships
    await db.transaction().execute(async (trx) => {
        const inserted = await upsertAdventure(row, trx);
        if (!inserted) throw new ApiError(500, "failed to save new adventure");
        const { id } = inserted;
        const uniqueAdventureAssetNames = new Set<number>(Object.values(adventure.nodes).reduce((acc: number[], node: Node) => {
            if (!node.assets) return acc;
            return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetId)]
        }, []));
        
        await updateAssetDiff(user, id, {assetsToAdd: [...uniqueAdventureAssetNames]}, trx);
    });
  
    const filePath = getAdventureFilePath(row.fileName);
    // insert new adventure
    await s3.putObject({
        Bucket: `${row.author}`,
        Key: filePath,
        Body: JSON.stringify(adventure),
        ContentType: 'application/json'
    });
}
  
export async function updateAdventure(user: string, adventure: Adventure | AdventureMetaData, id: number) {
    const row: Insertable<AdventureTable> = {
        author: user,
        name: adventure.name,
        description: adventure.description,
        fileName: adventure.name.replace(/\s+/g, '-'),
        playCount: 0
    };
    let existingAdventure = await getAdventureFromDb({id});
    if (!existingAdventure) throw new ApiError(404, "adventure not found");
    const filePath = getAdventureFilePath(existingAdventure.fileName);
    let oldAdventure: Adventure | undefined;
  
    if (existingAdventure) {
        let body = await (await s3.getObject({
            Bucket: existingAdventure.author,
            Key: filePath
        })).Body?.transformToString();
        if (body) {
            oldAdventure = JSON.parse(body) as Adventure;
        }
    }
    if (!oldAdventure) throw new ApiError(404, "unable to find story file");
    // update adventure and add proper relationships
    if (isAdventure(adventure)) {
        await db.transaction().execute(async (trx) => {
            const uniqueAdventureAssetNames = new Set<number>(Object.values(adventure.nodes).reduce((acc: number[], node: Node) => {
                if (!node.assets) return acc;
                return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetId)]
            }, []));
            let deletedAssets: number[] = [];
                // adventure already exists. Maintain association table of adventures 
            const oldUniqueAdventureAssetNames = new Set<number>(Object.values(oldAdventure!.nodes).reduce((acc: number[], node: Node) => {
                if (!node.assets) return acc;
                return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetId)]
            }, []));
            deletedAssets = [...oldUniqueAdventureAssetNames].filter(asset => !uniqueAdventureAssetNames.has(asset));
        
            const inserted = await upsertAdventure(row, trx, id);
            if (!inserted) throw new ApiError(500, "failed to insert");
            await updateAssetDiff(user, id, {assetsToAdd: [...uniqueAdventureAssetNames], assetsToRemove: deletedAssets}, trx);
        });
        
        // insert new adventure
        await s3.putObject({
            Bucket: `${row.author}`,
            Key: getAdventureFilePath(row.fileName),
            Body: JSON.stringify(adventure),
            ContentType: 'application/json'
        });
        if (oldAdventure.name !== row.name) {
            await s3.deleteObject({
                Bucket: `${row.author}`,
                Key: filePath
            });
        }
    } else {
        const inserted = await upsertAdventure(row, undefined, id);
        if (!inserted) throw new ApiError(500, "failed to insert");
        if (oldAdventure.name !== row.name || oldAdventure.description !== row.description) {
            const nameChanged = oldAdventure.name !== row.name;
            oldAdventure.name = row.name;
            oldAdventure.description = row.description;
            await s3.putObject({
                Bucket: `${row.author}`,
                Key: getAdventureFilePath(row.fileName),
                Body: JSON.stringify(oldAdventure),
                ContentType: 'application/json'
            });
            if (nameChanged) {
                await s3.deleteObject({
                    Bucket: `${row.author}`,
                    Key: filePath
                });
            }
        }
    }
}
  
export async function validateAdventure(adventure: Adventure) {
  
}