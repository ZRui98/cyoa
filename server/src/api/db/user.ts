import { Insertable, Kysely, ReferenceExpression, Selectable, Transaction, Updateable } from "kysely";
import db, { DatabaseSchema } from ".";
import { UserData, UserTable } from "../../models/User";
import { ApiError } from "../../util/error";
import { AdventureSummary } from "../../models/Adventure";

export async function getAdventureSummaries(user: string): Promise<AdventureSummary[]> {
    const results = await db.selectFrom('adventure')
        .where('author', '=', user)
        .selectAll()
        .execute();
    if (!results) {
        return [];
    }
    return results.map(({name, description, playCount}) => ({name, description, playCount}));
}

export async function getUserFromDb(
    values: Partial<Selectable<UserTable>>,
    trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db
): Promise<Selectable<UserTable> | undefined> {
    let transaction = trx.selectFrom('user')
    Object.entries(values).forEach(([key, val]) => {
      transaction = transaction.where(key as ReferenceExpression<DatabaseSchema, 'user'>, '=', val)
    })
    return await transaction.selectAll()
      .executeTakeFirst()
};

export async function insertUserDb(
    user: Insertable<UserData>,
    trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db
): Promise<Selectable<UserTable>> {
    console.log(user);
    const v = await trx.insertInto('user').values(user).returningAll().executeTakeFirst();
    console.log('success!');
    if (v === undefined) throw new ApiError(500, "Insert failed, unable to fetch object");
    return v;
}

export async function updateUserDb(
    user: Insertable<UserTable> | Updateable<UserTable>,
    name: string,
    trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db,
): Promise<Selectable<UserTable>> {
    const v = await trx.updateTable('user').set(user)
        .where('name', '=', name)
        .returningAll()
        .executeTakeFirst();
    if (v === undefined) throw new ApiError(500, "Insert failed, unable to fetch object");
    return v;
}

type ActicationParams = {
    name: string
};

export async function activateUser(
    options: ActicationParams,
    name: string,
    trx: Transaction<DatabaseSchema> | Kysely<DatabaseSchema> = db,
): Promise<{name: string, activated: boolean}> {
    const user = await getUserFromDb({name}, trx);
    if (user?.activated) {
        return {name: user.name, activated: false};
    }
    const result = await updateUserDb({...options, activated: 1}, name, trx);
    return {name: result.name, activated: true};
}