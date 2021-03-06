/* eslint-disable no-undef */
const {transports, createLogger, format, config, addColors} = require('winston');
const { nodeEnv } = require('./keys')

const envVar = nodeEnv || 'development'

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
                level: 'info',
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
                level: 'debug',
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

    const loggingWinston = new LoggingWinston(
        {
        // projectId: 'baby-domains-249012',
        level: 'debug',// log at 'warn' and above ,
        logName: "api-creator.log"
        }
        );

    // Create a Winston logger that streams to Stackdriver Logging
    // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
    logger = createLogger({
      level: 'debug',
      transports: [
        new transports.Console(),
        // Add Stackdriver Logging
        loggingWinston,
      ],
    });
}

module.exports = logger


