import chalk from 'chalk';

type LogType = 'WEBSOCKET' | 'APIROUTE' | 'UNKNOWN' | "ForestBotAPI";

export default class Logger {
    private static log(type: LogType, logStyle: typeof chalk, message: string) {
        const typePrefix = chalk.bold(`[${type}]`);
        const messageText = message ? ` - ${message}` : '';

        const timestamp = new Date().toLocaleString();
        console.log(logStyle(`${typePrefix}${messageText} | ${timestamp}`));
    }

    static success(message: string, type: LogType = 'UNKNOWN') {
        this.log(type, chalk.greenBright, message);
    }

    static warn(message: string, type: LogType = 'UNKNOWN') {
        this.log(type, chalk.yellowBright, message);
    }

    static error(message: string, type: LogType = 'UNKNOWN') {
        this.log(type, chalk.redBright, message);
    }
}