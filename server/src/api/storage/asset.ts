import { BusboyFileStream } from "@fastify/busboy";
import { Insertable, Updateable } from "kysely";
import { MimeType, fileTypeStream} from 'file-type';
import { deleteAssetDb, getAssetFromDb, insertAssetDb, updateAssetDb } from "../db/asset";
import { FileType, ManagedAssetResponse, ManagedAssetTable } from "../../models/Asset";
import { ApiError } from "../../util/error";
import { getPresignedUrlForFiles, s3, uploadFromStream } from ".";
import db from "../db";
import { pipeline } from "stream/promises";

export function getAssetFilePath(fileName: string) {
    return `assets/${fileName}`;
}

function getFileType(mimeType: MimeType | undefined): FileType | undefined {
    let fileType: FileType | undefined;
    if (mimeType?.startsWith('image/')) {
        fileType = 'IMG';
    } else if (mimeType?.startsWith('audio/')) {
        fileType = 'AUDIO';
    }
    return fileType;
}

export async function saveAsset({file, filename, name}: {file: BusboyFileStream, filename: string, name: string}, author: string): Promise<ManagedAssetResponse> {
    const existingAsset = await getAssetFromDb({author, name, fileName: filename});
    if (existingAsset) throw new ApiError(409, "Asset already exists.");
    const stream = await fileTypeStream(file);
    const fileType = getFileType(stream.fileType?.mime);
    if (!fileType) throw new ApiError(400, "Unsupported file type");
    // if file name has changed, and asset path should be updated, then reupload all json adventures using updated asset.
    const row: Insertable<ManagedAssetTable> = {
        fileName: filename,
        name,
        fileType,
        author,
    };
    const newAsset = await insertAssetDb(row, undefined);
    const filePath = getAssetFilePath(filename);
    const {pass, upload} = uploadFromStream(filePath, author, stream.fileType?.mime);
    pipeline(
        stream,
        pass
    );
    await upload.done();
    const paths = await getPresignedUrlForFiles(author, [getAssetFilePath(newAsset.fileName)]);
    return {
        ...newAsset,
        path: paths[newAsset.fileName]
    }
}
  
export async function updateAsset({file, filename, name, id}: {file?: BusboyFileStream, filename?: string, name?: string, id: number}, author: string): Promise<ManagedAssetResponse | null> {
    const asset = await getAssetFromDb({id});
    if (!asset) throw new ApiError(404, "asset not found");
    let assetResponse: ManagedAssetResponse = asset;
    const updatedAsset: Updateable<ManagedAssetTable> = {};
    if (file && filename) {
        const stream = await fileTypeStream(file);
        const fileType = getFileType(stream.fileType?.mime);
        updatedAsset.fileType = fileType;
        const filePath = getAssetFilePath(filename);
        const { pass, upload } = uploadFromStream(filePath, author);
        pipeline(
            stream,
            pass
        );
        await upload.done();
        const paths = await getPresignedUrlForFiles(author, [filePath]);
        assetResponse.path = paths[filePath];
    }
    const newFileName = filename ?? asset.fileName;
    const newName = name ?? asset.name;
    try {
        if (!!newFileName) updatedAsset.fileName = newFileName;
        if (!!newName) updatedAsset.name = newName;
        const v = await updateAssetDb(updatedAsset, undefined, id);
        assetResponse = v;
    } catch(e) {
        if ((e as {message: string}).message.startsWith('duplicate key value')) {
            throw new ApiError(409, "Asset with same name or filename already exists!");
        }
    }

    return assetResponse;
}

export async function deleteAsset(id: number, author: string): Promise<ManagedAssetResponse | null> {
    const asset = await getAssetFromDb({id});
    
    if (!asset) throw new ApiError(404, 'asset not found');
    await deleteAssetDb(id);
    await s3.deleteObject({Bucket: author, Key: getAssetFilePath(asset.fileName)});
    return asset;
}