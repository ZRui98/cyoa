import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('adventure_asset')
        .addForeignKeyConstraint('adventure_id_foreign', ['adventureId'], 'adventure', ['id'])
        .execute();
    await db.schema
        .alterTable('adventure_asset')
        .addForeignKeyConstraint('asset_id_foreign', ['assetId'], 'asset', ['id'])
        .execute();

}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('adventure_asset')
        .dropConstraint('adventure_id_foreign')
        .execute();
    await db.schema
        .alterTable('adventure_asset')
        .dropConstraint('asset_id_foreign')
        .execute();
}