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
    let SR          = [-1, -1, -1];
    let safeBNet    = fixBNet(BNet);

    try {
        await page.goto(`https://www.overbuff.com/players/pc/${safeBNet}`);
    } catch (error) {
        toast.tError(error);
    }

    let pHTML = await page.content();
    sleep(100);

    $('div[data-portable="ratings"] > section > article > table > tbody > tr', pHTML).each(function() {
        
        let temp = $(this).text();
            temp = fixSR(temp);
            temp = temp.split(' ');
    
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

    toast.show(`${BNet} done`);

    // Return the SR array for the player
    return SR;

}


// Member Average SR
function avgSR(SR) {
    let count = 0;
    let sum = 0;

    SR.forEach(pos => {
        if(pos !== -1) {
            count++;
            sum += pos;
        }
    });

    if((sum/count).toString() === 'NaN'){
        return -1;
    } else {
        return (sum/count);
    }

}


// This shit does not work for some reason
function teamAvgSR(members) {

    let count = 0, sum = 0;

    for(var i = 0; i < members.length; i++) {

        if(members[i].AvgSR !== -1) {

            sum += parseInt(members[i].AvgSR);
            count++;
            
        }

    }

    console.log(`Team Average:\n\tSum: ${sum}, Count: ${count}, Avg: ${sum/count}`);
    return (sum / count);

}


function top6(members) {

    let sum = 0, mSR = [];

    for(var i = 0; i < members.length; i++) {

        if(members[i].MaxSR !== -1) {
            
            mSR.push(members[i].MaxSR);
            
        }

    }

    // Sorting the array highest to lowest
    mSR.sort();
    mSR.reverse(); // Makes the array descending
    console.log(`Max SR: ${mSR}`);

    for(var i = 0; i < 6; i++) {
        sum += mSR[i];
    }

    console.log(`Top6 Average:\n\tSum: ${sum}, Avg: ${sum / 6}`);
    return (sum / 6);

}


// =============================================
//            Getting all Member's SR
// =============================================
async function getAllMemberSR(teamName, tournament) {

    let team    = await database.getTeamN(teamName, tournament),
        members = team.members;


    // Setting the SR for each member within the team data
    for(var i = 0; i < members.length; i++) {

        members[i].SR       = await getMemberSR(members[i].BNet);
        members[i].MaxSR    = Math.max(...members[i].SR);
        members[i].AvgSR    = avgSR(members[i].SR);

        // console.log(`name: members[i].BNet\nmSR: ${members[i].SR}\n\tMaxSR: ${members[i].MaxSR}\n\tAvgSR: ${members[i].AvgSR}`);
        
        sleep(500);

    }

    // Push the edited team model to be updated
    // Database will look by team._id for mathcing document
    await database.updateMembers(team.name, tournament, members);

    let teamAvg     = teamAvgSR(members);
    let topSix      = top6(members);

    await database.insertT6(team, tournament, topSix);
    await database.insertTAvg(team, tournament, teamAvg);

    toast.show('Team Updated');
}

module.exports = {
    getAllMemberSR
}