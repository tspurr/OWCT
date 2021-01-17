const scraper       = require('./scripts/scraper.js');
const refreshBtn    = document.getElementById('refreshBtn');


// Was already run and the teams were stored
// I don't know why this is running even when it is not called
function refreshTeams() {
    scraper.scrape('https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams');
}