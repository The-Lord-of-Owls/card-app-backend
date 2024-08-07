'use strict';

const { Sequelize, DataTypes } = require( 'sequelize' )
const { Schema, model } = require( "mongoose" )
const { getClient } = require( '../databases/mysql' )

module.exports = {
	name: "User",
	SQL: getClient().define( 'User', {	//Sequelize
		name: {							//User's steam name
			type: DataTypes.STRING,
			allowNull: false			//Can not be null
		},
		userId: {						//User's SteamID64
			type: DataTypes.STRING,
			allowNull: false,			//Can not be null
			unique: true				//Nobody can have the same steamID
		},
		role: {							//User's role
			type: DataTypes.STRING,
			allowNull: false,			//Can not be null
			defaultValue: "user"		//Default role for all new users
		}
	}, {
		tableName: 'users',				//Stored in the mysql database under the 'users' table
		timestamps: true
	} ),
	noSQL: model( "Users", new Schema( {//Mongoose
		userId: {						//User's SteamID
			type: String,
			unique: true,				//We can't have duplicates
			required: true				//Required for identifying the user
		},
		decks: [ {						// List of user's decks
			name: {						// Deck name
				type: String,
				required: true
			},
			description: {				// Deck description
				type: String,
				required: true
			},
			cards: [ {					// List of cards in the deck
				id: {					// Card ID
					type: Number,
					required: true
				},
				count: {				// Number of copies of the card
					type: Number,
					required: true,
					min: 1				// At least one card is required
				}
			} ]
		} ],
		createdAt: {					//When the user was created
			type: Date,
			default: Date.now
		},
		updatedAt: {					//When the user was last updated
			type: Date,
			default: Date.now
		}
	} ) )
}


