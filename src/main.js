const scraper   = require('./scripts/scraper.js');
const database  = require('./database/functions');
const mongoose  = require('./database/database');

const tournamentName    = 'fa20-owcc-varsity-series-ms';
let selectTeam          = document.getElementById('teamMenu');

// Need to initialize the connection to the database FIRST 
mongoose.init();


// ==================================
//              Main Async
// ==================================
// DO NOT RUN ANYTHING IN HERE BESIDES WHAT NEEDS TO LOAD ON
// PAGE LOAD!! EVERYTHING ELSE CAN BE BUTTONS! GOT IT?!?!
async function main() {
    await refreshTeams();
}

// ==================================
//          Main Async Call
// ==================================
main()


// Called in main when page is loaded, the refreshTeams button will
// also refresh the menu and call this function
async function refreshTeams() {
    let teams = await database.getTournTeams(tournamentName);

    teams.sort(); // Sort the array in alphabetical order

    for(var i = 0; i < teams.length; i++) {
        let el      = document.createElement('option');
        el.text     = teams[i];
        el.value    = teams[i];

        selectTeam.appendChild(el);
    }
}


// ==================================
//      Refresh Whole Tournament
// ==================================
async function refreshTournament() {
    await scraper.scrapeAll('https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams');
}


