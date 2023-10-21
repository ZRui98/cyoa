import { BusboyFileStream } from '@fastify/busboy';
import { Insertable, Updateable } from 'kysely';
import { MimeType, fileTypeStream } from 'file-type';
import { deleteAssetDb, getAssetFromDb, getManagedAssetResponse, insertAssetDb, updateAssetDb } from '../db/asset';
import { FileType, ManagedAssetResponse, ManagedAssetTable } from '../../models/Asset';
import { ApiError } from '../../util/error';
import { s3, uploadFromStream } from '.';
import { pipeline } from 'stream/promises';
import { decodeSqid } from '../../util/sqid';

export function getAssetFilePath(user: string, fileName: string) {
  return `${user}/${fileName}`;
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

export async function saveAsset(
  { file, filename, name }: { file: BusboyFileStream; filename: string; name: string },
  author: string
): Promise<ManagedAssetResponse> {
  const existingAsset = await getAssetFromDb({ author, name, fileName: filename });
  if (existingAsset) throw new ApiError(409, 'Asset already exists.');
  const stream = await fileTypeStream(file);
  const fileType = getFileType(stream.fileType?.mime);
  if (!fileType) throw new ApiError(400, 'Unsupported file type');
  // if file name has changed, and asset path should be updated, then reupload all json adventures using updated asset.
  const row: Insertable<ManagedAssetTable> = {
    fileName: filename,
    name,
    fileType,
    author,
  };
  const newAsset = await insertAssetDb(row, undefined);
  const filePath = getAssetFilePath(author, filename);
  const { pass, upload } = uploadFromStream(process.env.ASSET_BUCKET_NAME, filePath, stream.fileType?.mime);
  pipeline(stream, pass);
  await upload.done();
  return getManagedAssetResponse(author, newAsset, true);
}

export async function updateAsset(
  { file, filename, name }: { file?: BusboyFileStream; filename?: string; name?: string },
  author: string,
  sqid: string
): Promise<ManagedAssetResponse | null> {
  const asset = await getAssetFromDb({ id: decodeSqid(sqid), author });
  if (!asset) throw new ApiError(404, 'asset not found');
  const updatedAsset: Updateable<ManagedAssetTable> = {};
  if (file && filename) {
    const stream = await fileTypeStream(file);
    const fileType = getFileType(stream.fileType?.mime);
    if (!fileType) throw new ApiError(400, 'Unsupported file type');
    updatedAsset.fileType = fileType;
    const filePath = getAssetFilePath(author, filename);
    const { pass, upload } = uploadFromStream(process.env.ASSET_BUCKET_NAME, filePath);
    pipeline(stream, pass);
    await upload.done();
  }
  const newFileName = filename ?? asset.fileName;
  const newName = name ?? asset.name;
  let assetResponse: ManagedAssetResponse = getManagedAssetResponse(author, asset);
  try {
    if (!!newFileName) updatedAsset.fileName = newFileName;
    if (!!newName) updatedAsset.name = newName;
    const v = await updateAssetDb(updatedAsset, undefined, asset.id);
    assetResponse = getManagedAssetResponse(author, v, true);
  } catch (e) {
    if ((e as { message: string }).message.startsWith('duplicate key value')) {
      throw new ApiError(409, 'Asset with same name or filename already exists!');
    }
  }

  return assetResponse;
}

export async function deleteAsset(name: string, author: string): Promise<ManagedAssetResponse | null> {
  const asset = await getAssetFromDb({ name, author });

  if (!asset) throw new ApiError(404, 'asset not found');
  await deleteAssetDb(asset.id);
  await s3.deleteObject({ Bucket: process.env.ASSET_BUCKET_NAME, Key: getAssetFilePath(author, asset.fileName) });
  return getManagedAssetResponse(author, asset);
}
