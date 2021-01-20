const mongoose  = require('mongoose');
const config    = require('./models/config');
const _         = require('lodash');
const toast     = require('../scripts/toast');

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


// ===================================
//      Tournament Functions
// ===================================
async function uploadTournInfo(tournInfo) {

    try {
        await mongoose.connection.collection(tournInfo.name).insertOne(tournInfo);
    } catch (error) {
        toast.tError(`Could not upload ${tournInfo.name} information...`);
    }

}


// This returns an ARRAY of team names and not the team info itself
async function getTournTeams(tournament) {

    try {

        let data = await mongoose.connection.collection(tournament).findOne({_id: tournament});
        console.log(`Got teams for ${tournament}`)
        return data.teams;

    } catch (error) {

        toast.tError(`Could not get ${tournament} teams...`);

    }

}


module.exports = {

    // Team Functions
    uploadTeam, 
    getTeam, 
    getTeamN, 
    updateTeam, 
    updateMembers,

    // Tournament Functions
    uploadTournInfo,
    getTournTeams

};