const puppeteer = require('puppeteer');
const $         = require('cheerio');
const toast     = require('./toast');
const _         = require('lodash');

const Team              = require('../database/models/team');
const Tournament        = require('../database/models/tournament');
const database          = require('../database/functions');


let tournURL = [],
    tournPos = 6,
    tournNames = [];


// The sleep function to add a pause when turning a page
function sleep(milliseconds) {
    const date      = Date.now();
    let currentDate = null;

    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


// Async for each function
// To loop through the list of teams
async function asyncForEach(array, callback) {

    for (let index = 0; index < array.length; index++) {

        await callback(array[index], index, array);

    }

}


// Function tests if the link object
// is a team or not
function isTeam(str) {

    // In the table of teams there is another link for Eligible and Ineligible
    if (str.search('Eligible') != -1 
        || str.search('Ineligible') != -1) {

        return true;
        
    }

    return false;
}


// Funciton to store the members of a team
async function storeMembers(URL) {

    const tempBrowser   = await puppeteer.launch();
    const tempPage      = await tempBrowser.newPage();
    let members         = [];

    await tempPage.goto(URL);
    sleep(500);

    let html = await tempPage.content();

    // Getting down to the lowest level to not get clutter within the pull
    $('tr > td > div > div > div > div', html).each(function() {

        let BNet        = $(this).text(),
            poundPos    = BNet.search('#');

        // Test for # to see if the string is a BNet or not
        // Can't rely on there being a certain amount of players on each time
        if(poundPos !== -1) {

            let name    = BNet.substr(0, poundPos);

            // Create the model of a member for the array of members that goes
            // into the team model
            var member = {
                name: name,
                BNet: BNet,
                AvgSR: -1,
                MaxSR: -1,
                SR: {
                    'Tank': -1,
                    'Damage': -1,
                    'Support': -1
                }
            };

            members.push(member);
        }

    });

    // Closing the window when done
    tempBrowser.close();

    // Return the array of models for the team
    return members;

}


// Function to store the teams on the webpage
async function storeTeams(html) {

    // Collecting the team names and links to team page on page one
    $('a', html).each(function() {

        let text = $(this).text();

        if ( isTeam(text) ) {

            let holder      = text.substr(0, text.search('Eligible') - 1),
                teamName    = holder.replace(/\|/gi, ''),
                teamHRef    = $(this).attr(`href`),
                teamURL     = `https://gamebattles.majorleaguegaming.com`+ teamHRef;
            
            tournNames.push(teamName);

            const team = new Team({
                _id:        teamName,
                name:       teamName,
                url:        teamURL,

                // Include await so there are not 400 browsers open
                members:    []
            });

            try {
                database.uploadTeam(team, tournURL[tournPos]);
            } catch (error) {
                toast.tError(error);
            }

        }

    });

}


// =============================================
//             Main Scrape Function
// =============================================
async function scrapeAll(URL) {

    const browser   = await puppeteer.launch();
    const page      = await browser.newPage();
          tournURL = URL.split('/');

    // Going to the major league gaming website
    await page.goto(URL);
    sleep(500);
    
    let bodyHTML    = await page.content();

    // Was getting a repeat of the same page in the print out
    // Adding await seemed to have fixed the issue
    await storeTeams(bodyHTML);

    // Click to the next page of teams
    try {
        await page.click('button[aria-label="Next page"]');
    } catch (err) {
        console.log(err); // Keep this console log
        toast.tError('Please Press the Refresh Button Again!');
    }

    // For some reason the await page.content was happening too fast after page.click
    // So sleep(10(ms)) was added to create a small pause
    sleep(500);
    bodyHTML = await page.content();

    // Storing the second page of teams
    await storeTeams(bodyHTML);

    toast.show('teams stored');

    // Defining the tournament and uploading to the database
    const tournament = new Tournament({
        _id:    tournURL[tournPos],
        name:   tournURL[tournPos],
        url:    URL,

        teams: tournNames
    });

    database.uploadTournInfo(tournament);

    asyncForEach(tournNames, async (team) => {

        let teamInfo = await database.getTeamN(team, tournURL[tournPos]);

        let memberArray = await storeMembers(teamInfo.url);

        await database.updateMembers(teamInfo.name, tournURL[tournPos], memberArray);

    });

    sleep(500);

    toast.show('Files up to date!');

    // Close the browser window when done
    await browser.close();

} // Scrape

// Exporting
module.exports = {scrapeAll, sleep};