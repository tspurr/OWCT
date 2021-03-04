const firebase  = require('firebase');
const config    = require('./config');
const toast     = require('./scripts/toast');
const $         = require('jquery');

// Initialize the SDK to firebase
firebase.initializeApp(config.firebaseConfig);
firebase.auth().signInAnonymously();

const GameBattles = firebase.functions().httpsCallable('GameBattles');
const OverBuff    = firebase.functions().httpsCallable('OverBuff');

const {getTeamByName, 
       getTournaments, 
       getAllTournTeams,
       getTournamentByName} = require('./database/functions');

// Logging the response from any function
// Easier than writing this 100 times
function response(response) {
    if(response.error !== ''){
        toast.Error(response.error)
        console.error(response.error);
    } else {
        toast.show(response.response);
    }
}


// ####################################
//     Refresh Team Dropdown List
// ####################################
// also refresh the menu and call this function
async function refreshTeams() {

    let selectTournament = document.getElementById('tournMenu');
    let selectTeam       = document.getElementById('teamMenu');
    let tournamentName   = selectTournament.value;

    selectTeam.innerHTML = '<option value="">-- Loading --</option>';

    let teams = await getAllTournTeams(tournamentName);

    selectTeam.innerHTML = '<option value="">-- Select Team --</option>';

    for(var i = 0; i < teams.length; i++) {

        let el      = document.createElement('option');
        el.text     = teams[i].name;
        el.value    = teams[i].name;

        selectTeam.appendChild(el);

    }

    toast.show('Team Dropdown Refreshed!');

}


// Function to fix the display of SR to not be -1
function displaySR(SR) {
    if(SR === -1) {
        return 'N/A';
    }else {
        return Math.floor(SR);
    }
}

function displayWin(wl) {
    if(wl === 0) {
        return 'Loss';
    }else {
        return 'Win';
    }
}

// ####################################
//           Team Table/Data
// ####################################
async function loadTeam(teamName) {

    let selectTournament = document.getElementById('tournMenu');
    let teamTableBody    = document.getElementById('teamTable');
    let teamStats        = document.getElementById('stats');
    let teamMatches      = document.getElementById('matches');
    let updated          = document.getElementById('team-update');
    let tournamentName   = selectTournament.value;

    // Set the table back to nothing
    teamTableBody.innerHTML = '';
    teamMatches.innerHTML   = '';
    teamStats.innerHTML     = '';

    if(teamName === '-- Select Team --')
        return;

    // Create a loading indicator
    let row = document.createElement('tr');   
        row.innerHTML = 
           `<td>Loading...</td>
            <td class="team-table-right">N/A</td>
            <td class="team-table-right">N/A</td>
            <td class="team-table-right">N/A</td>`;

    teamTableBody.appendChild(row);

    // Getting selected team information from BigQuery
    let team = await getTeamByName(teamName, tournamentName);

    // Team Table with Players SR
    let members = team.members;

    teamTableBody.innerHTML = '';
    teamMatches.innerHTML   = '';
    teamStats.innerHTML     = '';

    // Loading the team SR
    for(var i = 0; i < members.length; i++) {
        let row = document.createElement('tr');
            row.innerHTML = 
            `<td>${members[i].BNet}</td>
             <td class="team-table-right">${displaySR(members[i].tank)}</td>
             <td class="team-table-right">${displaySR(members[i].damage)}</td>
             <td class="team-table-right">${displaySR(members[i].support)}</td>`;

        teamTableBody.appendChild(row);
    }

    // Displaying when the team was last updated
    updated.innerHTML = `Last Updated: <b>${team.updated}<b>`;

    // Basic Statistics for team
    let avgSR = document.createElement('tr');
        avgSR.innerHTML = 
            `<td>Avg SR</td>
             <td>${displaySR(team.AvgSR)}</td>`;

    let top6 = document.createElement('tr');
        top6.innerHTML = 
            `<td>Top6 SR</td>
             <td>${displaySR(team.Top6SR)}</td>`;

    teamStats.appendChild(avgSR);
    teamStats.appendChild(top6);

    // TODO: Re-setup match storage

}


// ####################################
//     Refresh Team Skill Ratings
// ####################################
async function refreshTeamSR() {

    let selectTournament = document.getElementById('tournMenu');
    let selectTeam       = document.getElementById('teamMenu');
    let tournID          = await getTournamentByName(selectTournament.value);
    let teamID           = await getTeamByName(selectTeam.value);
    
    let resp = await OverBuff({type: 'Team', teamID: teamID, tournID: tournID});
    response(resp);

    loadTeam(team);

}


// ####################################
//    Refresh All Teams Skill Ratings
// ####################################
async function refreshTeamsSR() {

    let selectTournament = document.getElementById('tournMenu');
    let tournName        = selectTournament.value;
    let tournID          = await getTournamentByName(tournName);
    let teams            = getAllTournTeams(tournName)

    for(var i = 0; i < teams.length; i++) {

        let resp = await OverBuff({type: 'Team', teamID: teams[i].teamID, tournID: tournID});
        response(resp);
        
    }

}


// ####################################
//       Refresh Tournaments List
// ####################################
async function loadTournaments() {

    let selectTournament = document.getElementById('tournMenu');
        selectTournament.innerHTML = '<option value="">Loading</option>';

    // Get all the documents within the tournaments collection
    let tournaments = await getTournaments();
    
    selectTournament.innerHTML = '<option value="">-- Select Tournament --</option>';

    // Parse thorugh all the tournaments
    for(var i = 0; i < tournaments.length; i++) {

        // Add an option for each torunament based on the short URL
        let el      = document.createElement('option');
        el.text     = tournaments[i].shortURL;
        el.value    = tournaments[i].shortURL;

        selectTournament.appendChild(el);

    }

}


// ####################################
//       Refresh Whole Tournament
// ####################################
async function refreshTournament() {

    let selectTournament = document.getElementById('tournMenu');
    let tournName        = selectTournament.value;
    let tournID          = await getTournamentByName(tournName);

    let resp = await GameBattles({type: 'ALL', tournID: tournID});
    response(resp);

    let teams = await getAllTournTeams(tournName);

    for(var i = 0; i < teams.length; i++) {

        let resp2 = await OverBuff({type: 'Team', teamID: teams[i].teamID, tournID: tournID});
        response(resp2);

        console.log(`${teams[i]} SR gotten`);

    }

    console.log('Got all team\'s SR!');
    
}




// ####################################
//        Loading Specific Pages
// ####################################
async function loadPage(page) {
    let mainPage = document.getElementById('main');
        mainPage.innerHTML = '';

    switch (page) {
        case 'main':
            $('#main').load('./html/teamTable.html #teamPage', function() {
                loadTournaments();
            });
            break;

        case 'bracket':
            $('#main').load('./html/bracket.html #bracketPage', function() {
                // Load bracket when built
            });
            break;
    
        case 'info':
            $('#main').load('./html/info.html #infoPage');
            break;

        default:
            $('#main').load('./html/teamTable.html #teamPage');
            break;
    }

}


// ####################################
//              Main Async
// ####################################
// DO NOT RUN ANYTHING IN HERE BESIDES WHAT NEEDS TO LOAD ON
// PAGE LOAD!! EVERYTHING ELSE CAN BE NOT HERE! GOT IT?!?!
async function main() {

    await loadPage('main');

}

// ####################################
//          Main Async Call
// ####################################
main()