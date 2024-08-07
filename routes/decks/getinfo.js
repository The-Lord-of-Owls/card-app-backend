'use strict';

const { models } = require( '../../models/user.js' )

module.exports = {
	path: '/decks/getinfo',
	method: 'GET',
	run: async ( req, res ) => {
		const { userId, deckName } = req.query

		// Basic validation
		if ( !userId || !deckName ) {
			return res.status( 400 ).send( { error: 'User ID and Deck Name are required' } )
		}

		try {
			// Find the user by userId and locate the specific deck by name
			const user = await models.Users.findOne( { userId }, 'decks' )

			if ( !user ) {
				return res.status( 404 ).send( { error: 'User not found' } )
			}

			// Find the specified deck by name
			const deck = user.decks.find( d => d.name === deckName )

			if ( !deck ) {
				return res.status( 404 ).send( { error: 'Deck not found' } )
			}

			// Calculate the total number of cards in the deck
			const totalCards = deck.cards.reduce( ( sum, card ) => sum + card.count, 0 )

			// Respond with the deck information
			res.status( 200 ).send( {
				success: true,
				userId: userId,
				name: deck.name,
				description: deck.description,
				totalCards: totalCards
			} )
		} catch ( error ) {
			console.error( 'Error retrieving deck info:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


