'use strict';

module.exports.setLogin = ( req, user ) => {
	if ( user ) {
		req.session.user = {
			name: user.dataValues.name,
			userId: user.dataValues.userId,
			role: user.dataValues.role,
		}
		req.session.loginStatus = true
		req.session.save()
	} else {
		req.session.destroy( e => {
			if ( e ) {
				console.error( e )
				return true
			}
		} )
	}
}


