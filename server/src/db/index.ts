import { Kysely, PostgresDialect } from "kysely";
import Pool from "pg-pool";
import { AdventureTable } from "../models/Adventure";
import { AdventureAssetTable, AssetTable } from "../models/Asset";

export interface Database {
  adventure: AdventureTable
  asset: AssetTable
  adventure_asset: AdventureAssetTable
}

const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: `${process.env.DB_HOST}`,
        database: `${process.env.DB_NAME}`,
        user: `${process.env.DB_USER}`,
        password: `${process.env.DB_PASSWORD}`,
      })
    }),
});

export default db;