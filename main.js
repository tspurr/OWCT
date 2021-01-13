const scraper = require('./scraper.js');

const tournamentURL = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';

// Was already run and the teams were stored
scraper.scrape(tournamentURL);