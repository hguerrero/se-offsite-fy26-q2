const { Kafka, logLevel } = require('kafkajs')

// Read env vars
const bootstrapServers = process.env.KAFKA_BOOTSTRAP
const oauthToken = process.env.KAFKA_TOKEN

if (!bootstrapServers || !oauthToken) {
  console.error('❌ Please set KAFKA_BOOTSTRAP and KAFKA_TOKEN environment variables.')
  process.exit(1)
}

// Kafka config with SASL OAuthBearer
const kafka = new Kafka({
  clientId: 'kafka-topic-lister',
  brokers: bootstrapServers.split(','),
  logLevel: logLevel.INFO,
  ssl: false,
  sasl: {
    mechanism: 'oauthbearer',
    oauthBearerProvider: async () => {
      return {
        value: oauthToken,
        // optional: lifetime, principalName, extensions
      }
    },
  },
})

const admin = kafka.admin()

async function listTopics() {
  try {
    await admin.connect()
    const topics = await admin.listTopics()
    console.log('✅ Kafka Topics:')
    topics.forEach((t) => console.log(` - ${t}`))
  } catch (err) {
    console.error('❌ Error listing topics:', err.message)
  } finally {
    await admin.disconnect()
  }
}

listTopics()
