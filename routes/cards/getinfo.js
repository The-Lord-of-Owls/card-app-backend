'use strict';

const axios = require( 'axios' )
const { getClient } = require( "../../databases/redis.js" )

const allCardsUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php'
const redisClient = getClient()

module.exports = {
	path: '/cards/getinfo',
	method: 'GET',
	run: async ( req, res ) => {
		let card = await redisClient.json.get( req.query[ "cardindex" ], "$" )

		if ( card ) {
			return res.status( 200 ).send( card )
		}

		axios.get( `${ allCardsUrl }?id=${ req.query[ "cardid" ] }` ).then( card => {
			redisClient.json.set( req.query[ "cardindex" ], '$', {
				id: card.id,
				name: card.name,
				type: card.type,
				frameType: card.frameType,
				desc: card.desc,
				atk: card.atk,
				def: card.def,
				level: card.level,
				race: card.race,
				attribute: card.attribute
			} )
			res.status( 200 ).send( card.data )
		} )
	}
}


