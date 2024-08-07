'use strict';

const { connect } = require( "mongoose" )
const { readdirSync, lstatSync } = require( 'fs' )
const { join } = require( 'path' )
const { logger } = require( "../utilities/logger.js" )

const { mongodbUrl } = process.env

const models = {}	//Models are stored here for later use
let client = {}

module.exports = {
	getClient: () => client,
	models: models,
	connect: async () => {
		try {
			logger( "debug", "MONGODB", "Attempting to connect to MongoDB" )

			await connect( mongodbUrl || 'mongodb://127.0.0.1:27017/cardapp' ).then( async ( connection ) => {
				client = connection
				logger( "message", "MONGODB", "Successfully connected to MongoDB" )

				function loadModels( modelsFolder ) {
					readdirSync( modelsFolder ).forEach( async file => {		//Loop through the directory
						const filePath = join( modelsFolder, file )			//join file and directory to get filePath

						if ( lstatSync( filePath ).isFile() ) {				//Filepath is a file
							const { name: modelName, noSQL } = require( filePath )	//Load the model config

							if ( noSQL !== undefined ) {
								models[ modelName ] = noSQL	//Put the model into the models object

								noSQL.createCollection().then( collection => {	//Add the collection to MongoDB
									logger( "debug", "MONGODB", `Creating ${ modelName } collection in MongoDB` )
								} )
							}
						} else if ( lstatSync( filePath ).isDirectory() ) {		//Filepath is a directory
							//Recursively check sub folders for routes
							loadRoutes( filePath )
						} else {	//Filepath is neither a file or directory. Something went horribly wrong!
							logger( "error", "MONGODB", `${ filePath } is neither a file or a directory. Something went horribly wrong!` )
						}
					} )
				}
				loadModels( join( __dirname, '../models' ) )	//Begin loading model configs
			} ).then( () => {
				logger("message", "MONGODB", 'MongoDB synchronized successfully.' )
			} ).catch( e => {	//Unable to connect to MongoDB
				logger( "error", "MONGODB", 'Unable to connect to MongoDB:', e )
			} )
		} catch ( e ) {	//Unable to connect to MongoDB
			logger( "error", "MONGODB", 'Failed to connect to MongoDB: ', e )
		}
	}
}


