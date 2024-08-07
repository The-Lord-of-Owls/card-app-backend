'use strict';

const fs = require( 'fs' )
const { imageDownloader } = require( '../../utilities/imageDownloader.js' )

const imageDir = './assets/images/'
const cardApiPath = 'https://images.ygoprodeck.com/images/cards/'

module.exports = {
	path: '/cards/getimage',
	method: 'GET',
	run: async ( req, res ) => {
		const cardId = req.query[ "cardid" ]
		const cardImageFilePath = `${ imageDir + cardId }.jpg`

		if ( fs.existsSync( cardImageFilePath ) ) {
			//read file contents if it exists
			const cardFile = fs.readFileSync( cardImageFilePath )

			return res.status( 200 ).send( cardFile )
		}

		await imageDownloader( `${ cardApiPath + cardId }.jpg`, cardImageFilePath )
		res.status( 200 ).send( fs.readFileSync( cardImageFilePath ) )
	}
}


