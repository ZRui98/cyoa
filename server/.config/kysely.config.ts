import Database from 'better-sqlite3';
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: 'better-sqlite3',
	dialectConfig: {
      	database: new Database(process.env.DB_FILE),
	},
  	migrations: {
		migrationFolder: "db/migrations",
  	},
	//   plugins: [],
	//   seeds: {
	//     seedFolder: "seeds",
	//   }
})
