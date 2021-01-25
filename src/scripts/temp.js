const fetch = require('node-fetch');
const $     = require('cheerio');

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

async function getSR(User) {

    let response = await fetch('https://www.overbuff.com/players/pc/' + User);
    let data = await response.text();
    let SR = [-1, -1, -1];

    $('div[data-portable="ratings"] > section > article > table > tbody > tr', data).each(function() {
        
        let tempSR = $(this).text();
            tempSR = fixSR(tempSR);
            tempSR = tempSR.split(' ');

        if(tempSR[0] === 'Tank') {
            SR[0] = tempSR[1];
        }else if(tempSR[0] === 'Damage') {
            SR[1] = tempSR[1];
        }else if(tempSR[0] === 'Support') {
            SR[2] = tempSR[1];
        }

    });
    
    return SR;

}

getSR('UpNorth-11329');