const scraper = require('./scripts/scraper.js');


// ==================================
//         Refresh All Teams
// ==================================
function refreshTeams() {
    scraper.scrape('https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams');
}


