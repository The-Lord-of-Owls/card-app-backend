'use strict';

const { models } = require( '../../models/user.js' )

module.exports = {
	path: '/decks/create',
	method: 'POST',
	run: async ( req, res ) => {
		const { userId, name, description, cards } = req.body

		// Basic validation
		if ( !userId || !name || !description || !Array.isArray( cards ) ) {
			return res.status( 400 ).send( { error: 'Invalid input data' } )
		}

		try {
			// Create new deck object
			const newDeck = { name, description, cards }

			// Find the user by userId and update their decks array
			const user = await models.Users.findOneAndUpdate(
				{ userId },
				{ $push: { decks: newDeck } },
				{ new: true, useFindAndModify: false } // Return the updated document
			)

			if ( user ) {
				res.status( 200 ).send( { success: true, message: 'Deck created successfully', user } )
			} else {
				res.status( 404 ).send( { error: 'User not found' } )
			}
		} catch ( error ) {
			console.error( 'Error creating deck:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


