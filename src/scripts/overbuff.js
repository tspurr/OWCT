const puppeteer     = require('puppeteer');
const $             = require('cheerio');
const toast         = require('./toast');
const _             = require('lodash');
const database      = require('../database/functions');


// The sleep function to add a pause when turning a page
function sleep(milliseconds) {
    const date      = Date.now();
    let currentDate = null;

    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


// Make a URL safe BNet
function fixBNet(BNet) {
    return BNet.replace(/#/gi, '-');
}


function fixSR(SR) {

    console.log(`SR Type: ${typeof SR}`);
    
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

    console.log(`Fixed SR: ${SR}`);
    return SR;

}


// =============================================
//             Getting a Member's SR
// =============================================
async function getMemberSR(BNet) {
    const browser   = await puppeteer.launch();
    const page      = await browser.newPage();
    let SR = [-1, -1, -1];

    let safeBNet = fixBNet(BNet);
    try {
        console.log(`https://www.overbuff.com/players/pc/${safeBNet}`);
        await page.goto(`https://www.overbuff.com/players/pc/${safeBNet}`);
    } catch (error) {
        toast.tError(error);
    }

    let pHTML = await page.content();
    sleep(500);

    $('div[data-portable="ratings"] > section > article > table > tbody > tr', pHTML).each(function() {
        
        let temp = $(this).text();
            temp = fixSR(temp);
            temp = temp.split(' ');
        
        console.log(`\t${safeBNet}: ${temp[1]}`);
    
        // Setting the positions SR
        if(temp[0] === 'Tank') {
            SR[0] = parseInt(temp[1]);
        } else if (temp[0] === 'Damage') {
            SR[1] = parseInt(temp[1]);
        } else if (temp[0] === 'Support') {
            SR[2] = parseInt(temp[1]);
        }
    

    });

    // CLOSE THE BROWSER!!!
    await browser.close();

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
        console.log('Member SR: ' + members[i].SR);
        members[i].SR = await getMemberSR(members[i].BNet);
        sleep(1000);
    }

    console.log(team);

    // Push the edited team model to be updated
    // Database will look by team._id for mathcing document
    await database.updateMembers(team.name, tournament, team.members);

}

module.exports = {
    getAllMemberSR
}