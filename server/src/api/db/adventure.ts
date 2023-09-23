import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction } from "kysely";
import db, { Database } from ".";
import { getFileURLFromAdventure } from "../storage/adventure";
import { AdventureTable } from "../../models/Adventure";

export async function getPresignedAdventureFromId(user: string, file: string, trx: Transaction<Database> | Kysely<Database> = db): Promise<string | undefined> {
    const {fileName, author} = await trx.selectFrom('adventure')
      .where('fileName', '=', file)
      .where('author', '=', user)
      .select(['fileName', 'author'])
      .executeTakeFirstOrThrow(() => new Error("could not find adventure"));
    const url =  getFileURLFromAdventure(author, fileName).href;
    const signedUrl = url;
    return signedUrl;
}

export async function getAdventureFromDb(
  values: Partial<Selectable<AdventureTable>>,
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
  trx: Transaction<Database> | Kysely<Database> = db,
  id?: number
) {
  let response: Selectable<AdventureTable>[] | undefined;
  if (id) {
    response = await trx.updateTable('adventure').set(adventure)
      .where('id', '=', id)
      .returningAll()
      .execute();
  }
  if (!response || !response.length) {
      response = await trx.insertInto('adventure').values(adventure).returningAll().execute();
  }
  return response[0];
}