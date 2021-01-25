const fetch = require('node-fetch');

let GB = 'https://gb-api.majorleaguegaming.com/',
    tournament = 'api/web/v1/tournament-screen/',
    teams = 'api/v1/tournament-team/with-eligibility-and-premium-status/',
    team = 'api/web/v1/team-members-extended/team/',
    tournID = '151515',
    pageTwo = '?pageNumber=2&pageSize=25',
    UMichID = '34959968';

async function getTourn() {

    let response = await fetch(GB+tournament+tournID);
    let data = await response.json();

    // let tournament = data.body.tournament;

    // let title = tournament.title;
    // let url = tournament.url;
    // let id = tournament.id;
    // let shortURL = tournament.simpleUrl;

    return data;

}

async function getTeams() {
    let response = await fetch(GB+teams+tournID);
    let data = await response.json();

    let response2 = await fetch(GB+teams+tournID+pageTwo);
    let data2 = await response2.json();

    let records = data.body.records;
    let records2 = data2.body.records;
    records = records.concat(records2);

    return data;
}

async function getTeam() {
    let response = await fetch(GB+team+UMichID);
    let data = await response.json();

    let teamMembers = data.body;

    let BNet = teamMembers[0].teamMember.gamertag;
    let MemberID = teamMembers[0].teamMember.userId;
    let username = teamMembers[0].teamMember.username;

    return data;
}

getTourn().then(data => console.log(data.body));
getTeams();
getTeam();