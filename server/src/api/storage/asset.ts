import { BusboyFileStream } from "@fastify/busboy";
import { Insertable, Updateable } from "kysely";
import path from "path";
import { deleteAssetDb, getAssetFromDb, insertAssetDb, updateAssetDb } from "../db/asset";
import { AssetResponse, AssetTable } from "../../models/Asset";
import { ApiError } from "../../util/error";
import { updateAdventuresWithAsset } from "./adventure";
import { s3, uploadFromStream } from ".";

export function getAssetFilePath(fileName: string) {
    return `assets/${fileName}`;
}
  
export function getFileURLFromAsset(user: string, fileName: string): URL {
    const url = new URL(`${process.env.STORAGE_URL}`);
    url.pathname += path.join('/', user, getAssetFilePath(fileName));
    return url;
}

export async function saveAsset({file, filename, name}: {file: BusboyFileStream, filename: string, name: string}, author: string): Promise<AssetResponse> {
    const existingAsset = await getAssetFromDb({author, name, fileName: filename});
    if (existingAsset) throw new ApiError(409, "Asset already exists.");
  
    // if file name has changed, and asset path should be updated, then reupload all json adventures using updated asset.
    const row: Insertable<AssetTable> = {
        fileName: filename,
        name,
        author,
    };
    const newAsset = await insertAssetDb(row, undefined);
    const filePath = getAssetFilePath(filename);
    const {pass, upload} = uploadFromStream(filePath, author);
    file.pipe(pass);
    await upload.done();
    return {
        ...newAsset,
        path: getAssetFilePath(newAsset.fileName)
    }
}
  
export async function updateAsset({file, filename, name, id}: {file?: BusboyFileStream, filename?: string, name?: string, id: number}, author: string): Promise<AssetResponse | null> {
    const asset = await getAssetFromDb({id});
    if (!asset) throw new ApiError(404, "asset not found");
    // if filename or asset name has changed, and asset should be updated, then reupload all json adventures using updated asset.
    const fileNameOrNameChanged = (filename && filename !== asset.fileName) || (name && name !== asset.name);
    let assetResponse: AssetResponse | null = null;
    if (fileNameOrNameChanged) {
        const newFileName = filename ?? asset.fileName;
        const newName = name ?? asset.name;
        try {
            const row: Updateable<AssetTable> = {};
            if (!!newFileName) row.fileName = newFileName;
            if (!!newName) row.name = newName;
            const v = await updateAssetDb(row, undefined, id);
            assetResponse = {...v, path: getAssetFilePath(newFileName)};
        } catch(e) {
            if ((e as {message: string}).message.startsWith('duplicate key value')) {
                throw new ApiError(409, "Asset with same name or filename already exists!");
            }
        }
        await updateAdventuresWithAsset(author, asset.id, {
            path: getFileURLFromAsset(author, newFileName).href,
            managedAssetName: newName
        });

    }
    if (file && filename) {
        const filePath = getAssetFilePath(filename);
        const { pass, upload } = uploadFromStream(filePath, author);
        file.pipe(pass);
        await upload.done();
    }

    return assetResponse;
}

export async function deleteAsset(id: number, author: string): Promise<AssetResponse | null> {
    const asset = await getAssetFromDb({id});
    
    if (!asset) throw new ApiError(404, 'asset not found');
    await deleteAssetDb(id);
    await s3.deleteObject({Bucket: author, Key: getAssetFilePath(asset.fileName)});
    return {...asset, path: getAssetFilePath(asset.fileName)};
}