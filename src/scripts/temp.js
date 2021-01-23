const puppeteer = require('puppeteer');
const $         = require('cheerio');
const functions = require('firebase-functions');

const admin     = require('firebase-admin');
const database  = admin.firestore();

// Global Variables are BAD I KNOW!
let tournURL    = [],
    tournPos    = 6,
    tournNames  = [];


const PUPPERTEER_OPTIONS = {
    headless: true,
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--timeout=30000',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
        "--proxy-server='direct://'",
        '--proxy-bypass-list=*',
        '--deterministic-fetch',
    ],
};


const openConnection = async() => {

    const browser = await puppeteer.launch(PUPPERTEER_OPTIONS);
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

    await page.setViewport({ width: 1680, height: 1050 });
    return {browser, page};

};


// Close the connection on puppeteer
const closeConnection = async(page, browser) => {

    page && (await page.close());
    browser && (await browser.close());

};


exports.scrapeTournament = functions.https.onCall(async (req, res) => {

    console.log(req);

    let {browser, page} = openConnection();
    
    try {
        
        await page.goto(data.url, { waitUntil: 'load' });
        let bodyHTML    = await page.content();

        // Look into making this a function again
        $('a', bodyHTML).each(function() {

            let text    = $(this).text();
            let isTeam  = false;

            if (text.search('Eligible') != -1 || text.search('Ineligible') != -1) {
                 isTeam = true;  
            }
    
            if ( isTeam ) {
    
                let holder      = text.substr(0, text.search('Eligible') - 1),
                    teamName    = holder.replace(/\|/gi, ''),
                    teamHRef    = $(this).attr(`href`),
                    teamURL     = `https://gamebattles.majorleaguegaming.com`+ teamHRef;
                
                tournNames[teamName] = teamURL;
                console.log(`Team ${teamName} Logged`);
    
                const team = {
                    name:       teamName,
                    url:        teamURL,
                    AvgSR:      -1,
                    Top6SR:     -1,
                    timestamp:  new Date().toLocaleString().replace(',',''),
    
                    members:    []
                };
    
                batch.set(database.collection(tournURL[tournPos]).doc(team.name), team);
                console.log(`Team Logged ${team}`);
            }
    
        });

        await page.click('button[aria-label="Next page"]', { waitUntil: 'load' });
        bodyHTML = await page.content();

        // Look into making this a function again
        $('a', bodyHTML).each(function() {

            let text    = $(this).text();
            let isTeam  = false;

            if (text.search('Eligible') != -1 || text.search('Ineligible') != -1) {
                 isTeam = true;  
            }
            if ( isTeam ) {
    
                let holder      = text.substr(0, text.search('Eligible') - 1),
                    teamName    = holder.replace(/\|/gi, ''),
                    teamHRef    = $(this).attr(`href`),
                    teamURL     = `https://gamebattles.majorleaguegaming.com`+ teamHRef;
                
                tournNames[teamName] = teamURL;
                console.log(`Team ${teamName} Logged`);
    
                const team = {
                    name:       teamName,
                    url:        teamURL,
                    AvgSR:      -1,
                    Top6SR:     -1,
                    timestamp:  new Date().toLocaleString().replace(',',''),
    
                    members:    []
                };
    
                batch.set(database.collection(tournURL[tournPos]).doc(team.name), team);
                console.log(`Team Logged ${team}`);
            }
    
        });

        const tournament = {
            name:   tournURL[tournPos],
            url:    URL,
    
            teams:  tournNames
        };

        batch.set(database.collection(tournURL[tournPos]).doc('info'), tournament);

        await batch.commit();

        res.status(200).send('Scrape Done!');

    } catch (error) {

        res.status(500).send(error);
        
    } finally {

        await closeConnection(page, browser);
        console.log('Browser Closed');

    }

});