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

async function storeTeams(tournID, tournSURL) {

    let response    = await fetch(GBApi + teamsAPI + tournID);
    let data        = await response.json();
    let teamNames   = [];

    // Combine the pages of teams in the tournament
    let tournTeams  = data.body.records;
    
    // Check if there is more than one page of teams in the tournament
    if(data.body.totalPages > 1) {

        // Loop through every page in the tournament
        for(var i = 2; i <= data.body.totalPages; i++) {

            // Getting the response from the page
            let response2   = await fetch(GBApi + teamsAPI + tournID + `?pageNumber=${i}&pageSize=25`);
            let data2       = await response2.json();
            tournTeams      = tournTeams.concat(data2.body.records);
        }

    }

    let storedTeams = [];

    // Loop and create documents for each team in the tournament
    for(var i = 0; i < tournTeams.length; i++) {

        // Only store eligible teams
        if(tournTeams[i].eligibilityStatus === 'ELIGIBLE') {

            let teamName = tournTeams[i].team.name.replace(/\|/gi, "");
        
            const teamInfo = {
                name:    teamName,
                url:     tournTeams[i].team.url,
                id:      tournTeams[i].team.id,
                AvgSR:   -1,
                Top6Avg: -1,
                updated: new Date().toLocaleString('en-US', {timeZone: 'EST'}),
                members: [],
                matches: [],
            };

            // // Within the tournament collection, set the document by the team name
            // // to the teamInfo object created above with all the members
            // await database.collection(tournSURL).doc(teamInfo.name).set(teamInfo)
            // .catch(function(error) {
            //     console.error(`########### ${teamInfo.name} ###########`);
            //     console.error(error);
            // });

            storedTeams.push(teamInfo);
            teamNames.push(teamInfo.name);
            console.log(`${i}:\t ${teamInfo.name}`);

        }

    }

    const teams = {
        name: tournSURL,
        id: tournID,
        teams: teamNames
    };

    // Store all teams in one file for dropdown
    await database.collection(tournSURL).doc('info').set(teams)
    .catch(function(error) {
        console.error(`########### Teams Storage ###########`);
        console.error(error);
    });

}

storeTeams('159390', 'owcc-spring-2021');

// storeMatches('34959968');