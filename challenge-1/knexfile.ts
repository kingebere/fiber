// Update with your config settings.
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import fs from "fs-extra"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const folderName = path.join(__dirname,'out')

//This checks if there is a folder existing,
//it none, it creates the directory
await fs.ensureDir(folderName)
const dbFilePath = `${folderName}/database.sqlite`;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export const development = {
    client: 'sqlite3',
    connection: {
        filename: dbFilePath
    },
    useNullAsDefault: false,
    // Preventing the application from overloading 
    // the database server with too many concurrent database connections.
    pool: {
        min: 0,
        max: 10, // Maximum number of connections
    },
};
export const staging = {
    client: 'postgresql',
    connection: {
        database: 'my_db',
        user: 'username',
        password: 'password'
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
};
export const production = {
    client: 'postgresql',
    connection: {
        database: 'my_db',
        user: 'username',
        password: 'password'
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
};