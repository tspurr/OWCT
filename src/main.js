const scraper = require('./scripts/scraper.js');
const refreshBtn = document.getElementById('refreshBtn');

const tournamentURL = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';


// Was already run and the teams were stored
refreshBtn.onclick = scraper.scrape(tournamentURL);