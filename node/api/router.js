/*----------------------------------------------------
 *
 *		Require's
 *
 *---------------------------------------------------*/


//	var mongoose	= require('mongoose');
var fs			= require('fs');
//	var model		= require('nodejs-model');
var formidable	= require('formidable');
var Baby		= require('babyparse');

//	var fns			= require('./functions');
var gameModels	= require("./gameModels");
//	var log		= require("bole")("api/router");
var router		= require("express").Router();

Game			= gameModels.Game;
Season			= gameModels.Season;

//	stats			= gameModels.stats;



/*----------------------------------------------------
 *
 *		Functions
 *
 *---------------------------------------------------*/



/*----------------------------------------------------
 *
 *		Add a Season to DB
 *
 *---------------------------------------------------*/


function addSeasonFromCSV(req, res) {

	var headerRow = 'Team_1_Name,Team_2_Name,Team_1_Goals,Team_2_Goals,Date\r\n';

    var form = new formidable.IncomingForm();

    form.uploadDir		= './uploads';
    form.keepExtensions	= true;

	form.on('fileBegin', function(name, file){
		file.path = form.uploadDir + '/' + file.name;
    });

    var files = [],
    	fields = [];

    form.on('field', function(field, value) {
        fields.push([field, value]);
    });
    form.on('file', function(field, file) {
        files.push(file);
    });
    form.on('end', function() {

		for ( var f = 0; f < files.length; f ++ ) {

			var file = files[f];

		//	console.log('file: ', file.name);

			if ( ! file.type === 'text/csv' ) { console.log('Error: File type is not csv'); }

			var filePath	= file.path;
			var fileName	= filePath.split('/').pop();
			var frags		= fileName.split('_'),
				country		= frags[0],
				league		= frags[1],
				years		= frags[2].split('.')[0];


			var data = fs.readFileSync( filePath );

				data += '';

			//	if ( err ) { console.log(err); }
				//	data needs to be a string!!
				//	Pass in header row!
				var parsed	= Baby.parse( headerRow + data, { dynamicTyping: true, header: true, skipEmptyLines: true } );
				var games	= parsed.data;

				var season = {
					  'country'	: country
					, 'league'	: league
					, 'year'	: years
					, 'games'	: games
				};

			//	console.log( 'parsed: ', parsed );

				gameModels.addSeasonToDB( season );

			//	});

		}	//	end for

    });
    form.parse(req);

}



/*----------------------------------------------------
 *
 *		Get Games
 *
 *---------------------------------------------------*/


function getGames(req, res) {

	Game.findAll(function (err, games) {

		if (err) {
			log.error(error, "error finding games");
			res.status(500).send(err);
			return;
		}
		res.json(games);
	});
}




/*----------------------------------------------------
 *
 *		List all Seasons in DB
 *
 *---------------------------------------------------*/

/*
function listSeasons() {

}
*/



/*----------------------------------------------------
 *
 *		Retrieve a Season from DB
 *
 *---------------------------------------------------*/

function getSeasonFromDB( seasonID ) {

}



/*----------------------------------------------------
 *
 *		Generates a list of teams (unique'd) from a list of games
 *
 *---------------------------------------------------*/


function teamsList( matchList ) {

	var teams = [];

	for (var i = 0; i < matchList.length; i++) {
		if ( teams.indexOf( matchList[i].Team_1_Name ) < 0 ) {
			teams.push( matchList[i].Team_1_Name );
		}
		if ( teams.indexOf( matchList[i].Team_2_Name ) < 0 ) {
			teams.push( matchList[i].Team_2_Name );
		}
	}

	return teams;
}



/*----------------------------------------------------
 *
 *		Returns the winner of a game, & points
 *
 *---------------------------------------------------*/


function whoWon(game) {
		var points	= 3,
		output	= {
			'Team'		: null,
			'TeamName'	: null,
			'Points'	: points
		},
		team1		= game.Team_1_Name,
		team2		= game.Team_2_Name,
		team1Goals	= game.Team_1_Goals,
		team2Goals	= game.Team_2_Goals;

	if ( team1Goals > team2Goals ) {
		output.Team		= [1];
		output.TeamName = [team1];
	} else if ( team2Goals > team1Goals ) {
		output.Team		= [2];
		output.TeamName = [team2];
	} else if ( team1Goals === team2Goals ) {
		output.Team		= [1,2];
		output.TeamName = [team1,team2];
		output.Points = 1;
	}

	return output;
}



