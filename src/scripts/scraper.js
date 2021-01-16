const puppeteer = require('puppeteer');
const $ = require('cheerio');
const t = require('./team.js');
const fs = require('fs');
const toast = require('./toast');
const _ = require('lodash');
const { url } = require('inspector');


let tournament = []; // Array of all the teams in the tournament
let tournNames = [];


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

        if ( isTeam(text) ) {

            let holder      = text.substr(0, text.search('Eligible') - 1),
                teamName    = holder.replace(/\|/gi, ''),
                teamHRef    = $(this).attr(`href`),
                teamURL     = `https://gamebattles.majorleaguegaming.com`+ teamHRef,
                team        = new t.Team(teamName, teamURL);
            
            tournNames.push(team.getName());
            tournament.push(team);

        }

    });

}


async function getMemberSR(member, html) {
    
    const tempPage = await browser.newPage();
    let urlName = member.getName().replace(/#/gi, '-');

    await tempPage.goto(`https://www.overbuff.com/players/pc/${urlName}`);
    sleep(500);
    
    // Collect the HTML
    let pHTML = await tempPage.content();
    sleep(500);

    $('tbody > tr > td', pHTML).each(function() {
        console.log($(this).text());
    });
}


// Funciton to store the members of a team
async function storeMembers(team, html) {

    // Getting down to the lowest level to not get clutter within the pull
    $('tr > td > div > div > div > div', html).each(function() {
        let BNet        = $(this).text(),
            poundPos    = BNet.search('#');

        // Test for # to see if the string is a BNet or not
        // Can't rely on there being a certain amount of players on each time
        if(poundPos !== -1) {
            let name = BNet.substr(0, poundPos);

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
    toast.show('Page One');
    
    sleep(500);
    let bodyHTML = await page.content();

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

    toast.show('Next Page');

    // For some reason the await page.content was happening too fast after page.click
    // So sleep(10(ms)) was added to create a small pause
    sleep(500);
    bodyHTML = await page.content();

    // Storing the second page of teams
    await storeTeams(bodyHTML);

    toast.show('Member Start');

    sleep(500);

    await asyncForEach(tournament, async (team) => {

        // Go to the team page and store the HTML
        await page.goto(team.getURL());

        sleep(500);

        bodyHTML = await page.content();

        storeMembers(team, bodyHTML);

        let teamJSON = JSON.stringify(team, undefined, 4),
            teamName = team.getName()

        if(!fs.existsSync(`E:/GitHub/T3.5Scraper/files/${teamName}.json`)) {

            // Storing the JSON file of all the teams
            fs.writeFile(`./T3.5Scraper/files/${teamName}.json`, teamJSON, 'utf8', function (err) {
                if (err) {
                    toast.tError(err);
                }
        
            toast.show(`${teamName} file stored!`);
        });
        }

    })

    toast.show('Files up to date!');

    // Storing a list of all the teams within the tournament
    let json = JSON.stringify(tournNames, undefined, 4);

    // Storing the JSON file of all the teams
    fs.writeFile(`./T3.5Scraper/files/teams.json`, json, 'utf8', function (err) {
        if (err) {
            toast.tError(err);
        }

        toast.show(`team.json stored`);
    });

} // Scrape

// Exporting the Scrape function
module.exports.scrape = scrape;