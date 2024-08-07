'use strict';

const { models } = require( '../../models/user.js' )

module.exports = {
	path: '/decks/setinfo',
	method: 'POST',
	run: async ( req, res ) => {
		const { userId, deckName, newName, newDescription } = req.body

		// Basic validation
		if ( !userId || !deckName || ( newName === undefined && newDescription === undefined ) ) {
			return res.status( 400 ).send( { error: 'User ID, Deck Name, and at least one field to update are required' } )
		}

		try {
			// Find the user by userId
			const user = await models.Users.findOne( { userId } )

			if ( !user ) {
				return res.status( 404 ).send( { error: 'User not found' } )
			}

			// Find the specified deck by name
			const deck = user.decks.find( d => d.name === deckName )

			if ( !deck ) {
				return res.status( 404 ).send( { error: 'Deck not found' } )
			}

			// Update the deck's name and/or description
			if ( newName ) {
				deck.name = newName
			}
			if ( newDescription ) {
				deck.description = newDescription
			}

			// Save the updated user document
			await user.save()

			// Respond with the updated deck information
			res.status( 200 ).send( {
				success: true,
				message: 'Deck information updated successfully',
				deck: {
					name: deck.name,
					description: deck.description
				}
			} )
		} catch ( error ) {
			console.error( 'Error updating deck info:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


