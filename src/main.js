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
        return SR;
    }
}


// ==================================
//          Team Table/Data
// ==================================
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

    toast.show('Team Table Loaded!');

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
    let tournID = '159390';

    // await GameBattlesAPI( {id: tournID} )
    //     .then((result) => {
    //         console.log(result);
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });

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