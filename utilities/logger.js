'use strict';

//What runtime mode we are using
const NODE_ENV = process.env.NODE_ENV === 'development' ?
	'development' : 'production'

	//Debug message display
const DEBUG = `CARDAPP-DEBUG`
const BgBlue = "\x1b[44m"

//Warning message display
const WARNING = `CARDAPP-WARNING`
const BgYellow = "\x1b[43m"

//Error message display
const ERROR = `CARDAPP-ERROR`
const BgRed = "\x1b[41m"

//Default messager display
const DEFAULT = `CARDAPP`
const BgGreen = "\x1b[42m"

//App Version Information
const version = ` @  v${process.env.npm_package_version}  |`
const BgGray = "\x1b[100m"

//Reset background and foreground color to default values
const Reset = "\x1b[0m"

module.exports.logger = ( type, title, ...args ) => {
	//Title is forced to upercase to prevent for formating
	switch ( type.toLowerCase() ) {	//Message type is forced to lowercase to prevent errors from case sensitivity
		case "debug":	//Messages used for debugging
			if ( NODE_ENV !== "development" ) break	//Only run if in development
			console.log( BgBlue, DEBUG, version, BgGray, title.toUpperCase(), Reset, ...args )
			break
		case "warning":	//Runs for warning messages
			console.warn( BgYellow, WARNING, version, BgGray, title.toUpperCase(), Reset, ...args )
			break
		case "error":	//Runs if an error is encountered
			console.error( BgRed, ERROR, version, BgGray, title.toUpperCase(), Reset, ...args )
			break
		default:		//If type is anything not in the list this runs
			console.log( BgGreen, DEFAULT, version, BgGray, title.toUpperCase(), Reset, ...args )
	}
}