/*----------------------------------------------------
 *
 *		Sort table by date	(chronological)
 *
 *---------------------------------------------------*/

var stats = {};
var totalStats = {}

function sortTable(season, drawThreshold) {
	var table = season.games;
	var sortedTable = table.sort(function(x, y) {

		var xFrags	= x.Date.split('.'),
			yFrags	= y.Date.split('.'),

			xDate	= new Date( xFrags[1] + '-' + xFrags[0] + '-' + xFrags[2] ),
			yDate	= new Date( yFrags[1] + '-' + yFrags[0] + '-' + yFrags[2] );

		return xDate - yDate;
	});

//	console.log('stat:\n', stat);

	var s = season.country + '-' + season.league + '-' + season.year;
	stats[s] = {
		correct		:	[null, null, null],	// {predicted: null, correct: null, total: null},
		homeWins	:	[null, null, null],	// {predicted: null, correct: null, total: null},
		awayWins	:	[null, null, null],	// {predicted: null, correct: null, total: null},
		draws		:	[null, null, null]	// {predicted: null, correct: null, total: null}
	};


//	console.log('s:', s, 'stats[s]:\n', stats[s]);

	return splitTable(season, table, drawThreshold);
	//	console.log( 'First: ', table[0], ' Last: ', table[ table.length-1 ] );
}



/*----------------------------------------------------
 *
 *		Split table
 *
 *---------------------------------------------------*/

function splitTable(season, table, drawThreshold) {

	totalStats.correct	= [null, null, null];
	totalStats.homeWins	= [null, null, null];
	totalStats.awayWins	= [null, null, null];
	totalStats.draws	= [null, null, null];


	//	We need each team to have the chance to score points so we can rank them
	//	after teams/2 games, every team should've played once
	//	!TODO:	maybe good to give 3-5 games to get more accuracy...
	var teams		= teamsList( table );
	var splitIndex	= Math.ceil(teams.length/2) * 5;
//	var firstGames	= table.slice(0, splitIndex);
//	var restOfGames	= table.slice(splitIndex, table.length-1 );

	//	console.log( 'split at: ', splitIndex, firstGames, restOfGames );

//	console.log('in splitTable, restOfGames: ', restOfGames);

	//	generate league table for first 5 games for each team
	var leagueTable = generateLeagueTable( table, 0 );

	for ( var g = 1; g < splitIndex; g++ ) {
		generateLeagueTable( table, g, leagueTable );
	}


//	console.log('calling predictGame');
	for ( var p = splitIndex; p < table.length; p ++ ) {
		predictGame( season, table, leagueTable, p, drawThreshold );
	}
//	console.log( '\n', Object.keys(stats).length, '\n\n' );


	var statsKeys		= Object.keys(stats),
		statsKeysLength	= statsKeys.length;

	//	iterate through seasons
	for (var i = 0; i < statsKeysLength; i++) {
		var statsKey	= statsKeys[i];
		var stat		= stats[statsKey];

//		console.log('key:\n', sKey, ', stat:\n', stat);

		var statKeys	= Object.keys(stat),
			statLength	= statKeys.length;

		//	iterate through stat breakdown for season
		for (var j = 0; j < statLength; j ++) {
			var statKey	= statKeys[j];

	//		console.log(statKey);
			//	calculate correct as percentage
			stat[statKey][3] = (100 * (stat[statKey][1] / stat[statKey][2]) + '%');

			totalStats[statKey][0] += stat[statKey][0];
			totalStats[statKey][1] += stat[statKey][1];
			totalStats[statKey][2] += stat[statKey][2];
		}

	}

	statKeys	= Object.keys(totalStats),
	statLength	= statKeys.length;

	//	iterate through stat breakdown for season
	for (var j = 0; j < statLength; j ++) {
		var statKey	= statKeys[j];

//		console.log(statKey);
		//	calculate correct as percentage
		totalStats[statKey][3] = (100 * (totalStats[statKey][1] / totalStats[statKey][2]) + '%');
	}

	stats['total stats'] = totalStats;

	return stats;

}



/*----------------------------------------------------
 *
 *		Generates a League Table from a Table of results
 *
 *---------------------------------------------------*/


