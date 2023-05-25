import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";
import { promises as fs } from "fs";
import path from "path";
import { Database } from "../src/db";
import Pool from "pg-pool";

const __dirname = process.cwd();
async function migrate() {
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
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'db/migrations')
    })
  });

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrate();