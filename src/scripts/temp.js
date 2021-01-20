const puppeteer = require('puppeteer');
const $         = require('cheerio');


// Make a URL safe BNet
function fixBNet(BNet) {
    return BNet.replace(/#/gi, '-');
}

// This function is to separate the Pos from the SR and
// remove the , from the numbers as well
function fixSR(SR) {
    
    if(SR.search('Tank') !== -1) {
        SR = SR.substring(0, 5) + SR.substring(6);
        SR = SR.substring(0, 4) + ' ' + SR.substring(4);
    }else if(SR.search('Damage') !== -1) {
        SR = SR.substring(0, 7) + SR.substring(8);
        SR = SR.substring(0, 6) + ' ' + SR.substring(6);
    }else if(SR.search('Support') !== -1) {
        SR = SR.substring(0, 8) + SR.substring(9);
        SR = SR.substring(0, 7) + ' ' + SR.substring(7);
    }

    return SR;

}


async function main(team) {

    const browser   = await puppeteer.launch();
    const page      = await browser.newPage();
    let teamSR      = [];

    for(var i = 0; i < team.length; i++) {

        await page.goto(`https://www.overbuff.com/players/pc/${ fixBNet(team[i]) }`);

        let pHTML   = await page.content();
        let long    = 'div[data-portable="ratings"] > section > article > table > tbody > tr';
        let pSR     = [];

        $(long, pHTML).each(function() {

            let sr = fixSR($(this).text());
                sr = sr.split(' ');

            pSR[sr[0]] = sr[1];
        });

        teamSR.push(pSR);

    }

    browser.close();
    return teamSR;

}

let team = [
    'Yuena#11442',
    'BowieJr#1659',
    'Anditaco#1526',
    'TankEngine#11951',
    'BrianT1G#1245',
    'Flippy#11248',
    'Gream#11345',
    'Infinity#12737',
    'Kage#12961',
    'UpNorth#11329',
    'WITHER#11428'
];

let Members = [];
let sum = 0, count = 0;
console.log(sum/count);
members = main(team);