function generateLeagueTable( resultsTable, gameNumber, leagueTable) {

	//	If we haven't specified how many games to calculate, or if we've asked for more than there are, do the lot
	//	if ( ! gameNumber || gameNumber > resultsTable.length ) { gameNumber = resultsTable.length; }

	var teams	= teamsList( resultsTable );

	//	if no leagueTable is passed in, create one
	if (! leagueTable) {
		var leagueTable	= {};

		//	Setup empty table with columns
		//	iterate through teams
		for ( var t = 0; t < teams.length; t++ ) {
			var team = teams[t];

			leagueTable[ team ] = {};
			leagueTable[ team ][ 'Goals_For' ]		= 0;
			leagueTable[ team ][ 'Goals_Against' ]	= 0;
			leagueTable[ team ][ 'Goal_Diff' ]		= 0;
			leagueTable[ team ][ 'Points' ]			= 0;
			leagueTable[ team ][ 'Games_Played' ]	= 0;

		}
	}

	var game		= resultsTable[gameNumber],
		team1		= game.Team_1_Name,
		team2		= game.Team_2_Name,
		team1Goals	= game.Team_1_Goals,
		team2Goals	= game.Team_2_Goals;

	//	Team 1
	leagueTable[ team1 ].Goals_For 		+= team1Goals;
	leagueTable[ team1 ].Goals_Against	+= team2Goals;
	leagueTable[ team1 ].Goal_Diff		+= ( team1Goals - team2Goals );
	leagueTable[ team1 ].Games_Played	++;

	//	Team2
	leagueTable[ team2 ].Goals_For 		+= team2Goals;
	leagueTable[ team2 ].Goals_Against	+= team1Goals;
	leagueTable[ team2 ].Goal_Diff		+= ( team2Goals - team1Goals );
	leagueTable[ team2 ].Games_Played	++;

	var winner = whoWon( game );

//	console.log(gameNumber, ' winner: ', winner);

	for ( var t = 0; t < winner.TeamName.length; t++ ) {
		var team = winner.TeamName[t];
		leagueTable[ team ].Points += winner.Points;
	}


//	console.log('\n\n LEAGUE TABLE @ ', gameNumber, ' games \n\n', leagueTable, '\n\n');
//	console.log('generating league table for game: ', gameNumber);
	return leagueTable;
//	console.log('calling predictGame');
//	predictGame( resultsTable, leagueTable );

}



/*----------------------------------------------------
 *
 *		Predict Game
 *
 *---------------------------------------------------*/


function predictGame( season, results, leagueTable, game, drawThreshold ) {

	var s = season.country + '-' + season.league + '-' + season.year;

//	console.log('s:', s, '\n stats[s]:', stats[s]);

	var gameToPredict	= results[game],
		team1			= gameToPredict.Team_1_Name,
		team2			= gameToPredict.Team_2_Name;


//	console.log('calling predictResult for game ', g, ' : ', team1, ' v ', team2);
	var prediction	= predictResult(team1, team2, leagueTable, drawThreshold);
	var winner		= whoWon(results[game]);
	var predWinner	= prediction.winningTeam + '';
	var winningTeam	= winner.Team + '';

	leagueTable = generateLeagueTable( results, game, leagueTable );

	var correct = ( predWinner === winningTeam);

	//	predicted result
	//	 home win
	if (predWinner == '1') {
		stats[s].homeWins[0] ++;
	//	away
	} else if ( predWinner == '2' ) {
		stats[s].awayWins[0] ++;
	//	draw
	} else {
		stats[s].draws[0] ++;
	}

	//	number of correct predictions
	if ( correct ) {
		stats[s].correct[0] ++;
		stats[s].correct[1] ++;

		if ( winningTeam === '1' ) {
			stats[s].homeWins[1] ++;
		} else if ( winningTeam === '2' ) {
			stats[s].awayWins[1] ++;
		} else {
			stats[s].draws[1] ++;
		}
	}

	//	number of total results
	if ( winningTeam === '1' ) {
		stats[s].homeWins[2] ++;
	} else if ( winningTeam === '2' ) {
		stats[s].awayWins[2] ++;
	} else {
		stats[s].draws[2] ++;
	}


	stats[s].correct[2] ++;

}



/*----------------------------------------------------
 *
 *		Pedicts Result from a given game
 *
 *---------------------------------------------------*/


