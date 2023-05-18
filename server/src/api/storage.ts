import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { BusboyFileStream } from "@fastify/busboy";
import path from "path";
import stream  from 'stream';
import { URL } from "url";

import { Adventure, AdventureTable } from "../models/Adventure";
import db from "../db";
import { Insertable } from "kysely";
import { Asset, AssetTable, ManagedExportableAsset, isManagedExportableAsset } from "../models/Asset";
import { getAllAdventuresUsingAsset, getAssetFromDb, updateAssetDiff, upsertAsset } from "../db/asset";
import { getAdventureFromDb, upsertAdventure } from "../db/adventure";
import { Node } from "../models/Node";

const s3 = new S3({
  region: "us-east-1",
  endpoint: `${process.env.STORAGE_URL}`,
  credentials: {
    accessKeyId: `${process.env.ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
  },
  forcePathStyle: true
});

export function getAdventureFilePath(fileName: string) {
  return `adventures/${fileName}.json`;
}

export function getFileURLFromAdventure(user: string, adventureName: string): URL {
  const url = new URL(`${process.env.STORAGE_URL}`);
  url.pathname += path.join('/', user, getAdventureFilePath(adventureName));
  return url;
}

export function getAssetFilePath(fileName: string) {
  return `assets/${fileName}`;
}

export function getFileURLFromAsset(user: string, fileName: string): URL {
  const url = new URL(`${process.env.STORAGE_URL}`);
  url.pathname += path.join('/', user, getAssetFilePath(fileName));
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
  const existingAdventure = await getAdventureFromDb({author: user, fileName: row.fileName});
  const filePath = getAdventureFilePath(row.fileName);
  let oldAdventure: Adventure | undefined;

  if (existingAdventure) {
    let body = await (await s3.getObject({
      Bucket: row.author,
      Key: filePath
    })).Body?.transformToString();
    if (body) {
      oldAdventure = JSON.parse(body) as Adventure;
    }
  }

  // update adventure and add proper relationships
  await db.transaction().execute(async (trx) => {
    const inserted = await upsertAdventure(row, trx);
    if (!inserted) throw new Error("failed to insert");
    const { id } = inserted;
    const uniqueAdventureAssetNames = new Set<string>(Object.values(adventure.nodes).reduce((acc: string[], node: Node) => {
      if (!node.assets) return acc;
      return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetName)]
    }, []));
    let deletedAssets: string[] = [];
    if (oldAdventure) {
      // adventure already exists. Maintain association table of adventures 
      const oldUniqueAdventureAssetNames = new Set<string>(Object.values(oldAdventure.nodes).reduce((acc: string[], node: Node) => {
        if (!node.assets) return acc;
        return [...acc, ...node.assets.filter(isManagedExportableAsset).map(asset => asset.managedAssetName)]
      }, []));
      deletedAssets = [...oldUniqueAdventureAssetNames].filter(asset => !uniqueAdventureAssetNames.has(asset));
    }
      
    await updateAssetDiff(user, id, {namesToAdd: [...uniqueAdventureAssetNames], namesToRemove: deletedAssets}, trx);
  });

  // insert new adventure
  await s3.putObject({
    Bucket: `${row.author}`,
    Key: filePath,
    Body: JSON.stringify(adventure)
  });
}

function uploadFromStream(filePath: string, user: string): {pass: stream.PassThrough, upload: Upload} {
  var pass = new stream.PassThrough();
  var params = {Bucket: user, Key: filePath, Body: pass};
  const upload = new Upload({
    client: s3,
    leavePartsOnError: true, // optional manually handle dropped parts
    params,
  });

  return { pass, upload };
}

export async function saveAsset({file, filename, name}: {file: BusboyFileStream, filename: string, name: string}): Promise<void> {
  let author = 'user1';
  const filePath = getAssetFilePath(filename);
  const {pass, upload} = uploadFromStream(filePath, 'user1');
  file.pipe(pass);
  await upload.done();
  const existingAsset = await getAssetFromDb({user: author, name: name});

  // if file name has changed, and asset path should be updated, then reupload all json adventures using updated asset.
  const row: Insertable<AssetTable> = {
    fileName: filename,
    name,
    author,
  };
  if ((existingAsset)) {
    if (row.fileName !== existingAsset.fileName || row.name !== existingAsset.name) {
      await updateAdventuresWithAsset(author, existingAsset.id, {
        path: getFileURLFromAsset(author, row.fileName).href,
        managedAssetName: row.name
      });
    }

  }
  await upsertAsset(row);
}

export async function updateAdventuresWithAsset(user: string, assetId: number, newAsset: ManagedExportableAsset | undefined) {
  const adventureEntries = await getAllAdventuresUsingAsset(assetId);
  const filePaths = adventureEntries.map(({fileName}) => fileName);
  const adventures = await getAllAdventureFiles(user, filePaths);
  const newAdventures = adventures.map((adventure) => {
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
  const promises = newAdventures.map(async (adventure) => saveAdventure(user, adventure));
  await Promise.all(promises);
}

async function getAllAdventureFiles(user: string, fileNames: string[]): Promise<Adventure[]> {
  const responses = await Promise.all(fileNames.map(async (fileName) => {
    const filePath = getAdventureFilePath(fileName);
    const file = await s3.getObject({Bucket: user, Key: filePath});
    return file.Body?.transformToString();
  }));
  return responses
    .filter(response => response !== undefined)
    .map((response: string) => JSON.parse(response) as Adventure);
}

export async function validateAdventure(adventure: Adventure) {

}