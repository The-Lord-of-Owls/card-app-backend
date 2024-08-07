'use strict';

const { createClient } = require( "redis" )
const { logger } = require( "../utilities/logger.js" )
const RedisStore = require( "connect-redis" ).default

const models = {}	//Models are stored here for later use

const client = createClient( { url: process.env.redisUrl || "redis://127.0.0.1:6379" } )
	.on( 'error', e => logger( "error", "REDIS", e ) )

let redisStore = new RedisStore( {
	client: client,
	prefix: "owlcafe:",
} )


module.exports = {
	getClient: () => client,
	getStore: () => redisStore,
	models: models,
	connect: async () => {
		try {	//Connect to Redis
			logger( "debug", "REDIS", "Attempting to connect to Redis" )

			await client.connect().then( async () => {
				logger( "message", "REDIS", "Successfully connected to Redis" )

				//Reset our cache
				await client.del( 'noderedis:jsondata' )
				await client.json.set( 'noderedis:jsondata', '$', {} )

				//Enable caching
				client.enabled = true
				logger( "message", "REDIS", "Redis Cache: Enabled" )
			} )
		} catch ( e ) {	//Redis connection failed, defaulting to no caching mode
			logger( "error", "REDIS", "Failed to connect to Redis. Caching Disabled: ", e )
		}

		return client
	}
}


