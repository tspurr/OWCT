const scraper           = require('./scripts/scraper.js');
const database          = require('./database/functions');
const mongoose          = require('./database/database');
const overbuff          = require('./scripts/overbuff');

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

    selectTeam.innerHTML = '<option value="">Select a Team</option>';

    let teams = await database.getTournTeams(tournamentName);

    teams.sort(); // Sort the array in alphabetical order

    for(var i = 0; i < teams.length; i++) {

        let el      = document.createElement('option');
        el.text     = teams[i];
        el.value    = teams[i];

        selectTeam.appendChild(el);

    }

}


function displaySR(SR) {
    if(SR === -1) {
        return 'N/A';
    }else {
        return SR;
    }
}


// Called to load team table
// Is given the value of the team selected to then process the data into
// the table
async function loadTeamTable(teamName) {

    // Set the table back to nothing
    teamTableBody.innerHTML = '';

    if(teamName === 'Select a Team')
        return;

    let team    = await database.getTeamN(teamName, tournamentName);
    let members = team.members;

    // Loop thorugh the members on the team and store the rel. information
    for(var i = 0; i < members.length; i++) {

        let row = document.createElement('tr');
        
        row.innerHTML = 
           `<td>${members[i].BNet}</td>
            <td class="table-right">${displaySR(members[i].SR[0])}</td>
            <td class="table-right">${displaySR(members[i].SR[1])}</td>
            <td class="table-right">${displaySR(members[i].SR[2])}</td>`;

        teamTableBody.appendChild(row);

    }

}


// ==================================
//     Refresh Team Skill Ratings
// ==================================
async function refreshTeamSR() {

    let team = selectTeam.value;

    await overbuff.getAllMemberSR(team, tournamentName);

    loadTeamTable(team);

}


// ==================================
//      Refresh Whole Tournament
// ==================================
async function refreshTournament() {

    await scraper.scrapeAll('https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams');

}


