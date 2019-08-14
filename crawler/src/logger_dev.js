const {transports, createLogger, format, config, addColors} = require('winston');
const keys = require('./keys')

const env = keys.nodeEnv || 'development'

addColors(config.npm.colors)
exports.logger = createLogger({
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
