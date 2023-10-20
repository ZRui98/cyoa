import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction } from "kysely";
import db, { DatabaseSchema } from ".";
import { getAdventureFilePath } from "../storage/adventure";
import { AdventureTable } from "../../models/Adventure";
import { getPresignedUrlForFile } from "../storage";

export async function getPresignedAdventureFromId(
  user: string,
  file: string,
  trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db
): Promise<string | undefined> {
    const {fileName, author} = await trx.selectFrom('adventure')
      .where('fileName', '=', file)
      .where('author', '=', user)
      .select(['fileName', 'author'])
      .executeTakeFirstOrThrow(() => new Error("could not find adventure"));
    const signedUrl = await getPresignedUrlForFile(process.env.STORY_BUCKET_NAME ?? 'cyoa-stories', getAdventureFilePath(author, fileName));
    return signedUrl;
}

export async function getAdventureFromDb(
  values: Partial<Selectable<AdventureTable>>,
  trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db
): Promise<Selectable<AdventureTable> | undefined> {
  let transaction = trx.selectFrom('adventure')
  Object.entries(values).forEach(([key, val]) => {
    transaction = transaction.where(key as ReferenceExpression<DatabaseSchema, 'adventure'>, '=', val)
  })
  return await transaction.selectAll()
    .executeTakeFirst()
}

export async function upsertAdventure(
  adventure: Insertable<AdventureTable>,
  trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db,
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

export async function deleteAdventureDb(
  id: number,
  trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db,
) {
  await trx.deleteFrom('adventure').where('id', '=', id).execute();
}