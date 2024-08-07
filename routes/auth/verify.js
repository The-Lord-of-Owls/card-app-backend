'use strict';

const { steamHomeURL } = process.env || "http://localhost"
const steamRedirect = `https://steamcommunity.com/openid/login?openid.mode=checkid_setup&openid.return_to=${ steamHomeURL }/api/auth/verify&openid.realm=${ steamHomeURL }&openid.ns=http://specs.openid.net/auth/2.0&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`
const { setLogin } = require( "../../utilities/setLogin.js" )
const { logger } = require( "../../utilities/logger.js" )

const { getModels } = require( "../../databases/mysql" )

module.exports = {
	path: "/auth/verify",
	method: 'GET',
	run: async ( req, res ) => {
		if ( req.session && req.session.user ) {
			return res.redirect( steamHomeURL )
		} else {
			const steamId = req.query[ "openid.claimed_id" ]

			if ( steamId.includes( "/id/" ) ) {
				const userId = steamId.substring( steamId.lastIndexOf( "/" ) + 1 )
				const { User } = getModels()	//Get the user model from mysql

				User.findOne( {	//find one in database
					where: { userId: userId }
				} ).then( user => {
					if ( user ) {	//If it does exist, set req.session.user to it
						setLogin( req, user )
					} else {	//If it doesn't exist, make it
						User.create( {	//Create the founder user in MySQL
							name: "test",
							userId: userId,
							role: 'user'
						} ).then( user => {	//We were able to save the user in MySQL
							logger( "debug", "EXPRESS: /auth/verify", 'User added to MySQL:', user.toJSON() )
							setLogin( req,user )
						} ).catch( e => {	//We were unable to save the user to MySQL
							logger( "error", "EXPRESS: /auth/verify", 'Error adding user to MySQL:', e )
						} )
					}
				} )

				res.redirect( steamHomeURL )
			} else return res.redirect( steamRedirect )
		}
	}
}


