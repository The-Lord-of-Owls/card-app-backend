'use strict';

const { steamHomeURL } = process.env || "http://localhost"
const steamRedirect = `https://steamcommunity.com/openid/login?openid.mode=checkid_setup&openid.return_to=${ steamHomeURL }/api/auth/verify&openid.realm=${ steamHomeURL }&openid.ns=http://specs.openid.net/auth/2.0&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`


module.exports = {
	path: "/auth/login",
	method: 'GET',
	run: async ( req, res ) => {
		return req.session && req.session.user ? res.redirect( steamHomeURL ) : res.redirect( steamRedirect )
	}
}


