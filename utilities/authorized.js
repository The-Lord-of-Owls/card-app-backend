'use strict';

module.exports.Authorized = ( requiredRole ) => {
	return function ( req, res, next ) {
		if ( req.session && req.session.user && req.session.user.role === requiredRole ) {
			next()
		} else {
			res.status( 403 ).json( { msg: "Not authorized" } )
		}
	}
}


