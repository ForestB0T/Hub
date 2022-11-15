import { createPool, Pool } from 'mysql';
import chalk from 'chalk';
import dbConfig from '../../config.js';
import util from "util";

const database: Pool = createPool(dbConfig);
database.getConnection(err => err ? console.error(err) : console.log(chalk.greenBright("Connected to database successfully.")));

export const promisedQuery = util.promisify(database.query).bind(database);
export default database; 