'use strict';

const { models } = require( '../../models/user.js' )

module.exports = {
	path: '/decks/addcard',
	method: 'POST',
	run: async ( req, res ) => {
		const { userId, deckName, cardId, count } = req.body

		// Basic validation
		if ( !userId || !deckName || !cardId || typeof count !== 'number' ) {
			return res.status( 400 ).send( { error: 'Invalid input data' } )
		}

		try {
			// Find the user by userId and update the specified deck with the new card
			const user = await models.Users.findOneAndUpdate(
				{ userId, 'decks.name': deckName }, // Locate the user and the deck by name
				{ 
					$push: { 
						'decks.$.cards': { id: cardId, count: count } 
					} 
				},
				{ new: true, useFindAndModify: false } // Return the updated document
			)

			if ( user ) {
				res.status( 200 ).send( { success: true, message: 'Card added successfully', user } )
			} else {
				res.status( 404 ).send( { error: 'User or deck not found' } )
			}
		} catch ( error ) {
			console.error( 'Error adding card:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


