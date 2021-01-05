const puppeteer = require('puppeteer');
const $ = require('cheerio');
const teamsURL = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';

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


// Traverses the webpage
// Use Puppeteer to look at the whole page and be able to use the Javascript
puppeteer
  .launch()

  .then(function(browser) {
    return browser.newPage();
  })

  // Load in the webpage that lists all the teams
  .then(function(page) {

    return page.goto(teamsURL).then(function() {
      return page.content();
    });
    
  })

  // On the first page before the next page button is clicked
  // All the teams on the page are stored and the links to their team page are also stored
  .then(function(html) {
    $('a', html).each(function() {
        //console.log($(this).text());

        if ( isTeam($(this).text()) ){
          let teamName = $(this).text().substr(0, $(this).text().search('Eligible') - 1);
          let teamURLShort = $(this).attr(`href`);
          let teamURL = `https://gamebattles.majorleaguegaming.com/`+ $(this).attr(`href`);

          // TODO
          // Store all the teams in an array of teams that have players in them
          console.log(`${teamName}:\t\t\t${teamURLShort}`);

        }

      });

  })

  // TODO
  // Click the button to go to the next page in the table of teams
  .then(function(page) {

    return page.click()

  })

  // Stores all the rest of the teams on the table
  // after the next page button was clicked
  .then(function(html) {
    $('a', html).each(function() {
      //console.log($(this).text());

      if ( isTeam($(this).text()) ){
        let teamName = $(this).text().substr(0, $(this).text().search('Eligible') - 1);
        let teamURLShort = $(this).attr(`href`);
        let teamURL = `https://gamebattles.majorleaguegaming.com/`+ $(this).attr(`href`);

        // TODO
        // Store all the teams in an array of teams that have players in them
        console.log(`${teamName}:\t\t\t${teamURLShort}`);

      }

    });
  })

  .catch(function(err) {
    console.log(err);
  });