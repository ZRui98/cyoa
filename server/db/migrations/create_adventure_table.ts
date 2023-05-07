import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('adventure')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('filePath', 'varchar', (col) =>col.notNull())
    .addColumn('author', 'varchar', (col) => col.notNull())
    .addColumn('playCount', 'integer', (col) => col.defaultTo(0).notNull())
    .execute();
  await db.schema.createIndex('author_filepath_unique')
    .on('adventure')
    .columns(['filePath', 'author'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('adventure').execute();
  await db.schema.dropIndex('author_filepath_unique').execute();
}