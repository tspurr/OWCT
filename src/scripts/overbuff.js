const puppeteer     = require('puppeteer');
const $             = require('cheerio');
const toast         = require('./toast');
const _             = require('lodash');
const database      = require('../database/functions');


// Make a URL safe BNet
async function fixBNet(BNet) {
    return BNet.replace(/#/gi, '-');
}

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


// =============================================
//             Getting a Member's SR
// =============================================
async function getMemberSR(BNet) {
    const browser   = await puppeteer.launch();
    const page      = await browser.newPage();
    let SR = [];

    await page.goto(`https://www.overbuff.com/players/pc/${ fixBNet(BNet) }`);

    let pHTML = await page.content();

    let long = 'div[data-portable="ratings"] > section > article > table > tbody > tr';

    $(long, pHTML).each(function() {
        let temp = fixSR($(this).text);
            temp = temp.split(' ');
        
        // Setting the positions SR
        SR[temp[0]] = parseInt(temp[1]);
    });

    // Return the SR array for the player
    return SR;
}


// =============================================
//            Getting all Member's SR
// =============================================
async function getAllMemberSR(teamName, tournament) {

    let team    = await database.getTeamN(teamName, tournament),
        members = team.members;

    // Setting the SR for each member within the team data
    for(var i = 0; i < members.length; i++) {
        members[i].SR = getMemberSR(members[i].BNet);
    }

    // Push the edited team model to be updated
    // Database will look by team._id for mathcing document
    await database.updateTeam(team, tournament);

}

module.exports = {
    getAllMemberSR
}