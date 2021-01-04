const puppeteer = require('puppeteer');
const $ = require('cheerio');
const url = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';

function isTeam(str) {
    let pos = str.search('Eligible');

    if (str.search('Eligible') != -1) {
        return true;
    }

    return false;
}

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