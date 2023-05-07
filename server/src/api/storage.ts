import { Adventure, AdventureRow, InsertableAdventureRow } from "../models/Adventure";
import { S3 } from "@aws-sdk/client-s3";
import db from "../db";
import { URL } from "url";
import path from "path";

const s3 = new S3({
  region: "us-east-1",
  endpoint: `${process.env.STORAGE_URL}`,
  credentials: {
    accessKeyId: `${process.env.ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
  },
  forcePathStyle: true
});

function getFilenameFromAdventure(user: string, adventureName: string): URL {
  const url = new URL(`${process.env.STORAGE_URL}`);
  url.pathname += path.join('/', user, `${adventureName}.json`);
  return url;
}

export async function saveAdventure(user: string, adventure: Adventure) {
  const row: InsertableAdventureRow = {
    author: user,
    name: adventure.name,
    description: adventure.description,
    filePath: adventure.name.replace(/\s+/g, '-'),
    playCount: 0
  };
  await s3.putObject({
    Bucket: `${row.author}`,
    Key: `${row.filePath}.json`,
    Body: JSON.stringify(adventure)
  });
  await db.insertInto("adventure").values(row).execute();
}

export async function getFilePathFromId(user: string, file: string): Promise<string | undefined> {
  const {filePath, author} = await db.selectFrom('adventure')
    .where('filePath', '=', file)
    .where('author', '=', user)
    .selectAll()
    .executeTakeFirstOrThrow();
  return getFilenameFromAdventure(author, filePath).href;
}

export async function validateAdventure(adventure: Adventure) {

}