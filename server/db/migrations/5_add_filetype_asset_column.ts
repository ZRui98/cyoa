import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('asset')
        .addColumn('fileType', 'varchar')
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('asset')
        .dropColumn('fileType')
        .execute();
}