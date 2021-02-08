const firebase  = require('firebase');
                  require('firebase/firestore');
const config    = require('./config');
const toast     = require('./scripts/toast');

// Initialize the SDK to firebase
firebase.initializeApp(config.firebaseConfig);
firebase.auth().signInAnonymously();


const database          = firebase.firestore();
const GameBattlesAPI    = firebase.functions().httpsCallable('GameBattlesAPI');
const OverBuffAPI       = firebase.functions().httpsCallable('OverBuffAPI');

let selectTeam          = document.getElementById('teamMenu');
let selectTournament    = document.getElementById('tournMenu');
let teamTableBody       = document.getElementById('teamTable');
let teamStats           = document.getElementById('stats');
let teamMatches         = document.getElementById('matches');


// ==================================
//     Refresh Team Dropdown List
// ==================================
// also refresh the menu and call this function
async function refreshTeams() {

    let tournamentName = selectTournament.value;
    console.log(tournamentName);

    selectTeam.innerHTML = '<option value="">Select a Team</option>';

    let teams = await database.collection(tournamentName).doc('info').get();
        teams = teams.data().teams;

    teams.sort(); // Sort the array in alphabetical order

    for(var i = 0; i < teams.length; i++) {

        let el      = document.createElement('option');
        el.text     = teams[i];
        el.value    = teams[i];

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


// ==================================
//          Team Table/Data
// ==================================
async function loadTeam(teamName) {

    let tournamentName = selectTournament.value;

    // Set the table back to nothing
    teamTableBody.innerHTML = '';
    teamMatches.innerHTML = '';
    teamStats.innerHTML = '';

    if(teamName === 'Select a Team')
        return;

    let team    = await database.collection(tournamentName).doc(teamName).get();
        team    = team.data();

    // Team Table with Players SR
    let members = team.members;

    // Create a loading indicator
    let row = document.createElement('tr');   
        row.innerHTML = 
           `<td>Loading...</td>
            <td class="table-right">N/A</td>
            <td class="table-right">N/A</td>
            <td class="table-right">N/A</td>`;

    teamTableBody.appendChild(row);

    teamTableBody.innerHTML = '';

    // Loading the team SR
    for(var i = 0; i < members.length; i++) {
        let row = document.createElement('tr');
            row.innerHTML = 
            `<td>${members[i].BNet}</td>
             <td class="table-right">${displaySR(members[i].SR[0])}</td>
             <td class="table-right">${displaySR(members[i].SR[1])}</td>
             <td class="table-right">${displaySR(members[i].SR[2])}</td>`;

        teamTableBody.appendChild(row);
    }

    // Basic Statistics for team
    let avgSR = document.createElement('tr');
        avgSR.innerHTML = 
            `<td>Avg SR</td>
             <td>${displaySR(team.AvgSR)}</td>`;

    let top6 = document.createElement('tr');
        top6.innerHTML = 
            `<td>Top6 SR</td>
             <td>${displaySR(team.Top6Avg)}</td>`;

    teamStats.appendChild(avgSR);
    teamStats.appendChild(top6);

    // Team matches for specific tournament
    let matches = team.matches;

    for(var i = 0; i < matches.length; i++) {
        let row = document.createElement('tr');
            row.innerHTML = 
            `<td>${matches[i].vsName}</td>
             <td class="table-right">${displayWin(matches[i].wl)}</td>`;

        teamMatches.appendChild(row);
    }

}


// ==================================
//     Refresh Team Skill Ratings
// ==================================
async function refreshTeamSR() {

    let tournamentName = selectTournament.value;
    let team = selectTeam.value;

    let resp = await OverBuffAPI({type: 'All', team: team, tournament: tournamentName});

    if(resp.error != '') {
        toast.Error(resp.error);
    } else {
        toast.show(resp.response);
    }

    loadTeamTable(team);

}


// ==================================
//   Refresh All Teams Skill Ratings
// ==================================
async function refreshTeamsSR() {

    let tournamentName = selectTournament.value;
    let teams = await database.collection(tournamentName).doc('info').get();
        teams = teams.data().teams;

    for(var i = 0; i < teams.length; i++) {

        let resp = await OverBuffAPI({type: 'All', team: team, tournament: tournamentName});
        
        if(resp.error != '') {
            toast.Error(resp.error);
        } else {
            toast.show(resp.response);
        }
    }

}


// ==================================
//      Refresh Tournaments List
// ==================================
async function loadTournaments() {

    selectTournament.innerHTML = '<option value="">Select a Tournament</option>';

    // Get all the documents within the tournaments collection
    let tournaments = await database.collection('tournaments').get();
        tournaments = tournaments.docs.map(doc => doc.data());
    
    // Parse thorugh all the tournaments
    for(var i = 0; i < tournaments.length; i++) {

        // Add an option for each torunament based on the short URL
        let el      = document.createElement('option');
        el.text     = tournaments[i].shortURL;
        el.value    = tournaments[i].shortURL;

        selectTournament.appendChild(el);

    }

}


// ==================================
//      Refresh Whole Tournament
// ==================================
async function refreshTournament() {

    let tournName = selectTournament.value;
    let tournID = '151515';  //'159390';

    await GameBattlesAPI( {id: tournID} )
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.error(error);
        });

    let teams = await database.collection(tournName).doc('info').get();
        teams = teams.data().teams;

    for(var i = 0; i < teams.length; i++) {

        await OverBuffAPI({type: 'All', team: teams[i], tournament: tournName});
        console.log(`${teams[i]} SR gotten`);

    }
    
}


// ==================================
//              Main Async
// ==================================
// DO NOT RUN ANYTHING IN HERE BESIDES WHAT NEEDS TO LOAD ON
// PAGE LOAD!! EVERYTHING ELSE CAN BE NOT HERE! GOT IT?!?!
async function main() {

    await loadTournaments();

}


// ==================================
//          Main Async Call
// ==================================
main()