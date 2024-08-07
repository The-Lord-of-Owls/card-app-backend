'use strict';

const { getClient } = require( "../../databases/redis.js" )
const axios = require( 'axios' )

const allCardsUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php'
const redisClient = getClient()

module.exports = {
	path: '/cards/getlist',
	method: 'GET',
	run: async ( req, res ) => {
		const start = req.query[ "start" ] || 0
		const count = req.query[ "end" ] || 100
		const cardCount = await redisClient.get( "cardCount" )

		let resData = {
			total: cardCount,
			cards: []
		}

		for ( var i = start; i < count; i++ ) {
			let card = await redisClient.json.get( i.toString(), '$' )
			resData.cards.push( card )
		}

		res.status( 200 ).send( resData )
	},
	onStartup: async ( params ) => {
		//Have this request the cards from the api and cache it to redis later
		axios.get( allCardsUrl ).then( cards => {
			redisClient.set( "cardCount", cards.data.data.length.toString() )

			cards.data.data.forEach( ( card, idx ) => {
				//Cache each card in redis
				redisClient.json.set( idx.toString(), "$", {
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
			} )
			console.log( "cards have been cached" )
		} )
	}
}


