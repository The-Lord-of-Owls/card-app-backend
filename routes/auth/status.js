'use strict';

module.exports = {
	path: "/auth/status",
	method: 'GET',
	run: async ( req, res ) => {
		return req.session && req.session.user ? res.status( 200 ).send( {
			loginStatus: true,
			name: req.session.user.name,
			userId: req.session.user.userId,
			role: req.session.user.role
		} ) : res.status( 200 ).send( {
			loginStatus: false
		} )
	}
}


