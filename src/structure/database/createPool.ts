import { createPool, Pool } from 'mysql';
import chalk from 'chalk';
import dbConfig from '../../config.js';
import util from "util";

export type database = {
    Pool: Pool
    promisedQuery: (query: string, values?: any) => Promise<any>;
    isConnected: () => Promise<boolean>;
}

export default class Database implements database {

    public promisedQuery: any;
    public Pool: Pool

    constructor() {
        this.Pool = createPool(dbConfig);
        this.Pool.getConnection(err => err ? console.error(err) : console.log(chalk.greenBright("Connected to database successfully.")));

        this.promisedQuery = util.promisify(this.Pool.query).bind(this.Pool);

    }

    public isConnected(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.Pool.getConnection((err, connection) => {
                if (err) {
                    resolve(false);
                } else {
                    connection.ping((err) => {
                        connection.release();
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                }
            });
        });
    }
    


}