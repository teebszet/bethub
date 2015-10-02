var games	= require("./gameModel");
var log		= require("bole")("customers/router");
var router	= require("express").Router();

function getGames(req, res) {

	game.findAll(function (error, games) {

		if (error) {
			log.error(error, "error finding games");
			res.status(500).send(error);
			return;
		}
		res.json(games);
	});
}

function addGame(req, res) {
	res.status(201).send();
}

router.post("/game", addGame);
router.get("/games", getGames);

module.exports = router;
