const firebase  = require('firebase');
                  require('firebase/firestore');
const config    = require('./config');
const toast     = require('./scripts/toast');

// Initialize the SDK to firebase
try {
    firebase.initializeApp(config.firebaseConfig);
} catch (error) {
    return console.error(error);
}

// Sign the user in annonymously
try {
    firebase.auth().signInAnonymously();
} catch (error) {
    return console.error('Could not sign in anonymously');
}

const database          = firebase.firestore();
const scrapeTournament  = firebase.functions.httpsCallaable('scrapeTournament');

const tournamentName    = 'fa20-owcc-varsity-series-ms';
let selectTeam          = document.getElementById('teamMenu');
let teamTableBody       = document.getElementById('teamTable');


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

    let teams = await database.collection(tournamentName).doc('info').get().teams;

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

    let team    = await database.collection(tournamentName).doc(teamName).get();
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

    scrapeTournament({url: 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams'})
        .then((result) => {
            toast.show(result);
        })
        .catch((error) => {
            console.error(error);
        });
    
}


