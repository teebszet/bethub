/*------------------------------------------------------------------------------
*
*
*				Bring Da func
*
*
*-----------------------------------------------------------------------------*/



/*----------------------------------------------------
*
*		Settings
*
*---------------------------------------------------*/

var parseDefaults = {
	dynamicTyping	:	true,
	header			:	true,
	complete		:	function(data) { return data; }
}


/*----------------------------------------------------
*
*		Functions
*
*---------------------------------------------------*/

var fns = {

	parseCsv : function(csv, options) {
		var parseOptions = $.extend(parseDefaults, options);
		var csvData = Papa.parse(csv, parseDefaults);
		console.log(csvData);
		return csvData;
	},


	dumpRows : function(row) {
		var rowData = '';

		for ( var col = 0; col < columns.length; col ++ ) {
			rowData += columns.col, ' ';
		}
		return rowData;
	},


	guessResults : function(data) {
		console.log(data);
	},


	handleForm : function(form) {

		$(form).on('submit', function(event) {

			event.preventDefault();

			var $form		= $(this),
				$fileInput	= $form.find('input[type=file]')[0],
				file		= $fileInput.files[0];

			Papa.parse(file, {
				dynamicTyping: true,
				header: true,


				/*----------------------------------------------------
				 *
				 *		We have the parsed data!
				 *		Do stuff from here
				 *
				 *---------------------------------------------------*/

				complete: function(results) {

					var table = results['data'];


					//	Make public
					window.table = table;


					/*----------------------------------------------------
					 *
					 *		Sort table by date	(chronological)
					 *
					 *---------------------------------------------------*/

					//	console.log( 'First: ', table[0], ' Last: ', table[ table.length-1 ] );
					var sortedTable = table.sort(function(x, y) {

						var xFrags	= x.Date.split('.'),
							yFrags	= y.Date.split('.'),

							xDate	= new Date( xFrags[1] + '-' + xFrags[0] + '-' + xFrags[2] ),
							yDate	= new Date( yFrags[1] + '-' + yFrags[0] + '-' + yFrags[2] );

						return xDate - yDate;
					});
					//	console.log( 'First: ', table[0], ' Last: ', table[ table.length-1 ] );





					/*----------------------------------------------------
					 *
					 *		Get list of Teams
					 *
					 *---------------------------------------------------*/


					 var teams = fns.teamsList( table );





					/*----------------------------------------------------
					 *
					 *		Split table
					 *
					 *---------------------------------------------------*/

					//	We need each team to have the chance to score points so we can rank them
					//	after teams/2 games, every team should've played once
					//	!TODO:	maybe good to give 3-5 games to get more accuracy...

					var splitIndex	= Math.ceil(teams.length/2) * 5;
					var firstGames	= table.slice(0, splitIndex);
					var restOfGames	= table.slice(splitIndex, table.length-1 );

					//	console.log( 'split at: ', splitIndex, firstGames, restOfGames );





					/*----------------------------------------------------
					 *
					 *		Generate League Table from firstGames
					 *
					 *---------------------------------------------------*/

					 fns.generateLeagueTable( firstGames );





					/*----------------------------------------------------
					 *
					 *		Predict Next Game/s
					 *
					 *---------------------------------------------------*/

					var gameToPredict = restOfGames[0],
						team1		= gameToPredict.Team_1_Name,
						team2		= gameToPredict.Team_2_Name;

					var prediction = fns.predictResult(team1, team2);

					console.log( prediction );

				}
			});


		});
	},	//	handleForm




	/*----------------------------------------------------
	 *
	 *		Generates a list of unique values from a list
	 *
	 *---------------------------------------------------*/

	uniquesFromList : function (value, index, self) {
	    return self.indexOf(value) === index;
	},




	/*----------------------------------------------------
	 *
	 *		Generates a list of teams (unique) from a list of games
	 *
	 *---------------------------------------------------*/

	teamsList : function( matchList ) {

		if ( ! matchList ) { matchList = window.table; }

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
	},




	/*----------------------------------------------------
	 *
	 *		Generates a League Table from a Table of results
	 *
	 *---------------------------------------------------*/


	generateLeagueTable : function( resultsTable, numberOfGames ) {

		//	If we haven't specified how many games to calculate, or if we've asked for more than there are, do the lot
		if ( ! numberOfGames || numberOfGames > resultsTable.length ) { numberOfGames = resultsTable.length; }

		var teamsList	= fns.teamsList( resultsTable );
		var leagueTable	= {};
/*
		var columns		= {
			'Goals_For'		: 0,
			'Goals_Against'	: 0,
			'Goal_Diff'		: 0,
			'Points'		: 0,
			'Games_Played'	: 0
		};
*/


		//	Setup empty table with columns
		//	iterate through teams
		for ( var t = 0; t < teamsList.length; t++ ) {
			var team = teamsList[t];

			leagueTable[ team ] = {};
			leagueTable[ team ][ 'Goals_For' ]		= 0;
			leagueTable[ team ][ 'Goals_Against' ]	= 0;
			leagueTable[ team ][ 'Goal_Diff' ]		= 0;
			leagueTable[ team ][ 'Points' ]			= 0;
			leagueTable[ team ][ 'Games_Played' ]	= 0;

		//	console.log( leagueTable );
		}

		//	console.log( leagueTable );

		console.log( 'Games: ', numberOfGames );

		//	iterate through games
		for ( var g = 0; g < numberOfGames; g++ ) {

			var game		= resultsTable[g],
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


			var winner = fns.whoWon(team1, team2, team1Goals, team2Goals);

			//	console.log('winner: ', winner, winner.Team);

			for ( var t = 0; t < winner.Team.length; t++ ) {
				var team = winner.Team[t];
			//	console.log( team, leagueTable[ team ], leagueTable[ team ].Points );

				leagueTable[ team ].Points += winner.Points;
			}


		}

	//	console.log( leagueTable );

		window.leagueTable = leagueTable;

	},






	/*----------------------------------------------------
	 *
	 *		Pedicts Result from a given game
	 *
	 *---------------------------------------------------*/


	predictResult : function(team1, team2, leagueTable) {

		//	If less than this difference separates the teams' win ratios,
		//	predict a draw
		var drawThreshold	= 0.12,
			result 			= null;

		if ( ! leagueTable ) { leagueTable = window.leagueTable; }

		var team1Points		= leagueTable[ team1 ].Points,
		   team1Played		= leagueTable[ team1 ].Games_Played,
		   team1Potential	= team1Played * 3,

		   team2Points		= leagueTable[ team2 ].Points,
		   team2Played		= leagueTable[ team2 ].Games_Played,
		   team2Potential	= team2Played * 3;

		var winRatioDiff = (team1Points/team1Potential) - (team2Points/team2Potential);




		console.log( 'Team1: ', team1, ', Team2: ', team2 );
		console.log( leagueTable[ team1 ], leagueTable[ team2 ] );



		 //	team1 should win
		 if ( winRatioDiff > drawThreshold ) {
		 	result = 'team1 wins';
		 //	tooo close!
		 } else if ( winRatioDiff < drawThreshold && winRatioDiff > - drawThreshold ) {
			 result = 'draw';

		 //	team 2 should win
		 } else if ( winRatioDiff < -drawThreshold ) {
			 result = 'team2 wins';
		 }

		 return result;

	 },






	/*----------------------------------------------------
	 *
	 *		Updates League Table with New Results
	 *
	 *---------------------------------------------------*/


	updateLeagueTable : function() {

	},


	whoWon : function(team1, team2, team1Goals, team2Goals) {
			var points	= 3,
			output	= {
				'Team'		: null,
				'Points'	: points
			};

		if ( team1Goals > team2Goals ) {
			output.Team = [team1];
		} else if ( team2Goals > team1Goals ) {
			output.Team = [team2];
		} else if ( team1Goals === team2Goals ) {
			output.Team = [team1,team2];
			output.Points = 1;
		} else {
			//	shouldn't ever run!
			//	error
			return -1;
		}
		return output;
	},

	calculatePoints : function() {

	}


}	//	fns


module.exports = fns;

//	fns.handleForm('form');
