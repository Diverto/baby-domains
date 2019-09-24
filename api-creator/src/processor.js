const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises;

const logger = require('./logger')
const { exchangeName, routingKey, imageSmall, imageBig, retentionPolicy } = require('./keys')
const mongoConnect = require('./db/mongoose').mongoConnect
const mongoClose = require('./db/mongoose').mongoClose
const BabyDomain = require('./models/babydomains').BabyDomain

const dateToFilename = (dateRegistered = '') => {
    try {
        logger.debug('Executing api-creator/dateToFilename function')
        if (Object.prototype.toString.call(dateRegistered) !== '[object Date]') {
            throw new Error('Invalid type')
        }
        const dateFilename = path.join(__dirname, '..', 'data', 
            `domains-${dateRegistered.getFullYear()}` + 
            `-${('0' + (dateRegistered.getMonth() + 1)).slice(-2)}` + 
            `-${('0' + dateRegistered.getDate()).slice(-2)}`)
        return dateFilename
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/dateToFilename: ${error}`)
    }
}

/**
 * function that consumes channel that notifies when crawling
 * and putting domains to db is done
 * @param {object} ch - RabbitMQ channel
 */
exports.listenMessages = async (channel) => {
    try {
        logger.debug('Executing api-creator/listenMessages function')
        await channel.prefetch(1);
        channel.consume(`${exchangeName}.${routingKey}`, async (msg) => {
            if (msg != null) {
                const msgBody = msg.content.toString()
                const data = JSON.parse(msgBody);
                if (data.status === "completed") {
                    const { db } = await mongoConnect()
                    logger.debug(`Processing finished. Registered date: ${data.dateRegistered}`)
                    let upperDate = new Date(data.dateRegistered)
                    upperDate.setDate(upperDate.getDate() + 1)
                    const domains = await BabyDomain.find({'dateRegistered': 
                    {$gte: data.dateRegistered, $lte: upperDate}})
                    logger.info(`Number of entries for ${data.dateRegistered}: 
                    ${Object.keys(domains).length}`)
                    let cb_json = {
                        feedinfo: {
                            name: 'babydomains',
                            display_name: 'Newly generated domains',
                            provider_url: 'https://github.com/Diverto/baby-domains',
                            summary: 'This feed tags baby domains. Updated every 24 hours',
                            tech_data: 'No requirements to use this feed',
                            icon: imageBig,
                            icon_small: imageSmall,
                            category: 'Open Source'
                        },
                        reports: []
                    }
                    const curr_time = Math.round(Date.now()/1000)
                    const registeredDate = new Date(data.dateRegistered)
                    // date for which retention policy is applied
                    let removeDomainsDate = new Date(data.dateRegistered)
                    removeDomainsDate.setDate(removeDomainsDate.getDate() - retentionPolicy)
                    const regDateString = `${registeredDate.getFullYear()}-` +
                    `${('0' + (registeredDate.getMonth() + 1)).slice(-2)}-` +
                    `${('0' + registeredDate.getDate()).slice(-2)}`
                    // const removeDomainsDateString = `${removeDomainsDate.getFullYear()}-` +
                    // `${('0' + (removeDomainsDate.getMonth() + 1)).slice(-2)}-` +
                    // `${('0' + removeDomainsDate.getDate()).slice(-2)}`
                    for(let domain of domains) {
                        let report = {
                            timestamp: curr_time,
                            id: `BABY-${domain.domainName}-${regDateString}`,
                            title: `New domain ${domain.domainName} ` +
                            `registered on ${regDateString}`,
                            link: 'http://whoisds.com/newly-registered-domains',
                            score: 30,
                            iocs: {
                                dns: [
                                    domain.domainName
                                ]
                            }
                        }
                        cb_json.reports.push(report)
                    }
                    const json_cb_feed = JSON.stringify(cb_json)
                    await fsPromises.writeFile(dateToFilename(registeredDate) + '.json', json_cb_feed)
                    await fsPromises.writeFile(path.join(__dirname, '..', 'data', 'babydomains.feed'), json_cb_feed)
                    // if (fs.existsSync(writePathZip)) {

                    // }
                    logger.info(`JSON file for the date ${regDateString} created`)
                    // Object.entries(domains).forEach(([key, value]) => {
                    //     console.log(`${key}: ${value}`);
                    // }) 
                    await mongoClose(db)
                    
                }
            }
        }, {noAck: true})    
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator/listenMessages: ${error}`)
    }
}
