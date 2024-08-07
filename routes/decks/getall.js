'use strict';

const { models } = require( '../../models/user.js' )

module.exports = {
	path: '/decks/getall',
	method: 'GET',
	run: async ( req, res ) => {
		const { userId } = req.query

		// Basic validation
		if ( !userId ) {
			return res.status( 400 ).send( { error: 'User ID is required' } )
		}

		try {
			// Find the user by userId and select only the decks field
			const user = await models.Users.findOne( { userId }, 'decks' )

			if ( user ) {
				res.status( 200 ).send( { success: true, decks: user.decks } )
			} else {
				res.status( 404 ).send( { error: 'User not found' } )
			}
		} catch ( error ) {
			console.error( 'Error fetching decks:', error )
			res.status( 500 ).send( { error: 'Internal server error' } )
		}
	}
}


