'use strict';

const express = require( "express" )
const expressWs = require( 'express-ws' )
const { json: jsonParse } = require( "body-parser" )
const cors = require( "cors" )
const session = require( "express-session" )
const { v4: uuidv4 } = require( "uuid" )
const { Authenticated } = require( "../utilities/authenticated.js" )
const { getClient, getStore } = require( '../databases/redis.js' )
const { readdirSync, lstatSync } = require( 'fs' )
const { join } = require( 'path' )
const { randomBytes, createHash } = require( 'crypto' )
const { logger } = require( '../utilities/logger.js' )
const { RestPort, steamHomeURL } = process.env

const secret = process.env.secret || randomBytes( 32 ).toString( 'hex' )
if ( !process.env.secret ) logger( "warning", "EXPRESS", `New Secret was generated, please add it to .env config file: ${ secret }` )


//Express Object
const expressApp = express()
expressApp.use( jsonParse() )				//Format we expect responses to be in
expressApp.use( cors( { origin: steamHomeURL || "http://localhost", credentials: true } ) )	//Setup CORS
expressApp.get( 'env' ) === 'production' ? expressApp.set( 'trust proxy', 1 ) : null
expressApp.use( session( {
	store: getStore(),
	secret: secret,
	genid: ( req ) => {
		return createHash( 'sha256' ).update( uuidv4() ).update( randomBytes( 256 ) ).digest( "hex" )
	},
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: expressApp.get( 'env' ) === 'development' ? false : true
	}
} ) )
const socketInstance = expressWs( expressApp )

//Register routes
const routes = []	//Route configs are stored here

function loadRoutes( routesFolder ) {
	readdirSync( routesFolder ).forEach( file => {			//Loop through the directory
		const filePath = join( routesFolder, file )		//join file and directory to get filePath

		if ( lstatSync( filePath ).isFile() ) {			//Filepath is a file
			const routeCfg = require( filePath )	//Load the route config

			if ( routeCfg !== undefined && routeCfg.path !== undefined && routeCfg.method !== undefined && routeCfg.run !== undefined ) {
				routes.push( routeCfg )	//Add the routeConfig to the array

				logger( "debug", "EXPRESS", `Loaded route config: ${ routeCfg.path }` )	//Infor of file load
			}
		} else if ( lstatSync( filePath ).isDirectory() ) {		//Filepath is a directory
			//Recursively check sub folders for routes
			loadRoutes( filePath )
		} else {	//Filepath is neither a file or directory. Something went horribly wrong!
			logger( "error", "EXPRESS", `${ filePath } is neither a file or a directory. Something went horribly wrong!` )
		}
	} )
}
loadRoutes( join( __dirname, '../routes' ) )		//Begin loading route configs

routes.forEach( route => {	//Loop through all routes and add them to express
	const redisClient = getClient()
	const routeFunction = ( route.useCache === true && redisClient.enabled === true ) ?		//Determin if we will run with or without redis cache
		( req, res ) => route.run( req, res, redisClient ) :	//With redis cache
		( req, res ) => route.run( req, res )					//Without redis cache

	switch ( route.method.toLowerCase() ) {	//Handle setting up routes by method
		case "get":
			route.authenticated === true ?	//Check if we should use authentication
				expressApp.get( route.path, Authenticated, routeFunction ) :	//Yes
				expressApp.get( route.path, routeFunction )						//No
			break
		case "post":
			route.authenticated === true ?	//Check if we should use authentication
				expressApp.post( route.path, Authenticated, routeFunction ) :	//Yes
				expressApp.post( route.path, routeFunction )					//No
			break
		case "put":
			route.authenticated === true ?	//Check if we should use authentication
				expressApp.put( route.path, Authenticated, routeFunction ) :	//Yes
				expressApp.put( route.path, routeFunction )						//No
			break
		case "delete":
			route.authenticated === true ?	//Check if we should use authentication
				expressApp.delete( route.path, Authenticated, routeFunction ) :	//Yes
				expressApp.delete( route.path, routeFunction )					//No
			break
		default:	//If it's not GET, POST, PUT or DELETE then we have messed something up with the config
			logger( "error", "EXPRESS", `Unsupported method ${ method } for route ${ routePath }` )
	}

	//Handle onStartup function for the route
	//Useful for 3rd party apis
	if ( route.onStartup ) route.onStartup()
} )


module.exports = {
	getExpressApp: () => expressApp,
	getSocketInstance: () => socketInstance,
	server: expressApp,			//Our express app object
	start: async () => {		//Async function to start the server
		try {	//Start express
			logger( "debug", "EXPRESS", "Attempting to start express" )
			!RestPort ? logger( "warning", "EXPRESS", "process.env.RestPort was not configured in .env file!" ) : null	//Notify on missing config file

			expressApp.listen( RestPort || 4000, () => {	//Port fallback incase .env isn't configed
				//Provide some basic info to console for the express app
				logger( "message", "EXPRESS", `Successfully started express on port: ${ RestPort || 4000 }` )
				logger( "debug", "EXPRESS", `Running in ${ expressApp.get( 'env' ) } mode` )
			} )
		} catch ( e ) {	//We failed to start express
			logger( "error", "EXPRESS", 'Failed to start express: ', e )
		}
	}
}


