'use strict';

const { models } = require( '../../models/user.js' )

module.exports = {
	path: '/decks/delete',
	method: 'POST',
	run: async ( req, res ) => {
		const { userId, deckName } = req.body
		
		// Basic validation
		if ( !userId || !deckName ) {
			return res.status( 400 ).send( { error: 'Invalid input data' } )
		}

		try {
			// Find the user by userId and remove the deck by name
			const user = await models.Users.findOneAndUpdate(
				{ userId },
				{ $pull: { decks: { name: deckName } } },
				{ new: true, useFindAndModify: false } // Return the updated document
			)

			if ( user ) {
				res.status( 200 ).send( { success: true, message: 'Deck deleted successfully', user } )
			} else {
				res.status( 404 ).send( { error: 'User not found' } )
			}
		} catch ( error ) {
			console.error( 'Error deleting deck:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


