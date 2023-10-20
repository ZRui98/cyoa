import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('user')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar', (col) => col.unique())
        .addColumn('email', 'varchar', (col) =>col.notNull())
        .addColumn('accountType', 'varchar', (col) =>col.notNull())
        .addColumn('bio', 'varchar')
        .addColumn('accountTypeId', 'varchar', (col) => col.notNull())
        .addColumn('activated', 'boolean', (col) => col.defaultTo(false))
        .execute();
    await db.schema.createIndex('accounttype_accounttypeid_unique')
        .on('user')
        .columns(['accountType', 'accountTypeId'])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex('accounttype_accounttypeid_unique').execute();
    await db.schema.dropTable('user').execute();
}