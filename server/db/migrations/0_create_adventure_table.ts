import { Kysely } from 'kysely';
import { DatabaseSchema } from '../../src/api/db';

export async function up(db: Kysely<DatabaseSchema>): Promise<void> {
  await db.schema
    .createTable('adventure')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('fileName', 'varchar', (col) => col.notNull())
    .addColumn('author', 'varchar', (col) => col.notNull())
    .addColumn('playCount', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('description', 'varchar')
    .execute();
  await db.schema
    .createIndex('adventure_author_filename_unique')
    .on('adventure')
    .columns(['fileName', 'author'])
    .execute();
  await db.schema.createIndex('adventure_author_name_unique').on('adventure').columns(['name', 'author']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('adventure').execute();
  await db.schema.dropIndex('author_filename_unique').execute();
}
