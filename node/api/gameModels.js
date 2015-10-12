/*----------------------------------------------------
 *
 *		Mongoose DB Connection
 *
 *---------------------------------------------------*/


var mongoose	= require('mongoose');
mongoose.connect('mongodb://localhost/BetHub');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	//	console.log('Connected to DB!');
});



/*------------------------------------------------------------------------------
 *
 *
 *				Define Schema
 *
 *
 *-----------------------------------------------------------------------------*/






/*----------------------------------------------------
 *
 *		Games
 *
 *---------------------------------------------------*/


var gameSchema = new mongoose.Schema({
	  team_1_Name	: String
	, team_2_Name	: String
	, team_1_Goals	: Number
	, team_2_Goals	: Number
	, date			: String
});
var Game = mongoose.model('Game', gameSchema);



/*----------------------------------------------------
 *
 *		LeagueTables (NOT CURRENTLY USED)
 *
 *---------------------------------------------------*/


/*
var leagueTableSchema = new mongoose.Schema({
	  team_Name		: String
	, points		: Number
	, goals_For		: Number
	, goals_Against	: Number
	, games_Played	: Number
});
var leagueTable = mongoose.model('LeagueTable', leagueTableSchema);
*/




/*----------------------------------------------------
 *
 *		Seasons
 *
 *---------------------------------------------------*/



var seasonSchema = new mongoose.Schema({
	  country		: String
	, league		: String
	, year			: String
	, games			: Array
});
var Season = mongoose.model('Season', seasonSchema);



/*----------------------------------------------------
 *
 *		Test Results (ALSO NOT USED, YET)
 *
 *---------------------------------------------------*/


var testResultsSchema = new mongoose.Schema({

});






/*------------------------------------------------------------------------------
 *
 *
 *				Fns
 *
 *
 *-----------------------------------------------------------------------------*/



/*----------------------------------------------------
 *
 *		Add Game
 *
 *---------------------------------------------------*/


function addGameToDB(game) {
	var gameToAdd = new Game({
		  team_1_Name	: game.Team_1_Name
		, team_2_Name	: game.Team_2_Name
		, team_1_Goals	: game.Team_1_Goals
		, team_2_Goals	: game.Team_2_Goals
		, date			: game.Date	//	.replace('.', '-')
	});

	gameToAdd.save(function (err, gameToAdd) {
		if (err) { return console.error(err); }
		console.log( 'Added game: ', gameToAdd.Team_1_Name, ' v ', gameToAdd.Team_2_Name, ' on ', gameToAdd.date );
	});
}




/*----------------------------------------------------
 *
 *		Add Sesaon
 *
 *---------------------------------------------------*/


function addSeasonToDB(season) {
	var seasonToAdd = new Season({
		  country	: season.country
		, league	: season.league
		, year		: season.year
		, games		: season.games
	});

	seasonToAdd.save(function (err, seasonToAdd) {
		if (err) { return console.error(err); }
		console.log( 'Added season: ', seasonToAdd.league, ' ', seasonToAdd.year, ': ', seasonToAdd.games.length, ' games' );
	});
}




/*----------------------------------------------------
 *
 *		List Seasons
 *
 *---------------------------------------------------*/


function listSeasons(req, res) {

	Season.find( '', function (err, seasons) {
		if (err) { console.log( err ); }

		for (var s = 0; s < seasons.length; s++) {

			var season = seasons[s];

			delete season.games;

			seasons[s] = season;

		}

	     res.render('seasonView', {seasons: seasons});

	    return seasons;

	});

}



/*----------------------------------------------------
 *
 *		List Games in a Season
 *
 *---------------------------------------------------*/


function listGamesInSeason( req, res, queryString, callback, drawThreshold ) {

	if ( drawThreshold ) {
		console.log('drawThreshold: ', drawThreshold);
	//	var drawThreshold = req.drawThreshold;
	}

	var testResults = {};

	Season.find( queryString, function(err, seasons) {

		if (err) { console.log( 'UH OH: ', err ); }


		for (var s = 0; s < seasons.length; s++) {

			var season = seasons[s];

	//		console.log(season.games[0]);

			if ( typeof callback === 'function') {

				//	dump results to console after last season
				if ( s === seasons.length -1 ) {

						//	console.log( callback( season ) );
						testResults = callback( season, drawThreshold );

						if (drawThreshold) {
							console.log('drawThreshold:', drawThreshold);
						}

				} else {
					 callback( season, drawThreshold );
				}
			}

		}
		console.log( testResults['total stats'] );

		if (drawThreshold) {
			return testResults['total stats'];
		}

	//	res.render('showResults', {testResults: JSON.stringify(testResults['total stats']) } );
	});
}



/*----------------------------------------------------
 *
 *		Exports
 *
 *---------------------------------------------------*/


//	exports.Game				= Game;
//	exports.Season				= Season;

//	exports.seasonDB			= db;
exports.addGameToDB 		= addGameToDB;
exports.addSeasonToDB		= addSeasonToDB;
exports.listSeasons			= listSeasons;
exports.listGamesInSeason 	= listGamesInSeason;

