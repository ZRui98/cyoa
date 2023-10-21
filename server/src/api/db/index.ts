import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { AdventureTable } from '../../models/Adventure';
import { AdventureAssetTable, ManagedAssetTable } from '../../models/Asset';
import { UserTable } from '../../models/User';

export interface DatabaseSchema {
  adventure: AdventureTable;
  asset: ManagedAssetTable;
  adventure_asset: AdventureAssetTable;
  user: UserTable;
}
const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: new Database('cyoa.db'),
  }),
});

export default db;
