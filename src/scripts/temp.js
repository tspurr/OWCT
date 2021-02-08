const fetch         = require('node-fetch');
let admin, database;


// Global Variables are BAD I KNOW!
const   GBApi           = 'https://gb-api.majorleaguegaming.com/',
        tournScreen     = 'api/web/v1/tournament-screen/',
        teamsAPI        = 'api/v1/tournament-team/with-eligibility-and-premium-status/',
        teamAPI         = 'api/web/v1/team-members-extended/team/',
        teamMatchesAPI  = 'api/web/v1/team-matches-screen/team/';

// #################################
//          Match Storage
// #################################
async function storeMatches(teamID) {
    let response = await fetch(GBApi + teamMatchesAPI + teamID + '?pageSize=5&pageNumber=1');
    let data     = await response.json();
        data     = data.body;

    let matches = [];

    if(data.totalRecords === 0)
        return matches;

    // Looking through all the pages of matches the team has played
    for(var i = 1; i <= data.totalPages; i++) {

        let response2 = await fetch(GBApi + teamMatchesAPI + teamID + `?pageSize=5&pageNumber=${i}`);
        let data2     = await response2.json();
            data2     = data2.body;

        // Looping through all the matches on a match page
        for(var j = 0; j < data2.records.length; j++) {
            let record = data2.records[j];

            // Only store the match if it is completed
            if(record.match.status === 'COMPLETED') {
                // Figuring out the oponent of team (teamID)
                let other = '', otherID = '';
                if(record.homeTeamCard.id !== parseInt(teamID)) {
                    other   = record.homeTeamCard.name;
                    otherID = record.homeTeamCard.id;
                } else {
                    other   = record.visitorTeamCard.name;
                    otherID = record.visitorTeamCard.id;
                }

                // Setting up the match
                let match = {
                    vsName: other,
                    vsID: otherID,
                    wl: 0 // 0 for loss, 1 for win
                }

                // Checking if the team, who is teamID, won the match
                if(record.winningTeamId === parseInt(teamID)) {
                    match.wl = 1;
                }

                // Add the match to the array of matches the team has played
                matches.push(match);
            }

        }

    }

    return matches;

}

storeMatches('34959968');