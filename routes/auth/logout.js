'use strict';

const { setLogin } = require( "../../utilities/setLogin.js" )

module.exports = {
	path: "/auth/logout",
	method: 'GET',
	run: async ( req, res ) => {
		if ( setLogin( req ) ) {
			res.status( 500 ).send( { loginStatus: true, msg: 'Logout failed' } )
		} else {
			res.clearCookie( 'connect.sid' )					//Clear the cookie from the user
			res.status( 200 ).send( { loginStatus: false } )
		}
	}
}


