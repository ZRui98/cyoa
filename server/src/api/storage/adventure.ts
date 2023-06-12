import { Insertable } from "kysely";
import path from "path";
import { s3 } from ".";
import db from "../db";
import { getAdventureFromDb, upsertAdventure } from "../db/adventure";
import { getAllAdventuresUsingAsset, updateAssetDiff } from "../db/asset";
import { Adventure, AdventureTable, AdventureMetaData, isAdventure } from "../../models/Adventure";
import { Asset, ManagedExportableAsset, isManagedExportableAsset } from "../../models/Asset";
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
        const uniqueAdventureAssetNames = new Set<string>(Object.values(adventure.nodes).reduce((acc: string[], node: Node) => {
            if (!node.assets) return acc;
            return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetName)]
        }, []));
        
        await updateAssetDiff(user, id, {namesToAdd: [...uniqueAdventureAssetNames]}, trx);
    });
  
    const filePath = getAdventureFilePath(row.fileName);
    // insert new adventure
    await s3.putObject({
        Bucket: `${row.author}`,
        Key: filePath,
        Body: JSON.stringify(adventure)
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
            const uniqueAdventureAssetNames = new Set<string>(Object.values(adventure.nodes).reduce((acc: string[], node: Node) => {
                if (!node.assets) return acc;
                return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetName)]
            }, []));
            let deletedAssets: string[] = [];
                // adventure already exists. Maintain association table of adventures 
            const oldUniqueAdventureAssetNames = new Set<string>(Object.values(oldAdventure!.nodes).reduce((acc: string[], node: Node) => {
                if (!node.assets) return acc;
                return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetName)]
            }, []));
            deletedAssets = [...oldUniqueAdventureAssetNames].filter(asset => !uniqueAdventureAssetNames.has(asset));
        
            const inserted = await upsertAdventure(row, trx, id);
            if (!inserted) throw new ApiError(500, "failed to insert");
            await updateAssetDiff(user, id, {namesToAdd: [...uniqueAdventureAssetNames], namesToRemove: deletedAssets}, trx);
        });
        
        // insert new adventure
        await s3.putObject({
            Bucket: `${row.author}`,
            Key: getAdventureFilePath(row.fileName),
            Body: JSON.stringify(adventure)
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
            console.log('what happened', oldAdventure.name, row.name, nameChanged, filePath);
            oldAdventure.name = row.name;
            oldAdventure.description = row.description;
            await s3.putObject({
                Bucket: `${row.author}`,
                Key: getAdventureFilePath(row.fileName),
                Body: JSON.stringify(oldAdventure)
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

async function getAllAdventureFiles(user: string, fileNames: string[]): Promise<(Adventure | undefined)[]> {
    const responses = await Promise.all(fileNames.map(async (fileName) => {
        const filePath = getAdventureFilePath(fileName);
        const file = await s3.getObject({Bucket: user, Key: filePath});
        return file.Body?.transformToString()
    }));
    return responses
        .map((response: string) => response !== undefined ? JSON.parse(response) as Adventure : response);
}
  
export async function validateAdventure(adventure: Adventure) {
  
}

export async function updateAdventuresWithAsset(user: string, assetId: number, newAsset: ManagedExportableAsset | undefined) {
    const adventureEntries = await getAllAdventuresUsingAsset(assetId);
    const filePaths = adventureEntries.map(({fileName}) => fileName);
    const adventures = await getAllAdventureFiles(user, filePaths);
    const newAdventures = adventures.map((adventure) => {
        if (!adventure) return;
        Object.keys(adventure.nodes).forEach((key) => {
            let assets = adventure.nodes[key].assets;
            if (!assets) return;
            assets = assets.map(
            (asset: Asset) => {
                if (isManagedExportableAsset(asset) && asset.managedAssetName === newAsset?.managedAssetName) {
                    return newAsset;
                }
                return asset;
            }).filter((asset): asset is Asset => asset !== undefined);
    
            adventure.nodes[key].assets = assets;
        });
        return adventure;
    });
    const promises = newAdventures.reduce((acc: Promise<void>[], adventure, idx) => {
        if (!adventure) return acc;
        return [...acc, updateAdventure(user, adventure, adventureEntries[idx].id)];
    }, []);
    await Promise.all(promises);
}