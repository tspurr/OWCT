const puppeteer = require('puppeteer');
const $         = require('cheerio');

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

async function main() {
    const browser   = await puppeteer.launch();
    const page      = await browser.newPage();


    await page.goto(`https://www.overbuff.com/players/pc/UpNorth-11329`);

    let pHTML = await page.content();

    let long = 'div[data-portable="ratings"] > section > article > table > tbody > tr';

    $(long, pHTML).each(function() {
        console.log( fixSR($(this).text()) );
    });
}

main();