import { createPool, Pool } from 'mysql';
import chalk from 'chalk';
import dbConfig from '../../config.js';
import util from "util";
import Logger from '../logger/Logger.js';

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
        this.Pool.getConnection(err => err ? 
            Logger.database("Failed to connect to the database")
            : 
            Logger.database("Connected to the database"));
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