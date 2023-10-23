import { Insertable } from 'kysely';
import { getUserFilePath, s3 } from '.';
import db from '../db';
import { getAdventureFromDb, upsertAdventure, deleteAdventureDb } from '../db/adventure';
import { updateAdventureAssetDiff } from '../db/asset';
import { Adventure, AdventureTable, AdventureMetaData, isAdventure } from '../../models/Adventure';
import { isManagedExportableAsset } from '../../models/Asset';
import { Node } from '../../models/Node';
import { ApiError } from '../../util/error';

async function getAdventureAndJSON(user: string, adventureName: string) {
  const existingAdventure = await getAdventureFromDb({ author: user, name: adventureName });
  if (!existingAdventure) throw new ApiError(404, 'adventure not found');
  const filePath = getUserFilePath(user, existingAdventure.fileName, '.json');
  let oldAdventure: Adventure | undefined;
  let body = await (
    await s3.getObject({
      Bucket: process.env.STORY_BUCKET_NAME,
      Key: filePath,
    })
  ).Body?.transformToString();
  if (body) {
    oldAdventure = JSON.parse(body) as Adventure;
  }
  return { adventureContent: oldAdventure, existingAdventure };
}

export async function saveAdventure(user: string, adventure: Adventure) {
  const row: Insertable<AdventureTable> = {
    author: user,
    name: adventure.name,
    description: adventure.description,
    fileName: adventure.name.replace(/\s+/g, '-'),
    playCount: 0,
  };
  let existingAdventure = await getAdventureFromDb({ author: user, fileName: row.fileName });
  if (existingAdventure) throw new ApiError(409, 'adventure with same name or filename already exists');
  // update adventure and add proper relationships
  await db.transaction().execute(async (trx) => {
    const inserted = await upsertAdventure(row, trx);
    if (!inserted) throw new ApiError(500, 'failed to save new adventure');
    const { id } = inserted;
    const uniqueAdventureAssetNames = new Set<string>(
      Object.values(adventure.nodes).reduce((acc: string[], node: Node) => {
        if (!node.assets) return acc;
        return [...acc, ...node.assets.filter(isManagedExportableAsset).map((asset) => asset.managedAssetId)];
      }, [])
    );

    await updateAdventureAssetDiff(user, id, { assetsToAdd: [...uniqueAdventureAssetNames] }, trx);
  });

  const filePath = getUserFilePath(user, row.fileName, '.json');
  // insert new adventure
  await s3.putObject({
    Bucket: process.env.STORY_BUCKET_NAME,
    Key: filePath,
    Body: JSON.stringify(adventure),
    ContentType: 'application/json',
  });
}

export async function updateAdventure(user: string, adventure: Adventure | AdventureMetaData, name: string) {
  const { adventureContent, existingAdventure } = await getAdventureAndJSON(user, name);
  const filePath = getUserFilePath(user, existingAdventure.fileName, '.json');

  if (!adventureContent) throw new ApiError(404, 'unable to find story file');
  // update adventure and add proper relationships

  const row: Insertable<AdventureTable> = {
    author: user,
    name: adventure.name,
    description: adventure.description,
    fileName: adventure.name.replace(/\s+/g, '-'),
    playCount: 0,
  };
  if (isAdventure(adventure)) {
    await db.transaction().execute(async (trx) => {
      const uniqueAdventureAssetNames = new Set<string>(
        Object.values(adventure.nodes).reduce((acc: string[], node: Node) => {
          if (!node.assets) return acc;
          return [...acc, ...node.assets.filter(isManagedExportableAsset).map((asset) => asset.managedAssetId)];
        }, [])
      );
      let deletedAssets: string[] = [];
      // adventure already exists. Maintain association table of adventures
      const oldUniqueAdventureAssetNames = new Set<string>(
        Object.values(adventureContent!.nodes).reduce((acc: string[], node: Node) => {
          if (!node.assets) return acc;
          return [...acc, ...node.assets.filter(isManagedExportableAsset).map((asset) => asset.managedAssetId)];
        }, [])
      );
      deletedAssets = [...oldUniqueAdventureAssetNames].filter((asset) => !uniqueAdventureAssetNames.has(asset));

      const inserted = await upsertAdventure(row, trx, existingAdventure.id);
      if (!inserted) throw new ApiError(500, 'failed to insert');
      await updateAdventureAssetDiff(
        user,
        existingAdventure.id,
        { assetsToAdd: [...uniqueAdventureAssetNames], assetsToRemove: deletedAssets },
        trx
      );
    });

    // insert new adventure
    await s3.putObject({
      Bucket: process.env.STORY_BUCKET_NAME,
      Key: getUserFilePath(user, row.fileName, '.json'),
      Body: JSON.stringify(adventure),
      ContentType: 'application/json',
    });
    if (adventureContent.name !== row.name) {
      await s3.deleteObject({
        Bucket: process.env.STORY_BUCKET_NAME,
        Key: filePath,
      });
    }
  } else {
    const inserted = await upsertAdventure(row, undefined, existingAdventure.id);
    if (!inserted) throw new ApiError(500, 'failed to insert');
    if (adventureContent.name !== row.name || adventureContent.description !== row.description) {
      const nameChanged = adventureContent.name !== row.name;
      adventureContent.name = row.name;
      adventureContent.description = row.description;
      await s3.putObject({
        Bucket: process.env.STORY_BUCKET_NAME,
        Key: getUserFilePath(user, row.fileName, '.json'),
        Body: JSON.stringify(adventureContent),
        ContentType: 'application/json',
      });
      if (nameChanged) {
        await s3.deleteObject({
          Bucket: process.env.STORY_BUCKET_NAME,
          Key: getUserFilePath(user, row.fileName, '.json'),
        });
      }
    }
  }
}

export async function deleteAdventure(user: string, name: string) {
  const { adventureContent, existingAdventure } = await getAdventureAndJSON(user, name);
  const filePath = getUserFilePath(user, existingAdventure.fileName, '.json');
  const oldUniqueAdventureAssetIds = new Set<string>(
    Object.values(adventureContent!.nodes).reduce((acc: string[], node: Node) => {
      if (!node.assets) return acc;
      return [...acc, ...node.assets.filter(isManagedExportableAsset).map((asset) => asset.managedAssetId)];
    }, [])
  );

  await db.transaction().execute(async () => {
    await updateAdventureAssetDiff(user, existingAdventure.id, { assetsToRemove: [...oldUniqueAdventureAssetIds] });
    await deleteAdventureDb(existingAdventure.id);
  });
  await s3.deleteObject({
    Bucket: process.env.STORY_BUCKET_NAME,
    Key: filePath,
  });
}

export async function validateAdventure(adventure: Adventure) {}
