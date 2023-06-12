import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('asset')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('author', 'varchar', (col) => col.notNull())
    .addColumn('fileName', 'varchar', (col) =>col.notNull())
    .addColumn('description', 'varchar')
    .execute();
  await db.schema.createIndex('asset_author_filename_unique')
    .on('asset')
    .columns(['fileName', 'author'])
    .unique()
    .execute();
  await db.schema.createIndex('asset_author_name_unique')
    .on('asset')
    .columns(['name', 'author'])
    .unique()
    .execute();
  await db.schema
    .createTable('adventure_asset')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('assetId', 'bigint', (col) => col)
    .addColumn('adventureId', 'bigint', (col) => col)
    .execute();
  await db.schema.createIndex('adventure_asset_unique')
    .on('adventure_asset')
    .columns(['assetId', 'adventureId'])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('asset').execute();
  await db.schema.dropTable('adventure_asset').execute();
  await db.schema.dropIndex('author_name_unique').execute();
}