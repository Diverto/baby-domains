/* eslint-disable no-undef */

const amqp = require('amqplib')
const { cloudamqpConnectionString } = require('../src/keys')
// const listenMessages = require('../src/processor').listenMessages

let channel
let connection
beforeAll(async () => {
    console.log(`${ cloudamqpConnectionString }`)
    connection = await amqp.connect(cloudamqpConnectionString);
    channel = await connection.createChannel();
})

afterAll(async() => {
    await channel.close()
    await connection.close()
})

describe('listenMessages function tap into RabbitMQ exchange and queues', () => {
    test('stub', () => {
        expect(Object.prototype.toString.call(channel) === "[object Object]").toBe(true)
    })
})