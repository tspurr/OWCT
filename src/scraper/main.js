// Include main.js as a script and it can then listen to button clicks
// On button clicks and entries we can then activate parts of the scraper.js code
// Will probably need to break that code down into specific functions, code restructure may be required

const scraper = require('./scraper');

const tournamentURL = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';

// Was already run and the teams were stored
scraper.scrape(tournamentURL);