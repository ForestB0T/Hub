import chalk from 'chalk';

type LogType = 'WEBSOCKET' | 'APIROUTE' | 'UNKNOWN' | "ForestBotAPI";

export default class Logger {
    private static log(type: LogType, logStyle: typeof chalk, message: string) {
        const typePrefix = chalk.bold(chalk.white("[") + logStyle(`${type}`) + chalk.white("]"));
        let messageText = message ? `- ${message}` : '';

        messageText = messageText.replace(/(GET|POST)/g, match => {
          if (match === 'GET') {
            return chalk.yellow('GET');
          } else if (match === 'POST') {
            return chalk.yellow('POST');
          }
        });

        const timestamp = new Date().toLocaleString();
        console.log(`${typePrefix} ${messageText} | ${timestamp}`);
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