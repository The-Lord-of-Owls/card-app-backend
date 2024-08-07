'use strict';

const { steamHomeURL } = process.env || "http://localhost"
const steamRedirect = `https://steamcommunity.com/openid/login?openid.mode=checkid_setup&openid.return_to=${ steamHomeURL }/api/auth/verify&openid.realm=${ steamHomeURL }&openid.ns=http://specs.openid.net/auth/2.0&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`

//Authentication checker
module.exports.Authenticated = ( req, res, next ) => {
	if ( req.session && req.session.user && req.session.loginStatus ) {	//Does the session exist and does it have the user object inside it?
		next()	//Yes, allow access
	} else {	//No it does not! redirect to login
		res.redirect( steamRedirect )	//redirect to steam login
	}
}


