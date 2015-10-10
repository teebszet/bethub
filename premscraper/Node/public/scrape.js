//  Document ready
$(document).ready(function() {


    /*----------------------------------------------------
     *
     *      Settings
     *
     *---------------------------------------------------*/

    var baseUrl     = 'http://www.betexplorer.com/soccer/';
    var tableId     = '#leagueresults_tbody';
    var leagues     = {
        england : [
              'Premier_League'
            , 'Championship'
            , 'League_One'
            , 'League_Two'
            , 'Vanarama_Conference'
            , 'Vanarama_Conference_North'
            , 'Vanarama_Conference_South'
            , 'Southern_Premier_League'
            , 'Ryman_League'
            , 'Capital_One_Cup'
        ]
    }

    function scrapeUrl(url, subSection) {

        $.get(url + subSection, function(data) {

            processData( data );

        });

    }

    function processData( data ) {
        var rows    = $(data).find('tr').not('.rtitle');
        var games   = [];

        for (var r = 0; r < rows.length; r++) {
            var $row    = $( rows[r] ),
                teams   = $row.find('td:first-child').text().split(' - '),
                team1   = teams[0],
                team2   = teams[1]
                result  = $row.find('.result').text().split(':'),
                goals1  = result[0],
                goals2  = result[1],
                date    = $row.find('.date').text();

            var game = {
                Team_1_Name     : team1,
                Team_2_Name     : team2,
                Team_1_Goals    : goals1,
                Team_2_Goals    : goals2,
                date            : date
            }
            games.push(game);

        }

        console.log(games);

    }

    scrapeUrl('http://www.betexplorer.com/soccer/england/premier-league-2014-2015/results', tableId);

});
