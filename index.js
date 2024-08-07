'use strict';
require( "dotenv" ).config()

//Database connectors and express start function
const { connect: mongoConnect } = require( './databases/mongodb.js' )
const { connect: mysqlConnect } = require( './databases/mysql.js' )
const { connect: redisConnect } = require( './databases/redis.js' )
const { start: startServer } = require( "./utilities/express.js" )

mongoConnect().then( async () => {			//Connect to MongoDB
	mysqlConnect().then( async () => {		//Connect to MySQL
		redisConnect().then( async () => {	//Connect to Redis
			startServer()					//Start express server
		} )
	} )
} )


