const puppeteer = require('puppeteer');
const $ = require('cheerio');
const tankPos = 0, damagePos = 1, supportPos = 2;
const toast = require('./toast');


// ======================================
//           Team Member Class
// ======================================
class teamMember {

    constructor(name, BNet) {
        this.name = name;
        this.BNet = BNet;

        // In the order of Tank, Damage, and Support
        this.skillRating = [-1, -1, -1];
    }

    // Setting Tank SR
    tank(sr) {
        this.skillRating[tankPos] = sr;
    }

    // Setting Damage SR
    damage(sr) {
        this.skillRating[damagePos] = sr;
    }

    // Setting Support SR
    support(sr) {
        this.skillRating[supportPos] = sr;
    }

    // Probably won't use this
    setSR(tankSR, damageSR, supportSR) {
        this.skillRating[tankPos] = tankSR;
        this.skillRating[damagePos] = damageSR;
        this.skillRating[supportPos] = supportSR;
    }

    // Getting the BNet of the member
    getBnet() {
        return this.BNet;
    }

    // Calculates the average SR of a member
    avgSR() {
        let average = 0, sum = 0;

        skillRating.forEach(element => {

            //Check to see if the skill rating was input for that role
            if(element !== -1) {
                average += element;
                sum++;
            }

        });

        // If there is no average
        if (average === 0) {
            return -1;
        } else {
            return (average / sum);
        }

    }

    // Calculates returns the max SR of a player
    // Can return -1 if there was no SR input
    maxSR() {
        return Math.max(this.skillRating);
    }

} // Team Member Class


// ======================================
//              Team Class
// ======================================
class Team {

    constructor(teamName, teamURL) {
        this.name = teamName;
        this.url = teamURL;
        this.teamMembers = [];
    }

    // Adding a Team Member
    addMember(name, Bnet) {
        let member = new teamMember(name, Bnet);
        this.teamMembers.push(member);
    }

    // Getting a Team Member
    getMember(Bnet) {

        if(this.teamMembers.length === 0) {
            return toast.tError(`No Members on ${this.name}`);
        }

        // Look for member in team
        this.teamMembers.forEach(member => {

            if(member.getBnet === Bnet) {
                console.log(`${member.BNet} found in ${this.name}`);
                return member;
            }

        });

        return console.error(`${Bnet} not found in ${this.name}`);

    }

    // Getting the team name
    getName() {
        return this.name;
    }

    // Getting the team URL
    getURL() {
        return this.url;
    }

    // Calculates the avg SR of the whole team (not specific players)
    // Will take into account managers and coaches that are on the roster
    avgSkillRating() {
        let average = 0, sum = 0;

        // Looping through the array of team members
        teamMembers.forEach(element => {

            // Checking if SR was input into the member
            if(element.avgSR() !== -1) {
                average += element.avgSR();
                sum++;
            }

        });

        // If there is an average on the team
        if(average === 0) {
            return -1;
        } else {
            return (average / sum);
        }

    }

    // Calculates the avg SR of the top 6 SR on the team
    // Does not take into account 2-2-2 it can be highest sr from a player in any position
    // This will probably be more useful than looking at the whole avgSR
    top6SR() {
        let arr = [], average = 0, sum = 0;

        // Getting each players max SR
        teamMembers.forEach(element => {

            // Checking if there was SR input
            if(element.maxSR() !== -1) {
                arr.push(element.maxSR());
            }

        });

        // Averaging the array of max SRs on team
        arr.forEach(element => {
            average += element;
            sum++
        });

        // If the average does not change
        if(average === 0) {
            return -1;
        } else {
            return (average / sum);
        }
    }

} // Team Class

// Exporting the class to use in the main file
module.exports.Team = Team;