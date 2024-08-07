'use strict';

const { getClient } = require( "../databases/redis" )

module.exports.checkCache = async ( key, ttl, callback ) => {
	const client = getClient()

	return await client.get( key ).then( cacheValue => {	//Check redis for cache data
		if ( cacheValue ) return cacheValue	//If cache found, return that

		return callback().then( value => {	//If cache not found, perform function to retrieve the data and then cache it in redis with a ttl
			client.set( key, value, { EX: ttl, NX: true } )	//Store it in redis
			return value	//Don't wait on redis to store it, just return immediately
		} )
	} )
}


