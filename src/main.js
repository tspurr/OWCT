const firebase  = require('firebase');
                  require('firebase/firestore');
const config    = require('./config');
const toast     = require('./scripts/toast');

// Initialize the SDK to firebase
firebase.initializeApp(config.firebaseConfig);
firebase.auth().signInAnonymously();


const database          = firebase.firestore();
const scrapeTournament  = firebase.functions().httpsCallable('GameBattlesAPI');
const getTeamSR         = firebase.functions().httpsCallable('OverBuffAPI');

let selectTeam          = document.getElementById('teamMenu');
let selectTournament    = document.getElementById('tournMenu');
let teamTableBody       = document.getElementById('teamTable');


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


// Called in main when page is loaded, the refreshTeams button will
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

    let tournamentName = selectTournament.value;

    // Set the table back to nothing
    teamTableBody.innerHTML = '';

    if(teamName === 'Select a Team')
        return;

    let members = await database.collection(tournamentName).doc(teamName).get();
        members = members.data().members;

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

    let tournamentName = selectTournament.value;
    let team = selectTeam.value;

    await getTeamSR({team: team, tournament: tournamentName})
        .then(() => {
            loadTeamTable(team);
        });

}


// ==================================
//         Refresh Tournaments
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

    let tournID = '159390';

    scrapeTournament( {id: tournID} )
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.error(error);
        });
    
}


