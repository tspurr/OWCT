const puppeteer = require('puppeteer');
const $ = require('cheerio');
const tankPos = 0, damagePos = 1, supportPos = 2;

class teamMember {

    
    constructor(name) {
        this.name = name;

        // In the order of Tank, Damage, and Support
        this.skillRating = [-1, -1, -1];
    }

    constructor(name, tankSR, damageSR, supportSR) {
        this.name = name;

        this.skillRating[tankPos]       = tankSR;
        this.skillRating[damagePos]     = damageSR;
        this.skillRating[supportPos]    = supportSR;
    }

    // Calculates the average SR of a member
    avgSR() {
        let average = 0, sum = 0;

        for(var i = 0; i < this.skillRating.length; i++) {

            //Check to see if the skill rating was input for that role
            if (this.skillRating[i] != -1) {
                average += this.skillRating[i];
                sum++;
            }

        }

        return (average / sum);

    }

    // Calculates returns the max SR of a player
    maxSR() {
        return Math.max(this.skillRating);
    }

}


class Team {

    constructor() {
        this.name = "";
        this.teamMembers = [];
    }


    // Calculates the avg SR of the whole team (not specific players)
    // Will take into account managers and coaches that are on the roster
    avgSkillRating() {

    }

    // Calculates the avg SR of the top 6 SR on the team
    // Does not take into account 2-2-2 it can be highest sr from a player in any position
    top6SR() {

    }
}