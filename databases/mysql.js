'use strict';

const { Sequelize } = require( 'sequelize' )
const { readdirSync, lstatSync } = require( 'fs' )
const { join } = require( 'path' )
const { logger } = require( "../utilities/logger.js" )

const { mysqlDatabase, mysqlUsername, mysqlPassword, mysqlHost } = process.env

const models = {}	//Models are stored here for later use
const client = new Sequelize(
	mysqlDatabase || 'cardapp',
	mysqlUsername || 'cardapp',
	mysqlPassword || 'mlpfim777666', {
		host: mysqlHost || 'localhost',
		dialect: 'mysql'
	} )

module.exports = {
	getClient: () => client,
	getModels: () => models,
	connect: async () => {	//Handle starting sequalize
		try {	//Connect to MySQL
			logger( "debug", "MYSQL", "Attempting to connect to database" )

			await client.authenticate().then( async () => {
				logger( "message", "MYSQL", "Successfully connected to database" )

				function loadModels( modelsFolder ) {
					readdirSync( modelsFolder ).forEach( async file => {		//Loop through the directory
						const filePath = join( modelsFolder, file )			//join file and directory to get filePath

						if ( lstatSync( filePath ).isFile() ) {				//Filepath is a file
							const { name, SQL } = require( filePath )	//Load the model config

							if ( SQL !== undefined ) {
								models[ name ] = SQL	//Put the model into the models object
							}
						} else if ( lstatSync( filePath ).isDirectory() ) {		//Filepath is a directory
							//Recursively check sub folders for routes
							loadRoutes( filePath )
						} else {	//Filepath is neither a file or directory. Something went horribly wrong!
							logger( "error", "MYSQL", `${ filePath } is neither a file or a directory. Something went horribly wrong!` )
						}
					} )
				}
				loadModels( join( __dirname, '../models' ) )		//Begin loading model configs

				//Sync tables
				await client.sync()	//Sync the tables to MySQL server
			} ).then( () => {
				logger( "message", "MYSQL", 'Synchronized successfully' )
			} ).catch( e => {	//Unable to connect to MySQL
				logger( "error", "MYSQL", 'Failed to connect to database:', e )
			} )
		} catch ( e ) {	//Unable to connect to MySQL
			logger( "error", "MYSQL", 'Failed to connect to database: ', e )
		}
	}
}


