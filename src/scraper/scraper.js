const puppeteer = require('puppeteer');
const $ = require('cheerio');
const { Browser } = require('puppeteer/lib/cjs/puppeteer/common/Browser');
const t = require('./team.js'); // Load the team class from team.js
const fs = require('fs');

// TODO: 
// Should store teams in an individual array creating team json files instead
// of one large json file to parse over again and again
let tournament = []; // Array of all the teams in the tournament


// The sleep function to add a pause when turning a page
function sleep(milliseconds) {
    const date = Date.now();
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
    //let pos = str.search('Eligible');

    // In the table of teams there is another link for Eligible and Ineligible
    if (str.search('Eligible') != -1 
        || str.search('Ineligible') != -1) {

        return true;
        
    }

    return false;
}


// Function to store the teams on the webpage
async function storeTeams(html) {

    // Collecting the team names and links to team page on page one
    $('a', html).each(function() {
        let text = $(this).text();
        //console.log($(this).text());

        if ( isTeam(text) ) {

            let teamName = text.substr(0, text.search('Eligible') - 1);
            let teamHRef = $(this).attr(`href`);
            let teamURL = `https://gamebattles.majorleaguegaming.com`+ teamHRef;

            // Store all the teams in an array
            let team = new t.Team(teamName, teamURL);
            tournament.push(team);
            
            // console.log(`${teamName}:\t\t\t${teamHRef}`);

        }

    });

    // console.log('\nPage done\n')

}


// Funciton to store the members of a team
async function storeMembers(team, html) {

    // Getting down to the lowest level to not get clutter within the pull
    $('tr > td > div > div > div > div', html).each(function() {
        let BNet = $(this).text(),
            poundPos = BNet.search('#');

        // Test for # to see if the string is a BNet or not
        // Can't rely on there being a certain amount of players on each time
        if(poundPos !== -1) {
            let name = BNet.substr(0, poundPos);
            // console.log(name + ' ' + BNet);

            // Adding a player to the Team Object
            team.addMember(name, BNet);
        }

    });

}


// Main Scrap function that runs the whole file
// TODO come back and add the website URL as a parameter
// Allow user to choose what tournament they want
async function scrape(URL) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Going to the major league gaming website
    await page.goto(URL);
    console.log('Page One');
    
    sleep(500);
    let bodyHTML = await page.content();

    // Was getting a repeat of the same page in the print out
    // Adding await seemed to have fixed the issue
    await storeTeams(bodyHTML);

    // Click to the next page of teams
    await page.click('button[aria-label="Next page"]');
    console.log('Next Page');

    // For some reason the await page.content was happening too fast after page.click
    // So sleep(10(ms)) was added to create a small pause
    sleep(500);
    bodyHTML = await page.content();

    // Storing the second page of teams
    await storeTeams(bodyHTML);

    console.log('Member Start');

    sleep(500);

    await asyncForEach(tournament, async (team) => {

        // Go to the team page and store the HTML
        await page.goto(team.getURL());

        sleep(500);

        bodyHTML = await page.content();

        storeMembers(team, bodyHTML);
    })

    console.log('All Members Stored');

    let json = JSON.stringify(tournament);
    
    // Storing the JSON file of all the teams
    fs.writeFile("./T3SCraper/Teams.json", json, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");
    }); 

} // Scrape

// Exporting the Scrape function
module.exports.scrape = scrape;