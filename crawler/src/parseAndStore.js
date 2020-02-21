/* eslint-disable no-undef */
const createReadStream = require('fs').createReadStream
const path = require('path')
const createInterface = require('readline').createInterface
const BabyDomain = require('./models/babydomains').BabyDomain
let logger = require('./logger')

/**
 * function parsing domains from the file and storing them to mongodb
 * @param {{dateRegistered: Date, dateFilename: string}} 
 * @returns {string} - Path where zipped file was stored
 */
exports.parseDomainsAndStore = 
    async ({ dateRegistered = new Date('1970-01-01'), dateFilename = '' } = {}) => {
    try {
        logger.debug('* crawler.parseAndStore.parseDomainsAndStore: starting...')
    
        if (dateFilename === '' || dateRegistered === new Date('1970-01-01')) {
            throw new Error('You cannot omit parameters')
        }
        const pathRel = path.relative(
            path.join(__dirname, '..', 'data'), dateFilename)
    
        if ((pathRel.split("/").length - 1 > 3) ||
            !path.isAbsolute(dateFilename)) {
            throw new Error('Path is not a valid filesystem path')
        }
    
        const rl = createInterface({
            input: createReadStream(dateFilename),
            crlfDelay: Infinity
        })
        const start = process.hrtime.bigint()
        for await (const line of rl) {
            const domainName = line.trim()
            const domainEntry = {
                domainName,
                dateRegistered
            }
            const babyModel = new BabyDomain(domainEntry)
            await babyModel.save()
        }
        const end = process.hrtime.bigint();
        const duration = (end - start)/BigInt(1e9)
        logger.info(`* crawler.parseAndStore.parseDomainsAndStore: Process 
        of writing domains to database took ${BigInt(duration)} seconds`)
        logger.info('* crawler.parseAndStore.parseDomainsAndStore: All entries saved')
        return
    } catch (e) {
        const error = `${e}`.replace(/^Error:/gi, '>')
        throw new Error(`* crawler.parseAndStore.parseDomainsAndStore: ${error}`)
    }
}