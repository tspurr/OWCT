const mongoose  = require('mongoose');
const {Team}    = require('./models/team');
const config    = require('./models/config');
const _         = require('lodash');

// ===================================
//            Team Functions
// ===================================

// Uploading a team to the database
// Don't export this function because updateTeam will check if there is a team
// and if not then it will call this function on get team
async function uploadTeam(team, tournament) {

    await mongoose.connection.collection(tournament).insertOne(team);

};


// Get a team from the database
async function getTeam(team, tournament) {

    let db = mongoose.connection.collection(tournament);
    let data = await db.findOne({_id: team._id});

    // Check if there was data returned
    if(data)
        return data;
    // If there was no data returned then we upload the team
    else {
        return config.defaultTeam;
    }
    
};

// Get a team from the database by name
async function getTeamN(teamName, tournament) {

    let db = mongoose.connection.collection(tournament);
    let data = await db.findOne({_id: teamName});

    // Check if there was data returned
    if(data)
        return data;
    // If there was no data returned then we upload the team
    else {
        return config.defaultTeam;
    }
    
};

// Updating a team in the database
// Just replacing rn and will come back to make sure that actual comparisons
// are happening
async function updateTeam(team, tournament) {

    let db = mongoose.connection.collection(tournament);
    let data = getTeam(team, tournament);

    if(_.isEqual(team, data)) {
        return console.log(`${team._id} not updated, files were the same`);
    } else {
        return await db.updateOne(team);
    }

};

async function updateMembers(teamName, tournament, memberArray) {

    let db = mongoose.connection.collection(tournament);

    try {
        await db.findOneAndUpdate({_id: teamName}, {$set: {members: memberArray}});
    } catch (error) {
        console.log(err);
    }

};

module.exports = {uploadTeam, getTeam, getTeamN, updateTeam, updateMembers};