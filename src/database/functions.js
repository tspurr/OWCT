const {BigQuery} = require('@google-cloud/bigquery');
//  const toast      = require('../scripts/toast');

const bigquery = new BigQuery ({
    projectId: 'owct-1003',
    keyFilename: './OWCT/src/database/owct.json'
});


// ####################################
//         Select Query Helper
// ####################################
//  For select querys to handle error statements instead of typing it out a bunch
//  Returns a simplified version of the response from the queried tables
//     @param queryStatement : String
async function squeryHelper(queryStatement) {
    
    let rows = await bigquery.query(queryStatement)
                        .catch((error) => {
                            // toast.Error('Had Trouble looking up that info!');
                            console.error(error);
                        });

    return rows[0];

}


// ####################################
//         Get List Tournaments
// ####################################
//  @return tournaments : Array of Objects
async function getTournaments() {
    const selectTournaments = `SELECT shortURL FROM \`owct-1003.owcc.tournaments\` LIMIT 1000`;
    let tournaments = await squeryHelper(selectTournaments);

    return tournaments;
}


// ####################################
//         Get Tournament ID
// ####################################
//  @param tournName : String
//
//  @return tournID  : Integer
async function getTournamentByName(tournName) {

    const selectTournament = `SELECT id FROM \`owct-1003.owcc.tournaments\` WHERE shortURL = '${tournName}'`;
    let tournID = await squeryHelper(selectTournament);

    return tournID[0].id;

}


// ####################################
//          Get All teams
// ####################################
//  @param tournName : String
//
//  @return teams : Array of Objects
async function getAllTournTeams(tournName) {

    let tournID = await getTournamentByName(tournName);

    const selectTournamentTeams = `SELECT name FROM \`owct-1003.${tournID}.teams\` ORDER BY name`;
    let teams = await squeryHelper(selectTournamentTeams);

    return teams;
}


// ####################################
//          Get Team by Name
// ####################################
//  @param teamName : String
//         tournID  : Integer
//
//  @return Team : Object
async function getTeamByName(teamName, tournName) {

    // Get the ID of the tournament
    let tournID = await getTournamentByName(tournName);

    // Find the team in the teams table
    const selectTeamID = `SELECT teamID, AvgSR, Top6SR, updated FROM \`owct-1003.${tournID}.teams\` WHERE name = '${teamName}'`;
    let team = await squeryHelper(selectTeamID);
        team = team[0];
    let teamID = team.teamID;  // Set the teamID for easier use later on

    const selectMembers = `SELECT BNet, tank, damage, support FROM \`owct-1003.${tournID}.players\` WHERE teamID = ${teamID}`;
    let members = await squeryHelper(selectMembers);

    let Team = {
        AvgSR: team.AvgSR,
        Top6SR: team.Top6SR,
        members: members,
        updated: new Date(team.updated.value)
    };

    return Team;

}


// ####################################
//              Exports
// ####################################
module.exports = {
    getTeamByName,
    getTournaments,
    getAllTournTeams,
    getTeamByName,
    getTournamentByName,
};

getTeamByName('UMich Esports', 'owcc-spring-2021');
// getTournaments();
// getAllTournTeams('owcc-spring-2021');