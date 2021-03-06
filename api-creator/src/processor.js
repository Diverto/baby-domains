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
        logger.debug('* api-creator.processor.dateToFilename: starting')
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
        throw new Error(`* api-creator.processor.dateToFilename: ${error}`)
    }
}

/**
 * function that cleans database for older dates than retention policy
 * @param {Date} cleaningDate - upper date for database cleaning
 */ 
const cleanDb = async(cleaningDate) => {
    logger.debug(`* api-creator.processor.cleanDb: Removing old data from db from date: ${cleaningDate}`)
    const cleanedEntries = await BabyDomain.deleteMany({'dateRegistered': 
        {$lte: cleaningDate}})
    // logger.info(`* api-creator.processor.cleanDb: Number of cleaned entries: ${cleanedEntries.deletedCount}`)
    logger.info(`* api-creator.processor.cleanDb: Cleaning finished`)
}

/**
 * function that consumes channel that notifies when crawling
 * and putting domains to db is done
 * @param {object} ch - RabbitMQ channel
 */
exports.listenMessages = async (channel) => {
    try {
        logger.debug('* api-creator.processor.listenMessages: starting')
        await channel.prefetch(1);
        channel.consume(`${exchangeName}.${routingKey}`, async (msg) => {
            if (msg != null) {
                const msgBody = msg.content.toString()
                const data = JSON.parse(msgBody);
                logger.debug(`* api-creator.processor.listenMessages: Data status = ${data.status}`)
                if (data.status === "completed") {
                    const { db } = await mongoConnect()
                    logger.debug(`* api-creator.processor.listenMessages: Processing started. Registered date: ${data.dateRegistered}`)
                    let upperDate = new Date(data.dateRegistered)
                    upperDate.setDate(upperDate.getDate() + 1)
                    // logger.info(`* api-creator.processor.listenMessages: Number of entries for ${data.dateRegistered}: 
                    // ${Object.keys(domains).length}`)
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
                    // clean old data
                    await cleanDb(removeDomainsDate)
                    const regDateString = `${registeredDate.getFullYear()}-` +
                    `${('0' + (registeredDate.getMonth() + 1)).slice(-2)}-` +
                    `${('0' + registeredDate.getDate()).slice(-2)}`
                    const removeDomainsDateString = `${removeDomainsDate.getFullYear()}-` +
                    `${('0' + (removeDomainsDate.getMonth() + 1)).slice(-2)}-` +
                    `${('0' + removeDomainsDate.getDate()).slice(-2)}`
                    const cursor = await BabyDomain.find({'dateRegistered': 
                            {$gte: data.dateRegistered, $lte: upperDate}}).cursor()
                    logger.debug(`* api-creator.processor.listenMessages: DB entries started consuming`)
                    for(let domain = await cursor.next(); domain != null; domain = await cursor.next()) {
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
                    logger.debug(`* api-creator.processor.listenMessages: DB entries finished consuming`)
                    let json_cb_feed = JSON.stringify(cb_json) 
                    await fsPromises.writeFile(dateToFilename(registeredDate) + '.json', json_cb_feed)
                    if (fs.existsSync(dateToFilename(removeDomainsDate) + '.json')) {
                        const jsonFile = await fsPromises.readFile(dateToFilename(removeDomainsDate) + '.json')
                        let json_rm_feed = JSON.parse(jsonFile)
                        logger.info(`* api-creator.processor.listenMessages: Number of reports to be nulled for date ` +
                        `${removeDomainsDateString}: ${json_rm_feed.reports.length}`)
                        json_rm_feed.reports = json_rm_feed.reports.map((report) => { 
                            const repNew = report
                            repNew.score = 0 
                            repNew.timestamp = curr_time
                            return repNew
                        })
                        cb_json.reports = cb_json.reports.concat(json_rm_feed.reports)
                        json_cb_feed = JSON.stringify(cb_json)
                        //delete old json file
                        fs.unlinkSync(dateToFilename(removeDomainsDate) + '.json')
                    }
                         
                    await fsPromises.writeFile(path.join(__dirname, '..', 'public', 'babydomains.feed'), json_cb_feed)
                    logger.info(`* api-creator.processor.listenMessages: JSON file for the date ${regDateString} created`)
                    // Object.entries(domains).forEach(([key, value]) => {
                    //     console.log(`${key}: ${value}`);
                    // }) 
                    // await mongoClose(db)
                    
                }
            }
        }, {noAck: true})    
    } catch (e) {
        const error = `${e}`.replace(/^Error:/, '>')
        throw new Error(`* api-creator.processor.listenMessages: ${error}`)
    }
}
