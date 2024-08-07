'use strict';

const { models } = require('../../models/user.js')

module.exports = {
	path: '/decks/removecard',
	method: 'POST',
	run: async ( req, res ) => {
		const { userId, deckName, cardId } = req.body

		// Basic validation
		if ( !userId || !deckName || !cardId ) {
			return res.status( 400 ).send( { error: 'Invalid input data' } )
		}

		try {
			// Find the user by userId and update the specified deck by removing the card
			const user = await models.Users.findOneAndUpdate(
				{ userId, 'decks.name': deckName }, // Locate the user and the deck by name
				{ 
					$pull: { 
						'decks.$.cards': { id: cardId } // Remove the card by its ID
					} 
				},
				{ new: true, useFindAndModify: false } // Return the updated document
			)

			if ( user ) {
				res.status( 200 ).send( { success: true, message: 'Card removed successfully', user } )
			} else {
				res.status( 404 ).send( { error: 'User or deck not found' } )
			}
		} catch ( error ) {
			console.error( 'Error removing card:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


