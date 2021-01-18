const scraper   = require('./scripts/scraper.js');
const database  = require('./database/functions');
const mongoose  = require('./database/database');
const Tournament = require('./database/models/tournament.js');

const tournamentName    = 'fa20-owcc-varsity-series-ms';
let selectTeam          = document.getElementById('teamMenu');
let teamTableBody       = document.getElementById('teamTable');

// Need to initialize the connection to the database FIRST 
mongoose.init();


// ==================================
//              Main Async
// ==================================
// DO NOT RUN ANYTHING IN HERE BESIDES WHAT NEEDS TO LOAD ON
// PAGE LOAD!! EVERYTHING ELSE CAN BE NOT HERE! GOT IT?!?!
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


// Called to load team table
// Is given the value of the team selected to then process the data into
// the table
async function loadTeamTable(teamName) {

    if(teamName === 'Select a Team')
        return;

    let team = await database.getTeamN(teamName, tournamentName);
    let members = team.members;

    for(var i = 0; i < members.length; i++) {

        let row         = document.createElement('tr');
        
        row.innerHTML = 
           `<td>${members[i].BNet}</td>
            <td class=".table-right">${members[i].SR['Tank']}</td>
            <td class=".table-right">${members[i].SR['Damage']}</td>
            <td class=".table-right">${members[i].SR['Support']}</td>`;

        teamTableBody.appendChild(row);

    }
}


// ==================================
//      Refresh Whole Tournament
// ==================================
async function refreshTournament() {

    await scraper.scrapeAll('https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams');

}


