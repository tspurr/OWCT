const fetch = require('node-fetch');

const   GBApi           = 'https://gb-api.majorleaguegaming.com/',
        tournScreen     = 'api/web/v1/tournament-screen/',
        teamsAPI        = 'api/v1/tournament-team/with-eligibility-and-premium-status/',
        teamAPI         = 'api/web/v1/team-members-extended/team/';


async function main(tournID) {
    const roundLView    = `api/v1/tournament-bracket-rounds/tournament/${tournID}/bracket/SWISS`,
          roundView     = `api/web/v1/tournament-bracket/matches/tournament/${tournID}/bracket/SWISS/round/`,
          matchView     = `api/web/v1/match-screen/`, // Mathc IDs are the last variable in link
          BracketView    = `api/v1/tournaments/${tournID}/bracket-rounds-with-match-views/bracket/W`;

    // This gets a list of all the rounds in the tournament
    let response    = await fetch(GBApi + roundLView);
    let data        = await response.json();

    for(var i = 1; i <= data.body.length; i++) {

        let response2   = await fetch(GBApi + roundView + i);
        let data2       = await response2.json();

        console.log(data2);

        for(var j = 0; j < data2.body.length; j++) {

            let match = data2.body[j];
            let winningTeam = match.matchResult.winningTeamId;

            if(winningTeam === match.homeTeamBracketInfo.teamId) {
                winningTeam = match.homeTeamBracketInfo.teamName;
            } else {
                winningTeam = match.visitorTeamBracketInfo.teamname;
            }
            

            console.log(data3);

        }

    }

    // let response3   = await fetch(GBApi + BracketView);
    // let data3       = await response3.json();


    console.log(data);

}

main('151515');