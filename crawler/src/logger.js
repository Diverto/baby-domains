/* eslint-disable no-undef */
const {transports, createLogger, format, config, addColors} = require('winston');
const { nodeEnv } = require('./keys')

const envVar = nodeEnv || 'development'

console.log(`nodeenv: ${envVar}`)

let logger
if (envVar === 'development') {
    addColors(config.npm.colors)
    logger = createLogger({
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.json()
        ),
        transports: [
            new transports.Console({
                level: env === 'development'? 'info' : 'warn',
                colorize: true,
                format: format.combine(
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }),
                    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + 
                    (info.splat!==undefined?`${info.splat}`:" "))
                )
            }),
            new transports.File({
                level: env === 'development'? 'debug' : 'info',
                filename: 'logs/debug.log',
                maxsize: 1024 * 1024 * 30, // 30MB
                format: format.combine(
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }),
                    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + 
                    (info.splat!==undefined?`${info.splat}`:" "))
                )
            }),
            new transports.File({
                level: 'error',
                filename: 'logs/error.log',
                maxsize: 1024 * 1024 * 30, // 30MB
                format: format.combine(
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }),
                    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + 
                    (info.splat!==undefined?`${info.splat}`:" "))
                )
            })
        ]
    });
} else {
    // Imports the Google Cloud client library for Winston
    const {LoggingWinston} = require('@google-cloud/logging-winston');

    const loggingWinston = new LoggingWinston();

    // Create a Winston logger that streams to Stackdriver Logging
    // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
    logger = createLogger({
      level: 'info',
      transports: [
        new transports.Console(),
        // Add Stackdriver Logging
        loggingWinston,
      ],
    });
}

module.exports = logger


