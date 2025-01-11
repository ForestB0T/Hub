import chalk from 'chalk';

type LogType = 'WEBSOCKET' | 'APIROUTE' | 'UNKNOWN' | "ForestBotAPI" | "DATABASE" | "DISCORD" | "MINECRAFT" | "WEB" | "API" | "ERROR" | "WARN" | "INFO" | "SUCCESS";

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

    static success(message: string, type: LogType = 'SUCCESS') {
        this.log(type, chalk.greenBright, message);
    }

    static warn(message: string, type: LogType = 'WARN') {
        this.log(type, chalk.yellowBright, message);
    }

    static error(message: string, type: LogType = 'ERROR') {
        this.log(type, chalk.redBright, message);
    }

    static info(message: string, type: LogType = 'INFO') {
        this.log(type, chalk.blueBright, message);
    }

    static database(message: string, type: LogType = 'DATABASE') {
        this.log(type, chalk.blueBright, message);
    }
    static minecraft(message: string, type: LogType = 'MINECRAFT') {
        this.log(type, chalk.blueBright, message);
    }
}