function predictResult(team1, team2, leagueTable, drawThreshold) {

	//	If less than this difference separates the teams' win ratios,
	//	predict a draw
	if ( ! drawThreshold) {
		drawThreshold = 0.12;
	}
	var homeAdvantage = (0.228793/2);

	var result 			= {};

	var team1Name		= leagueTable[ team1 ].team_Name,
		team1Points		= leagueTable[ team1 ].Points,
	    team1Played		= leagueTable[ team1 ].Games_Played,
	    team1Potential	= team1Played * 3,
	    team1WinRatio	= (team1Points/team1Potential) * (1 + homeAdvantage),

		team2Name		= leagueTable[ team2 ].Name,
	    team2Points		= leagueTable[ team2 ].Points,
	    team2Played		= leagueTable[ team2 ].Games_Played,
	    team2Potential	= team2Played * 3,
	    team2WinRatio	= (team2Points/team2Potential) * (1 - homeAdvantage),

		winRatioDiff = (team1WinRatio - team2WinRatio);


	result.team1Name		= team1;
	result.team2Name		= team2;
	result.team1WinRatio	= team1WinRatio;
	result.team2WinRatio	= team2WinRatio;
	result.winRatioDiff		= winRatioDiff;

//	console.log( 'Team1: ', team1, ', Team2: ', team2 );
//	console.log( leagueTable[ team1 ], leagueTable[ team2 ] );

	 //	team1 should win
	if ( winRatioDiff > drawThreshold ) {
		result.winningTeam		= [1];
		result.winningTeamName	= [team1];

	 //	team 2 should win
	} else if ( winRatioDiff < -drawThreshold ) {
		result.winningTeam		= [2];
		result.winningTeamName	= [team2];

	 //	tooo close!
	} else {
		result.winningTeam		= [1,2];
		result.winningTeamName	= [team1,team2];
	}

	 return result;

 }



/*----------------------------------------------------
 *
 *		Routes
 *
 *---------------------------------------------------*/


router.get('/', function (req, res) {
  res.render('sendfile');
});

router.post('/add-season', addSeasonFromCSV);
router.get('/list-seasons', function(req, res) {
	gameModels.listSeasons( req, res );
});

router.post('/predict', function(req, res) {

	var fields	= [];
	var form	= new formidable.IncomingForm();

    form.on('field', function(field, value) {
        fields.push({field: value});
    });

	form.parse(req, function(err, fields, files) {
		if (err) { console.log(err); }

		var seasonId = fields.seasonID;

		var queryString = {"_id" : seasonId};

		gameModels.listGamesInSeason( req, res, queryString, sortTable );

	});

});

router.get('/predict-all', function(req, res) {

	var queryString = {};

//	var testResults = gameModels.listGamesInSeason( queryString, sortTable );
//	console.log(testResults);
//	res.render('showResults', {testResults: testResults});
	console.log(['Predicted', 'Correct', 'Total', 'Percentage']);
	gameModels.listGamesInSeason( req, res, queryString, sortTable );

});

router.get('/test', function(req, res) {
	res.render('test');
});
router.post('/run-test', function(req, res) {
	var fields	= [];
	var form	= new formidable.IncomingForm();

    form.on('field', function(field, value) {
        fields.push({field: value});
    });

	form.parse(req, function(err, fields, files) {
		if (err) { console.log(err); }

		var queryString = {};

		var testStart		= parseFloat(fields.testStart),
			testEnd			= parseFloat(fields.testEnd),
			testSteps		= parseInt(fields.testSteps),

			testRange		= testEnd - testStart,
			testStepSize	= testRange/testSteps;


		var dtTestResults = {}

		for ( var test = 0; test < testSteps; test++ ) {
			var drawThreshold = (testStart + (test * testStepSize));
			req.drawThreshold = drawThreshold;

			console.log( (testStart + (test * testStepSize)) ,':', drawThreshold);

			dtTestResults[ drawThreshold ] = gameModels.listGamesInSeason( req, res, queryString, sortTable, drawThreshold );
		}

		console.log( dtTestResults );

	//	res.render('showResults', {testResults: JSON.stringify(dtTestResults) } );

	});
});

router.get('/get-season', getSeasonFromDB);
router.get('/');
router.get('/games', getGames);

module.exports = router;
