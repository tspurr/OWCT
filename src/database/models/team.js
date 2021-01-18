const mongoose = require('mongoose');
const config = require('./config');
const Schema = mongoose.Schema;

const teamSchema = new Schema ({

    _id:    {type: String, required: true, default: config.defaultTeam._id},
    name:   {type: String, required: true, default: config.defaultTeam.name},
    url:    {type: String, required: true, default: config.defaultTeam.url},

    members: []

}, {timestamps: true})


const Team      = mongoose.model('Team', teamSchema);
module.exports  = Team;