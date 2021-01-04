const puppeteer = require('puppeteer');
const $ = require('cheerio');
const url = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';


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


//  Traverses the webpage
//  Use Puppeteer to look at the whole page and be able to use the Javascript
puppeteer
  .launch()

  .then(function(browser) {
    return browser.newPage();
  })

  .then(function(page) {

    return page.goto(url).then(function() {
      return page.content();
    });
    
  })

  .then(function(html) {
    $('a', html).each(function() {
        //console.log($(this).text());

        if ( isTeam($(this).text()) ){
            console.log('#\t' + $(this).text());
        }

      });

  })
  .catch(function(err) {
    console.log(err);
  });