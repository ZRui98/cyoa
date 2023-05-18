import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction } from "kysely";
import db, { Database } from ".";
import { getFileURLFromAdventure } from "../api/storage";
import { AdventureTable } from "../models/Adventure";
import { AssetTable } from "../models/Asset";

export async function getFileURLFromId(user: string, file: string, trx: Transaction<Database> | Kysely<Database> = db): Promise<string | undefined> {
    const {fileName, author} = await trx.selectFrom('adventure')
      .where('fileName', '=', file)
      .where('author', '=', user)
      .select(['fileName', 'author'])
      .executeTakeFirstOrThrow();
    return getFileURLFromAdventure(author, fileName).href;
}

export async function getAdventureFromDb(
  values: Partial<Selectable<AssetTable>>,
  trx: Transaction<Database> | Kysely<Database> = db
): Promise<Selectable<AdventureTable> | undefined> {
  let transaction = trx.selectFrom('adventure')
  Object.entries(values).forEach(([key, val]) => {
    transaction = transaction.where(key as ReferenceExpression<Database, 'adventure'>, '=', val)
  })
  return await transaction.selectAll()
    .executeTakeFirst()
}

export async function upsertAdventure(
  adventure: Insertable<AdventureTable>,
  trx: Transaction<Database> | Kysely<Database> = db
) {
  let response = await trx.updateTable('adventure').set(adventure)
      .where('author', '=', adventure.author)
      .where('name', '=', adventure.name)
      .returningAll()
      .execute();
  if (!response.length) {
      response = await trx.insertInto('adventure').values(adventure).returningAll().execute();
  }
  return response[0];
}