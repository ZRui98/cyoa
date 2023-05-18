import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('adventure')
    .addColumn('description', 'varchar')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('adventure')
    .dropColumn('description')
    .execute();
}